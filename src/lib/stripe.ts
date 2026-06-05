import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripeConfigured = Boolean(key);

/** Lazily-instantiated server-side Stripe client. */
export function getStripe(): Stripe {
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}
