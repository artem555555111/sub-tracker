import type { Subscription } from "@/generated/prisma/client";
import { prisma } from "./db";
import { convert } from "./fx";
import { type BillingCycle, monthlyAmount, yearlyAmount } from "./money";

export function getAllSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { nextPaymentDate: "asc" }],
  });
}

export function getActiveSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId, status: "active" },
    orderBy: { nextPaymentDate: "asc" },
  });
}

export function countActiveSubscriptions(userId: string) {
  return prisma.subscription.count({ where: { userId, status: "active" } });
}

export type CategoryTotal = { category: string; monthly: number };
export type Totals = {
  monthly: number;
  yearly: number;
  byCategory: CategoryTotal[];
  mixed: boolean; // true if any sub is in a currency other than the target → totals are FX-approximated
};

// Totals in `targetCurrency` (the user's display currency). Each subscription's
// amount is converted from its own currency before summing — see lib/fx.ts.
export function computeTotals(subs: Subscription[], targetCurrency: string): Totals {
  let monthly = 0;
  let yearly = 0;
  let mixed = false;
  const byCat = new Map<string, number>();

  for (const s of subs) {
    if (s.currency !== targetCurrency) mixed = true;
    const cycle = s.billingCycle as BillingCycle;
    const amount = convert(s.amount, s.currency, targetCurrency);
    const m = monthlyAmount(amount, cycle, s.customCycleDays);
    monthly += m;
    yearly += yearlyAmount(amount, cycle, s.customCycleDays);
    byCat.set(s.category, (byCat.get(s.category) ?? 0) + m);
  }

  const byCategory = [...byCat.entries()]
    .map(([category, m]) => ({ category, monthly: m }))
    .sort((a, b) => b.monthly - a.monthly);

  return { monthly, yearly, byCategory, mixed };
}
