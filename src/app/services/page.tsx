import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Bounce FX serves schools, churches, businesses and community organizations across the DMV with inflatables, tents, tables, chairs, setup and same-day delivery.",
};

const SERVICES = [
  ["Bounce Houses & Water Slides", "Slides, combos & the 20x20 Grand Party Dome"],
  ["Tents & Shade", "Premium 20x20 high-peak frame tents"],
  ["Tables & Chairs", "Heavy-duty banquet tables & white folding chairs"],
  ["Delivery & Setup", "We deliver, set up, and pick everything back up"],
  ["Same-Day Service", "Order by noon and we'll do our best to set up today"],
  ["Large-Scale Events", "Festivals, field days & community gatherings"],
];

const AUDIENCES = [
  ["Schools", "Field days, fall festivals & fundraisers"],
  ["Churches", "Picnics, VBS & community outreach"],
  ["HOAs", "Block parties & neighborhood events"],
  ["Businesses", "Corporate family days & grand openings"],
];

export default function ServicesPage() {
  return (
    <>
      {/* Editorial header + service list — yellow */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="reveal">
            <p className="eyebrow text-party-red">What we do</p>
            <h1 className="mt-4 font-display text-5xl font-bold italic leading-[0.95] sm:text-6xl">
              Stress-free
              <br />
              celebration services
            </h1>
            <div className="mt-8">
              {SERVICES.map(([t, d]) => (
                <div key={t} className="rule-row">
                  <span>{t}</span>
                  <span className="max-w-[45%] text-right font-body text-sm font-normal not-italic text-party-ink/60">
                    {d}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/shop" className="btn-red">
                Browse Rentals
              </Link>
            </div>
          </div>

          <div className="reveal">
            <div className="overflow-hidden rounded-3xl shadow-card">
              <div className="relative aspect-[4/5]">
                <Image
                  src="/products/grand-dome.png"
                  alt="The Bounce FX Grand Party Dome inflatable ready for an event"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who we serve — cream */}
      <section className="bg-party-cream text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">Who we serve</p>
            <h2 className="section-title mt-3">Built for your community</h2>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {AUDIENCES.map(([t, d]) => (
              <div key={t} className="reveal rule-row">
                <span>{t}</span>
                <span className="max-w-[55%] text-right font-body text-sm font-normal not-italic text-party-ink/60">
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise — black */}
      <section className="bg-party-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 md:grid-cols-3">
          {[
            ["Clean & Sanitized", "Every unit is cleaned before each event."],
            ["Safe & Secure", "Properly anchored and safety-checked on site."],
            ["On-Time, Every Time", "We arrive early so you're ready to party."],
          ].map(([t, d]) => (
            <div key={t} className="reveal border-t-2 border-white/30 pt-5">
              <h3 className="font-display text-2xl font-bold italic text-party-yellow">
                {t}
              </h3>
              <p className="mt-2 text-white/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order CTA */}
      <section className="bg-party-red text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20">
          <h2 className="font-display text-4xl font-bold italic sm:text-5xl">
            Ready to place your order?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Check your date, pick your rentals, and book online with a simple
            deposit. We'll handle the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/availability" className="btn-yellow">
              Book Now
            </Link>
            <Link href="/shop" className="btn-white">
              Browse Rentals
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
