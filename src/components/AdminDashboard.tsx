"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Booking, BookingStatus, Product } from "@/lib/types";
import { money, prettyDate, todayISO } from "@/lib/format";

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-party-yellow text-party-ink",
  confirmed: "bg-party-green text-white",
  completed: "bg-party-blue text-white",
  cancelled: "bg-party-ink text-white",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminDashboard({
  bookings: initial,
  products = [],
  demo,
  email,
}: {
  bookings: Booking[];
  products?: Product[];
  demo: boolean;
  email: string | null;
}) {
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // Mock actions (no real Stripe/SMS in demo) — track which were triggered.
  const [charged, setCharged] = useState<Record<string, boolean>>({});
  const [reminded, setReminded] = useState<Record<string, boolean>>({});

  const today = todayISO();

  // Inventory: how many of each product are out on upcoming active bookings.
  const inventory = useMemo(() => {
    const out: Record<string, number> = {};
    bookings
      .filter(
        (b) =>
          b.event_date >= today &&
          (b.status === "confirmed" || b.status === "pending")
      )
      .forEach((b) =>
        b.product_ids.forEach((id) => {
          out[id] = (out[id] ?? 0) + 1;
        })
      );
    return products.map((p) => ({
      name: p.name,
      owned: p.quantity ?? 1,
      out: out[p.id] ?? 0,
    }));
  }, [products, bookings, today]);

  const stats = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");
    const revenue = active.reduce((s, b) => s + Number(b.total_amount), 0);
    const deposits = active.reduce((s, b) => s + Number(b.deposit_amount), 0);
    const upcoming = bookings.filter(
      (b) =>
        b.event_date >= today &&
        (b.status === "confirmed" || b.status === "pending")
    ).length;
    return {
      revenue,
      deposits,
      upcoming,
      total: bookings.length,
    };
  }, [bookings, today]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (dateFilter && b.event_date !== dateFilter) return false;
      return true;
    });
  }, [bookings, filter, dateFilter]);

  // group upcoming by date for the calendar strip
  const upcomingByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings
      .filter((b) => b.event_date >= today && b.status !== "cancelled")
      .forEach((b) => {
        const arr = map.get(b.event_date) ?? [];
        arr.push(b);
        map.set(b.event_date, arr);
      });
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [bookings, today]);

  async function setStatus(id: string, status: BookingStatus) {
    setBusy(id);
    const prev = bookings;
    setBookings((bs) =>
      bs.map((b) => (b.id === id ? { ...b, status } : b))
    );
    try {
      const res = await fetch("/api/admin/booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setBookings(prev); // revert
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {demo && (
        <p className="mb-6 rounded-lg border border-party-yellow/50 bg-party-yellow/25 px-4 py-3 font-semibold">
          Preview mode — showing sample bookings. Connect Supabase to manage
          real data.
        </p>
      )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total revenue", value: money(stats.revenue), c: "bg-party-green text-white" },
            { label: "Deposits collected", value: money(stats.deposits), c: "bg-party-blue text-white" },
            { label: "Upcoming events", value: String(stats.upcoming), c: "bg-party-red text-white" },
            { label: "Total bookings", value: String(stats.total), c: "bg-party-ink text-white" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl ${s.c} p-5 shadow-soft`}>
              <div className="font-display text-4xl font-bold italic">
                {s.value}
              </div>
              <div className="mt-1 text-sm uppercase tracking-wider opacity-80">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming calendar strip */}
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold italic">
            Upcoming schedule
          </h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {upcomingByDate.length === 0 && (
              <p className="text-party-ink/60">No upcoming events.</p>
            )}
            {upcomingByDate.map(([date, items]) => (
              <button
                key={date}
                onClick={() => setDateFilter(dateFilter === date ? "" : date)}
                className={`card shrink-0 p-4 text-left transition-transform hover:-translate-y-0.5 ${
                  dateFilter === date ? "bg-party-blue text-white" : "bg-white"
                }`}
              >
                <div className="font-display text-sm font-bold">
                  {prettyDate(date)}
                </div>
                <div className="mt-1 text-2xl font-bold">{items.length}</div>
                <div className="text-xs opacity-70">
                  event{items.length > 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inventory */}
        {inventory.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold italic">
              Inventory (units out on upcoming events)
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((it) => {
                const ratio = it.out / it.owned;
                return (
                  <div
                    key={it.name}
                    className="rounded-2xl bg-white p-4 shadow-soft"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-bold italic">
                        {it.name}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-party-ink/60">
                        {it.out}/{it.owned} out
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-party-ink/10">
                      <div
                        className={`h-full rounded-full ${
                          ratio >= 1
                            ? "bg-party-red"
                            : ratio >= 0.5
                            ? "bg-party-yellow"
                            : "bg-party-green"
                        }`}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-party-ink/15 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`tab ${filter === f.key ? "tab-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-party-ink/25 px-3 py-1.5 text-sm outline-none focus:border-party-red"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="text-sm font-semibold text-party-ink/60 hover:text-party-ink"
              >
                Clear ✕
              </button>
            )}
          </div>
        </div>

        {/* Bookings list */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 && (
            <div className="card grid place-items-center bg-white p-12 text-center text-party-ink/60">
              No bookings match these filters.
            </div>
          )}
          {filtered.map((b) => (
            <div key={b.id} className="card bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold italic">
                      {b.customer_name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_STYLE[b.status]}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-party-ink/60">
                    {prettyDate(b.event_date)} · {b.event_type} ·{" "}
                    {b.product_ids.length} item(s)
                  </p>
                  <p className="mt-1 text-sm text-party-ink/60">
                    {b.customer_email} · {b.customer_phone}
                  </p>
                  <p className="mt-1 text-sm text-party-ink/60">
                    {b.event_address}
                  </p>
                  {b.special_requests && (
                    <p className="mt-1 text-sm italic text-party-ink/50">
                      “{b.special_requests}”
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-display text-2xl font-bold italic">
                    {money(Number(b.total_amount))}
                  </div>
                  <div className="text-sm text-party-green">
                    {money(Number(b.deposit_amount))} deposit paid
                  </div>
                  <div className="text-sm font-semibold text-party-red">
                    {charged[b.id]
                      ? "Balance charged ✓"
                      : `${money(
                          Number(b.total_amount) - Number(b.deposit_amount)
                        )} balance due`}
                  </div>
                  <div className="text-xs text-party-ink/50">
                    {Number(b.delivery_fee) === 0
                      ? "Free delivery"
                      : `${money(Number(b.delivery_fee))} delivery`}
                  </div>
                </div>
              </div>

              {/* Payment + reminders (mock actions in demo) */}
              {(b.status === "confirmed" || b.status === "pending") && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-party-ink/12 pt-4">
                  <button
                    disabled={charged[b.id]}
                    onClick={() =>
                      setCharged((c) => ({ ...c, [b.id]: true }))
                    }
                    className="rounded-lg bg-party-green px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f9440] disabled:opacity-50"
                  >
                    {charged[b.id] ? "Balance charged" : "Charge balance"}
                  </button>
                  <button
                    disabled={reminded[b.id]}
                    onClick={() =>
                      setReminded((r) => ({ ...r, [b.id]: true }))
                    }
                    className="rounded-lg border border-party-ink/20 bg-white px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-party-cream disabled:opacity-50"
                  >
                    {reminded[b.id] ? "Reminder sent" : "Send reminder"}
                  </button>
                  <span className="text-xs text-party-ink/45">
                    Auto-reminder scheduled 3 days before event
                  </span>
                </div>
              )}

              {/* Status actions */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-party-ink/12 pt-4">
                {(["confirmed", "completed", "cancelled"] as BookingStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      disabled={busy === b.id || b.status === s}
                      onClick={() => setStatus(b.id, s)}
                      className={`rounded-lg border px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                        b.status === s
                          ? `border-transparent ${STATUS_STYLE[s]}`
                          : "border-party-ink/20 bg-white hover:bg-party-cream"
                      }`}
                    >
                      Mark {s}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
