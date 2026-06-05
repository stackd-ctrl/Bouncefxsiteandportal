import type { Metadata } from "next";
import { getProducts, getBundles } from "@/lib/catalog";
import ShopGrid from "@/components/ShopGrid";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Shop Rentals",
  description:
    "Browse Bounce FX inflatables, tents, tables, chairs and bundle packages. Check availability and book online.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [products, bundles] = await Promise.all([getProducts(), getBundles()]);

  return (
    <>
      <PageHeader
        eyebrow="The full lineup"
        title="Shop Rentals"
        subtitle="Inflatables, tents, tables, chairs and money-saving bundles — all delivered and set up for you."
        color="bg-party-red"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <ShopGrid
          products={products}
          bundles={bundles}
          initialCategory={searchParams.category || "all"}
        />
      </div>
    </>
  );
}
