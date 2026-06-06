import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SubscriptionDetail } from "@/components/subscriptions/subscription-detail";
import { CATEGORIES } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { CURRENCIES } from "@/lib/money";
import { requireUser } from "@/lib/session";

function isoDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub || sub.userId !== user.id) notFound();

  const locale = await getLocale();

  return (
    <SubscriptionDetail
      sub={{
        id: sub.id,
        serviceName: sub.serviceName,
        category: sub.category,
        amount: sub.amount,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        customCycleDays: sub.customCycleDays,
        nextPaymentDate: isoDate(sub.nextPaymentDate),
        startDate: isoDate(sub.startDate),
        paymentMethodLabel: sub.paymentMethodLabel ?? "",
        status: sub.status as "active" | "paused" | "cancelled",
        isTrial: sub.isTrial,
        trialEndDate: isoDate(sub.trialEndDate),
        isUnused: sub.isUnused,
        reminderDaysBefore: sub.reminderDaysBefore,
        notes: sub.notes ?? "",
      }}
      categories={CATEGORIES}
      currencies={[...CURRENCIES]}
      locale={locale}
    />
  );
}
