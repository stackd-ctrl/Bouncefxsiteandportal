import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";
import PartyBuilder from "@/components/PartyBuilder";
import SpaceChecker from "@/components/SpaceChecker";

export const metadata: Metadata = {
  title: "Build Your Party",
  description:
    "Tell us your guest count and we'll build the perfect party setup — chairs, tables, tents and inflatables — with a live estimate.",
};

export default async function BuildPage() {
  const products = await getProducts();

  return (
    <>
      <PageHeader
        eyebrow="Plan it in seconds"
        title="Build Your Party"
        subtitle="Move the slider, pick your occasion, and we'll recommend the perfect setup with a live estimate. Then book it in one click."
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
