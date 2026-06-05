import { PRODUCTS, BUNDLES } from "./data";
import type { Product, Bundle } from "./types";
import { createAdminSupabase, supabaseConfigured } from "./supabase/server";
import { readContent } from "./content";

/**
 * Catalog access that prefers live Supabase data and gracefully falls back to
 * the static catalog when Supabase isn't configured (or a query fails). This
 * lets the whole site render in local dev with zero setup.
 *
 * Admin edits (name/price/description/photo/availability) are stored as
 * overrides in the content store and merged on top here, so the whole site
 * reflects them everywhere products are shown.
 */

async function applyOverrides(products: Product[]): Promise<Product[]> {
  try {
    const { products: overrides } = await readContent();
    if (!overrides || Object.keys(overrides).length === 0) return products;
    return products.map((p) =>
      overrides[p.id] ? { ...p, ...overrides[p.id] } : p
    );
  } catch {
    return products;
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!supabaseConfigured) return applyOverrides(PRODUCTS);
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("price_per_day", { ascending: false });
    if (error || !data || data.length === 0) return applyOverrides(PRODUCTS);
    return applyOverrides(data as Product[]);
  } catch {
    return applyOverrides(PRODUCTS);
  }
}

async function applyBundleOverrides(bundles: Bundle[]): Promise<Bundle[]> {
  try {
    const { bundles: overrides } = await readContent();
    if (!overrides || Object.keys(overrides).length === 0) return bundles;
    return bundles.map((b) =>
      overrides[b.id] ? { ...b, ...overrides[b.id] } : b
    );
  } catch {
    return bundles;
  }
}

export async function getBundles(): Promise<Bundle[]> {
  if (!supabaseConfigured) return applyBundleOverrides(BUNDLES);
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .order("bundle_price", { ascending: true });
    if (error || !data || data.length === 0)
      return applyBundleOverrides(BUNDLES);
    return applyBundleOverrides(data as Bundle[]);
  } catch {
    return applyBundleOverrides(BUNDLES);
  }
}
