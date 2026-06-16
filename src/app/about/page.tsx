import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Bounce FX Party Rentals is a locally owned party rental company serving families, schools, churches, HOAs and community events throughout Fredericksburg, VA and surrounding areas.",
};

export default async function AboutPage() {
  const { media, site, pages } = await readContent();
  const c = pages.about;
  const aboutParas = site.aboutBody.split(/\n\n+/).filter(Boolean);
  return (
    <>
      {/* Editorial intro — yellow */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow text-party-red">{c.storyEyebrow}</p>
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
                {c.specialties.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-party-ink/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-party-red" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-7 max-w-md font-body text-party-ink/80">
              {c.closingBody}
            </p>
            <p className="mt-3 font-display text-xl font-bold italic text-party-red">
              {c.closingTagline}
            </p>

            <div className="mt-8">
              <Link href="/contact" className="btn-red">
                {c.ctaLabel}
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
            <p className="eyebrow text-party-red">{c.prideEyebrow}</p>
            <h2 className="section-title mt-3">{c.prideTitle}</h2>
          </div>
          <div className="mt-10 grid gap-x-12 gap-y-2 md:grid-cols-2">
            {c.pride.map((p) => (
              <div key={p.title} className="reveal rule-row">
                <span>{p.title}</span>
                <span className="max-w-xs text-right font-body text-sm font-normal not-italic text-party-ink/60">
                  {p.desc}
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
            <p className="eyebrow text-white/80">{c.serviceAreaEyebrow}</p>
            <h2 className="section-title mt-3">{c.serviceAreaTitle}</h2>
            <p className="mt-5 max-w-lg text-lg text-white/90">
              {c.serviceAreaBody}
            </p>
            <p className="mt-4 font-display text-lg font-semibold italic">
              {c.serviceAreaNote}
            </p>
          </div>
          <div className="reveal grid grid-cols-2 gap-3">
            {c.cities.map((city) => (
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
