import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronRightIcon } from "@/components/icons";
import { ServiceLogo } from "@/components/service-logo";
import type { Subscription } from "@/generated/prisma/client";
import { categoryColor } from "@/lib/categories";
import { type BillingCycle, daysUntil, formatMoney } from "@/lib/money";

export async function SubscriptionCard({
  sub,
  locale,
}: {
  sub: Subscription;
  locale: string;
}) {
  const tc = await getTranslations("categories");
  const tcy = await getTranslations("cycles");
  const td = await getTranslations("dashboard");

  const cycle =
    sub.billingCycle === "custom" && sub.customCycleDays
      ? tcy("customDays", { days: sub.customCycleDays })
      : tcy(sub.billingCycle as BillingCycle);

  const days = daysUntil(sub.nextPaymentDate);
  const due =
    days < 0
      ? td("overdue")
      : days === 0
        ? td("dueToday")
        : days === 1
          ? td("dueTomorrow")
          : td("dueInDays", { days });

  const color = categoryColor(sub.category);

  return (
    <Link
      href={`/subscriptions/${sub.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition hover:border-primary/40"
    >
      <ServiceLogo name={sub.serviceName} color={color} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{sub.serviceName}</p>
          {sub.isTrial && (
            <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
              {td("trialBadge")}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted">
          {tc(sub.category)} · {due}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums">
          {formatMoney(sub.amount, sub.currency, locale)}
        </p>
        <p className="text-xs text-muted">{cycle}</p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted" />
    </Link>
  );
}
