"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPlan, priceIdFor } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";
import { getStripe, stripeConfigured } from "@/lib/stripe";

const APP_URL = process.env.AUTH_URL ?? "http://localhost:3001";

export type BillingResult = { error?: string };

// Start Stripe Checkout for a plan. Redirects to Stripe on success.
export async function createCheckout(planId: string): Promise<BillingResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = getPlan(planId);
  if (!plan) return { error: "invalid" };
  if (!stripeConfigured()) return { error: "not_configured" };
  const price = priceIdFor(plan);
  if (!price) return { error: "not_configured" };

  const stripe = getStripe();

  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${APP_URL}/upgrade`,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    metadata: { userId: user.id, planId: plan.id },
    ...(plan.mode === "subscription"
      ? { subscription_data: { metadata: { userId: user.id } } }
      : {}),
  });

  if (session.url) redirect(session.url);
  return { error: "failed" };
}

// Open the Stripe Customer Portal (manage/cancel). Redirects on success.
export async function billingPortalAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!stripeConfigured() || !user.stripeCustomerId) return;

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/settings`,
  });
  redirect(portal.url);
}

// DEV ONLY: flip the current user's plan to exercise premium gating locally
// without Stripe. Disabled in production.
export async function devTogglePlan(): Promise<void> {
  if (process.env.NODE_ENV === "production") return;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await prisma.user.update({
    where: { id: user.id },
    data: { plan: user.plan === "premium" ? "free" : "premium" },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
