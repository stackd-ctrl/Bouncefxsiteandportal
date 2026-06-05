import { NextResponse } from "next/server";
import { getProducts, getBundles } from "@/lib/catalog";
import { getDeliveryQuote } from "@/lib/delivery";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";

interface CheckoutBody {
  productIds?: string[];
  bundleId?: string;
  eventDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventAddress: string;
  eventType: string;
  specialRequests?: string;
}

export async function POST(req: Request) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    productIds = [],
    bundleId,
    eventDate,
    customerName,
    customerEmail,
    customerPhone,
    eventAddress,
    eventType,
    specialRequests = "",
  } = body;

  if (!eventDate || !customerName || !customerEmail || !eventAddress) {
    return NextResponse.json(
      { error: "Missing required booking fields" },
      { status: 400 }
    );
  }

  // ── Resolve items + compute subtotal server-side (don't trust client) ──
  const [products, bundles] = await Promise.all([getProducts(), getBundles()]);
  let subtotal = 0;
  let resolvedProductIds: string[] = [];
  const lineLabels: string[] = [];

  if (bundleId) {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) {
      return NextResponse.json({ error: "Unknown bundle" }, { status: 400 });
    }
    subtotal += bundle.bundle_price;
    resolvedProductIds = [...bundle.product_ids];
    lineLabels.push(`${bundle.name} (bundle)`);
  }

  for (const id of productIds) {
    const p = products.find((x) => x.id === id);
    if (!p) continue;
    subtotal += p.price_per_day;
    resolvedProductIds.push(p.id);
    lineLabels.push(p.name);
  }

  if (resolvedProductIds.length === 0) {
    return NextResponse.json(
      { error: "No items selected" },
      { status: 400 }
    );
  }

  // ── Delivery (recomputed server-side from the event address) ──
  const delivery = await getDeliveryQuote(eventAddress);
  const deliveryFee = delivery.fee;

  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const deposit = Math.round(total * 0.5 * 100) / 100;

  // ── Persist a pending booking (if Supabase is configured) ──
  let bookingId: string | null = null;
  if (supabaseConfigured) {
    try {
      const supabase = createAdminSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          product_ids: resolvedProductIds,
          event_date: eventDate,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          event_address: eventAddress,
          event_type: eventType,
          special_requests: specialRequests,
          total_amount: total,
          deposit_amount: deposit,
          delivery_fee: deliveryFee,
          status: "pending",
        })
        .select("id")
        .single();
      if (!error && data) bookingId = data.id as string;
    } catch {
      // proceed without persistence
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // ── Stripe deposit checkout ──
  if (stripeConfigured) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: Math.round(deposit * 100),
              product_data: {
                name: "Bounce FX Booking Deposit (50%)",
                description: lineLabels.join(", ").slice(0, 250),
              },
            },
          },
        ],
        metadata: {
          booking_id: bookingId ?? "",
          event_date: eventDate,
          total_amount: String(total),
          deposit_amount: String(deposit),
          delivery_fee: String(deliveryFee),
        },
        success_url: `${siteUrl}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/book?canceled=1`,
      });
      return NextResponse.json({ url: session.url });
    } catch (e) {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 500 }
      );
    }
  }

  // ── Demo mode (no Stripe): confirm the booking directly ──
  if (bookingId && supabaseConfigured) {
    try {
      const supabase = createAdminSupabase();
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);
    } catch {
      /* ignore */
    }
  }

  const params = new URLSearchParams({
    demo: "1",
    name: customerName,
    date: eventDate,
    total: String(total),
    deposit: String(deposit),
    delivery: String(deliveryFee),
    items: lineLabels.join(" + "),
  });
  return NextResponse.json({
    url: `${siteUrl}/book/confirmation?${params.toString()}`,
  });
}
