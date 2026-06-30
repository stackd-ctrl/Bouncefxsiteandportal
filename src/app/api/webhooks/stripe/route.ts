import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { createAdminSupabase, supabaseConfigured } from "@/lib/supabase/server";
import {
  sendBookingConfirmation,
  sendOwnerBookingNotification,
} from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripeConfigured) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    if (!sig || !secret) throw new Error("Missing signature/secret");
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const bookingId = meta.booking_id;
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    if (bookingId && supabaseConfigured) {
      try {
        const supabase = createAdminSupabase();
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            stripe_payment_intent_id: paymentIntent,
          })
          .eq("id", bookingId);

        // Fetch the booking for the confirmation email
        const { data: booking } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (booking) {
          const items = `${booking.product_ids?.length ?? 0} item(s)`;
          await sendBookingConfirmation({
            to: booking.customer_email,
            customerName: booking.customer_name,
            eventDate: booking.event_date,
            items,
            total: Number(booking.total_amount),
            deposit: Number(booking.deposit_amount),
            deliveryFee: Number(booking.delivery_fee),
            confirmationNumber: booking.confirmation_number ?? undefined,
            orderNumber: booking.order_number ?? undefined,
            eventAddress: booking.event_address ?? undefined,
          });
          // Notify the business + add the booking to their calendar.
          await sendOwnerBookingNotification({
            to: booking.customer_email,
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            customerPhone: booking.customer_phone ?? undefined,
            eventDate: booking.event_date,
            items,
            total: Number(booking.total_amount),
            deposit: Number(booking.deposit_amount),
            deliveryFee: Number(booking.delivery_fee),
            confirmationNumber: booking.confirmation_number ?? undefined,
            orderNumber: booking.order_number ?? undefined,
            eventAddress: booking.event_address ?? undefined,
          });
        }
      } catch {
        // Acknowledge anyway so Stripe doesn't retry forever.
      }
    } else if (session.customer_details?.email) {
      // No persistence — still send a confirmation if we can.
      const customerEmail = session.customer_details.email;
      const customerName = session.customer_details.name ?? "there";
      await sendBookingConfirmation({
        to: customerEmail,
        customerName,
        eventDate: meta.event_date ?? "",
        items: "your selected items",
        total: Number(meta.total_amount ?? 0),
        deposit: Number(meta.deposit_amount ?? 0),
        deliveryFee: Number(meta.delivery_fee ?? 0),
        confirmationNumber: meta.confirmation_number || undefined,
        orderNumber: meta.order_number || undefined,
        eventAddress: meta.event_address || undefined,
      });
      if (meta.event_date) {
        await sendOwnerBookingNotification({
          to: customerEmail,
          customerName,
          customerEmail,
          customerPhone: session.customer_details.phone ?? undefined,
          eventDate: meta.event_date,
          items: "your selected items",
          total: Number(meta.total_amount ?? 0),
          deposit: Number(meta.deposit_amount ?? 0),
          deliveryFee: Number(meta.delivery_fee ?? 0),
          confirmationNumber: meta.confirmation_number || undefined,
          orderNumber: meta.order_number || undefined,
          eventAddress: meta.event_address || undefined,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
