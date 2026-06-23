"use client";

import { useMemo, useRef, useState } from "react";
import type { Booking, BookingStatus, Product } from "@/lib/types";
import { money, prettyDate, todayISO } from "@/lib/format";
import { paymentLabel } from "@/lib/pricing";

type Row = Booking & { archived?: boolean };

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-sky-100 text-sky-800",
  cancelled: "bg-gray-200 text-gray-600",
};

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

type SortKey =
  | "customer_name"
  | "event_date"
  | "event_type"
  | "total_amount"
  | "deposit_amount"
  | "balance"
  | "status";

function balanceOf(b: Row) {
  return Math.round((Number(b.total_amount) - Number(b.deposit_amount)) * 100) / 100;
}

// Pre-fills the owner's email client to send the rental agreement to a customer.
function agreementMailto(b: Row): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/rental-agreement.pdf`;
  const subject = encodeURIComponent(
    "Your Bounce FX Party Rentals rental agreement"
  );
  const body = encodeURIComponent(
    `Hi ${b.customer_name},\n\nThanks for booking with Bounce FX Party Rentals! ` +
      `Before your event${
        b.event_date ? ` on ${prettyDate(b.event_date)}` : ""
      }, please review and sign our rental & safety agreement:\n\n${url}\n\n` +
      `Reply to this email with any questions.\n\n— Bounce FX Party Rentals`
  );
  return `mailto:${b.customer_email}?subject=${subject}&body=${body}`;
}

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else if (c === '"') q = true;
    else cur += c;
  }
  out.push(cur);
  return out;
}

export default function AdminDashboard({
  bookings: initial,
  products = [],
  email,
}: {
  bookings: Booking[];
  products?: Product[];
  email: string | null;
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all | <status> | archived
  const [sortKey, setSortKey] = useState<SortKey>("event_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<Row | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const today = todayISO();

  // ── Stats (active, non-archived) ──
  const stats = useMemo(() => {
    const active = rows.filter((b) => !b.archived && b.status !== "cancelled");
    const revenue = active.reduce((s, b) => s + Number(b.total_amount), 0);
    const collected = active.reduce((s, b) => s + Number(b.deposit_amount), 0);
    const upcoming = active.filter(
      (b) =>
        b.event_date >= today &&
        (b.status === "confirmed" || b.status === "pending")
    ).length;
    return { revenue, collected, outstanding: revenue - collected, upcoming };
  }, [rows, today]);

  // ── Filter + search + sort ──
  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((b) => {
      if (statusFilter === "archived") return b.archived;
      if (b.archived) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (q) {
        const hay =
          `${b.customer_name} ${b.customer_email} ${b.customer_phone} ${b.event_address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "balance") {
        av = balanceOf(a);
        bv = balanceOf(b);
      } else if (sortKey === "total_amount" || sortKey === "deposit_amount") {
        av = Number(a[sortKey]);
        bv = Number(b[sortKey]);
      } else {
        av = String(a[sortKey] ?? "").toLowerCase();
        bv = String(b[sortKey] ?? "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function setStatus(id: string, status: BookingStatus) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await fetch("/api/admin/booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      /* ignore */
    }
  }

  async function setArchived(id: string, archived: boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, archived } : r)));
    try {
      await fetch("/api/admin/booking-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, archived }),
      });
    } catch {
      /* ignore */
    }
  }

  async function saveEdit(draft: Row) {
    setSavingEdit(true);
    const patch = {
      id: draft.id,
      customer_name: draft.customer_name,
      customer_email: draft.customer_email,
      customer_phone: draft.customer_phone,
      event_address: draft.event_address,
      event_type: draft.event_type,
      event_date: draft.event_date,
      special_requests: draft.special_requests,
      status: draft.status,
    };
    try {
      await fetch("/api/admin/booking-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      /* ignore */
    }
    setRows((rs) => rs.map((r) => (r.id === draft.id ? { ...r, ...patch } : r)));
    setEditing(null);
    setSavingEdit(false);
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Event Date",
      "Type",
      "Address",
      "Items",
      "Total",
      "Paid",
      "Balance",
      "Status",
      "Created",
      "Notes",
    ];
    const lines = [headers.join(",")];
    for (const b of view) {
      lines.push(
        [
          b.customer_name,
          b.customer_email,
          b.customer_phone,
          b.event_date,
          b.event_type,
          b.event_address,
          b.product_ids?.length ?? 0,
          b.total_amount,
          b.deposit_amount,
          balanceOf(b),
          b.status,
          b.created_at ?? "",
          (b.special_requests ?? "").replace(/\n/g, " "),
        ]
          .map(csvCell)
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bounce-fx-bookings-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const linesAll = text.split(/\r?\n/).filter((l) => l.trim());
      if (linesAll.length < 2) return;
      const cols = parseLine(linesAll[0]).map((h) => h.trim().toLowerCase());
      const idx = (n: string) => cols.indexOf(n);
      const imported: Row[] = linesAll.slice(1).map((line) => {
        const f = parseLine(line);
        const get = (n: string) => (idx(n) >= 0 ? f[idx(n)] ?? "" : "");
        const total = Number(get("total")) || 0;
        return {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `imp-${Math.round(total)}-${line.length}`,
          product_ids: [],
          event_date: get("event date") || today,
          customer_name: get("name"),
          customer_email: get("email"),
          customer_phone: get("phone"),
          event_address: get("address"),
          event_type: get("type") || "Other",
          special_requests: get("notes"),
          total_amount: total,
          deposit_amount: Number(get("paid")) || 0,
          delivery_fee: 0,
          stripe_payment_intent_id: null,
          status: (STATUSES.includes(get("status") as BookingStatus)
            ? get("status")
            : "pending") as BookingStatus,
          created_at: today,
        };
      });
      setRows((rs) => [...imported, ...rs]);
    };
    reader.readAsText(file);
  }

  const STAT_CARDS = [
    { label: "Revenue (active)", value: money(stats.revenue) },
    { label: "Collected", value: money(stats.collected) },
    { label: "Outstanding", value: money(stats.outstanding) },
    { label: "Upcoming events", value: String(stats.upcoming) },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, address…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={exportCsv}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Export CSV
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importCsv(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <Th label="Customer" k="customer_name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th label="Event date" k="event_date" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th label="Type" k="event_type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Items</th>
              <Th label="Total" k="total_amount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} right />
              <Th label="Paid" k="deposit_amount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} right />
              <Th label="Balance" k="balance" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} right />
              <Th label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  {rows.length === 0
                    ? "No bookings yet. They'll appear here as customers book online."
                    : "No bookings match your filters."}
                </td>
              </tr>
            )}
            {view.map((b) => {
              const bal = balanceOf(b);
              return (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">
                      {b.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">{b.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {b.event_date ? prettyDate(b.event_date) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.event_type}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {b.product_ids?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {money(Number(b.total_amount))}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {money(Number(b.deposit_amount))}
                    <span className="block text-[11px] text-gray-400">
                      {paymentLabel(
                        Number(b.total_amount),
                        Number(b.deposit_amount)
                      )}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      bal > 0 ? "text-gray-900" : "text-emerald-600"
                    }`}
                  >
                    {bal > 0 ? money(bal) : "Paid"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        setStatus(b.id, e.target.value as BookingStatus)
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${
                        STATUS_STYLE[b.status]
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(b)}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      {b.archived ? (
                        <button
                          onClick={() => setArchived(b.id, false)}
                          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => setArchived(b.id, true)}
                          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Showing {view.length} of {rows.length} booking
        {rows.length === 1 ? "" : "s"}. Edits, archiving and imports persist once
        the Supabase backend is connected; until then they apply for this
        session.
      </p>

      {editing && (
        <EditDrawer
          booking={editing}
          saving={savingEdit}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}

function Th({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  right,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  right?: boolean;
}) {
  const active = sortKey === k;
  return (
    <th className={`px-4 py-3 font-medium ${right ? "text-right" : ""}`}>
      <button
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 hover:text-gray-800 ${
          active ? "text-gray-900" : ""
        }`}
      >
        {label}
        <span className="text-[10px]">
          {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function EditDrawer({
  booking,
  saving,
  onClose,
  onSave,
}: {
  booking: Row;
  saving: boolean;
  onClose: () => void;
  onSave: (b: Row) => void;
}) {
  const [d, setD] = useState<Row>(booking);
  function set(patch: Partial<Row>) {
    setD((cur) => ({ ...cur, ...patch }));
  }
  const labelCls = "block text-xs font-semibold text-gray-600";
  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Edit booking</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className={labelCls}>Customer name</label>
            <input
              className={inputCls}
              value={d.customer_name}
              onChange={(e) => set({ customer_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={inputCls}
                value={d.customer_email}
                onChange={(e) => set({ customer_email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                value={d.customer_phone}
                onChange={(e) => set({ customer_phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Event date</label>
              <input
                type="date"
                className={inputCls}
                value={d.event_date}
                onChange={(e) => set({ event_date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={d.status}
                onChange={(e) =>
                  set({ status: e.target.value as BookingStatus })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Event type</label>
            <input
              className={inputCls}
              value={d.event_type}
              onChange={(e) => set({ event_type: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Event address</label>
            <input
              className={inputCls}
              value={d.event_address}
              onChange={(e) => set({ event_address: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={d.special_requests ?? ""}
              onChange={(e) => set({ special_requests: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className={labelCls}>Quick actions</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={agreementMailto(d)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Email rental agreement
              </a>
              <a
                href="/rental-agreement.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                View agreement PDF
              </a>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(d)}
            disabled={saving}
            className="rounded-lg bg-party-red px-4 py-2 text-sm font-semibold text-white hover:bg-party-red/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
