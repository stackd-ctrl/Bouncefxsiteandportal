import Link from "next/link";
import type { Bundle } from "@/lib/types";
import { money } from "@/lib/format";
import BundleGallery from "./BundleGallery";

const TIER_STYLE: Record<
  string,
  { badge: string; accent: string; label: string }
> = {
  bronze: { badge: "bg-[#CD7F32] text-white", accent: "text-[#B06A26]", label: "Bronze" },
  silver: { badge: "bg-party-ink text-white", accent: "text-party-ink", label: "Silver" },
  gold: { badge: "bg-party-yellow text-party-ink", accent: "text-party-red", label: "Gold" },
};

export default function BundleCard({
  bundle,
  featured = false,
}: {
  bundle: Bundle;
  featured?: boolean;
}) {
  const tier = bundle.tier ?? "bronze";
  const style = TIER_STYLE[tier];
  const savings =
    Math.round((bundle.individual_value - bundle.bundle_price) * 100) / 100;
  const photos = [bundle.image_url, ...(bundle.images ?? [])].filter(
    Boolean
  ) as string[];

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 shadow-card transition-transform duration-300 ${
        featured
          ? "bg-party-red text-white lg:-translate-y-3"
          : "bg-white text-party-ink"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 z-10 rounded-full bg-party-yellow px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-party-ink">
          Most Popular
        </span>
      )}
      {!featured && bundle.badge && (
        <span className="absolute -top-3 left-8 z-10 rounded-full bg-party-red px-4 py-1 font-body text-xs font-bold uppercase tracking-wider text-white">
          {bundle.badge}
        </span>
      )}

      {photos.length > 0 && <BundleGallery images={photos} />}

      <h3 className="mt-1 font-display text-3xl font-bold italic">
        {bundle.name}
      </h3>
      <p className={`mt-2 text-sm ${featured ? "text-white/85" : "text-party-ink/65"}`}>
        {bundle.description}
      </p>

      <div className="mt-5 flex items-end gap-2">
        <span className="font-display text-5xl font-bold italic">
          {money(bundle.bundle_price)}
        </span>
        {savings > 0 && (
          <span
            className={`mb-2 text-sm font-semibold line-through ${
              featured ? "text-white/60" : "text-party-ink/40"
            }`}
          >
            {money(bundle.individual_value)}
          </span>
        )}
      </div>
      {savings > 0 && (
        <p
          className={`text-sm font-bold ${
            featured ? "text-party-yellow" : style.accent
          }`}
        >
          You save {money(savings)}
        </p>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {(bundle.highlights ?? []).map((h) => (
          <li key={h} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                featured ? "bg-party-yellow" : "bg-party-red"
              }`}
            />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/book?bundle=${bundle.id}`}
        className={`btn-pill mt-7 w-full ${featured ? "btn-white" : "btn-red"}`}
      >
        Book This Bundle
      </Link>
    </div>
  );
}
