import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PricingPlans } from "@/components/billing/pricing-plans";
import { CheckIcon, ChevronLeftIcon } from "@/components/icons";
import { requireUser } from "@/lib/session";
import { stripeConfigured } from "@/lib/stripe";

const BENEFITS = ["benefit_unlimited", "benefit_ai", "benefit_export", "benefit_calendar"];

export default async function UpgradePage() {
  await requireUser();
  const locale = await getLocale();
  const t = await getTranslations("pricing");

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/settings"
          aria-label="Back"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>
      </header>

      <ul className="space-y-2.5 rounded-2xl border border-border bg-card p-4">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-sm">
            <CheckIcon className="size-4 shrink-0 text-primary" />
            {t(b)}
          </li>
        ))}
      </ul>

      <PricingPlans locale={locale} stripeReady={stripeConfigured()} />

      <p className="text-center text-xs text-muted">{t("cancelAnytime")}</p>
    </div>
  );
}
