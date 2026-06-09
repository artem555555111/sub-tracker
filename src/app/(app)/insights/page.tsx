import { getLocale, getTranslations } from "next-intl/server";
import { PremiumGate } from "@/components/premium-gate";
import { categoryColor } from "@/lib/categories";
import { convert } from "@/lib/fx";
import {
  type BillingCycle,
  formatMoney,
  formatMoneyRounded,
  monthlyAmount,
  yearlyAmount,
} from "@/lib/money";
import { requireUser } from "@/lib/session";
import { getActiveSubscriptions } from "@/lib/subscriptions";

// Premium "Insights" — a deeper, annualized view computed from current
// subscriptions (no history needed). Real month-over-month trends are a later
// add (they require capturing monthly snapshots over time).
export default async function InsightsPage() {
  const user = await requireUser();
  const t = await getTranslations("insights");

  if (user.plan !== "premium") {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </header>
        <PremiumGate />
      </div>
    );
  }

  const subs = await getActiveSubscriptions(user.id);
  const locale = await getLocale();
  const tc = await getTranslations("categories");
  const tcy = await getTranslations("cycles");
  const ta = await getTranslations("audit");
  const cur = user.currency;

  let annual = 0;
  let mixed = false;
  const catMap = new Map<string, number>();
  const cycMap = new Map<string, number>();
  const rows: { name: string; yearly: number }[] = [];

  for (const s of subs) {
    if (s.currency !== cur) mixed = true;
    const y = yearlyAmount(
      convert(s.amount, s.currency, cur),
      s.billingCycle as BillingCycle,
      s.customCycleDays,
    );
    annual += y;
    catMap.set(s.category, (catMap.get(s.category) ?? 0) + y);
    cycMap.set(s.billingCycle, (cycMap.get(s.billingCycle) ?? 0) + y);
    rows.push({ name: s.serviceName, yearly: y });
  }

  const approx = mixed ? "≈ " : "";
  const topSubs = [...rows].sort((a, b) => b.yearly - a.yearly).slice(0, 5);
  const byCategory = [...catMap.entries()]
    .map(([key, yearly]) => ({ key, yearly }))
    .sort((a, b) => b.yearly - a.yearly);
  const byCycle = [...cycMap.entries()]
    .map(([key, yearly]) => ({ key, yearly }))
    .sort((a, b) => b.yearly - a.yearly);

  // Reconstructed monthly-spend history from when each subscription was added
  // (uses current amounts; reflects only still-active subs). Exact month-over-
  // month capture would need stored snapshots — a later add.
  const now = new Date();
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" });
  const trend = Array.from({ length: 6 }, (_, idx) => {
    const back = 5 - idx;
    const monthStart = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() - back + 1, 1);
    let total = 0;
    for (const s of subs) {
      if (s.createdAt < nextStart) {
        total += monthlyAmount(
          convert(s.amount, s.currency, cur),
          s.billingCycle as BillingCycle,
          s.customCycleDays,
        );
      }
    }
    return {
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      label: monthFmt.format(monthStart),
      total,
    };
  });
  const trendMax = Math.max(...trend.map((m) => m.total), 0);

  if (subs.length === 0) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </header>
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          {t("empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </header>

      <div className="rounded-2xl border border-primary/30 bg-accent/40 p-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t("forecastTitle")}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
          {approx}
          {formatMoneyRounded(annual, cur, locale)}
        </p>
        <p className="text-xs text-muted">{ta("perYear")}</p>
      </div>

      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold">{t("trendTitle")}</h2>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex h-28 items-end justify-between gap-2">
            {trend.map((m) => {
              const h = trendMax > 0 ? Math.round((m.total / trendMax) * 100) : 0;
              return (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-primary/80"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] capitalize text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold">{t("topTitle")}</h2>
        <div className="space-y-2.5 rounded-2xl border border-border bg-card p-4">
          {topSubs.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate font-medium">{s.name}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {approx}
                {formatMoney(s.yearly, cur, locale)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold">{t("categoryTitle")}</h2>
        <div className="space-y-3.5 rounded-2xl border border-border bg-card p-4">
          {byCategory.map((it) => {
            const pct = annual > 0 ? Math.round((it.yearly / annual) * 100) : 0;
            const color = categoryColor(it.key);
            return (
              <div key={it.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {tc(it.key)}
                  </span>
                  <span className="tabular-nums text-muted">
                    {approx}
                    {formatMoney(it.yearly, cur, locale)}
                    <span className="ml-1.5 text-xs">{pct}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold">{t("cycleTitle")}</h2>
        <div className="space-y-3.5 rounded-2xl border border-border bg-card p-4">
          {byCycle.map((it) => {
            const pct = annual > 0 ? Math.round((it.yearly / annual) * 100) : 0;
            return (
              <div key={it.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{tcy(it.key as BillingCycle)}</span>
                  <span className="tabular-nums text-muted">
                    {approx}
                    {formatMoney(it.yearly, cur, locale)}
                    <span className="ml-1.5 text-xs">{pct}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
