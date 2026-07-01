import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/lib/cities";
import { getProducts } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import { money } from "@/lib/format";

// Keep the live catalog fresh without a redeploy (see shop/page.tsx).
export const revalidate = 60;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { city: string };
}): Metadata {
  const city = getCity(params.city);
  if (!city) return { title: "Service Area" };
  return {
    title: `Bounce House & Party Rentals in ${city.name}, ${city.state}`,
    description: `Bounce houses, water slides, tents, tables and chairs for rent in ${city.name}, ${city.state}. Delivery, setup and pickup included. ${
      city.freeDelivery ? "Free local delivery." : "Low flat-rate delivery."
    } Book online with Bounce FX.`,
    alternates: { canonical: `/party-rentals/${city.slug}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: { city: string };
}) {
  const city = getCity(params.city);
  if (!city) notFound();

  const products = await getProducts();
  const fee = city.freeDelivery
    ? "Free delivery"
    : `~${money(Math.max((city.miles - 15) * 2, 0))} delivery`;
  const others = CITIES.filter((c) => c.slug !== city.slug);

  return (
    <>
      <section className="bg-party-red text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <p className="eyebrow text-white/80">Now serving {city.name}, {city.state}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-bold italic leading-[0.95] sm:text-6xl md:text-7xl">
            Bounce House &amp; Party Rentals in {city.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90">{city.blurb}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/availability" className="btn-yellow">
              Book Now
            </Link>
            <Link href="/build" className="btn-white">
              Build Your Party
            </Link>
          </div>
          <p className="mt-5 font-display text-lg font-semibold italic">
            {city.miles > 0 ? `~${city.miles} mi from our shop · ` : ""}
            {fee} · Setup &amp; pickup included
          </p>
        </div>
      </section>

      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-party-red">What we bring to {city.name}</p>
            <h2 className="section-title mt-3">Rentals for every celebration</h2>
          </div>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Internal links to other areas (SEO) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold italic">
            We also serve nearby
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/party-rentals/${c.slug}`}
                className="rounded-full border border-party-ink/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-party-cream"
              >
                {c.name}, {c.state}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
