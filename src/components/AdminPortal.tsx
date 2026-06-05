"use client";

import { useState } from "react";
import Link from "next/link";
import type { Booking, Product, Bundle } from "@/lib/types";
import type { SiteInfo, MediaInfo } from "@/lib/content";
import AdminDashboard from "./AdminDashboard";
import ProductsPanel from "./admin/ProductsPanel";
import BundlesPanel from "./admin/BundlesPanel";
import MediaPanel from "./admin/MediaPanel";
import SettingsPanel from "./admin/SettingsPanel";

type Tab = "bookings" | "products" | "bundles" | "media" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "bookings", label: "Bookings" },
  { key: "products", label: "Products" },
  { key: "bundles", label: "Bundles" },
  { key: "media", label: "Media" },
  { key: "settings", label: "Settings" },
];

export default function AdminPortal({
  bookings,
  products,
  bundles,
  site,
  media,
  demo,
  email,
}: {
  bookings: Booking[];
  products: Product[];
  bundles: Bundle[];
  site: SiteInfo;
  media: MediaInfo;
  demo: boolean;
  email: string | null;
}) {
  const [tab, setTab] = useState<Tab>("bookings");

  return (
    <div className="min-h-screen bg-party-cream">
      {/* Top bar */}
      <header className="border-b border-party-ink/15 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold italic">
              Bounce FX
            </span>
            <span className="font-display text-xl font-medium italic text-party-ink/50">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {email && (
              <span className="hidden text-party-ink/60 sm:inline">{email}</span>
            )}
            <Link href="/" className="btn-white !px-4 !py-2 !text-sm">
              View Site
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab ${tab === t.key ? "tab-active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {tab === "bookings" && (
          <AdminDashboard
            bookings={bookings}
            products={products}
            demo={demo}
            email={email}
          />
        )}
        {tab === "products" && <ProductsPanel products={products} />}
        {tab === "bundles" && <BundlesPanel bundles={bundles} />}
        {tab === "media" && <MediaPanel media={media} />}
        {tab === "settings" && <SettingsPanel site={site} />}
      </div>
    </div>
  );
}
