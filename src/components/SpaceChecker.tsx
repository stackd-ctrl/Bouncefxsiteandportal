"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

const CLEARANCE = 3; // ft of safety clearance recommended on each side

export default function SpaceChecker({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.footprint && p.category === "inflatable");
  const [id, setId] = useState(items[0]?.id ?? "");
  const [yardW, setYardW] = useState("");
  const [yardD, setYardD] = useState("");

  const item = items.find((p) => p.id === id);
  const fp = item?.footprint ?? [0, 0];
  const needW = fp[0] + CLEARANCE * 2;
  const needD = fp[1] + CLEARANCE * 2;

  const w = parseFloat(yardW);
  const d = parseFloat(yardD);
  const hasInput = !isNaN(w) && !isNaN(d) && w > 0 && d > 0;
  // allow either orientation
  const fits =
    hasInput &&
    ((w >= needW && d >= needD) || (w >= needD && d >= needW));

  // scale visual to the larger dimension
  const maxDim = Math.max(needW, needD, hasInput ? Math.max(w, d) : 0, 1);
  const pct = (n: number) => `${(n / maxDim) * 100}%`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <p className="eyebrow text-party-red">Will it fit?</p>
      <h3 className="mt-2 font-display text-2xl font-bold italic">
        Space &amp; fit checker
      </h3>
      <p className="mt-2 text-sm text-party-ink/60">
        Inflatables need a flat space plus about {CLEARANCE} ft of clearance on
        each side. Check your yard before you book.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="field-label">Inflatable</label>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="field"
          >
            {items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Your space width (ft)</label>
          <input
            type="number"
            inputMode="decimal"
            value={yardW}
            onChange={(e) => setYardW(e.target.value)}
            placeholder="e.g. 30"
            className="field"
          />
        </div>
        <div>
          <label className="field-label">Your space depth (ft)</label>
          <input
            type="number"
            inputMode="decimal"
            value={yardD}
            onChange={(e) => setYardD(e.target.value)}
            placeholder="e.g. 30"
            className="field"
          />
        </div>
      </div>

      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[1fr_220px]">
        <div>
          <p className="text-sm">
            <span className="font-semibold">{item?.name}</span> footprint:{" "}
            <span className="font-bold">
              {fp[0]} × {fp[1]} ft
            </span>
          </p>
          <p className="text-sm text-party-ink/70">
            With clearance, plan for{" "}
            <span className="font-bold">
              {needW} × {needD} ft
            </span>
            .
          </p>

          {hasInput && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                fits
                  ? "border-party-green/40 bg-party-green/10 text-party-green"
                  : "border-party-red/40 bg-party-red/10 text-party-red"
              }`}
            >
              {fits
                ? `You're good to go — your ${w}×${d} ft space fits the ${item?.name}!`
                : `That might be tight. We'd recommend at least ${needW}×${needD} ft — give us a call and we'll find the right fit.`}
            </div>
          )}
        </div>

        {/* Scaled visual */}
        <div className="relative aspect-square w-full max-w-[220px] rounded-xl border-2 border-dashed border-party-ink/30 bg-party-cream">
          <span className="absolute left-2 top-2 text-[10px] font-bold uppercase tracking-wider text-party-ink/40">
            {hasInput ? `Your space ${w}×${d}ft` : "Your space"}
          </span>
          <div
            className="absolute bottom-0 left-0 grid place-items-center rounded-tr-lg bg-party-red/80 text-center text-[10px] font-bold leading-tight text-white"
            style={{ width: pct(needW), height: pct(needD) }}
          >
            {item?.name.split(" ")[0]}
          </div>
        </div>
      </div>
    </div>
  );
}
