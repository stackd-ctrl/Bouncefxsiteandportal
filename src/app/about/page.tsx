import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bounce FX Party Rentals is a locally owned party rental company serving families, schools, churches, HOAs and community events throughout Fredericksburg, VA and surrounding areas.",
};

const SPECIALTIES = [
  "Bounce house rentals",
  "Water slide rentals",
  "Tables & chairs",
  "Party setup for birthdays, school events, cookouts & more",
];

const PRIDE = [
  ["Clean & sanitized equipment", "Spotless and disinfected before every event."],
  ["On-time delivery", "We show up early so you're ready to celebrate."],
  ["Safe setup & takedown", "Properly anchored and inspected on site."],
  ["Friendly, professional service", "Real people who care about your day."],
];

const CITIES = [
  "Fredericksburg",
  "Stafford",
  "Spotsylvania",
  "King George",
  "Woodbridge",
  "Manassas",
];

export default async function AboutPage() {
  const { media, site } = await readContent();
  const aboutParas = site.aboutBody.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {/* Editorial intro — yellow */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow text-party-red">Our story</p>
            <h1 className="mt-4 whitespace-pre-line font-display text-6xl font-bold italic leading-[0.95] sm:text-7xl">
              {site.aboutHeadline}
            </h1>
            <div className="mt-6 space-y-4 font-body text-party-ink/80">
              {aboutParas.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-7">
              <p className="eyebrow text-party-red">We specialize in</p>
              <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                {SPECIALTIES.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-party-ink/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-party-red" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-7 max-w-md font-body text-party-ink/80">
              Whether you're planning a backyard birthday party or a large
              community event, we're here to help make it stress-free and
              memorable.
            </p>
            <p className="mt-3 font-display text-xl font-bold italic text-party-red">
              Thank you for supporting a local small business.
            </p>

            <div className="mt-8">
              <Link href="/contact" className="btn-red">
                Reserve Your Rental
              </Link>
            </div>
          </div>

          <div className="reveal">
            <div className="overflow-hidden rounded-3xl bg-black shadow-card ring-1 ring-party-ink/10">
              <div className="relative aspect-[9/10]">
                <Image
                  src={media.logo}
                  alt="Bounce FX Party Rentals — Bounce, Play, Celebrate! Fredericksburg, VA"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values — clean rule rows on cream */}
      <section className="bg-party-cream text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">Why families choose us</p>
            <h2 className="section-title mt-3">We take pride in</h2>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {PRIDE.map(([t, d]) => (
              <div key={t} className="reveal rule-row">
                <span>{t}</span>
                <span className="max-w-xs text-right font-body text-sm font-normal not-italic text-party-ink/60">
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service area — red block */}
      <section className="bg-party-red text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.4fr_1fr]">
          <div className="reveal">
            <p className="eyebrow text-white/80">Service area</p>
            <h2 className="section-title mt-3">Proudly serving the DMV</h2>
            <p className="mt-5 max-w-lg text-lg text-white/90">
              Home base is Fredericksburg, VA (22401). We deliver to families,
              schools, churches, HOAs, and community events throughout Stafford,
              Spotsylvania, King George, and the surrounding areas.
            </p>
            <p className="mt-4 font-display text-lg font-semibold italic">
              Free delivery within 15 miles · $2/mile beyond · Same-day
              available
            </p>
          </div>
          <div className="reveal grid grid-cols-2 gap-3">
            {CITIES.map((city) => (
              <span
                key={city}
                className="rounded-2xl bg-white/10 px-4 py-4 text-center font-display text-lg font-bold italic backdrop-blur"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
