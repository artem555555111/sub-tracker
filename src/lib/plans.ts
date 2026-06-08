// Premium pricing (spec block 11). Display amounts are in EUR; the real
// Stripe Price IDs come from env so they can differ per environment.
export type PlanId = "monthly" | "yearly" | "lifetime";

export type PlanDef = {
  id: PlanId;
  mode: "subscription" | "payment";
  amount: number; // display price in EUR
  interval?: "month" | "year";
  priceEnv: string; // env var holding the Stripe Price ID
  recommended?: boolean;
};

export const PLAN_CURRENCY = "EUR";

export const PLANS: PlanDef[] = [
  { id: "monthly", mode: "subscription", amount: 2.99, interval: "month", priceEnv: "STRIPE_PRICE_MONTHLY" },
  {
    id: "yearly",
    mode: "subscription",
    amount: 19.99,
    interval: "year",
    priceEnv: "STRIPE_PRICE_YEARLY",
  },
  {
    id: "lifetime",
    mode: "payment",
    amount: 39.99,
    priceEnv: "STRIPE_PRICE_LIFETIME",
    recommended: true,
  },
];

export function getPlan(id: string): PlanDef | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceIdFor(plan: PlanDef): string | undefined {
  return process.env[plan.priceEnv];
}
