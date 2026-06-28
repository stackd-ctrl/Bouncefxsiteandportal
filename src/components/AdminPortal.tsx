"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabase, supabaseConfigured } from "@/lib/supabase/client";
import type { Booking, Product, Bundle } from "@/lib/types";
import type { SiteInfo, MediaInfo, PagesContent, Lead } from "@/lib/content";
import AdminDashboard from "./AdminDashboard";
import CustomersPanel from "./admin/CustomersPanel";
import ProductsPanel from "./admin/ProductsPanel";
import BundlesPanel from "./admin/BundlesPanel";
import MediaPanel from "./admin/MediaPanel";
import PagesPanel from "./admin/PagesPanel";
import SettingsPanel from "./admin/SettingsPanel";
import TeamPanel from "./admin/TeamPanel";

type Tab =
  | "bookings"
  | "customers"
  | "products"
  | "bundles"
  | "media"
  | "pages"
  | "settings"
  | "team";

const NAV: { key: Tab; label: string; icon: JSX.Element; desc: string }[] = [
  {
    key: "bookings",
    label: "Bookings",
    desc: "Customer orders",
    icon: (
      <path d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    key: "customers",
    label: "Customers",
    desc: "Leads & contacts",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
    ),
  },
  {
    key: "products",
    label: "Products",
    desc: "Catalog & inventory",
    icon: (
      <path d="M3.3 7 12 12l8.7-5M12 22V12M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    ),
  },
  {
    key: "bundles",
    label: "Bundles",
    desc: "Package deals",
    icon: (
      <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
    ),
  },
  {
    key: "media",
    label: "Media",
    desc: "Photos & logo",
    icon: (
      <path d="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M8.5 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    ),
  },
  {
    key: "pages",
    label: "Pages",
    desc: "Website copy",
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6" />
    ),
  },
  {
    key: "settings",
    label: "Settings",
    desc: "Business info",
    icon: (
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.81 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 2.5V2.4a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9h.1a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    ),
  },
  {
    key: "team",
    label: "Team",
    desc: "Admin access",
    icon: (
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" />
    ),
  },
];

export default function AdminPortal({
  bookings,
  products,
  bundles,
  customProducts,
  customBundles,
  leads,
  site,
  media,
  pages,
  demo,
  email,
  isOwner,
  admins,
  ownerEmail,
}: {
  bookings: Booking[];
  products: Product[];
  bundles: Bundle[];
  customProducts: Product[];
  customBundles: Bundle[];
  leads: Lead[];
  site: SiteInfo;
  media: MediaInfo;
  pages: PagesContent;
  demo: boolean;
  email: string | null;
  isOwner: boolean;
  admins: string[];
  ownerEmail: string | null;
}) {
  const [tab, setTab] = useState<Tab>("bookings");
  // Only the owner manages admin access.
  const nav = NAV.filter((n) => n.key !== "team" || isOwner);
  const [loggingOut, setLoggingOut] = useState(false);
  // Cross-tab navigation: open a specific booking or customer when jumping tabs.
  const [focusBookingId, setFocusBookingId] = useState<string | null>(null);
  const [focusCustomerEmail, setFocusCustomerEmail] = useState<string | null>(
    null
  );
  const current = NAV.find((n) => n.key === tab)!;

  function openBooking(id: string) {
    setFocusBookingId(id);
    setTab("bookings");
  }
  function openCustomer(email: string) {
    setFocusCustomerEmail(email);
    setTab("customers");
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      if (supabaseConfigured) {
        await createBrowserSupabase().auth.signOut();
      }
    } finally {
      window.location.href = "/admin/login";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-party-red text-sm font-bold text-white">
            FX
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900">Bounce FX</p>
            <p className="text-xs text-gray-500">Admin Console</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {nav.map((n) => {
            const active = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full ${
                  active
                    ? "bg-party-red/10 text-party-red"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {n.icon}
                </svg>
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-gray-200 p-4 lg:block">
          {email && (
            <p className="truncate text-xs text-gray-500">{email}</p>
          )}
          <Link
            href="/"
            className="mt-2 block text-sm font-semibold text-party-red hover:underline"
          >
            View live site →
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{current.label}</h1>
            <p className="text-xs text-gray-500">{current.desc}</p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {loggingOut ? "…" : "Log out"}
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {tab === "bookings" && (
            <AdminDashboard
              bookings={bookings}
              products={products}
              leads={leads}
              email={email}
              focusBookingId={focusBookingId}
              onFocusConsumed={() => setFocusBookingId(null)}
              onOpenCustomer={openCustomer}
            />
          )}
          {tab === "customers" && (
            <CustomersPanel
              leads={leads}
              bookings={bookings}
              products={products}
              focusCustomerEmail={focusCustomerEmail}
              onFocusConsumed={() => setFocusCustomerEmail(null)}
              onOpenBooking={openBooking}
            />
          )}
          {tab === "products" && (
            <ProductsPanel products={products} customProducts={customProducts} />
          )}
          {tab === "bundles" && (
            <BundlesPanel
              bundles={bundles}
              customBundles={customBundles}
              products={products}
            />
          )}
          {tab === "media" && <MediaPanel media={media} />}
          {tab === "pages" && <PagesPanel pages={pages} site={site} />}
          {tab === "settings" && <SettingsPanel site={site} />}
          {tab === "team" && isOwner && (
            <TeamPanel
              initialAdmins={admins}
              ownerEmail={ownerEmail}
              currentEmail={email}
            />
          )}
        </div>
      </main>
    </div>
  );
}
