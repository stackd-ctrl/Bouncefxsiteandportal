import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { getPages } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import PartyBuilder from "@/components/PartyBuilder";
import SpaceChecker from "@/components/SpaceChecker";

export const metadata: Metadata = {
  title: "Build Your Party",
  description:
    "Tell us your guest count and we'll build the perfect party setup — chairs, tables, tents and inflatables — with a live estimate.",
};

export default async function BuildPage() {
  const [products, c] = await Promise.all([
    getProducts(),
    getPages().then((p) => p.build),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.subtitle}
        color="bg-party-yellow"
        text="text-party-ink"
      />

      <section className="bg-party-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <PartyBuilder products={products} />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SpaceChecker products={products} />
        </div>
      </section>
    </>
  );
}
