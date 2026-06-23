import type { Metadata } from "next";
import { getProducts, getBundles } from "@/lib/catalog";
import QuickCheckout from "@/components/QuickCheckout";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Quick Checkout",
  description:
    "Pick your items, fill out one short form, and pay — the fast way to book Bounce FX Party Rentals.",
};

export default async function CheckoutPage() {
  const [products, bundles] = await Promise.all([getProducts(), getBundles()]);

  return (
    <>
      <PageHeader
        eyebrow="Fast & simple"
        title="Quick Checkout"
        subtitle="Pick your items, fill out one short form, and pay. No multi-step process."
        color="bg-party-red"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <QuickCheckout products={products} bundles={bundles} />
      </div>
    </>
  );
}
