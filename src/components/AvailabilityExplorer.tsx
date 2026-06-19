"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Calendar from "./Calendar";
import { money, prettyDate } from "@/lib/format";

interface AvailItem {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  image_url: string;
  available: boolean;
  remaining?: number;
  owned?: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  inflatable: "Inflatable",
  table: "Table",
  chair: "Chair",
  tent: "Tent",
  bundle: "Bundle",
};

export default function AvailabilityExplorer({
  initialProduct,
}: {
  initialProduct?: string;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [items, setItems] = useState<AvailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loads, setLoads] = useState<Record<string, number>>({});

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${d}`);
      const data = await res.json();
      setItems(data.availability ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMonth = useCallback(async (year: number, monthIndex: number) => {
    try {
      const res = await fetch(
        `/api/availability/month?year=${year}&month=${monthIndex + 1}`
      );
      const data = await res.json();
      setLoads((cur) => ({ ...cur, ...(data.loads ?? {}) }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (date) load(date);
  }, [date, load]);

  const availableCount = items.filter((i) => i.available).length;
  const sorted = useMemo(() => {
    const list = onlyAvailable ? items.filter((i) => i.available) : items;
    return [...list].sort(
      (a, b) => Number(b.available) - Number(a.available)
    );
  }, [items, onlyAvailable]);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {/* ── Sidebar: calendar + info ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Calendar
          selected={date}
          onSelect={setDate}
          loads={loads}
          onMonthChange={loadMonth}
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-party-green/60" />
            Wide open
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-party-yellow" />
            Filling up
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-party-red/60" />
            Almost booked
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-party-ink/12 bg-white p-5 shadow-soft">
          <p className="eyebrow text-party-red">Good to know</p>
          <ul className="mt-3 space-y-3 text-sm">
            {[
              ["Free delivery", "Within 15 miles of 22401"],
              ["$50 deposit", "Confirms your date online"],
              ["Setup included", "We deliver, set up & pick up"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start justify-between gap-3">
                <span className="font-display text-base font-bold italic">
                  {t}
                </span>
                <span className="text-right text-party-ink/55">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Results ── */}
      <div>
        {!date && (
          <div className="rounded-2xl border border-dashed border-party-ink/25 bg-white p-10 text-center sm:p-14">
            <p className="eyebrow text-party-red">Step 1</p>
            <h3 className="mt-3 font-display text-3xl font-bold italic">
              Choose your event date
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-party-ink/60">
              Pick a date on the calendar and we'll show you exactly what's
              available to book for your celebration.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Inflatables", "Tents", "Tables & Chairs"].map((t) => (
                <div
                  key={t}
                  className="rounded-xl bg-party-cream px-3 py-4 font-display text-lg font-bold italic"
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {date && (
          <>
            {/* Summary bar */}
            <div className="rounded-2xl bg-party-ink px-6 py-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Availability for
                  </p>
                  <p className="font-display text-2xl font-bold italic">
                    {prettyDate(date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold italic text-party-yellow">
                    {loading ? "…" : availableCount}
                    <span className="text-lg text-white/60">
                      {" "}
                      / {items.length}
                    </span>
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    items available
                  </p>
                </div>
              </div>
            </div>

            {/* Filter toggle */}
            <div className="mt-5 flex items-center gap-6 border-b border-party-ink/15 pb-1">
              <button
                onClick={() => setOnlyAvailable(false)}
                className={`tab ${!onlyAvailable ? "tab-active" : ""}`}
              >
                All items
              </button>
              <button
                onClick={() => setOnlyAvailable(true)}
                className={`tab ${onlyAvailable ? "tab-active" : ""}`}
              >
                Available only
              </button>
            </div>

            {/* Item list */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {sorted.map((it) => (
                <div
                  key={it.id}
                  className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
                    it.available
                      ? "border-party-ink/12 bg-white shadow-soft"
                      : "border-party-ink/10 bg-party-cream/60"
                  }`}
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={it.image_url}
                      alt={it.name}
                      fill
                      sizes="96px"
                      className={`object-cover ${
                        it.available ? "" : "grayscale"
                      }`}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-party-ink/45">
                      {CATEGORY_LABEL[it.category] ?? "Rental"}
                    </span>
                    <h4 className="font-display text-lg font-bold italic leading-tight">
                      {it.name}
                    </h4>
                    <p className="text-sm font-semibold text-party-ink/55">
                      {money(it.price_per_day)}/day
                    </p>
                    {it.available &&
                      it.remaining !== undefined &&
                      it.owned !== undefined &&
                      it.owned > 1 &&
                      it.remaining <= 3 && (
                        <p className="text-xs font-bold text-party-red">
                          Only {it.remaining} left for this date!
                        </p>
                      )}
                    <div className="mt-auto pt-2">
                      {it.available ? (
                        <Link
                          href={`/book?product=${it.id}&date=${date}`}
                          className="btn-red btn-pill !px-4 !py-2 !text-sm"
                        >
                          Book This Item
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-party-ink/10 px-3 py-1.5 text-xs font-bold text-party-ink/60">
                          Booked for this date
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {onlyAvailable && availableCount === 0 && !loading && (
              <p className="mt-8 rounded-2xl bg-party-cream p-8 text-center text-party-ink/60">
                Everything's booked for this date. Try another date or{" "}
                <Link href="/contact" className="font-semibold underline">
                  contact us
                </Link>{" "}
                about your event.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
