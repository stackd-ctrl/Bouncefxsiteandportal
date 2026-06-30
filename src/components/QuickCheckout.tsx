"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, Bundle, DeliveryQuote } from "@/lib/types";
import { money, todayISO } from "@/lib/format";
import { depositFor, amountDueNow, type PaymentChoice } from "@/lib/pricing";

const EVENT_TYPES = [
  "Birthday",
  "School",
  "Church",
  "Corporate",
  "Community",
  "Other",
];

const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: "inflatable", label: "Bounce houses & slides" },
  { key: "tent", label: "Tents" },
  { key: "table", label: "Tables" },
  { key: "chair", label: "Chairs" },
];

export default function QuickCheckout({
  products,
  bundles,
}: {
  products: Product[];
  bundles: Bundle[];
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventAddress: "",
    eventType: "Birthday",
    eventDate: "",
    specialRequests: "",
  });
  const [delivery, setDelivery] = useState<DeliveryQuote | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [payChoice, setPayChoice] = useState<PaymentChoice>("deposit");
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bundle = bundles.find((b) => b.id === bundleId) ?? null;

  const subtotal = useMemo(() => {
    let s = bundle ? bundle.bundle_price : 0;
    for (const p of products) s += (qty[p.id] || 0) * p.price_per_day;
    return Math.round(s * 100) / 100;
  }, [qty, bundle, products]);

  const deliveryFee = delivery?.fee ?? 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const deposit = depositFor(total);
  const amountToPay = amountDueNow(
    total,
    payChoice,
    typeof customAmount === "number" ? customAmount : undefined
  );
  const balanceAfter = Math.round((total - amountToPay) * 100) / 100;
  const itemCount =
    (bundle ? 1 : 0) + Object.values(qty).reduce((a, b) => a + b, 0);

  function setQ(id: string, n: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(999, n)) }));
  }
  function field(patch: Partial<typeof form>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function checkDelivery() {
    if (!form.eventAddress.trim()) return;
    setDeliveryLoading(true);
    try {
      const r = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: form.eventAddress }),
      });
      setDelivery(await r.json());
    } catch {
      setDelivery(null);
    } finally {
      setDeliveryLoading(false);
    }
  }

  const canPay =
    itemCount > 0 &&
    !!form.customerName &&
    !!form.customerEmail &&
    !!form.customerPhone &&
    !!form.eventAddress &&
    !!form.eventDate &&
    agreed &&
    !submitting;

  async function pay() {
    setSubmitting(true);
    setError(null);
    try {
      const productIds: string[] = [];
      for (const p of products) {
        const n = qty[p.id] || 0;
        for (let i = 0; i < n; i++) productIds.push(p.id);
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds,
          bundleId: bundleId || undefined,
          eventDate: form.eventDate,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          eventAddress: form.eventAddress,
          eventType: form.eventType,
          paymentChoice: payChoice,
          amountToPay,
          promoCode: promoCode.trim() || undefined,
          specialRequests: [
            form.specialRequests,
            `[Rental agreement accepted at quick checkout on ${todayISO()}]`,
          ]
            .filter(Boolean)
            .join(" "),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* ── Left: items + details ── */}
      <div className="space-y-8">
        {/* Items */}
        <section>
          <h2 className="font-display text-2xl font-bold italic">
            1. Pick your items
          </h2>
          <p className="mt-1 text-sm text-party-ink/60">
            Set a quantity for anything you want. Tables and chairs can be added
            by the dozen.
          </p>

          {bundles.length > 0 && (
            <div className="mt-5">
              <p className="field-label">Bundle packages</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {bundles.map((b) => {
                  const on = bundleId === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBundleId(on ? null : b.id)}
                      className={`rounded-2xl border-2 p-4 text-left transition-colors ${
                        on
                          ? "border-party-red bg-party-red/5"
                          : "border-party-ink/15 bg-white hover:border-party-ink/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold italic">
                          {b.name}
                        </span>
                        <span className="font-display font-bold italic">
                          {money(b.bundle_price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-party-ink/55">
                        {(b.highlights ?? []).slice(0, 3).join(" · ")}
                      </p>
                      <span
                        className={`mt-2 inline-block text-xs font-bold uppercase tracking-wider ${
                          on ? "text-party-red" : "text-party-ink/40"
                        }`}
                      >
                        {on ? "✓ Added" : "Tap to add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {CATEGORY_ORDER.map((cat) => {
            const items = products.filter((p) => p.category === cat.key);
            if (items.length === 0) return null;
            return (
              <div key={cat.key} className="mt-6">
                <p className="field-label">{cat.label}</p>
                <div className="divide-y divide-party-ink/10 overflow-hidden rounded-2xl border border-party-ink/15 bg-white">
                  {items.map((p) => {
                    const n = qty[p.id] || 0;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="text-xs text-party-ink/55">
                            {money(p.price_per_day)} / day
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQ(p.id, n - 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-party-ink/25 text-lg leading-none hover:bg-party-cream"
                            aria-label={`Remove one ${p.name}`}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={n}
                            onChange={(e) => setQ(p.id, Number(e.target.value))}
                            className="w-14 rounded-lg border border-party-ink/25 px-2 py-1 text-center text-sm outline-none focus:border-party-red"
                          />
                          <button
                            type="button"
                            onClick={() => setQ(p.id, n + 1)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-party-ink/25 text-lg leading-none hover:bg-party-cream"
                            aria-label={`Add one ${p.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Details */}
        <section>
          <h2 className="font-display text-2xl font-bold italic">
            2. Event & contact details
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Event date</label>
              <input
                type="date"
                min={todayISO()}
                className="field"
                value={form.eventDate}
                onChange={(e) => field({ eventDate: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Event type</label>
              <select
                className="field"
                value={form.eventType}
                onChange={(e) => field({ eventType: e.target.value })}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Full name</label>
              <input
                className="field"
                value={form.customerName}
                onChange={(e) => field({ customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field"
                value={form.customerPhone}
                onChange={(e) => field({ customerPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                className="field"
                value={form.customerEmail}
                onChange={(e) => field({ customerEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Event address</label>
              <input
                className="field"
                placeholder="Street, City, ZIP"
                value={form.eventAddress}
                onChange={(e) => field({ eventAddress: e.target.value })}
                onBlur={checkDelivery}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">
                Anything we should know? (optional)
              </label>
              <textarea
                rows={2}
                className="field resize-none"
                value={form.specialRequests}
                onChange={(e) => field({ specialRequests: e.target.value })}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ── Right: sticky order summary ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border-2 border-party-ink bg-white p-6 shadow-card">
          <h2 className="font-display text-xl font-bold italic">Your order</h2>

          <div className="mt-4 space-y-1.5 text-sm">
            <Row label={`Items (${itemCount})`} value={money(subtotal)} />
            <Row
              label="Delivery"
              value={
                deliveryLoading
                  ? "…"
                  : delivery
                  ? deliveryFee === 0
                    ? "FREE"
                    : money(deliveryFee)
                  : "Add address"
              }
            />
            <div className="my-2 border-t border-dashed border-party-ink/20" />
            <Row label="Total" value={money(total)} bold />
          </div>

          {/* Promo code */}
          <div className="mt-5">
            <label className="field-label">Promo code</label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Have a code? Enter it here"
              autoCapitalize="characters"
              className="field uppercase placeholder:normal-case placeholder:text-party-ink/40"
            />
            <p className="mt-1 text-xs text-party-ink/45">
              Discount is applied at the payment step.
            </p>
          </div>

          {/* Payment choice */}
          <div className="mt-5 space-y-2">
            <p className="field-label">Pay now</p>
            {[
              { key: "deposit" as PaymentChoice, label: "Deposit", amt: deposit },
              { key: "full" as PaymentChoice, label: "In full", amt: total },
              { key: "custom" as PaymentChoice, label: "Custom amount", amt: null },
            ].map((o) => (
              <label
                key={o.key}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-colors ${
                  payChoice === o.key
                    ? "border-party-red bg-party-red/5"
                    : "border-party-ink/15 hover:border-party-ink/30"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="qpay"
                    checked={payChoice === o.key}
                    onChange={() => setPayChoice(o.key)}
                    className="h-4 w-4 accent-party-red"
                  />
                  <span className="font-semibold">{o.label}</span>
                </span>
                {o.amt !== null && (
                  <span className="font-display font-bold italic">
                    {money(o.amt)}
                  </span>
                )}
              </label>
            ))}
            {payChoice === "custom" && (
              <input
                type="number"
                min={deposit}
                max={total}
                step="0.01"
                placeholder={`${deposit}–${total}`}
                className="field"
                value={customAmount}
                onChange={(e) =>
                  setCustomAmount(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            )}
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-sm text-party-ink/60">Due now</span>
            <span className="font-display text-2xl font-bold italic">
              {money(amountToPay)}
            </span>
          </div>
          {balanceAfter > 0 && (
            <p className="text-right text-xs text-party-ink/55">
              {money(balanceAfter)} balance on event day
            </p>
          )}

          {/* Agreement */}
          <label className="mt-4 flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-party-red"
            />
            <span>
              I agree to the{" "}
              <a
                href="/rental-agreement.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-party-red underline"
              >
                rental &amp; safety agreement
              </a>
              .
            </span>
          </label>

          {error && (
            <p className="mt-3 rounded-lg border border-party-red/40 bg-party-red/10 px-3 py-2 text-sm font-semibold text-party-red">
              {error}
            </p>
          )}

          <button
            onClick={pay}
            disabled={!canPay}
            className="btn-green btn-pill mt-4 w-full disabled:opacity-50"
          >
            {submitting ? "Starting checkout…" : `Pay ${money(amountToPay)}`}
          </button>
          {itemCount === 0 && (
            <p className="mt-2 text-center text-xs text-party-ink/50">
              Add at least one item to continue.
            </p>
          )}

          <p className="mt-4 text-center text-xs text-party-ink/50">
            Prefer step-by-step?{" "}
            <Link href="/availability" className="font-semibold text-party-red">
              Use guided booking
            </Link>
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        bold ? "font-display text-lg font-bold italic" : ""
      }`}
    >
      <span className={bold ? "" : "text-party-ink/60"}>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
