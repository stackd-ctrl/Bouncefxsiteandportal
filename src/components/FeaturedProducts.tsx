"use client";

import { useState, useEffect } from "react";
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

export default function FeaturedProducts({
  products,
}: {
  products: Product[];
}) {
  const [active, setActive] = useState<Product | null>(null);
  const [view, setView] = useState(0);

  useEffect(() => {
    if (!active) return;
    setView(0);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  const gallery = active
    ? [active.image_url, ...(active.images ?? [])].filter(Boolean)
    : [];

  return (
    <>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <article
            key={p.id}
            className="reveal group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1.5"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-2 transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-party-ink">
                {CATEGORY_LABEL[p.category] ?? "Rental"}
              </span>
              {/* Quick view button on hover */}
              <button
                onClick={() => setActive(p)}
                className="absolute inset-x-4 bottom-4 translate-y-3 rounded-xl bg-party-ink/90 py-2.5 font-body text-sm font-semibold text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Quick View
              </button>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-2xl font-bold italic leading-tight">
                {p.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold italic text-party-red">
                  {money(p.price_per_day)}
                </span>
                <span className="text-sm font-semibold text-party-ink/50">
                  / day
                </span>
              </div>
              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => setActive(p)}
                  className="btn-outline btn-pill flex-1 !px-3 !py-2.5 !text-sm"
                >
                  Quick View
                </button>
                <Link
                  href={`/book?product=${p.id}`}
                  className="btn-red btn-pill flex-1 !px-3 !py-2.5 !text-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Quick View modal */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl bg-white shadow-card sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl shadow-soft transition-colors hover:bg-party-cream"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="grid sm:grid-cols-2">
              <div className="bg-white p-3">
                <div className="relative aspect-[4/3] sm:aspect-square">
                  <Image
                    src={gallery[view] ?? active.image_url}
                    alt={active.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setView(i)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                          i === view
                            ? "border-party-red"
                            : "border-party-ink/15"
                        }`}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <span className="rounded-full bg-party-cream px-3 py-1 font-body text-xs font-bold uppercase tracking-wider">
                  {CATEGORY_LABEL[active.category] ?? "Rental"}
                </span>
                <h3 className="mt-3 font-display text-3xl font-bold italic leading-tight">
                  {active.name}
                </h3>
                <p className="mt-3 text-sm text-party-ink/70">
                  {active.description}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold italic text-party-red">
                    {money(active.price_per_day)}
                  </span>
                  <span className="text-sm font-semibold text-party-ink/50">
                    / day
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <Link
                    href={`/book?product=${active.id}`}
                    className="btn-red btn-pill w-full"
                  >
                    Book Now
                  </Link>
                  <Link
                    href={`/availability?product=${active.id}`}
                    className="btn-outline btn-pill w-full"
                  >
                    Check Availability
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
