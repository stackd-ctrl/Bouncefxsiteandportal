"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";

const EVENT_TYPES = ["Birthday", "Church", "School", "HOA", "Corporate"];

export default function PartyBuilder({ products }: { products: Product[] }) {
  const [guests, setGuests] = useState(30);
  const [eventType, setEventType] = useState("Birthday");

  const chairs = products.find((p) => p.category === "chair");
  const table = products.find((p) => p.category === "table");
  const tent = products.find((p) => p.category === "tent");
  const inflatables = products.filter((p) => p.category === "inflatable");

  const setup = useMemo(() => {
    const items: { product: Product; qty: number }[] = [];
    if (chairs) items.push({ product: chairs, qty: guests });
    if (table) items.push({ product: table, qty: Math.ceil(guests / 8) });
    if (tent && guests >= 30)
      items.push({ product: tent, qty: guests >= 60 ? 2 : 1 });
    // headline inflatable scales with crowd
    const pick =
      guests >= 45
        ? inflatables.find((p) => p.name.includes("Grand")) ?? inflatables[0]
        : guests >= 18
        ? inflatables[0]
        : null;
    if (pick) items.push({ product: pick, qty: 1 });
    return items;
  }, [guests, chairs, table, tent, inflatables]);

  const total = setup.reduce(
    (s, it) => s + it.product.price_per_day * it.qty,
    0
  );

  const productParam = setup.map((it) => it.product.id).join(",");
  const note = `Auto-built for ${guests} ${eventType.toLowerCase()} guests: ${setup
    .map((it) => `${it.qty}× ${it.product.name}`)
    .join(", ")}`;
  const bookHref = `/book?products=${productParam}&note=${encodeURIComponent(
    note
  )}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Controls */}
      <div>
        <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
          <label className="field-label">Occasion</label>
          <div className="mb-6 mt-2 flex flex-wrap gap-2">
            {EVENT_TYPES.map((e) => (
              <button
                key={e}
                onClick={() => setEventType(e)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  eventType === e
                    ? "border-transparent bg-party-ink text-white"
                    : "border-party-ink/20 hover:bg-party-cream"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <label className="field-label !mb-0">How many guests?</label>
            <span className="font-display text-4xl font-bold italic text-party-red">
              {guests}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-3 w-full accent-party-red"
          />
          <div className="mt-1 flex justify-between text-xs text-party-ink/40">
            <span>10</span>
            <span>150</span>
          </div>
        </div>

        {/* Recommended items */}
        <div className="mt-6 space-y-3">
          {setup.map((it) => (
            <div
              key={it.product.id}
              className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-soft"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-party-cream">
                <Image
                  src={it.product.image_url}
                  alt={it.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold italic">
                  {it.product.name}
                </p>
                <p className="text-sm text-party-ink/55">
                  {money(it.product.price_per_day)}/day · qty {it.qty}
                </p>
              </div>
              <p className="font-display text-lg font-bold italic">
                {money(it.product.price_per_day * it.qty)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-party-ink p-6 text-white shadow-card sm:p-7">
          <p className="eyebrow text-party-yellow">Your party plan</p>
          <h3 className="mt-2 font-display text-2xl font-bold italic">
            {eventType} for {guests}
          </h3>
          <ul className="mt-4 space-y-1.5 text-sm text-white/80">
            {setup.map((it) => (
              <li key={it.product.id} className="flex justify-between gap-3">
                <span>
                  {it.qty}× {it.product.name}
                </span>
                <span className="font-semibold">
                  {money(it.product.price_per_day * it.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-white/15 pt-4">
            <span className="font-display text-lg font-bold italic">
              Est. total
            </span>
            <span className="font-display text-3xl font-bold italic text-party-yellow">
              {money(total)}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Day rate · 50% deposit holds your date · delivery calculated at
            checkout.
          </p>
          <Link href={bookHref} className="btn-yellow btn-pill mt-5 w-full">
            Book this setup
          </Link>
          <Link
            href="/availability"
            className="mt-2 block text-center text-sm text-white/70 hover:text-white"
          >
            or check your date first
          </Link>
        </div>
      </aside>
    </div>
  );
}
