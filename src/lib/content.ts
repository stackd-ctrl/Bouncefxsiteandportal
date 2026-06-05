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

export interface SiteContent {
  products: Record<string, ProductOverride>;
  bundles: Record<string, BundleOverride>;
  site: SiteInfo;
  media: MediaInfo;
}

export const DEFAULT_SITE: SiteInfo = {
  phones: ["571-494-3903", "571-264-9996"],
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

const CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

function hydrate(parsed: Partial<SiteContent> | null): SiteContent {
  return {
    products: parsed?.products ?? {},
    bundles: parsed?.bundles ?? {},
    site: { ...DEFAULT_SITE, ...(parsed?.site ?? {}) },
    media: { ...DEFAULT_MEDIA, ...(parsed?.media ?? {}) },
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
  const merged: SiteContent = {
    products: { ...current.products, ...(next.products ?? {}) },
    bundles: { ...current.bundles, ...(next.bundles ?? {}) },
    site: { ...current.site, ...(next.site ?? {}) },
    media: { ...current.media, ...(next.media ?? {}) },
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
