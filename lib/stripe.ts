import Stripe from "stripe";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getBaseUrl() {
  return requireEnv("NEXT_PUBLIC_URL").replace(/\/+$/, "");
}

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2025-03-31.basil",
      typescript: true,
    });
  }
  return stripeClient;
}

export function getStripeWebhookSecret() {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}
