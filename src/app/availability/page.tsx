import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AvailabilityExplorer from "@/components/AvailabilityExplorer";
import { getMedia } from "@/lib/content";

export const metadata: Metadata = {
  title: "Check Availability",
  description:
    "Pick your event date and instantly see which Bounce FX rentals are available to book.",
};

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: { product?: string };
}) {
  const media = await getMedia();
  return (
    <>
      {/* Hero with logo */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow text-party-yellow">Live availability</p>
            <h1 className="mt-4 font-display text-5xl font-bold italic leading-[0.95] sm:text-6xl md:text-7xl">
              Check Your Date,
              <br />
              Then Book It
            </h1>
            <p className="mt-5 max-w-xl font-body text-lg text-white/85">
              Pick your event date below and we'll show you exactly what's
              available. Found your favorites? Place your order in just a few
              clicks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#calendar" className="btn-yellow">
                Pick Your Date
              </Link>
              <Link href="/shop" className="btn-outline border-white text-white hover:bg-white hover:text-party-ink">
                Browse Rentals
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[360px]">
            <div className="relative aspect-square">
              <Image
                src={media.logo}
                alt="Bounce FX Party Rentals logo"
                fill
                priority
                sizes="360px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <div
        id="calendar"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16"
      >
        <AvailabilityExplorer initialProduct={searchParams.product} />
      </div>
    </>
  );
}
