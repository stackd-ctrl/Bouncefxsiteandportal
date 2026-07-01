"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { Product, Bundle, DeliveryQuote } from "@/lib/types";
import { money, prettyDate, todayISO } from "@/lib/format";
import { depositFor, amountDueNow, type PaymentChoice } from "@/lib/pricing";
import Calendar from "./Calendar";

const EVENT_TYPES = [
  "Birthday",
  "School",
  "Church",
  "Corporate",
  "Community",
  "Other",
];

const SUPPORT_PHONE = "571-264-9996";

// Fallback sanity check used ONLY when the geocoder is unreachable: require a
// ZIP or a comma-separated address so obvious junk ("123 asdf") is still caught.
function addressLooksComplete(input: string): boolean {
  const s = input.trim();
  if (/\b\d{5}\b/.test(s)) return true;
  return s.split(",").map((p) => p.trim()).filter(Boolean).length >= 2;
}

export default function BookingFlow({
  products,
  bundles,
  initial,
}: {
  products: Product[];
  bundles: Bundle[];
  initial: {
    product?: string;
    products?: string[];
    note?: string;
    bundle?: string;
    date?: string;
  };
}) {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initial.products && initial.products.length > 0
      ? Array.from(new Set(initial.products))
      : initial.product
      ? [initial.product]
      : []
  );
  const [selectedBundle, setSelectedBundle] = useState<string | null>(
    initial.bundle ?? null
  );
  const [date, setDate] = useState<string | null>(initial.date ?? null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventAddress: "",
    eventType: "Birthday",
    deliveryDate: "",
    deliveryTime: "",
    specialRequests: initial.note ?? "",
  });

  const [delivery, setDelivery] = useState<DeliveryQuote | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [payChoice, setPayChoice] = useState<PaymentChoice>("deposit");
  const [customAmount, setCustomAmount] = useState<number | "">("");
  const [promoCode, setPromoCode] = useState("");

  const bundle = useMemo(
    () => bundles.find((b) => b.id === selectedBundle) ?? null,
    [bundles, selectedBundle]
  );

  const subtotal = useMemo(() => {
    let s = bundle ? bundle.bundle_price : 0;
    for (const id of selectedProducts) {
      const p = products.find((x) => x.id === id);
      if (p) s += p.price_per_day;
    }
    return Math.round(s * 100) / 100;
  }, [bundle, selectedProducts, products]);

  const deliveryFee = delivery?.fee ?? 0;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const deposit = depositFor(total);
  const amountToPay = amountDueNow(
    total,
    payChoice,
    typeof customAmount === "number" ? customAmount : undefined
  );
  const balanceAfter = Math.round((total - amountToPay) * 100) / 100;
  const hasSelection = selectedProducts.length > 0 || !!bundle;

  function toggleProduct(id: string) {
    setSelectedProducts((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  async function checkDelivery() {
    if (!form.eventAddress.trim()) return;
    setDeliveryLoading(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: form.eventAddress }),
      });
      setDelivery(await res.json());
    } catch {
      setDelivery(null);
    } finally {
      setDeliveryLoading(false);
    }
  }

  // Auto-check delivery when entering the review step
  useEffect(() => {
    if (step === 3 && form.eventAddress && !delivery) checkDelivery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Debounced address validation on step 2 as the customer types, so the
  // "Review booking" button enables itself once a real address resolves.
  useEffect(() => {
    if (step !== 2) return;
    if (!form.eventAddress.trim()) {
      setDelivery(null);
      return;
    }
    const t = setTimeout(() => checkDelivery(), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.eventAddress, step]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedProducts,
          bundleId: selectedBundle || undefined,
          eventDate: date,
          paymentChoice: payChoice,
          amountToPay,
          promoCode: promoCode.trim() || undefined,
          ...form,
          specialRequests: [
            form.specialRequests,
            (form.deliveryDate || form.deliveryTime) &&
              `[Preferred delivery: ${
                form.deliveryDate ? prettyDate(form.deliveryDate) : "event date"
              }${form.deliveryTime ? ` at ${formatTime(form.deliveryTime)}` : ""}]`,
            `[Agreement signed by ${signature.trim()} on ${todayISO()}]`,
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

  // Address is acceptable when the geocoder verified it (valid === true) or,
  // only if the geocoder was unavailable (valid == null), it at least looks
  // complete (has a ZIP or a comma-separated street/city). A confirmed "no
  // match" (valid === false) blocks the booking.
  const addressOk =
    !!form.eventAddress.trim() &&
    !!delivery &&
    (delivery.valid === true ||
      (delivery.valid == null && addressLooksComplete(form.eventAddress)));

  const canStep1 = hasSelection && !!date;
  const canStep2 =
    form.customerName &&
    form.customerEmail &&
    form.customerPhone &&
    addressOk;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {["Items & Date", "Your Details", "Review & Pay"].map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full border-2 border-party-ink px-3 py-1.5 ${
                    active
                      ? "bg-party-red text-white"
                      : done
                      ? "bg-party-green text-white"
                      : "bg-white"
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/30 font-body text-sm font-bold">
                    {done ? "✓" : n}
                  </span>
                  <span className="hidden font-body text-sm font-semibold sm:inline">
                    {label}
                  </span>
                </div>
                {n < 3 && <div className="h-0.5 flex-1 bg-party-ink/15" />}
              </div>
            );
          })}
        </div>

        {/* STEP 1 — Items & Date */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold italic">
                1. Choose your items
              </h2>
              <p className="text-party-ink/60">
                Mix individual rentals or pick a bundle below.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {products.map((p) => {
                  const on = selectedProducts.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-transform active:translate-y-0.5 ${
                        on
                          ? "border-party-ink bg-party-green/15 shadow-soft"
                          : "border-party-ink/20 bg-white hover:border-party-ink"
                      }`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-party-ink">
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display font-bold">
                          {p.name}
                        </p>
                        <p className="text-sm text-party-ink/60">
                          {money(p.price_per_day)}/day
                        </p>
                      </div>
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border-2 border-party-ink ${
                          on ? "bg-party-green text-white" : "bg-white"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 className="mt-6 font-display text-lg font-bold italic">
                …or pick a bundle
              </h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {bundles.map((b) => {
                  const on = selectedBundle === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() =>
                        setSelectedBundle(on ? null : b.id)
                      }
                      className={`rounded-2xl border-2 p-3 text-left transition-transform active:translate-y-0.5 ${
                        on
                          ? "border-party-ink bg-party-yellow/30 shadow-soft"
                          : "border-party-ink/20 bg-white hover:border-party-ink"
                      }`}
                    >
                      <p className="font-display font-bold">{b.name}</p>
                      <p className="text-sm text-party-ink/60">
                        {money(b.bundle_price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold italic">
                2. Pick your event date
              </h2>
              <div className="mt-4 max-w-sm">
                <Calendar selected={date} onSelect={setDate} />
              </div>
            </div>

            <button
              disabled={!canStep1}
              onClick={() => setStep(2)}
              className="btn-red w-full disabled:opacity-50 sm:w-auto"
            >
              Continue to details
            </button>
            {!canStep1 && (
              <p className="text-sm text-party-ink/50">
                Select at least one item and a date to continue.
              </p>
            )}
          </div>
        )}

        {/* STEP 2 — Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold italic">Event details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.customerName}
                onChange={(v) => setForm({ ...form, customerName: v })}
                placeholder="Jordan Smith"
              />
              <Field
                label="Email"
                type="email"
                value={form.customerEmail}
                onChange={(v) => setForm({ ...form, customerEmail: v })}
                placeholder="you@email.com"
              />
              <Field
                label="Phone"
                type="tel"
                value={form.customerPhone}
                onChange={(v) => setForm({ ...form, customerPhone: v })}
                placeholder="(540) 555-0123"
              />
              <div>
                <label className="field-label">
                  Event type
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) =>
                    setForm({ ...form, eventType: e.target.value })
                  }
                  className="field mt-1.5"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Field
                label="Event address (for delivery)"
                value={form.eventAddress}
                onChange={(v) => setForm({ ...form, eventAddress: v })}
                onBlur={checkDelivery}
                placeholder="123 Party Ln, Fredericksburg, VA 22401"
              />
              {deliveryLoading && (
                <p className="mt-1.5 text-sm text-party-ink/50">
                  Checking address…
                </p>
              )}
              {!deliveryLoading && delivery && delivery.valid === false && (
                <p className="mt-1.5 text-sm font-semibold text-party-red">
                  We couldn&apos;t find that address. Please enter a complete
                  street address, city, and ZIP — or call/text us at{" "}
                  {SUPPORT_PHONE} and we&apos;ll set it up for you.
                </p>
              )}
              {!deliveryLoading && delivery && delivery.valid !== false && (
                <>
                  <p
                    className={`mt-1.5 text-sm font-semibold ${
                      delivery.free ? "text-party-green" : "text-party-ink"
                    }`}
                  >
                    {delivery.free
                      ? "Free delivery to this address!"
                      : delivery.miles > 0
                      ? `Estimated delivery fee: ${money(delivery.fee)}`
                      : "We'll confirm your exact delivery rate — we deliver across the DMV."}
                  </p>
                  {delivery.valid === true && delivery.resolvedAddress && (
                    <p className="mt-0.5 text-xs text-party-green">
                      ✓ Delivering to {delivery.resolvedAddress}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Preferred delivery date</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  min={todayISO()}
                  onChange={(e) =>
                    setForm({ ...form, deliveryDate: e.target.value })
                  }
                  className="field mt-1.5"
                />
                <p className="mt-1 text-xs text-party-ink/45">
                  Leave blank to deliver on your event date
                  {date ? ` (${prettyDate(date)})` : ""}.
                </p>
              </div>
              <div>
                <label className="field-label">Preferred delivery time</label>
                <input
                  type="time"
                  value={form.deliveryTime}
                  onChange={(e) =>
                    setForm({ ...form, deliveryTime: e.target.value })
                  }
                  className="field mt-1.5"
                />
                <p className="mt-1 text-xs text-party-ink/45">
                  We&apos;ll confirm an exact window before your event.
                </p>
              </div>
            </div>

            <div>
              <label className="field-label">
                Special requests (optional)
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) =>
                  setForm({ ...form, specialRequests: e.target.value })
                }
                rows={3}
                placeholder="Setup location notes, theme, timing…"
                className="field mt-1.5"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-white">
                Back
              </button>
              <button
                disabled={!canStep2}
                onClick={() => setStep(3)}
                className="btn-red flex-1 disabled:opacity-50 sm:flex-none"
              >
                Review booking
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Review & Pay */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold italic">Review & pay deposit</h2>

            <div className="card bg-party-cream p-5">
              <Row label="Event date" value={date ? prettyDate(date) : "—"} />
              <Row
                label="Delivery"
                value={
                  (form.deliveryDate
                    ? prettyDate(form.deliveryDate)
                    : date
                    ? prettyDate(date)
                    : "On event date") +
                  (form.deliveryTime ? ` · ${formatTime(form.deliveryTime)}` : "")
                }
              />
              <Row label="Name" value={form.customerName} />
              <Row label="Email" value={form.customerEmail} />
              <Row label="Phone" value={form.customerPhone} />
              <Row label="Address" value={form.eventAddress} />
              <Row label="Event type" value={form.eventType} />
              {form.specialRequests && (
                <Row label="Notes" value={form.specialRequests} />
              )}
            </div>

            {/* E-sign rental agreement */}
            <div className="rounded-2xl border border-party-ink/15 bg-white p-5">
              <h3 className="font-display text-lg font-bold italic">
                Rental Agreement
              </h3>
              <div className="mt-2 max-h-32 overflow-y-auto rounded-lg bg-party-cream p-3 text-xs leading-relaxed text-party-ink/70">
                <p>
                  By signing, you agree to Bounce FX Party Rentals' terms: (1) a
                  responsible adult will supervise all inflatable use at all
                  times; (2) no shoes, sharp objects, food, or drinks inside
                  inflatables; (3) units must be evacuated in high winds
                  (15+ mph) or storms; (4) the renter is responsible for damage
                  beyond normal use; (5) the $50 deposit is non-refundable within
                  72 hours of the event; (6) the remaining balance is due on the
                  day of delivery; (7) Bounce FX is licensed & insured and is not
                  liable for injury resulting from misuse.
                </p>
              </div>
              <a
                href="/rental-agreement.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-party-red underline underline-offset-2 hover:text-party-red/80"
              >
                Read the full rental &amp; safety agreement (PDF) →
              </a>
              <label className="mt-3 flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-party-red"
                />
                <span>
                  I have read and agree to the rental agreement and safety terms.
                </span>
              </label>
              <div className="mt-3">
                <label className="field-label">Type your full name to sign</label>
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your full name"
                  className="field"
                  style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                />
                {signature && agreed && (
                  <p className="mt-1.5 text-xs text-party-green">
                    Signed by {signature} · {prettyDate(todayISO())}
                  </p>
                )}
              </div>
            </div>

            {/* Promo code */}
            <div className="rounded-2xl border border-party-ink/15 bg-white p-5">
              <h3 className="font-display text-lg font-bold italic">
                Promo code
              </h3>
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Have a code? Enter it here"
                autoCapitalize="characters"
                className="field mt-2 uppercase placeholder:normal-case placeholder:text-party-ink/40"
              />
              <p className="mt-1.5 text-xs text-party-ink/55">
                Got a promo? Enter it and the discount is applied at the secure
                payment step.
              </p>
            </div>

            {/* Payment amount */}
            <div className="rounded-2xl border border-party-ink/15 bg-white p-5">
              <h3 className="font-display text-lg font-bold italic">
                How would you like to pay?
              </h3>
              <div className="mt-3 space-y-2">
                {[
                  {
                    key: "deposit" as PaymentChoice,
                    title: "Pay deposit now",
                    sub: `${money(total - deposit)} balance due on event day`,
                    amount: deposit,
                  },
                  {
                    key: "full" as PaymentChoice,
                    title: "Pay in full",
                    sub: "Nothing left to pay later",
                    amount: total,
                  },
                  {
                    key: "custom" as PaymentChoice,
                    title: "Pay another amount",
                    sub: "Choose a partial payment",
                    amount: null,
                  },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                      payChoice === opt.key
                        ? "border-party-red bg-party-red/5"
                        : "border-party-ink/15 hover:border-party-ink/30"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payChoice"
                        checked={payChoice === opt.key}
                        onChange={() => setPayChoice(opt.key)}
                        className="h-4 w-4 accent-party-red"
                      />
                      <span>
                        <span className="font-semibold">{opt.title}</span>
                        <span className="block text-xs text-party-ink/55">
                          {opt.sub}
                        </span>
                      </span>
                    </span>
                    {opt.amount !== null && (
                      <span className="font-display text-lg font-bold italic">
                        {money(opt.amount)}
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {payChoice === "custom" && (
                <div className="mt-3">
                  <label className="field-label">Amount to pay now ($)</label>
                  <input
                    type="number"
                    min={deposit}
                    max={total}
                    step="0.01"
                    className="field"
                    placeholder={String(deposit)}
                    value={customAmount}
                    onChange={(e) =>
                      setCustomAmount(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                  <p className="mt-1 text-xs text-party-ink/55">
                    Between {money(deposit)} (min) and {money(total)} (full).
                    Balance after: {money(balanceAfter)}.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <p className="rounded-lg border border-party-red/40 bg-party-red/10 px-4 py-3 font-semibold text-party-red">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-white">
                Back
              </button>
              <button
                onClick={submit}
                disabled={submitting || !agreed || signature.trim().length < 2}
                className="btn-green flex-1 disabled:opacity-50"
              >
                {submitting ? "Starting checkout…" : `Pay ${money(amountToPay)}`}
              </button>
            </div>
            {(!agreed || signature.trim().length < 2) && (
              <p className="text-center text-sm text-party-ink/50">
                Please review and sign the rental agreement to continue.
              </p>
            )}
            <p className="text-center text-sm text-party-ink/50">
              {balanceAfter > 0
                ? `${money(balanceAfter)} balance due on event day. `
                : "Paid in full — nothing due later. "}
              Secure payment via Stripe.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky order summary ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card bg-white p-6">
          <h3 className="font-display text-xl font-bold italic">Order Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            {bundle && (
              <div className="flex justify-between">
                <span>{bundle.name} (bundle)</span>
                <span className="font-semibold">
                  {money(bundle.bundle_price)}
                </span>
              </div>
            )}
            {selectedProducts.map((id) => {
              const p = products.find((x) => x.id === id);
              if (!p) return null;
              return (
                <div key={id} className="flex justify-between">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="font-semibold">
                    {money(p.price_per_day)}
                  </span>
                </div>
              );
            })}
            {!hasSelection && (
              <p className="text-party-ink/50">No items selected yet.</p>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-dashed border-party-ink/20 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="font-semibold">
                {delivery
                  ? delivery.free
                    ? "FREE"
                    : money(deliveryFee)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between font-display text-lg font-bold italic">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-party-green/15 px-3 py-2 font-display font-bold text-party-green">
              <span>Deposit due now</span>
              <span>{money(deposit)}</span>
            </div>
            <div className="flex justify-between text-sm text-party-ink/60">
              <span>Balance on event day</span>
              <span>{money(Math.round((total - deposit) * 100) / 100)}</span>
            </div>
          </div>
          {date && (
            <p className="mt-4 text-center text-sm text-party-ink/60">
              {prettyDate(date)}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="field mt-1.5"
      />
    </div>
  );
}

/** "14:30" → "2:30 PM" for friendly display. */
function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-party-ink/10 py-2 last:border-0">
      <span className="text-sm text-party-ink/60">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}
