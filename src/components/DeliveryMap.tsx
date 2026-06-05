"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DeliveryQuote } from "@/lib/types";
import { money } from "@/lib/format";

// Leaflet touches `window`, so the map must be client-only (no SSR).
const DeliveryMapInner = dynamic(() => import("./DeliveryMapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-party-cream text-party-ink/40">
      Loading map…
    </div>
  ),
});

export default function DeliveryMap() {
  const [value, setValue] = useState("");
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Official fee/miles from our API (consistent with checkout)
      const quotePromise = fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: value.trim() }),
      }).then((r) => r.json());

      // Coordinates for the map pin via OpenStreetMap (free, no key)
      const geoPromise = fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
          value.trim()
        )}`,
        { headers: { Accept: "application/json" } }
      ).then((r) => r.json());

      const [q, geo] = await Promise.all([quotePromise, geoPromise]);
      setQuote(q);
      if (Array.isArray(geo) && geo[0]) {
        setPin([parseFloat(geo[0].lat), parseFloat(geo[0].lon)]);
      } else {
        setPin(null);
      }
    } catch {
      setError("We couldn't map that address. Try a ZIP code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white text-party-ink shadow-card">
      <div className="relative h-72 sm:h-80">
        <DeliveryMapInner pin={pin} free={quote ? quote.free : null} />
      </div>

      <div className="p-5 sm:p-6">
        <p className="eyebrow text-party-red">Delivery zone</p>
        <h3 className="mt-1.5 font-display text-2xl font-bold italic">
          Are you in our free zone?
        </h3>
        <form onSubmit={check} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your address or ZIP code"
            className="field flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-dark shrink-0 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Map It"}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm font-semibold text-party-red">{error}</p>
        )}

        {quote && (
          <div
            className={`mt-4 rounded-xl border px-5 py-4 ${
              quote.free
                ? "border-party-green/40 bg-party-green/10"
                : "border-party-ink/15 bg-party-cream"
            }`}
          >
            <p
              className={`font-display text-2xl font-bold italic ${
                quote.free ? "text-party-green" : "text-party-ink"
              }`}
            >
              {quote.free ? "Free delivery!" : `Delivery fee: ${money(quote.fee)}`}
            </p>
            <p className="mt-1 text-sm text-party-ink/70">
              {quote.miles > 0 && <>~{quote.miles} mi from Fredericksburg. </>}
              {quote.free
                ? "You're inside our free 15-mile zone."
                : "Billed at $2.00/mile beyond the free 15-mile radius."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
