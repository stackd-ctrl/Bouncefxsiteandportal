"use client";

import { useMemo, useRef, useState } from "react";
import type { Lead } from "@/lib/content";
import type { Booking } from "@/lib/types";
import { money, prettyDate, todayISO } from "@/lib/format";

type Stage = Lead["stage"];

const STAGES: Stage[] = ["new", "contacted", "quoted", "booked"];

const STAGE_STYLE: Record<Stage, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-amber-100 text-amber-800",
  quoted: "bg-violet-100 text-violet-800",
  booked: "bg-emerald-100 text-emerald-800",
};

// A unified customer row: either a stored lead (editable) or one derived from
// bookings. Derived rows get "promoted" to a real lead the moment they're edited.
type Row = Lead & {
  isLead: boolean;
  bookingsCount: number;
  totalSpent: number;
  lastEvent?: string;
};

type SortKey = "name" | "email" | "stage" | "source" | "bookingsCount";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `lead-${Math.random().toString(36).slice(2)}`;
}

function rowToLead(r: Row): Lead {
  return {
    id: r.isLead ? r.id : newId(),
    name: r.name,
    email: r.email,
    phone: r.phone,
    stage: r.stage,
    source: r.isLead ? r.source : "Booking",
    notes: r.notes,
    archived: r.archived,
    created_at: r.created_at,
  };
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

export default function CustomersPanel({
  leads: initial,
  bookings,
}: {
  leads: Lead[];
  bookings: Booking[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<Row | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function persist(next: Lead[]) {
    setLeads(next);
    setSaveState("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: next }),
      });
      setSaveState(res.ok ? "saved" : "idle");
    } catch {
      setSaveState("idle");
    }
  }

  function upsert(lead: Lead) {
    const exists = leads.some((l) => l.id === lead.id);
    persist(exists ? leads.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...leads]);
  }

  // ── Merge leads + booking-derived customers (dedup by email) ──
  const rows = useMemo<Row[]>(() => {
    const byEmail = new Map<
      string,
      { name: string; phone: string; count: number; total: number; last: string }
    >();
    for (const b of bookings) {
      const key = (b.customer_email || "").toLowerCase();
      if (!key) continue;
      const e =
        byEmail.get(key) ??
        { name: b.customer_name, phone: b.customer_phone, count: 0, total: 0, last: "" };
      e.count += 1;
      e.total += Number(b.total_amount) || 0;
      if (!e.last || b.event_date > e.last) e.last = b.event_date;
      e.name = e.name || b.customer_name;
      e.phone = e.phone || b.customer_phone;
      byEmail.set(key, e);
    }

    const out: Row[] = [];
    const leadEmails = new Set<string>();
    for (const l of leads) {
      const key = (l.email || "").toLowerCase();
      if (key) leadEmails.add(key);
      const s = key ? byEmail.get(key) : undefined;
      out.push({
        ...l,
        isLead: true,
        bookingsCount: s?.count ?? 0,
        totalSpent: s?.total ?? 0,
        lastEvent: s?.last,
      });
    }
    for (const [key, s] of Array.from(byEmail.entries())) {
      if (leadEmails.has(key)) continue;
      out.push({
        id: `bk-${key}`,
        name: s.name,
        email: key,
        phone: s.phone,
        stage: "booked",
        source: "Booking",
        notes: "",
        created_at: s.last || todayISO(),
        isLead: false,
        bookingsCount: s.count,
        totalSpent: s.total,
        lastEvent: s.last,
      });
    }
    return out;
  }, [leads, bookings]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => !r.archived);
    return {
      total: active.length,
      booked: active.filter((r) => r.bookingsCount > 0).length,
      open: active.filter((r) => r.bookingsCount === 0).length,
      archived: rows.filter((r) => r.archived).length,
    };
  }, [rows]);

  const view = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (stageFilter === "archived") return r.archived;
      if (r.archived) return false;
      if (stageFilter !== "all" && r.stage !== stageFilter) return false;
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (q) {
        const hay = `${r.name} ${r.email} ${r.phone} ${r.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "bookingsCount") {
        av = a.bookingsCount;
        bv = b.bookingsCount;
      } else {
        av = String(a[sortKey] ?? "").toLowerCase();
        bv = String(b[sortKey] ?? "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, search, stageFilter, sourceFilter, sortKey, sortDir]);

  const sources = useMemo(
    () => Array.from(new Set(rows.map((r) => r.source).filter(Boolean))),
    [rows]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function addLead() {
    const lead: Lead = {
      id: newId(),
      name: "",
      email: "",
      phone: "",
      stage: "new",
      source: "Manual",
      notes: "",
      created_at: todayISO(),
    };
    persist([lead, ...leads]);
    setEditing({ ...lead, isLead: true, bookingsCount: 0, totalSpent: 0 });
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Stage",
      "Source",
      "Bookings",
      "Total Spent",
      "Notes",
      "Created",
    ];
    const lines = [headers.join(",")];
    for (const r of view) {
      lines.push(
        [
          r.name,
          r.email,
          r.phone,
          r.stage,
          r.source,
          r.bookingsCount,
          r.totalSpent,
          (r.notes ?? "").replace(/\n/g, " "),
          r.created_at,
        ]
          .map(csvCell)
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bounce-fx-customers-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const all = String(reader.result)
        .split(/\r?\n/)
        .filter((l) => l.trim());
      if (all.length < 2) return;
      const cols = parseLine(all[0]).map((h) => h.trim().toLowerCase());
      const idx = (n: string) => cols.indexOf(n);
      const imported: Lead[] = all.slice(1).map((line) => {
        const f = parseLine(line);
        const get = (n: string) => (idx(n) >= 0 ? f[idx(n)] ?? "" : "");
        const stage = get("stage").toLowerCase();
        return {
          id: newId(),
          name: get("name"),
          email: get("email"),
          phone: get("phone"),
          stage: (STAGES.includes(stage as Stage) ? stage : "new") as Stage,
          source: get("source") || "Import",
          notes: get("notes"),
          created_at: get("created") || todayISO(),
        };
      });
      persist([...imported, ...leads]);
    };
    reader.readAsText(file);
  }

  const STAT = [
    { label: "Customers", value: stats.total },
    { label: "Booked", value: stats.booked },
    { label: "Leads (no booking)", value: stats.open },
    { label: "Archived", value: stats.archived },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT.map((s) => (
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

      <p className="text-xs text-gray-500">
        One unified list — auto-pulled from bookings and website contact forms,
        plus anyone you add or import. Matched by email so each person appears
        once.
      </p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, source…"
          className="min-w-[180px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red"
        >
          <option value="all">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
          <option value="archived">Archived</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red"
        >
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
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
        <button
          onClick={addLead}
          className="rounded-lg bg-party-red px-3 py-2 text-sm font-semibold text-white hover:bg-party-red/90"
        >
          + Add
        </button>
        {saveState !== "idle" && (
          <span className="text-xs font-semibold text-gray-500">
            {saveState === "saving" ? "Saving…" : "Saved ✓"}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <Th label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th label="Email" k="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 font-medium">Phone</th>
              <Th label="Stage" k="stage" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th label="Source" k="source" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <Th label="Bookings" k="bookingsCount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  {rows.length === 0
                    ? "No customers yet. They'll appear here from bookings and contact forms — or add/import your own."
                    : "No customers match your filters."}
                </td>
              </tr>
            )}
            {view.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {r.name || <span className="text-gray-400">(no name)</span>}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.email}</td>
                <td className="px-4 py-3 text-gray-700">{r.phone}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.stage}
                    onChange={(e) =>
                      upsert({ ...rowToLead(r), stage: e.target.value as Stage })
                    }
                    className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${
                      STAGE_STYLE[r.stage]
                    }`}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {r.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {r.bookingsCount > 0 ? (
                    <>
                      {r.bookingsCount}
                      <span className="block text-[11px] text-gray-400">
                        {money(r.totalSpent)} total
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(r)}
                      className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        upsert({ ...rowToLead(r), archived: !r.archived })
                      }
                      className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                    >
                      {r.archived ? "Restore" : "Archive"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Showing {view.length} of {rows.length}. Edits to a booking customer save
        them into your list. Persists once Supabase is connected.
      </p>

      {editing && (
        <EditDrawer
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(lead) => {
            upsert(lead);
            setEditing(null);
          }}
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
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <th className="px-4 py-3 font-medium">
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
  row,
  onClose,
  onSave,
}: {
  row: Row;
  onClose: () => void;
  onSave: (l: Lead) => void;
}) {
  const [d, setD] = useState<Lead>(rowToLead(row));
  function set(patch: Partial<Lead>) {
    setD((c) => ({ ...c, ...patch }));
  }
  const labelCls = "block text-xs font-semibold text-gray-600";
  const inputCls =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-party-red";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Customer details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {row.bookingsCount > 0 && (
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-600">
            {row.bookingsCount} booking{row.bookingsCount === 1 ? "" : "s"} ·{" "}
            {money(row.totalSpent)} total
            {row.lastEvent ? ` · last ${prettyDate(row.lastEvent)}` : ""}
          </div>
        )}
        <div className="space-y-4 p-5">
          <div>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={d.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={inputCls}
                value={d.email}
                onChange={(e) => set({ email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={inputCls}
                value={d.phone}
                onChange={(e) => set({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Stage</label>
              <select
                className={inputCls}
                value={d.stage}
                onChange={(e) => set({ stage: e.target.value as Stage })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <input
                className={inputCls}
                value={d.source}
                onChange={(e) => set({ source: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={5}
              className={`${inputCls} resize-none`}
              value={d.notes}
              onChange={(e) => set({ notes: e.target.value })}
            />
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
            className="rounded-lg bg-party-red px-4 py-2 text-sm font-semibold text-white hover:bg-party-red/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
