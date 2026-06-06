"use server";

import { type AuditResult, runAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const DAY_MS = 24 * 60 * 60 * 1000;

export type AuditActionResult = {
  error?: string;
  result?: AuditResult;
  source?: string;
  createdAt?: string;
  cached?: boolean;
};

export async function runAuditAction(): Promise<AuditActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauth" };
  if (user.plan !== "premium") return { error: "premium" };

  // Rate limit / cost control: at most one real run per day (spec block 8).
  const existing = await prisma.aiAudit.findUnique({ where: { userId: user.id } });
  if (existing && Date.now() - existing.createdAt.getTime() < DAY_MS) {
    return {
      result: JSON.parse(existing.result) as AuditResult,
      source: existing.source,
      createdAt: existing.createdAt.toISOString(),
      cached: true,
    };
  }

  const subs = await prisma.subscription.findMany({
    where: { userId: user.id, status: "active" },
  });
  const auditSubs = subs.map((s) => ({
    serviceName: s.serviceName,
    category: s.category,
    amount: s.amount,
    currency: s.currency,
    billingCycle: s.billingCycle,
    customCycleDays: s.customCycleDays,
    isUnused: s.isUnused,
    isTrial: s.isTrial,
  }));

  const { result, source } = await runAudit({
    subs: auditSubs,
    locale: user.locale,
    currency: user.currency,
  });

  const now = new Date();
  await prisma.aiAudit.upsert({
    where: { userId: user.id },
    update: { result: JSON.stringify(result), currency: user.currency, source, createdAt: now },
    create: { userId: user.id, result: JSON.stringify(result), currency: user.currency, source },
  });

  return { result, source, createdAt: now.toISOString(), cached: false };
}
