/**
 * Seed the Stripe product catalog with the Bounce FX inventory.
 *
 *   1. Grab your TEST secret key from https://dashboard.stripe.com/test/apikeys
 *   2. Put it in .env.local as STRIPE_SECRET_KEY=sk_test_...
 *   3. Run:  npm run stripe:seed
 *
 * Safe to run more than once. Each catalog item is matched by the metadata
 * field `catalog_id` (our internal UUID), so re-runs UPDATE the existing
 * Stripe product/price instead of creating duplicates. Prices are immutable in
 * Stripe, so when an amount changes we create a new default price and archive
 * the old one.
 *
 * Note: this only populates the Stripe dashboard catalog (reporting / Payment
 * Links / a tidy product list). The live booking checkout computes its charge
 * dynamically (items + delivery, deposit/partial/full) and does NOT depend on
 * these objects.
 */
import { config } from "dotenv";
import Stripe from "stripe";
import { PRODUCTS, BUNDLES } from "../src/lib/data";

config({ path: ".env.local" });

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error("✗ Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}
if (!key.startsWith("sk_test_")) {
  console.error(
    `✗ Refusing to run: STRIPE_SECRET_KEY is not a test key (expected sk_test_…).\n` +
      `  This seed is intended for the Stripe test sandbox. If you really mean to\n` +
      `  seed LIVE mode, set ALLOW_LIVE_SEED=1 in the environment.`
  );
  if (process.env.ALLOW_LIVE_SEED !== "1") process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

type SeedItem = {
  catalogId: string;
  name: string;
  description: string;
  /** unit amount in dollars */
  amount: number;
  metadata: Record<string, string>;
};

const dollarsToCents = (d: number) => Math.round(d * 100);

/**
 * Find a product we previously created for this catalog id (by metadata), or
 * null. We search rather than store the Stripe id so the script stays
 * stateless and re-runnable from a clean checkout.
 */
async function findExisting(catalogId: string): Promise<Stripe.Product | null> {
  const res = await stripe.products.search({
    query: `metadata['catalog_id']:'${catalogId}'`,
    limit: 1,
  });
  return res.data[0] ?? null;
}

async function upsertItem(item: SeedItem): Promise<void> {
  const cents = dollarsToCents(item.amount);
  const existing = await findExisting(item.catalogId);

  let product: Stripe.Product;
  if (existing) {
    product = await stripe.products.update(existing.id, {
      name: item.name,
      description: item.description,
      active: true,
      metadata: { catalog_id: item.catalogId, ...item.metadata },
    });
  } else {
    product = await stripe.products.create({
      name: item.name,
      description: item.description,
      metadata: { catalog_id: item.catalogId, ...item.metadata },
    });
  }

  // Does the current default price already match? If so, leave it alone.
  const defaultPriceId =
    typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id ?? null;

  let currentMatches = false;
  if (defaultPriceId) {
    const price = await stripe.prices.retrieve(defaultPriceId);
    currentMatches =
      price.active &&
      price.unit_amount === cents &&
      price.currency === "usd";
  }

  if (!currentMatches) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: cents,
      metadata: { catalog_id: item.catalogId },
    });
    await stripe.products.update(product.id, { default_price: price.id });
    // Archive the stale default price so the dashboard shows one active price.
    if (defaultPriceId && defaultPriceId !== price.id) {
      await stripe.prices.update(defaultPriceId, { active: false });
    }
  }

  console.log(
    `   ✓ ${item.name}  ($${item.amount.toFixed(2)})  ${product.id}${
      existing ? "  [updated]" : "  [created]"
    }`
  );
}

/** Fixed id for the 100%-off admin coupon so re-runs reuse it. */
const ADMIN_COUPON_ID = "admin-comp-100";
const ADMIN_PROMO_CODE = "ADMINFX2026"; // Stripe normalizes codes to uppercase

/**
 * Ensure a 100%-off "admin comp" coupon exists with the promotion code
 * ADMINFX2026 attached. Idempotent: re-runs reuse the coupon (fixed id) and the
 * existing promotion code (matched by code) rather than duplicating.
 *
 * Note: Stripe promotion-code lookups are case-insensitive on entry but the
 * stored code is uppercased — customers can type "adminfx2026" and it matches.
 */
async function ensureAdminPromo(): Promise<void> {
  console.log("\n🏷️  Admin promo code");

  let coupon: Stripe.Coupon;
  try {
    coupon = await stripe.coupons.retrieve(ADMIN_COUPON_ID);
  } catch {
    coupon = await stripe.coupons.create({
      id: ADMIN_COUPON_ID,
      name: "Admin Comp (100% off)",
      percent_off: 100,
      duration: "forever",
      metadata: { kind: "admin_comp" },
    });
  }

  const existing = await stripe.promotionCodes.list({
    code: ADMIN_PROMO_CODE,
    limit: 1,
  });
  let promo = existing.data[0];
  if (promo) {
    if (!promo.active) {
      promo = await stripe.promotionCodes.update(promo.id, { active: true });
    }
  } else {
    promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: ADMIN_PROMO_CODE,
      metadata: { kind: "admin_comp" },
    });
  }

  console.log(
    `   ✓ ${promo.code}  → 100% off  (${promo.id})  ${
      existing.data[0] ? "[exists]" : "[created]"
    }`
  );
}

async function main() {
  const mode = key!.startsWith("sk_test_") ? "TEST" : "LIVE";
  console.log(`🟣 Seeding Stripe catalog (${mode} mode)…\n`);

  console.log("📦 Products");
  for (const p of PRODUCTS) {
    await upsertItem({
      catalogId: p.id,
      name: p.name,
      description: p.description,
      amount: p.price_per_day,
      metadata: { kind: "product", category: p.category, unit: "per_day" },
    });
  }

  console.log("\n🎁 Bundles");
  for (const b of BUNDLES) {
    await upsertItem({
      catalogId: b.id,
      name: `${b.name} (Bundle)`,
      description: b.description,
      amount: b.bundle_price,
      metadata: {
        kind: "bundle",
        tier: b.tier ?? "",
        includes: b.product_ids.join(","),
      },
    });
  }

  await ensureAdminPromo();

  console.log(
    `\n✅ Done — ${PRODUCTS.length} products + ${BUNDLES.length} bundles + 1 admin promo in Stripe ${mode}.`
  );
}

main().catch((err) => {
  console.error("\n✗ Stripe seed failed:", err?.message ?? err);
  process.exit(1);
});
