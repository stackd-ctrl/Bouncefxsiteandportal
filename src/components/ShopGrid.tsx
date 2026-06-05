"use client";

import { useState } from "react";
import type { Product, Bundle } from "@/lib/types";
import { CATEGORIES } from "@/lib/data";
import ProductCard from "./ProductCard";
import BundleCard from "./BundleCard";
import DeliveryCalculator from "./DeliveryCalculator";

export default function ShopGrid({
  products,
  bundles,
  initialCategory = "all",
}: {
  products: Product[];
  bundles: Bundle[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState(initialCategory);

  const showBundles = active === "all" || active === "bundle";
  const visibleProducts =
    active === "all" || active === "bundle"
      ? active === "bundle"
        ? []
        : products
      : products.filter((p) => p.category === active);

  return (
    <div>
      {/* Filter tabs — professional */}
      <div className="flex flex-wrap gap-x-7 gap-y-3 border-b border-party-ink/15 pb-1">
        {CATEGORIES.map((c) => {
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`tab ${isActive ? "tab-active" : ""}`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Delivery calculator strip */}
      <div className="mt-8">
        <DeliveryCalculator />
      </div>

      {/* Bundles */}
      {showBundles && (
        <div className="mt-12">
          <h2 className="section-title mb-6 !text-3xl">Bundle Packages</h2>
          <div className="grid gap-7 lg:grid-cols-3">
            {bundles.map((b) => (
              <BundleCard
                key={b.id}
                bundle={b}
                featured={b.tier === "silver"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {visibleProducts.length > 0 && (
        <div className="mt-12">
          {active === "all" && (
            <h2 className="section-title mb-6 !text-3xl">Individual Rentals</h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {visibleProducts.length === 0 && !showBundles && (
        <p className="mt-12 text-center text-lg text-party-ink/60">
          No items in this category yet — check back soon!
        </p>
      )}
    </div>
  );
}
