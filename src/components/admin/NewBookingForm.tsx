"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, BookingStatus } from "@/lib/types";
import type { Lead } from "@/lib/content";
import { money } from "@/lib/format";

interface AvailItem {
  id: string;
  remaining: number;
  owned: number;
}

const EVENT_TYPES = [
  "Birthday",
  "Church",
  "School",
  "Corporate",
  "Community",
  "Other",
];

export default function NewBookingForm({
  products,
  leads,
  presetCustomer,
  onClose,
}: {
  products: Product[];
  leads: Lead[];
  /** When opened from a customer profile, prefill + lock the customer. */
  presetCustomer?: { name: string; email: string; phone: string };
  onClose: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState(presetCustomer?.name ?? "");
  const [email, setEmail] = useState(presetCustomer?.email ?? "");
  const [phone, setPhone] = useState(presetCustomer?.phone ?? "");
  const [address, setAddress] = useState("");
  const [eventType, setEventType] = useState("Birthday");
  const [date, setDate] = useState("");
  const [requests, setRequests] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [saveCustomer, setSaveCustomer] = useState(!presetCustomer);

  // Distance / delivery estimate from the event address.
  const [dist, setDist] = useState<{
    miles: number;
    fee: number;
    free: boolean;
    estimated: boolean;
  } | null>(null);
  const [distLoading, setDistLoading] = useState(false);

  async function calcDistance() {
    if (!address.trim()) return;
    setDistLoading(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: address.trim() }),
      });
      const q = await res.json();
      setDist(q);
      setDeliveryFee(String(q.fee ?? 0));
    } catch {
      /* ignore */
    } finally {
      setDistLoading(false);
    }
  }

  const [avail, setAvail] = useState<Record<string, AvailItem>>({});
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch quantity-aware availability whenever the date changes.
  useEffect(() => {
    if (!date) {
      setAvail({});
      return;
    }
    let cancelled = false;
    setLoadingAvail(true);
    fetch(`/api/availability?date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const map: Record<string, AvailItem> = {};
        (data.availability ?? []).forEach((a: AvailItem) => (map[a.id] = a));
        setAvail(map);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingAvail(false));
    return () => {
      cancelled = true;
    };
  }, [date]);

  function pickCustomer(id: string) {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    setName(lead.name);
    setEmail(lead.email);
    setPhone(lead.phone);
  }

  function setQ(id: string, n: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, n) }));
  }

  const selected = products
    .map((p) => ({ p, q: qty[p.id] ?? 0 }))
    .filter((x) => x.q > 0);
  const subtotal = selected.reduce((s, x) => s + x.p.price_per_day * x.q, 0);
  const total =
    Math.round((subtotal + (Number(deliveryFee) || 0)) * 100) / 100;

  // Client-side over-book hint (server enforces the real check).
  const overbooked = selected.filter(
    (x) => date && avail[x.p.id] && x.q > avail[x.p.id].remaining
  );

  async function submit() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/booking-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          event_address: address,
          event_type: eventType,
          event_date: date,
          special_requests: requests,
          items: selected.map((x) => ({
            product_id: x.p.id,
            quantity: x.q,
          })),
          delivery_fee: Number(deliveryFee) || 0,
          amount_paid: Number(amountPaid) || 0,
          status,
          save_customer: saveCustomer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.conflicts?.length) {
          const lines = data.conflicts
            .map(
              (c: { name: string; requested: number; remaining: number }) =>
                `${c.name}: you asked for ${c.requested}, only ${c.remaining} free on ${date}`
            )
            .join(" · ");
          throw new Error(`${data.error} ${lines}`);
        }
        throw new Error(data.error || "Could not save the booking.");
      }
      setSuccess(
        `Booking saved — Order #${data.order_number} · ${data.confirmation_number}`
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold italic text-gray-900">
            New booking
          </h2>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-gray-500 hover:text-party-red"
          >
            Close ✕
          </button>
        </div>

        {/* Customer */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Customer
          </h3>
          {presetCustomer ? (
            <p className="mt-1 text-sm text-gray-600">
              Booking for{" "}
              <span className="font-semibold text-gray-900">
                {presetCustomer.name || presetCustomer.email}
              </span>
            </p>
          ) : (
            leads.length > 0 && (
              <div className="mt-2">
                <label className="field-label">Link an existing customer</label>
                <select
                  className="field"
                  defaultValue=""
                  onChange={(e) => pickCustomer(e.target.value)}
                >
                  <option value="">— New customer —</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.email ? `(${l.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Name *</label>
              <input
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Event address</label>
              <div className="flex gap-2">
                <input
                  className="field flex-1"
                  placeholder="Street, city or ZIP"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setDist(null);
                  }}
                />
                <button
                  type="button"
                  onClick={calcDistance}
                  disabled={distLoading || !address.trim()}
                  className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {distLoading ? "…" : "Calc distance"}
                </button>
              </div>
              {dist && (
                <p className="mt-1 text-xs font-semibold text-gray-600">
                  {dist.miles > 0 ? `~${dist.miles} mi · ` : ""}
                  {dist.free
                    ? "Free delivery zone"
                    : `Suggested delivery fee ${money(dist.fee)}`}
                  {dist.estimated ? " (estimate)" : ""} — applied below.
                </p>
              )}
            </div>
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={saveCustomer}
              onChange={(e) => setSaveCustomer(e.target.checked)}
              className="h-4 w-4 accent-party-green"
            />
            Save to Customers (CRM)
          </label>
        </div>

        {/* Event */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Event
          </h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Event date *</label>
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Event type</label>
              <select
                className="field"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Products & quantities
            </h3>
            {date && (
              <span className="text-xs text-gray-500">
                {loadingAvail
                  ? "Checking availability…"
                  : `Availability for ${date}`}
              </span>
            )}
          </div>
          {!date && (
            <p className="mt-2 text-xs text-party-red">
              Pick an event date first to see what&apos;s available.
            </p>
          )}
          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {products.map((p) => {
              const a = avail[p.id];
              const remaining = a ? a.remaining : p.quantity ?? 1;
              const q = qty[p.id] ?? 0;
              const over = Boolean(date && a && q > a.remaining);
              const soldOut = Boolean(date && a && a.remaining <= 0);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {money(p.price_per_day)}/day
                      {date && a && (
                        <span
                          className={`ml-2 font-semibold ${
                            soldOut
                              ? "text-party-red"
                              : "text-emerald-600"
                          }`}
                        >
                          {soldOut
                            ? "Fully booked"
                            : `${remaining} of ${a.owned} free`}
                        </span>
                      )}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={q || ""}
                    onChange={(e) => setQ(p.id, Math.floor(Number(e.target.value)))}
                    className={`field !w-20 text-center ${
                      over ? "!border-party-red" : ""
                    }`}
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
          {overbooked.length > 0 && (
            <p className="mt-2 text-xs font-semibold text-party-red">
              Over the available amount for{" "}
              {overbooked.map((x) => x.p.name).join(", ")} on {date}.
            </p>
          )}
        </div>

        {/* Money + status */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="field-label">Delivery fee ($)</label>
            <input
              type="number"
              step="0.01"
              className="field"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Amount collected ($)</label>
            <input
              type="number"
              step="0.01"
              className="field"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select
              className="field"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
            >
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="field-label">Special requests / notes</label>
          <textarea
            rows={2}
            className="field resize-none"
            value={requests}
            onChange={(e) => setRequests(e.target.value)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Items subtotal:{" "}
            <span className="font-bold text-gray-900">{money(subtotal)}</span> ·
            Total:{" "}
            <span className="font-bold text-gray-900">{money(total)}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy || overbooked.length > 0}
              className="btn-red !px-5 !py-2 !text-sm disabled:opacity-50"
            >
              {busy ? "Saving…" : "Create booking"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-party-red/40 bg-party-red/10 px-4 py-3 text-sm font-semibold text-party-red">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded-lg border border-party-green/40 bg-party-green/10 px-4 py-3 text-sm font-semibold text-party-green">
            {success} — you can close this window.
          </p>
        )}
      </div>
    </div>
  );
}
