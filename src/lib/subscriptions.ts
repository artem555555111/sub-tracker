import type { Subscription } from "@/generated/prisma/client";
import { prisma } from "./db";
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
};

// Totals are computed in the user's currency. For the MVP we assume amounts are
// in that currency (the add form defaults to it); FX conversion is a later add.
export function computeTotals(subs: Subscription[]): Totals {
  let monthly = 0;
  let yearly = 0;
  const byCat = new Map<string, number>();

  for (const s of subs) {
    const cycle = s.billingCycle as BillingCycle;
    const m = monthlyAmount(s.amount, cycle, s.customCycleDays);
    monthly += m;
    yearly += yearlyAmount(s.amount, cycle, s.customCycleDays);
    byCat.set(s.category, (byCat.get(s.category) ?? 0) + m);
  }

  const byCategory = [...byCat.entries()]
    .map(([category, m]) => ({ category, monthly: m }))
    .sort((a, b) => b.monthly - a.monthly);

  return { monthly, yearly, byCategory };
}
