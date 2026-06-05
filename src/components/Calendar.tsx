"use client";

import { useState, useEffect } from "react";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Heat-map tint for a day based on booking load (0 = open, 1 = fully booked). */
function loadTint(load: number | undefined): string {
  if (load === undefined) return "hover:bg-party-cream";
  if (load >= 0.85) return "bg-party-red/20 hover:bg-party-red/30";
  if (load >= 0.45) return "bg-party-yellow/40 hover:bg-party-yellow/60";
  return "bg-party-green/15 hover:bg-party-green/25";
}

export default function Calendar({
  selected,
  onSelect,
  loads,
  onMonthChange,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
  /** Optional heat-map data: dateISO -> load 0..1. */
  loads?: Record<string, number>;
  /** Called on mount and whenever the visible month changes. */
  onMonthChange?: (year: number, monthIndex: number) => void;
}) {
  const now = new Date();
  const [view, setView] = useState({
    y: now.getFullYear(),
    m: now.getMonth(),
  });

  useEffect(() => {
    onMonthChange?.(view.y, view.m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.y, view.m]);

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(dir: number) {
    setView((v) => {
      const m = v.m + dir;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }

  const isPast = (d: number) => iso(view.y, view.m, d) < todayIso;

  return (
    <div className="rounded-2xl border border-party-ink/12 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-party-ink/20 text-lg transition-colors hover:bg-party-cream"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="font-display text-xl font-bold italic">
          {MONTHS[view.m]} {view.y}
        </h3>
        <button
          onClick={() => shift(1)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-party-ink/20 text-lg transition-colors hover:bg-party-cream"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => (
          <div
            key={d}
            className="py-1 text-[11px] font-bold uppercase tracking-wider text-party-ink/40"
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const cellIso = iso(view.y, view.m, d);
          const past = isPast(d);
          const isSelected = selected === cellIso;
          const isToday = cellIso === todayIso;
          const tint = past ? "" : loadTint(loads?.[cellIso]);
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => onSelect(cellIso)}
              className={`aspect-square rounded-lg font-body text-sm font-semibold transition-colors ${
                isSelected
                  ? "bg-party-red text-white ring-2 ring-inset ring-party-ink"
                  : past
                  ? "text-party-ink/20"
                  : isToday
                  ? `${tint} ring-1 ring-inset ring-party-red/50`
                  : tint
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
