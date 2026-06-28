import type { Metadata } from "next";
import { getProducts, getBundles } from "@/lib/catalog";
import { getPages } from "@/lib/content";
import ShopGrid from "@/components/ShopGrid";
import PageHeader from "@/components/PageHeader";

// Re-fetch the live catalog at most once a minute (admin saves still refresh
// instantly via revalidatePath). Catches out-of-band DB edits / re-seeds too.
export const revalidate = 60;

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
  const [products, bundles, c] = await Promise.all([
    getProducts(),
    getBundles(),
    getPages().then((p) => p.shop),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.subtitle}
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
