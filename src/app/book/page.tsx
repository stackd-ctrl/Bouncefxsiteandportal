import type { Metadata } from "next";
import { getProducts, getBundles } from "@/lib/catalog";
import BookingFlow from "@/components/BookingFlow";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Book Your Event",
  description:
    "Build your party rental order, pick your date, and secure it with a simple deposit.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: {
    product?: string;
    products?: string;
    note?: string;
    bundle?: string;
    date?: string;
    canceled?: string;
  };
}) {
  const [products, bundles] = await Promise.all([getProducts(), getBundles()]);

  return (
    <>
      <PageHeader
        eyebrow="Almost party time"
        title="Book Your Event"
        subtitle="Three quick steps: choose your items & date, share event details, and pay your deposit."
        color="bg-party-red"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        {searchParams.canceled && (
          <p className="mb-6 rounded-lg border border-party-yellow/50 bg-party-yellow/20 px-4 py-3 font-semibold">
            Checkout canceled — your selections are still here whenever you're
            ready.
          </p>
        )}
        <BookingFlow
          products={products}
          bundles={bundles}
          initial={{
            product: searchParams.product,
            products: searchParams.products
              ? searchParams.products.split(",").filter(Boolean)
              : undefined,
            note: searchParams.note,
            bundle: searchParams.bundle,
            date: searchParams.date,
          }}
        />
      </div>
    </>
  );
}
