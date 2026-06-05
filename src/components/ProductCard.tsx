import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  inflatable: "Inflatable",
  table: "Table",
  chair: "Chair",
  tent: "Tent",
  bundle: "Bundle",
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5">
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-party-ink">
          {CATEGORY_LABEL[product.category] ?? "Rental"}
        </span>
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-xs font-bold ${
            product.is_available
              ? "bg-party-green text-white"
              : "bg-party-ink text-white"
          }`}
        >
          <span className="text-[8px]">●</span>
          {product.is_available ? "Available" : "Booked"}
        </span>
        {product.images && product.images.length > 0 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-party-ink/80 px-2.5 py-1 font-body text-xs font-bold text-white">
            +{product.images.length} photos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-bold italic leading-tight">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-party-ink/60">
          {product.description}
        </p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-3xl font-bold italic text-party-red">
            {money(product.price_per_day)}
          </span>
          <span className="text-sm font-semibold text-party-ink/50">/ day</span>
        </div>

        <div className="mt-5 flex gap-2.5">
          <Link
            href={`/availability?product=${product.id}`}
            className="btn-outline btn-pill flex-1 !px-3 !py-2.5 !text-sm"
          >
            Check Date
          </Link>
          <Link
            href={`/book?product=${product.id}`}
            className="btn-red btn-pill flex-1 !px-3 !py-2.5 !text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
