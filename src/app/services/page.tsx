import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Bounce FX serves schools, churches, businesses and community organizations across the DMV with inflatables, tents, tables, chairs, setup and same-day delivery.",
};

export default async function ServicesPage() {
  const c = (await getPages()).services;
  return (
    <>
      {/* Editorial header + service list — yellow */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="reveal">
            <p className="eyebrow text-party-red">{c.eyebrow}</p>
            <h1 className="mt-4 whitespace-pre-line font-display text-5xl font-bold italic leading-[0.95] sm:text-6xl">
              {c.headline}
            </h1>
            <div className="mt-8">
              {c.services.map((s) => (
                <div key={s.title} className="rule-row">
                  <span>{s.title}</span>
                  <span className="max-w-[45%] text-right font-body text-sm font-normal not-italic text-party-ink/60">
                    {s.desc}
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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">{c.whoEyebrow}</p>
            <h2 className="section-title mt-3">{c.whoTitle}</h2>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {c.audiences.map((a) => (
              <div key={a.title} className="reveal rule-row">
                <span>{a.title}</span>
                <span className="max-w-[55%] text-right font-body text-sm font-normal not-italic text-party-ink/60">
                  {a.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise — black */}
      <section className="bg-party-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-20 md:grid-cols-3">
          {c.promise.map((p) => (
            <div key={p.title} className="reveal border-t-2 border-white/30 pt-5">
              <h3 className="font-display text-2xl font-bold italic text-party-yellow">
                {p.title}
              </h3>
              <p className="mt-2 text-white/70">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order CTA */}
      <section className="bg-party-red text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20">
          <h2 className="font-display text-4xl font-bold italic sm:text-5xl">
            {c.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            {c.ctaSub}
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
