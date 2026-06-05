/**
 * Seed the Supabase `products` and `bundles` tables with the Bounce FX catalog.
 *
 *   1. Create your Supabase project and run `supabase/schema.sql`.
 *   2. Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. Run:  npm run seed
 *
 * Safe to run more than once — it upserts on the fixed UUIDs.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, BUNDLES } from "../src/lib/data";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🌱 Seeding products…");
  const products = PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price_per_day: p.price_per_day,
    category: p.category,
    image_url: p.image_url,
    is_available: p.is_available,
  }));
  const { error: pErr } = await supabase
    .from("products")
    .upsert(products, { onConflict: "id" });
  if (pErr) throw pErr;
  console.log(`   ✓ ${products.length} products`);

  console.log("🌱 Seeding bundles…");
  const bundles = BUNDLES.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    product_ids: b.product_ids,
    bundle_price: b.bundle_price,
    individual_value: b.individual_value,
    tier: b.tier,
    highlights: b.highlights,
  }));
  const { error: bErr } = await supabase
    .from("bundles")
    .upsert(bundles, { onConflict: "id" });
  if (bErr) throw bErr;
  console.log(`   ✓ ${bundles.length} bundles`);

  console.log("🎉 Done! Your catalog is live.");
}

main().catch((e) => {
  console.error("✗ Seed failed:", e.message ?? e);
  process.exit(1);
});
