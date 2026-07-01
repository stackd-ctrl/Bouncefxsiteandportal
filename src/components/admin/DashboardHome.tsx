"use client";

import { useMemo } from "react";
import type { Booking, Product } from "@/lib/types";
import type { Lead } from "@/lib/content";
import { money, prettyDate, todayISO } from "@/lib/format";

type Row = Booking & { archived?: boolean };

export default function DashboardHome({
  greetingName,
  bookings,
  products,
  leads,
  onNavigate,
  onOpenBooking,
}: {
  greetingName: string;
  bookings: Row[];
  products: Product[];
  leads: Lead[];
  onNavigate: (tab: string) => void;
  onOpenBooking: (id: string) => void;
}) {
  const today = todayISO();

  const stats = useMemo(() => {
    const active = bookings.filter(
      (b) => !b.archived && b.status !== "cancelled"
    );
    const revenue = active.reduce((s, b) => s + Number(b.total_amount), 0);
    const collected = active.reduce((s, b) => s + Number(b.deposit_amount), 0);
    const upcoming = active.filter(
      (b) =>
        b.event_date >= today &&
        (b.status === "confirmed" || b.status === "pending")
    ).length;
    return {
      revenue,
      collected,
      outstanding: revenue - collected,
      upcoming,
      total: active.length,
    };
  }, [bookings, today]);

  // Next upcoming events (soonest first).
  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            !b.archived && b.status !== "cancelled" && b.event_date >= today
        )
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
        .slice(0, 5),
    [bookings, today]
  );

  // Most recently added bookings.
  const recent = useMemo(
    () =>
      [...bookings]
        .filter((b) => !b.archived)
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice(0, 5),
    [bookings]
  );

  const recentLeads = useMemo(() => leads.slice(0, 5), [leads]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {greeting}, {greetingName} 👋
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with Bounce FX today —{" "}
          {prettyDate(today)}.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Upcoming events"
          value={String(stats.upcoming)}
          accent="text-party-red"
          onClick={() => onNavigate("bookings")}
        />
        <StatCard
          label="Booked revenue"
          value={money(stats.revenue)}
          accent="text-gray-900"
          onClick={() => onNavigate("bookings")}
        />
        <StatCard
          label="Collected"
          value={money(stats.collected)}
          accent="text-green-600"
          onClick={() => onNavigate("bookings")}
        />
        <StatCard
          label="Outstanding"
          value={money(stats.outstanding)}
          accent="text-amber-600"
          onClick={() => onNavigate("bookings")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <Panel
          title="Upcoming events"
          action={{ label: "All bookings", onClick: () => onNavigate("bookings") }}
        >
          {upcoming.length === 0 ? (
            <Empty text="No upcoming events yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => onOpenBooking(b.id)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {b.customer_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {b.event_type} · {prettyDate(b.event_date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-gray-700">
                      {money(Number(b.total_amount))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Recent bookings */}
        <Panel
          title="Recent bookings"
          action={{ label: "All bookings", onClick: () => onNavigate("bookings") }}
        >
          {recent.length === 0 ? (
            <Empty text="No bookings yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((b) => (
                <li key={b.id}>
                  <button
                    onClick={() => onOpenBooking(b.id)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {b.order_number != null ? `#${b.order_number} · ` : ""}
                        {b.customer_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {b.customer_email}
                      </p>
                    </div>
                    <StatusPill status={b.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Recent leads */}
        <Panel
          title="Recent leads"
          action={{ label: "Customers", onClick: () => onNavigate("customers") }}
        >
          {recentLeads.length === 0 ? (
            <Empty text="No leads captured yet." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLeads.map((l, i) => (
                <li
                  key={l.email || i}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {l.name || l.email || "Unknown"}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {l.email}
                      {l.source ? ` · ${l.source}` : ""}
                    </p>
                  </div>
                  {l.stage && (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                      {l.stage}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Quick actions */}
        <Panel title="Quick actions">
          <div className="grid grid-cols-2 gap-3 pt-1">
            <QuickLink label="Bookings" desc="Orders & CRM" onClick={() => onNavigate("bookings")} />
            <QuickLink label="Products" desc="Catalog & stock" onClick={() => onNavigate("products")} />
            <QuickLink label="Pages" desc="Edit site copy" onClick={() => onNavigate("pages")} />
            <QuickLink label="Media" desc="Photos & logo" onClick={() => onNavigate("media")} />
            <QuickLink label="Settings" desc="Business & profile" onClick={() => onNavigate("settings")} />
            <QuickLink label="Customers" desc="Leads & contacts" onClick={() => onNavigate("customers")} />
          </div>
          <p className="mt-4 text-xs text-gray-400">
            {products.length} products in the catalog.
          </p>
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-colors hover:border-gray-300"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </button>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold text-party-red hover:underline"
          >
            {action.label} →
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function QuickLink({
  label,
  desc,
  onClick,
}: {
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-gray-200 px-3 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-gray-400">{text}</p>;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-gray-100 text-gray-500",
    completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}
