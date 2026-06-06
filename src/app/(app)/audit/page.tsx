import { getLocale } from "next-intl/server";
import { AuditView } from "@/components/audit/audit-view";
import type { AuditResult } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function AuditPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const cached = await prisma.aiAudit.findUnique({ where: { userId: user.id } });

  return (
    <AuditView
      plan={user.plan}
      locale={locale}
      currency={user.currency}
      initial={
        cached
          ? {
              result: JSON.parse(cached.result) as AuditResult,
              source: cached.source,
              createdAt: cached.createdAt.toISOString(),
            }
          : null
      }
    />
  );
}
