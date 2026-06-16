"use client";

import { useState } from "react";
import Link from "next/link";
import type { Booking, Product, Bundle } from "@/lib/types";
import type { SiteInfo, MediaInfo, PagesContent } from "@/lib/content";
import AdminDashboard from "./AdminDashboard";
import ProductsPanel from "./admin/ProductsPanel";
import BundlesPanel from "./admin/BundlesPanel";
import MediaPanel from "./admin/MediaPanel";
import PagesPanel from "./admin/PagesPanel";
import SettingsPanel from "./admin/SettingsPanel";

type Tab = "bookings" | "products" | "bundles" | "media" | "pages" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "bookings", label: "Bookings" },
  { key: "products", label: "Products" },
  { key: "bundles", label: "Bundles" },
  { key: "media", label: "Media" },
  { key: "pages", label: "Pages" },
  { key: "settings", label: "Settings" },
];

export default function AdminPortal({
  bookings,
  products,
  bundles,
  site,
  media,
  pages,
  demo,
  email,
}: {
  bookings: Booking[];
  products: Product[];
  bundles: Bundle[];
  site: SiteInfo;
  media: MediaInfo;
  pages: PagesContent;
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
        {demo && (
          <p className="mb-6 rounded-lg border border-party-yellow/60 bg-party-yellow/25 px-4 py-3 text-sm font-semibold">
            Prototype mode — explore freely! You can edit and upload, but changes
            are session-only and won't be saved (connect Supabase to make edits
            stick). Bookings shown are sample data.
          </p>
        )}
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
        {tab === "pages" && <PagesPanel pages={pages} site={site} />}
        {tab === "settings" && <SettingsPanel site={site} />}
      </div>
    </div>
  );
}
