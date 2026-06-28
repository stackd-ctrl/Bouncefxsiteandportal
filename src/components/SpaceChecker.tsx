"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

const CLEARANCE = 3; // ft of safety clearance recommended on each side
const VERTICAL_CLEARANCE = 2; // ft of headroom above the inflated unit (indoor)

// How many feet one of each unit represents. Inputs are entered in the chosen
// unit and converted to feet internally (footprints are defined in feet).
const UNITS = {
  ft: { label: "Feet", toFt: 1 },
  in: { label: "Inches", toFt: 1 / 12 },
  yd: { label: "Yards", toFt: 3 },
  m: { label: "Meters", toFt: 3.28084 },
} as const;
type Unit = keyof typeof UNITS;

type Mode = "dims" | "area";

export default function SpaceChecker({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.footprint && p.category === "inflatable");
  const [id, setId] = useState(items[0]?.id ?? "");
  const [unit, setUnit] = useState<Unit>("ft");
  const [mode, setMode] = useState<Mode>("dims");
  const [yardW, setYardW] = useState("");
  const [yardD, setYardD] = useState("");
  const [areaVal, setAreaVal] = useState("");
  const [ceiling, setCeiling] = useState("");

  const item = items.find((p) => p.id === id);
  const fp = item?.footprint ?? [0, 0];
  const needW = fp[0] + CLEARANCE * 2;
  const needD = fp[1] + CLEARANCE * 2;

  const factor = UNITS[unit].toFt;
  const u = unit === "ft" ? "ft" : unit; // short suffix for display
  // Round a feet value into the chosen unit for display.
  const inUnit = (ft: number) => Math.round((ft / factor) * 10) / 10;
  // Round a square-feet area into the chosen unit (squared) for display.
  const areaInUnit = (ft2: number) =>
    Math.round((ft2 / (factor * factor)) * 10) / 10;

  const footprintArea = fp[0] * fp[1]; // sq ft
  const needArea = needW * needD; // sq ft incl. clearance
  const height = item?.height; // ft, inflatables only
  // Minimum room ceiling for an indoor setup = inflated height + headroom.
  const minCeiling = height != null ? height + VERTICAL_CLEARANCE : null;

  // ── Space input → feet ──
  const w = parseFloat(yardW) * factor;
  const d = parseFloat(yardD) * factor;
  const hasDims = !isNaN(w) && !isNaN(d) && w > 0 && d > 0;
  // Area is entered in the chosen unit squared; convert to sq ft.
  const areaFt = parseFloat(areaVal) * factor * factor;
  const hasArea = !isNaN(areaFt) && areaFt > 0;

  const hasSpace = mode === "dims" ? hasDims : hasArea;
  const spaceFits =
    mode === "dims"
      ? hasDims &&
        ((w >= needW && d >= needD) || (w >= needD && d >= needW))
      : hasArea && areaFt >= needArea;

  // ── Ceiling input → feet (optional; indoor) ──
  const ceilingFt = parseFloat(ceiling) * factor;
  const hasCeiling = !isNaN(ceilingFt) && ceilingFt > 0;
  // Only a real constraint when the unit has a known height and a ceiling was entered.
  const ceilingFits =
    !hasCeiling || minCeiling == null || ceilingFt >= minCeiling;

  const showResult = hasSpace || hasCeiling;
  const allFits = spaceFits && ceilingFits;

  // ── Scaled visual ──
  // In area mode, represent the room as a square of equal area.
  const roomSide = hasArea ? Math.sqrt(areaFt) : 0;
  const visW = mode === "dims" ? (hasDims ? w : 0) : roomSide;
  const visD = mode === "dims" ? (hasDims ? d : 0) : roomSide;
  const maxDim = Math.max(needW, needD, visW, visD, 1);
  const pct = (n: number) => `${(n / maxDim) * 100}%`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <p className="eyebrow text-party-red">Will it fit?</p>
      <h3 className="mt-2 font-display text-2xl font-bold italic">
        Space &amp; fit checker
      </h3>
      <p className="mt-2 text-sm text-party-ink/60">
        Inflatables need a flat space plus about {CLEARANCE} ft of clearance on
        each side. Setting up indoors? Add the room's ceiling height too.
      </p>

      {/* Unit toggle */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="field-label !mb-0 mr-1">Measure in</span>
        {(Object.keys(UNITS) as Unit[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setUnit(key)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
              unit === key
                ? "border-transparent bg-party-ink text-white"
                : "border-party-ink/20 hover:bg-party-cream"
            }`}
          >
            {UNITS[key].label}
          </button>
        ))}
      </div>

      {/* How do you want to enter the space? */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="field-label !mb-0 mr-1">Enter space as</span>
        {(
          [
            ["dims", "Width × Depth"],
            ["area", "Total sq " + u],
          ] as [Mode, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
              mode === key
                ? "border-transparent bg-party-red text-white"
                : "border-party-ink/20 hover:bg-party-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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

        {mode === "dims" ? (
          <>
            <div>
              <label className="field-label">Your space width ({u})</label>
              <input
                type="number"
                inputMode="decimal"
                value={yardW}
                onChange={(e) => setYardW(e.target.value)}
                placeholder={unit === "in" ? "e.g. 360" : "e.g. 30"}
                className="field"
              />
            </div>
            <div>
              <label className="field-label">Your space depth ({u})</label>
              <input
                type="number"
                inputMode="decimal"
                value={yardD}
                onChange={(e) => setYardD(e.target.value)}
                placeholder={unit === "in" ? "e.g. 360" : "e.g. 30"}
                className="field"
              />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className="field-label">
              Total room / yard area (sq {u})
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={areaVal}
              onChange={(e) => setAreaVal(e.target.value)}
              placeholder="e.g. 1000"
              className="field"
            />
          </div>
        )}
      </div>

      {/* Ceiling height — optional, for indoor rooms */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="field-label">
            Room ceiling height ({u}) — indoor
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={ceiling}
            onChange={(e) => setCeiling(e.target.value)}
            placeholder={
              unit === "in" ? "e.g. 144" : unit === "ft" ? "e.g. 20" : "optional"
            }
            className="field"
          />
        </div>
        <p className="self-end pb-2 text-xs text-party-ink/50 sm:col-span-2">
          Leave blank for outdoor setups. We&apos;ll check it against the
          inflatable&apos;s height plus {VERTICAL_CLEARANCE} ft of headroom.
        </p>
      </div>

      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[1fr_220px]">
        <div>
          <p className="text-sm">
            <span className="font-semibold">{item?.name}</span> footprint:{" "}
            <span className="font-bold">
              {inUnit(fp[0])} × {inUnit(fp[1])} {u}
            </span>{" "}
            <span className="text-party-ink/60">
              ({areaInUnit(footprintArea)} sq {u})
            </span>
          </p>
          <p className="text-sm text-party-ink/70">
            With clearance, plan for{" "}
            <span className="font-bold">
              {inUnit(needW)} × {inUnit(needD)} {u}
            </span>{" "}
            <span className="text-party-ink/60">
              ({areaInUnit(needArea)} sq {u})
            </span>
            .
          </p>
          {minCeiling != null && (
            <p className="text-sm text-party-ink/70">
              Inflated height{" "}
              <span className="font-bold">
                {inUnit(height as number)} {u}
              </span>{" "}
              — needs a{" "}
              <span className="font-bold">
                {inUnit(minCeiling)} {u}
              </span>{" "}
              ceiling indoors.
            </p>
          )}

          {showResult && (
            <div className="mt-4 space-y-2">
              {/* Space verdict */}
              {hasSpace && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    spaceFits
                      ? "border-party-green/40 bg-party-green/10 text-party-green"
                      : "border-party-red/40 bg-party-red/10 text-party-red"
                  }`}
                >
                  {spaceFits
                    ? mode === "dims"
                      ? `Floor space works — your ${yardW}×${yardD} ${u} fits the ${item?.name}.`
                      : `Floor space works — ${areaVal} sq ${u} is enough for the ${item?.name}.`
                    : `Floor space looks tight. Plan for at least ${
                        mode === "dims"
                          ? `${inUnit(needW)}×${inUnit(needD)} ${u}`
                          : `${areaInUnit(needArea)} sq ${u}`
                      } — call us and we'll find the right fit.`}
                </div>
              )}

              {/* Ceiling verdict */}
              {hasCeiling && minCeiling != null && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    ceilingFits
                      ? "border-party-green/40 bg-party-green/10 text-party-green"
                      : "border-party-red/40 bg-party-red/10 text-party-red"
                  }`}
                >
                  {ceilingFits
                    ? `Ceiling works — ${ceiling} ${u} clears the ${inUnit(
                        minCeiling
                      )} ${u} this unit needs.`
                    : `Ceiling too low — this unit needs ${inUnit(
                        minCeiling
                      )} ${u} and your room is ${ceiling} ${u}. Ask us about a shorter option.`}
                </div>
              )}

              {/* Combined all-clear */}
              {hasSpace && hasCeiling && minCeiling != null && allFits && (
                <div className="rounded-xl border border-party-green/40 bg-party-green/10 px-4 py-3 text-sm font-bold text-party-green">
                  You&apos;re good to go — both floor space and ceiling check out!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scaled visual */}
        <div className="relative aspect-square w-full max-w-[220px] rounded-xl border-2 border-dashed border-party-ink/30 bg-party-cream">
          <span className="absolute left-2 top-2 text-[10px] font-bold uppercase tracking-wider text-party-ink/40">
            {mode === "dims" && hasDims
              ? `Your space ${yardW}×${yardD}${u}`
              : mode === "area" && hasArea
              ? `Your room ${areaVal} sq ${u}`
              : "Your space"}
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
