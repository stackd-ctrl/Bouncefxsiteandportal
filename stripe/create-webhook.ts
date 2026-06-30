/**
 * Create (or reuse) the Stripe webhook endpoint for the deployed site.
 *
 *   URL:    npm run stripe:webhook -- https://your-domain/...   (or edit DEFAULT)
 *   Events: checkout.session.completed  (what /api/webhooks/stripe handles)
 *
 * Prints the signing secret (whsec_…) on creation — copy it into the Vercel
 * env as STRIPE_WEBHOOK_SECRET. The secret is only shown once, at creation;
 * if the endpoint already exists this script reports it and you can roll the
 * secret in the dashboard if you no longer have it.
 */
import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("✗ Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const DEFAULT_SITE = "https://bouncefxsiteandportal.vercel.app";
const siteArg = process.argv[2]?.replace(/\/+$/, "") || DEFAULT_SITE;
const endpointUrl = siteArg.endsWith("/api/webhooks/stripe")
  ? siteArg
  : `${siteArg}/api/webhooks/stripe`;

const EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "checkout.session.completed",
];

const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

async function main() {
  const mode = key!.startsWith("sk_live_") ? "LIVE" : "TEST";
  console.log(`🔌 Webhook endpoint (${mode} mode)\n   ${endpointUrl}\n`);

  // Reuse an existing endpoint with the same URL instead of duplicating.
  const existing = (await stripe.webhookEndpoints.list({ limit: 100 })).data.find(
    (e) => e.url === endpointUrl
  );

  if (existing) {
    await stripe.webhookEndpoints.update(existing.id, {
      enabled_events: EVENTS,
      disabled: false,
    });
    console.log(`   ✓ Endpoint already exists: ${existing.id}`);
    console.log(
      `   ⚠ Stripe only reveals the signing secret at creation. If you don't\n` +
        `     have it, click "Roll secret" on this endpoint in the dashboard\n` +
        `     and paste the new whsec_… into Vercel.`
    );
    return;
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: endpointUrl,
    enabled_events: EVENTS,
    description: "Bounce FX — booking confirmation",
  });

  console.log(`   ✓ Created ${endpoint.id}`);
  console.log(`\n   STRIPE_WEBHOOK_SECRET=${endpoint.secret}\n`);
  console.log("   → Paste that into Vercel → Project → Settings → Environment");
  console.log("     Variables, then redeploy.");
}

main().catch((err) => {
  console.error("\n✗ Failed:", err?.message ?? err);
  process.exit(1);
});
