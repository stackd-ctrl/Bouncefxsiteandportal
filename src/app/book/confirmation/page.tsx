import Link from "next/link";
import type { Metadata } from "next";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { money, prettyDate } from "@/lib/format";
import EventExtras from "@/components/EventExtras";
import Confetti from "@/components/Confetti";

export const metadata: Metadata = {
  title: "Booking Confirmed",
};

interface Summary {
  name: string;
  date: string;
  total: number;
  deposit: number;
  delivery: number;
  items: string;
  email?: string;
  payType?: string;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: {
    session_id?: string;
    demo?: string;
    name?: string;
    date?: string;
    total?: string;
    deposit?: string;
    delivery?: string;
    items?: string;
    payType?: string;
  };
}) {
  let summary: Summary | null = null;

  if (searchParams.session_id && stripeConfigured) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(
        searchParams.session_id
      );
      const m = session.metadata ?? {};
      summary = {
        name: session.customer_details?.name ?? "there",
        email: session.customer_details?.email ?? undefined,
        date: m.event_date ?? "",
        total: Number(m.total_amount ?? 0),
        deposit: Number(m.deposit_amount ?? (session.amount_total ?? 0) / 100),
        delivery: Number(m.delivery_fee ?? 0),
        items: "your selected rentals",
        payType: m.payment_type,
      };
    } catch {
      summary = null;
    }
  } else if (searchParams.demo) {
    summary = {
      name: searchParams.name ?? "there",
      date: searchParams.date ?? "",
      total: Number(searchParams.total ?? 0),
      deposit: Number(searchParams.deposit ?? 0),
      delivery: Number(searchParams.delivery ?? 0),
      items: searchParams.items ?? "your selected rentals",
      payType: searchParams.payType,
    };
  }

  const remaining = summary
    ? Math.round((summary.total - summary.deposit) * 100) / 100
    : 0;

  return (
    <section className="bg-party-red text-white">
      {summary && <Confetti />}
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-28">
        <p className="eyebrow text-white/80">Booking confirmed</p>
        <h1 className="mt-4 font-display text-6xl font-bold italic sm:text-7xl">
          You're booked!
        </h1>
        <p className="mt-4 text-lg text-white/90">
          {summary
            ? `Thanks ${summary.name}! Your payment is in and your party is officially on the calendar.`
            : "Your booking request was received — we'll be in touch shortly to confirm the details."}
        </p>

        {summary && (
          <div className="card mt-8 bg-white p-6 text-left text-party-ink">
            <h2 className="font-display text-xl font-bold italic">Booking Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              {summary.date && (
                <SummaryRow label="Event date" value={prettyDate(summary.date)} />
              )}
              <SummaryRow label="Items" value={summary.items} />
              <SummaryRow
                label="Delivery"
                value={summary.delivery === 0 ? "FREE" : money(summary.delivery)}
              />
              <div className="my-2 border-t border-dashed border-party-ink/15" />
              <SummaryRow label="Total" value={money(summary.total)} bold />
              <div className="flex justify-between rounded-lg bg-party-green/15 px-3 py-2 font-display font-bold text-party-green">
                <span>{summary.payType ?? "Paid"}</span>
                <span>{money(summary.deposit)}</span>
              </div>
              <SummaryRow
                label="Balance due on event day"
                value={remaining > 0 ? money(remaining) : "Paid in full"}
              />
            </div>
            {summary.email && (
              <p className="mt-4 text-sm text-party-ink/60">
                A confirmation has been sent to {summary.email}.
              </p>
            )}
          </div>
        )}

        {summary?.date && <EventExtras eventDate={summary.date} />}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-yellow">
            Back to Home
          </Link>
          <Link href="/shop" className="btn-white">
            Browse More Rentals
          </Link>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
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
        bold ? "font-display text-lg font-bold" : ""
      }`}
    >
      <span className={bold ? "" : "text-party-ink/60"}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
