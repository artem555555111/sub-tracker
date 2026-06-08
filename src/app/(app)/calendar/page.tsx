import { getLocale, getTranslations } from "next-intl/server";
import { PremiumGate } from "@/components/premium-gate";
import { categoryColor } from "@/lib/categories";
import { convert } from "@/lib/fx";
import {
  type BillingCycle,
  daysUntil,
  formatDate,
  formatMoney,
  formatMoneyRounded,
  occurrencesBetween,
  startOfDay,
} from "@/lib/money";
import { requireUser } from "@/lib/session";
import { getActiveSubscriptions } from "@/lib/subscriptions";

const WINDOW_DAYS = 31;

type Occ = { date: Date; name: string; amount: number; currency: string; category: string };

export default async function CalendarPage() {
  const user = await requireUser();
  const t = await getTranslations("calendar");

  // Calendar is a Premium feature — free users see an upsell instead.
  if (user.plan !== "premium") {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle", { days: WINDOW_DAYS })}</p>
        </header>
        <PremiumGate />
      </div>
    );
  }

  const subs = await getActiveSubscriptions(user.id);
  const locale = await getLocale();

  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + WINDOW_DAYS);

  const occ: Occ[] = [];
  for (const s of subs) {
    for (const d of occurrencesBetween(
      s.nextPaymentDate,
      s.billingCycle as BillingCycle,
      s.customCycleDays,
      today,
      end,
    )) {
      occ.push({
        date: d,
        name: s.serviceName,
        amount: s.amount,
        currency: s.currency,
        category: s.category,
      });
    }
  }
  occ.sort((a, b) => a.date.getTime() - b.date.getTime());

  const groups = new Map<string, Occ[]>();
  for (const o of occ) {
    const key = o.date.toISOString().slice(0, 10);
    const arr = groups.get(key);
    if (arr) arr.push(o);
    else groups.set(key, [o]);
  }

  // Totals are shown in the user's currency; each charge is converted from its
  // own currency first (line items below stay in their original currency).
  const periodTotal = occ.reduce((sum, o) => sum + convert(o.amount, o.currency, user.currency), 0);
  const periodApprox = occ.some((o) => o.currency !== user.currency);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle", { days: WINDOW_DAYS })}</p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t("periodTotal", { days: WINDOW_DAYS })}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {periodApprox ? "≈ " : ""}
          {formatMoneyRounded(periodTotal, user.currency, locale)}
        </p>
      </div>

      {occ.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          {t("empty", { days: WINDOW_DAYS })}
        </p>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([key, items]) => {
            const d = items[0].date;
            const du = daysUntil(d, today);
            const label =
              du === 0
                ? t("today")
                : du === 1
                  ? t("tomorrow")
                  : formatDate(d, locale, { weekday: "short", day: "numeric", month: "short" });
            const dayTotal = items.reduce(
              (sum, o) => sum + convert(o.amount, o.currency, user.currency),
              0,
            );
            const dayApprox = items.some((o) => o.currency !== user.currency);
            return (
              <section key={key}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">{label}</h2>
                  <span className="tabular-nums text-xs text-muted">
                    {dayApprox ? "≈ " : ""}
                    {formatMoney(dayTotal, user.currency, locale)}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((o, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: categoryColor(o.category) }}
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{o.name}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatMoney(o.amount, o.currency, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
