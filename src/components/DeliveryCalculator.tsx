"use client";

import { useState } from "react";
import type { DeliveryQuote } from "@/lib/types";
import { money } from "@/lib/format";

export default function DeliveryCalculator({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setQuote(null);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: value.trim() }),
      });
      if (!res.ok) throw new Error("Could not calculate delivery.");
      const data = (await res.json()) as DeliveryQuote;
      setQuote(data);
    } catch {
      setError("Hmm, we couldn't check that address. Try a ZIP code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        compact
          ? ""
          : "card bg-white p-6 sm:p-8"
      }
    >
      {!compact && (
        <div className="mb-5">
          <p className="eyebrow text-party-red">Delivery calculator</p>
          <h3 className="mt-2 font-display text-2xl font-bold italic leading-tight">
            What's my delivery rate?
          </h3>
          <p className="mt-1 text-sm text-party-ink/60">
            Free within 15 miles of Fredericksburg 22401.
          </p>
        </div>
      )}

      <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row">
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
          {loading ? "Checking…" : "Check Rate"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg border border-party-red/40 bg-party-red/10 px-4 py-3 text-sm font-semibold text-party-red">
          {error}
        </p>
      )}

      {quote && (
        <div
          className={`mt-4 rounded-xl border px-5 py-4 ${
            quote.free
              ? "border-party-green/40 bg-party-green/10"
              : "border-party-ink/15 bg-party-cream"
          }`}
        >
          {quote.free ? (
            <p className="font-display text-2xl font-bold italic text-party-green">
              Free delivery!
            </p>
          ) : quote.miles > 0 ? (
            <p className="font-display text-2xl font-bold italic text-party-ink">
              Delivery fee: {money(quote.fee)}
            </p>
          ) : (
            <p className="font-display text-2xl font-bold italic text-party-ink">
              We&apos;ll confirm your rate
            </p>
          )}
          <p className="mt-1 text-sm text-party-ink/70">
            {quote.miles > 0 ? (
              <>
                ~{quote.miles} mi from {quote.origin}.{" "}
                {quote.free
                  ? "You're inside our free delivery zone."
                  : "Billed at $2.00/mile beyond the free 15-mile radius."}
                {quote.estimated && (
                  <span className="text-party-ink/50"> (estimate)</span>
                )}
              </>
            ) : quote.free ? (
              "You're inside our free delivery zone."
            ) : (
              "We deliver across the DMV — give us a call or text and we'll confirm the exact delivery rate for your address."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
