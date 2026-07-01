import Image from "next/image";
import Link from "next/link";
import { getProducts, getBundles } from "@/lib/catalog";
import { readContent } from "@/lib/content";
import { REVIEWS } from "@/lib/data";
import BundleCard from "@/components/BundleCard";
import DeliveryMap from "@/components/DeliveryMap";
import Marquee, { WaveMarquee } from "@/components/Marquee";
import StatBand from "@/components/StatBand";
import FeaturedProducts from "@/components/FeaturedProducts";
import Gallery from "@/components/Gallery";
import InstagramStrip from "@/components/InstagramStrip";

// Keep the live catalog fresh without a redeploy (see shop/page.tsx).
export const revalidate = 60;

export default async function HomePage() {
  const [products, bundles, content] = await Promise.all([
    getProducts(),
    getBundles(),
    readContent(),
  ]);
  const { media, site, pages } = content;
  const c = pages.home;
  const featured = products.slice(0, 6);

  // getBundles() is price-ordered; show the home trio in Small → Medium → Large
  // order (featured Medium sits in the middle) rather than the price shuffle.
  const HOME_BUNDLE_ORDER = ["small", "medium", "large", "tent"];
  const homeBundleRank = (name?: string) => {
    const i = HOME_BUNDLE_ORDER.indexOf(
      (name ?? "").trim().toLowerCase().split(" ")[0]
    );
    return i === -1 ? HOME_BUNDLE_ORDER.length : i;
  };
  const homeBundles = [...bundles]
    .sort((a, b) => homeBundleRank(a.name) - homeBundleRank(b.name))
    .slice(0, 3);

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="bg-party-red text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 text-center sm:px-6 md:pb-16 md:pt-24">
          <p className="eyebrow text-white/80">{site.areaText}</p>
          <h1 className="mx-auto mt-5 max-w-4xl whitespace-pre-line font-display text-6xl font-bold italic leading-[0.92] tracking-tight sm:text-7xl md:text-8xl">
            {site.heroHeadline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-lg text-white/90">
            {site.heroSub}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/availability" className="btn-yellow">
              Book Now
            </Link>
            <Link href="/shop" className="btn-white">
              Browse Rentals
            </Link>
          </div>
          <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-1.5 font-body text-sm font-semibold text-white">
            <span aria-hidden>★</span>
            {c.militaryBadge}
          </p>
        </div>
      </section>

      <Marquee text={site.tagline} bg="bg-party-yellow" color="text-party-ink" />

      {/* Full-bleed hero image band */}
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden bg-black sm:h-[52vh]">
        <Image
          src={media.hero}
          alt="Kids jumping inside the Bounce FX Grand Dome bounce house at a backyard party in Fredericksburg, VA"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <StatBand />

      {/* ───────────── FEATURED PRODUCTS ───────────── */}
      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-party-red">{c.featuredEyebrow}</p>
              <h2 className="section-title mt-3">{c.featuredTitle}</h2>
            </div>
            <Link href="/shop" className="btn-dark">
              View All Rentals
            </Link>
          </div>

          <div className="mt-12">
            <FeaturedProducts products={featured} />
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">{c.howEyebrow}</p>
            <h2 className="section-title mt-3">{c.howTitle}</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {c.howSteps.map((s, i) => (
              <div
                key={i}
                className="reveal border-t-2 border-party-ink pt-5"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="font-display text-5xl font-bold italic text-party-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold italic">
                  {s.title}
                </h3>
                <p className="mt-2 text-party-ink/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── BUNDLES ───────────── */}
      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">{c.bundlesEyebrow}</p>
            <h2 className="section-title mt-3">{c.bundlesTitle}</h2>
            <p className="mt-4 text-lg text-party-ink/70">{c.bundlesSub}</p>
          </div>
          <div className="mt-14 grid items-stretch gap-7 lg:grid-cols-3">
            {homeBundles.map((b) => (
              <div key={b.id} className="reveal h-full">
                <BundleCard bundle={b} featured={b.tier === "silver"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── SERVICES STRIP ───────────── */}
      <section className="bg-party-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {c.servicesStrip.map((s, i) => (
              <div key={i} className="px-2 py-4 text-center sm:py-6">
                <h3 className="font-display text-2xl font-bold italic text-party-yellow">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-white/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── GALLERY ───────────── */}
      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">{c.galleryEyebrow}</p>
            <h2 className="section-title mt-3">{c.galleryTitle}</h2>
          </div>
          <div className="mt-10">
            <Gallery images={media.gallery} />
          </div>
        </div>
      </section>

      {/* ───────────── REVIEWS ───────────── */}
      <section className="bg-party-yellow text-party-ink">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal max-w-2xl">
            <p className="eyebrow text-party-red">{c.testimonialsEyebrow}</p>
            <h2 className="section-title mt-3">{c.testimonialsTitle}</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((t, i) => (
              <figure
                key={t.id}
                className="reveal border-t-2 border-party-ink pt-6"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <p className="eyebrow text-party-red">Rated {t.rating} / 5</p>
                <blockquote className="mt-3 font-display text-xl font-medium italic leading-relaxed">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-display text-lg font-bold italic">
                    {t.name}
                  </p>
                  {t.meta && (
                    <p className="text-sm text-party-ink/60">{t.meta}</p>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="reveal mt-10">
            <Link href="/reviews" className="btn-dark">
              Read all reviews
            </Link>
          </div>
        </div>
      </section>

      <WaveMarquee text="Follow the fun" />

      <InstagramStrip />

      {/* ───────────── SERVING THE DMV + DELIVERY ───────────── */}
      <section id="delivery" className="scroll-mt-24 bg-party-red text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2">
          <div className="reveal">
            <p className="eyebrow text-white/80">{c.deliveryEyebrow}</p>
            <h2 className="section-title mt-3">{c.deliveryTitle}</h2>
            <p className="mt-5 max-w-md text-lg text-white/90">
              {c.deliveryBody}
            </p>
            <ul className="mt-7 space-y-0">
              {c.deliveryBullets.map((t, i) => (
                <li
                  key={i}
                  className="border-b border-white/25 py-4 font-display text-lg font-semibold italic"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <DeliveryMap />
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
          <div className="mx-auto mb-8 w-48">
            <Image
              src={media.logo}
              alt="Bounce FX Party Rentals"
              width={569}
              height={627}
              className="h-auto w-full"
            />
          </div>
          <h2 className="font-display text-4xl font-bold italic leading-tight sm:text-6xl">
            {c.ctaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            {c.ctaSub}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/availability" className="btn-yellow">
              Book Now
            </Link>
            <Link href="/shop" className="btn-outline border-white text-white hover:bg-white hover:text-party-ink">
              Browse Rentals
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
