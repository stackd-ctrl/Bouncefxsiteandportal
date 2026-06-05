import type { Booking } from "./types";

/**
 * Sample bookings shown in the admin dashboard when Supabase isn't configured,
 * so the owner can preview the dashboard layout before going live.
 */
export const DEMO_BOOKINGS: Booking[] = [
  {
    id: "demo-1",
    product_ids: ["11111111-1111-4111-8111-111111111111"],
    event_date: futureDate(4),
    customer_name: "Maya Robinson",
    customer_email: "maya@example.com",
    customer_phone: "(540) 555-0142",
    event_address: "88 Maple Ave, Stafford, VA 22554",
    event_type: "Birthday",
    special_requests: "Setup in backyard, gate on the left side.",
    total_amount: 275,
    deposit_amount: 137.5,
    delivery_fee: 0,
    stripe_payment_intent_id: "pi_demo_1",
    status: "confirmed",
    created_at: pastDate(2),
  },
  {
    id: "demo-2",
    product_ids: [
      "55555555-5555-4555-8555-555555555555",
      "44444444-4444-4444-8444-444444444444",
    ],
    event_date: futureDate(9),
    customer_name: "Pastor James Whitfield",
    customer_email: "james@gracechurch.org",
    customer_phone: "(540) 555-0198",
    event_address: "12 Church St, Fredericksburg, VA 22401",
    event_type: "Church",
    special_requests: "Fall festival — need everything by 9am.",
    total_amount: 364,
    deposit_amount: 182,
    delivery_fee: 0,
    stripe_payment_intent_id: "pi_demo_2",
    status: "pending",
    created_at: pastDate(1),
  },
  {
    id: "demo-3",
    product_ids: ["33333333-3333-4333-8333-333333333333"],
    event_date: pastDate(6),
    customer_name: "Danielle Kim",
    customer_email: "dani@example.com",
    customer_phone: "(703) 555-0111",
    event_address: "401 Oak Dr, Spotsylvania, VA 22553",
    event_type: "Corporate",
    special_requests: null,
    total_amount: 305,
    deposit_amount: 152.5,
    delivery_fee: 30,
    stripe_payment_intent_id: "pi_demo_3",
    status: "completed",
    created_at: pastDate(14),
  },
];

function futureDate(days: number): string {
  return offsetISO(days);
}
function pastDate(days: number): string {
  return offsetISO(-days);
}
function offsetISO(days: number): string {
  // Deterministic relative date based on a fixed epoch to avoid Date.now in
  // edge-cached contexts; uses server time only here (admin is dynamic).
  const base = new Date();
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
