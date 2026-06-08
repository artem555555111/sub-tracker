import { getLocale, getTranslations } from "next-intl/server";
import { AddFab } from "@/components/add-fab";
import { InstallPrompt } from "@/components/install-prompt";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { requireUser } from "@/lib/session";
import { computeTotals, getActiveSubscriptions } from "@/lib/subscriptions";

export default async function DashboardPage() {
  const user = await requireUser();
  const subs = await getActiveSubscriptions(user.id);
  const locale = await getLocale();
  const t = await getTranslations("dashboard");

  if (subs.length === 0) {
    return (
      <>
        <EmptyState />
        <AddFab label={t("add")} />
      </>
    );
  }

  const totals = computeTotals(subs, user.currency);

  return (
    <div className="space-y-6">
      <InstallPrompt />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">
          {t("activeCount", { count: subs.length })}
        </p>
      </header>

      <SummaryCards
        monthly={totals.monthly}
        yearly={totals.yearly}
        currency={user.currency}
        locale={locale}
        approx={totals.mixed}
      />
      <UpcomingList subs={subs} locale={locale} />
      <CategoryBreakdown
        items={totals.byCategory}
        total={totals.monthly}
        currency={user.currency}
        locale={locale}
      />

      <AddFab label={t("add")} />
    </div>
  );
}
