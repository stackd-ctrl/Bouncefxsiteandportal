import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { readContent, writeContent, type Lead } from "@/lib/content";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

export const runtime = "nodejs";

interface LineItem {
  product_id: string;
  quantity: number;
}
interface Body {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  event_address?: string;
  event_type?: string;
  event_date?: string;
  special_requests?: string;
  items?: LineItem[];
  delivery_fee?: number;
  amount_paid?: number;
  status?: BookingStatus;
  save_customer?: boolean;
}

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

/** Statuses that "hold" inventory on a date (so they count toward availability). */
const HOLDING: BookingStatus[] = ["pending", "confirmed"];

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session.authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    customer_name = "",
    customer_email = "",
    customer_phone = "",
    event_address = "",
    event_type = "Other",
    event_date = "",
    special_requests = "",
    items = [],
    delivery_fee = 0,
    amount_paid = 0,
    status = "confirmed",
    save_customer = false,
  } = body;

  if (!customer_name.trim()) {
    return NextResponse.json(
      { error: "Customer name is required." },
      { status: 400 }
    );
  }
  if (!event_date) {
    return NextResponse.json(
      { error: "Event date is required." },
      { status: 400 }
    );
  }
  const cleanItems = items
    .map((i) => ({ product_id: i.product_id, quantity: Math.floor(Number(i.quantity) || 0) }))
    .filter((i) => i.product_id && i.quantity > 0);
  if (cleanItems.length === 0) {
    return NextResponse.json(
      { error: "Add at least one product." },
      { status: 400 }
    );
  }
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Connect Supabase to save bookings." },
      { status: 400 }
    );
  }

  const products = await getProducts();
  const supabase = createAdminSupabase();

  // ── Availability check (server-side, quantity-aware) ──
  // Count how many of each product are already held on that date by OTHER
  // bookings that hold inventory (pending/confirmed).
  const alreadyBooked: Record<string, number> = {};
  try {
    const { data } = await supabase
      .from("bookings")
      .select("product_ids,status")
      .eq("event_date", event_date)
      .in("status", HOLDING);
    (data ?? []).forEach((b: { product_ids: string[] }) =>
      (b.product_ids ?? []).forEach((id) => {
        alreadyBooked[id] = (alreadyBooked[id] ?? 0) + 1;
      })
    );
  } catch {
    /* treat as none booked */
  }

  const conflicts: {
    product_id: string;
    name: string;
    requested: number;
    remaining: number;
  }[] = [];
  let subtotal = 0;
  const productIds: string[] = [];

  for (const item of cleanItems) {
    const p = products.find((x) => x.id === item.product_id);
    if (!p) {
      return NextResponse.json(
        { error: `Unknown product in list.` },
        { status: 400 }
      );
    }
    const owned = p.quantity ?? 1;
    const remaining = Math.max(owned - (alreadyBooked[p.id] ?? 0), 0);
    // Only enforce when the new booking itself holds inventory.
    if (HOLDING.includes(status) && item.quantity > remaining) {
      conflicts.push({
        product_id: p.id,
        name: p.name,
        requested: item.quantity,
        remaining,
      });
      continue;
    }
    subtotal += p.price_per_day * item.quantity;
    // Repeat the id once per unit so the existing occurrence-based availability
    // counting stays consistent across the whole app.
    for (let n = 0; n < item.quantity; n++) productIds.push(p.id);
  }

  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        error: "Some items aren't available on that date.",
        conflicts,
      },
      { status: 409 }
    );
  }

  const total =
    Math.round((subtotal + (Number(delivery_fee) || 0)) * 100) / 100;
  const deposit = Math.round((Number(amount_paid) || 0) * 100) / 100;

  // ── Insert ──
  interface CreatedBooking {
    id: string;
    order_number?: number;
    confirmation_number?: string;
  }
  let created: CreatedBooking | null = null;
  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        product_ids: productIds,
        event_date,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        customer_phone: customer_phone.trim(),
        event_address: event_address.trim(),
        event_type,
        special_requests,
        total_amount: total,
        deposit_amount: deposit,
        delivery_fee: Number(delivery_fee) || 0,
        status,
      })
      .select("id, order_number, confirmation_number")
      .single();
    if (error) throw error;
    created = data as CreatedBooking;
  } catch {
    return NextResponse.json(
      { error: "Could not save the booking." },
      { status: 500 }
    );
  }

  // ── Optionally save the customer to the CRM (link by email) ──
  if (save_customer && customer_email.trim()) {
    try {
      const content = await readContent();
      const email = customer_email.trim().toLowerCase();
      const exists = content.leads.some(
        (l) => l.email.trim().toLowerCase() === email
      );
      if (!exists) {
        const lead: Lead = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `lead-${Date.now()}`,
          name: customer_name.trim(),
          email: customer_email.trim(),
          phone: customer_phone.trim(),
          stage: "booked",
          source: "Manual booking",
          notes: "",
          created_at: new Date().toISOString(),
        };
        await writeContent({ leads: [...content.leads, lead] });
      }
    } catch {
      /* non-fatal */
    }
  }

  revalidatePath("/admin");
  return NextResponse.json({
    ok: true,
    id: created?.id,
    order_number: created?.order_number,
    confirmation_number: created?.confirmation_number,
    total,
  });
}
