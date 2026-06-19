import { promises as fs } from "fs";
import path from "path";
import { GALLERY } from "./data";
import { createAdminSupabase, supabaseConfigured } from "./supabase/server";

/**
 * Lightweight, file-based content store for the owner admin portal. Lets the
 * owner edit product fields/photos, site media, and business info without code.
 *
 * Persists to `content/site.json` and uploaded files to `public/uploads/`.
 * This works when the app runs on a writable host (local machine, a VPS, or a
 * Node server). On Vercel's read-only runtime, swap the read/write helpers for
 * Supabase (a `site_content` row + Supabase Storage) — the shape stays the same.
 */

export interface ProductOverride {
  name?: string;
  description?: string;
  price_per_day?: number;
  image_url?: string;
  images?: string[];
  is_available?: boolean;
}

export interface BundleOverride {
  name?: string;
  description?: string;
  bundle_price?: number;
  image_url?: string;
  images?: string[];
}

export interface SiteInfo {
  phones: string[];
  email: string;
  instagram: string;
  facebook: string;
  tagline: string;
  areaText: string;
  heroHeadline: string;
  heroSub: string;
  aboutHeadline: string;
  aboutBody: string;
}

export interface MediaInfo {
  logo: string;
  hero: string;
  gallery: string[];
}

/**
 * Per-page editable copy. Everything here is plain words the owner can change
 * without touching code — headlines, body text, list items, button labels.
 * Structural things (forms, calculators, pricing tables, product data) stay in
 * code on purpose so edits can't break a feature.
 *
 * `Pair` = a titled item with a short description (steps, services, FAQ rows…).
 * `Stat` = a big number/label pair (the contact-page stat tiles).
 * Multi-line strings: a literal "\n" forces a line break in headlines, and a
 * blank line (two newlines) starts a new paragraph in body copy.
 */
export interface Pair {
  title: string;
  desc: string;
}
export interface Stat {
  big: string;
  small: string;
}

export interface PagesContent {
  home: {
    featuredEyebrow: string;
    featuredTitle: string;
    howEyebrow: string;
    howTitle: string;
    howSteps: Pair[];
    bundlesEyebrow: string;
    bundlesTitle: string;
    bundlesSub: string;
    servicesStrip: Pair[];
    galleryEyebrow: string;
    galleryTitle: string;
    testimonialsEyebrow: string;
    testimonialsTitle: string;
    deliveryEyebrow: string;
    deliveryTitle: string;
    deliveryBody: string;
    deliveryBullets: string[];
    ctaTitle: string;
    ctaSub: string;
  };
  about: {
    storyEyebrow: string;
    specialties: string[];
    closingBody: string;
    closingTagline: string;
    ctaLabel: string;
    prideEyebrow: string;
    prideTitle: string;
    pride: Pair[];
    serviceAreaEyebrow: string;
    serviceAreaTitle: string;
    serviceAreaBody: string;
    serviceAreaNote: string;
    cities: string[];
  };
  services: {
    eyebrow: string;
    headline: string;
    services: Pair[];
    whoEyebrow: string;
    whoTitle: string;
    audiences: Pair[];
    promise: Pair[];
    ctaTitle: string;
    ctaSub: string;
  };
  contact: {
    eyebrow: string;
    headline: string;
    intro: string;
    militaryNote: string;
    deliveryNote: string;
    respondNote: string;
    bannerTitle: string;
    bannerBody: string;
    stats: Stat[];
  };
  shop: { eyebrow: string; title: string; subtitle: string };
  availability: { eyebrow: string; headline: string; subtitle: string };
  build: { eyebrow: string; title: string; subtitle: string };
  reviews: { subtitle: string };
  bundles: {
    headerEyebrow: string;
    headerTitle: string;
    headerSubtitle: string;
    faq: Pair[];
  };
}

export interface SiteContent {
  products: Record<string, ProductOverride>;
  bundles: Record<string, BundleOverride>;
  site: SiteInfo;
  media: MediaInfo;
  pages: PagesContent;
}

export const DEFAULT_SITE: SiteInfo = {
  phones: ["571-264-9996", "571-494-3903"],
  email: "Info@bouncefxpartyrentals.com",
  instagram: "https://instagram.com/bouncefxpartyrentals",
  facebook: "https://facebook.com/share/1B5t1NjTLc",
  tagline: "Party vibes made easy",
  areaText: "Fredericksburg, VA & the DMV",
  heroHeadline: "Party Vibes\nMade Easy",
  heroSub:
    "Inflatables, tents, tables & chairs — delivered, set up, and ready to celebrate. Book online with a simple deposit and we handle the rest.",
  aboutHeadline: "Party Magic\nMade Easy",
  aboutBody:
    "Welcome to Bounce FX Party Rentals! We're a locally owned party rental company proudly serving families, schools, churches, HOAs, and community events throughout Fredericksburg and the surrounding areas.\n\nOur goal is simple — provide clean, safe, and fun inflatables, tables, and chairs with reliable customer service you can count on.",
};

export const DEFAULT_MEDIA: MediaInfo = {
  logo: "/bounce-fx-logo.png",
  hero: "/hero-grand-dome.png",
  gallery: GALLERY,
};

export const DEFAULT_PAGES: PagesContent = {
  home: {
    featuredEyebrow: "The lineup",
    featuredTitle: "All about the fun",
    howEyebrow: "Easy as 1 · 2 · 3",
    howTitle: "How the magic happens",
    howSteps: [
      {
        title: "Browse & pick your date",
        desc: "Explore our rentals and choose the perfect items. Check live availability for your event date.",
      },
      {
        title: "Pay your deposit",
        desc: "Lock in your booking with a simple flat $50 deposit online. The balance is due on the day of your event.",
      },
      {
        title: "We deliver & set up",
        desc: "Sit back and relax. We deliver, set up, and pick everything back up — clean, safe, and stress-free.",
      },
    ],
    bundlesEyebrow: "Bundle & save",
    bundlesTitle: "Everything in one package",
    bundlesSub:
      "Seating, shade, and bounce — bundled together for one easy price.",
    servicesStrip: [
      { title: "Folding Chairs", desc: "Crisp & heavy-duty" },
      { title: "Folding Tables", desc: "6ft banquet tables" },
      { title: "Inflatables", desc: "Slides & bounce houses" },
      { title: "Same-Day Delivery", desc: "Order by noon" },
    ],
    galleryEyebrow: "Real parties",
    galleryTitle: "Moments we made",
    testimonialsEyebrow: "Happy hosts",
    testimonialsTitle: "What families say",
    deliveryEyebrow: "Delivery",
    deliveryTitle: "Serving the DMV",
    deliveryBody:
      "Based in Fredericksburg, VA and delivering throughout the surrounding DMV. Setup and pickup are always included — we do the heavy lifting so you can enjoy the party.",
    deliveryBullets: [
      "Free delivery within 15 miles of 22401",
      "$2.00 / mile beyond the free zone",
      "Same-day delivery available — order by noon",
      "Schools, churches, businesses & community events",
    ],
    ctaTitle: "Ready to book your party?",
    ctaSub: "Check availability for your date and place your order in minutes.",
  },
  about: {
    storyEyebrow: "Our story",
    specialties: [
      "Bounce house rentals",
      "Water slide rentals",
      "Tables & chairs",
      "Party setup for birthdays, school events, cookouts & more",
    ],
    closingBody:
      "Whether you're planning a backyard birthday party or a large community event, we're here to help make it stress-free and memorable.",
    closingTagline: "Thank you for supporting a local small business.",
    ctaLabel: "Reserve Your Rental",
    prideEyebrow: "Why families choose us",
    prideTitle: "We take pride in",
    pride: [
      {
        title: "Clean & sanitized equipment",
        desc: "Spotless and disinfected before every event.",
      },
      {
        title: "On-time delivery",
        desc: "We show up early so you're ready to celebrate.",
      },
      {
        title: "Safe setup & takedown",
        desc: "Properly anchored and inspected on site.",
      },
      {
        title: "Friendly, professional service",
        desc: "Real people who care about your day.",
      },
    ],
    serviceAreaEyebrow: "Service area",
    serviceAreaTitle: "Proudly serving the DMV",
    serviceAreaBody:
      "Home base is Fredericksburg, VA (22401). We deliver to families, schools, churches, HOAs, and community events throughout Stafford, Spotsylvania, King George, and the surrounding areas.",
    serviceAreaNote:
      "Free delivery within 15 miles · $2/mile beyond · Same-day available",
    cities: [
      "Fredericksburg",
      "Stafford",
      "Spotsylvania",
      "King George",
      "Woodbridge",
      "Manassas",
    ],
  },
  services: {
    eyebrow: "What we do",
    headline: "Stress-free\ncelebration services",
    services: [
      {
        title: "Bounce Houses & Water Slides",
        desc: "Slides, combos & the 20x20 Grand Party Dome",
      },
      { title: "Tents & Shade", desc: "Premium 20x20 high-peak frame tents" },
      {
        title: "Tables & Chairs",
        desc: "Heavy-duty banquet tables & white folding chairs",
      },
      {
        title: "Delivery & Setup",
        desc: "We deliver, set up, and pick everything back up",
      },
      {
        title: "Same-Day Service",
        desc: "Order by noon and we'll do our best to set up today",
      },
      {
        title: "Large-Scale Events",
        desc: "Festivals, field days & community gatherings",
      },
    ],
    whoEyebrow: "Who we serve",
    whoTitle: "Built for your community",
    audiences: [
      { title: "Schools", desc: "Field days, fall festivals & fundraisers" },
      { title: "Churches", desc: "Picnics, VBS & community outreach" },
      { title: "HOAs", desc: "Block parties & neighborhood events" },
      {
        title: "Businesses",
        desc: "Corporate family days & grand openings",
      },
    ],
    promise: [
      {
        title: "Clean & Sanitized",
        desc: "Every unit is cleaned before each event.",
      },
      {
        title: "Safe & Secure",
        desc: "Properly anchored and safety-checked on site.",
      },
      {
        title: "On-Time, Every Time",
        desc: "We arrive early so you're ready to party.",
      },
    ],
    ctaTitle: "Ready to place your order?",
    ctaSub:
      "Check your date, pick your rentals, and book online with a simple deposit. We'll handle the rest.",
  },
  contact: {
    eyebrow: "Please contact for availability",
    headline: "Let's Get This\nParty Started!",
    intro:
      "Fill out the quick form, share your celebration dreams, and we'll whip up fun ideas that make your event a total yay!",
    militaryNote: "Ask about our military discounts.",
    deliveryNote:
      "Free within 15 miles of Fredericksburg 22401 · $2/mile beyond.",
    respondNote: "We typically respond within 24 hours.",
    bannerTitle: "Prefer to plan it together? We've got you.",
    bannerBody:
      "Tell us your date and we'll handle delivery, setup, and pickup — so all you have to do is show up and celebrate.",
    stats: [
      { big: "24 hrs", small: "Avg. reply time" },
      { big: "Free", small: "Local delivery" },
      { big: "Included", small: "Setup & pickup" },
    ],
  },
  shop: {
    eyebrow: "The full lineup",
    title: "Shop Rentals",
    subtitle:
      "Inflatables, tents, tables, chairs and money-saving bundles — all delivered and set up for you.",
  },
  availability: {
    eyebrow: "Live availability",
    headline: "Check Your Date,\nThen Book It",
    subtitle:
      "Pick your event date below and we'll show you exactly what's available. Found your favorites? Place your order in just a few clicks.",
  },
  build: {
    eyebrow: "Plan it in seconds",
    title: "Build Your Party",
    subtitle:
      "Move the slider, pick your occasion, and we'll recommend the perfect setup with a live estimate. Then book it in one click.",
  },
  reviews: {
    subtitle: "Real words from real Bounce FX parties across the DMV.",
  },
  bundles: {
    headerEyebrow: "Bundle & save",
    headerTitle: "Bundle Packages",
    headerSubtitle:
      "One package, everything you need. Pick a tier and we'll bring the whole setup — seating, shade, and bounce.",
    faq: [
      {
        title: "Can I customize a bundle?",
        desc: "Absolutely. Every bundle is a starting point — add chairs, tables, an extra tent, or swap the inflatable. Just tell us what you need and we'll build it.",
      },
      {
        title: "What does the deposit cover?",
        desc: "A flat $50 deposit confirms your date and reserves your equipment. The remaining balance is due on the day of your event.",
      },
      {
        title: "Is delivery really included?",
        desc: "Yes — delivery, setup, and pickup are included on every bundle within 15 miles of Fredericksburg (22401). Beyond that it's a flat $2/mile.",
      },
      {
        title: "How far ahead should I book?",
        desc: "Popular dates fill up fast, especially weekends in spring and summer. We recommend booking 2–3 weeks out, but we'll always do our best for last-minute events.",
      },
    ],
  },
};

const CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

/**
 * Fill in any missing page or field from defaults. Stored blobs predating the
 * Pages editor have no `pages` key; older saves may have only some pages — both
 * cases fall back to DEFAULT_PAGES one level deep (page → fields).
 */
function hydratePages(parsed?: Partial<PagesContent> | null): PagesContent {
  const out: Record<string, unknown> = {};
  const stored = (parsed ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_PAGES)) {
    out[key] = {
      ...(DEFAULT_PAGES[key as keyof PagesContent] as object),
      ...((stored[key] as object) ?? {}),
    };
  }
  return out as unknown as PagesContent;
}

function hydrate(parsed: Partial<SiteContent> | null): SiteContent {
  return {
    products: parsed?.products ?? {},
    bundles: parsed?.bundles ?? {},
    site: { ...DEFAULT_SITE, ...(parsed?.site ?? {}) },
    media: { ...DEFAULT_MEDIA, ...(parsed?.media ?? {}) },
    pages: hydratePages(parsed?.pages),
  };
}

export async function readContent(): Promise<SiteContent> {
  // Supabase (works on read-only hosts like Vercel) takes precedence.
  if (supabaseConfigured) {
    try {
      const sb = createAdminSupabase();
      const { data } = await sb
        .from("site_content")
        .select("data")
        .eq("id", "singleton")
        .single();
      return hydrate((data?.data ?? null) as Partial<SiteContent> | null);
    } catch {
      return hydrate(null);
    }
  }
  // Local file fallback.
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf8");
    return hydrate(JSON.parse(raw));
  } catch {
    return hydrate(null);
  }
}

export async function writeContent(
  next: Partial<SiteContent>
): Promise<SiteContent> {
  const current = await readContent();
  // Merge incoming pages per-page so a partial payload (e.g. just `home`)
  // doesn't wipe the others. Each page object is replaced wholesale, which is
  // what the admin sends (it always submits a full page).
  const mergedPages = { ...current.pages } as unknown as Record<string, unknown>;
  if (next.pages) {
    const incoming = next.pages as unknown as Record<string, unknown>;
    const base = current.pages as unknown as Record<string, unknown>;
    for (const key of Object.keys(incoming)) {
      mergedPages[key] = {
        ...((base[key] as object) ?? {}),
        ...((incoming[key] as object) ?? {}),
      };
    }
  }
  const merged: SiteContent = {
    products: { ...current.products, ...(next.products ?? {}) },
    bundles: { ...current.bundles, ...(next.bundles ?? {}) },
    site: { ...current.site, ...(next.site ?? {}) },
    media: { ...current.media, ...(next.media ?? {}) },
    pages: mergedPages as unknown as PagesContent,
  };

  if (supabaseConfigured) {
    const sb = createAdminSupabase();
    await sb
      .from("site_content")
      .upsert({ id: "singleton", data: merged }, { onConflict: "id" });
    return merged;
  }

  // Persist to the local file when the host is writable. On a read-only host
  // (e.g. Vercel prototype without Supabase) this no-ops so the admin still
  // "saves" without erroring — the edit just doesn't survive the session.
  try {
    await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
    await fs.writeFile(CONTENT_PATH, JSON.stringify(merged, null, 2), "utf8");
  } catch {
    /* read-only host — ephemeral prototype mode */
  }
  return merged;
}

/** Convenience getters for non-product surfaces. */
export async function getSiteInfo(): Promise<SiteInfo> {
  return (await readContent()).site;
}
export async function getMedia(): Promise<MediaInfo> {
  return (await readContent()).media;
}
export async function getPages(): Promise<PagesContent> {
  return (await readContent()).pages;
}
