import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/money";
import { PLAN_CURRENCY, PLANS } from "@/lib/plans";
import { btnPrimary } from "@/lib/ui";

export async function LandingPricing() {
  const locale = await getLocale();
  const t = await getTranslations("pricing");

  return (
    <section className="mt-12 space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("title")}
      </h2>
      <div className="space-y-3">
        {PLANS.map((p) => {
          const price = formatMoney(p.amount, PLAN_CURRENCY, locale);
          const period =
            p.id === "lifetime"
              ? t("oneTime")
              : p.interval === "year"
                ? t("perYear")
                : t("perMonth");
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-2xl border p-4 ${p.recommended ? "border-primary bg-accent/40" : "border-border bg-card"}`}
            >
              <div>
                <p className="font-semibold">{t(`plan_${p.id}`)}</p>
                <p className="text-sm text-muted">
                  <span className="font-bold text-foreground">{price}</span> {period}
                </p>
              </div>
              {p.recommended && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {t("recommended")}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Link href="/signup" className={`${btnPrimary} mt-1`}>
        {t("getStarted")}
      </Link>
    </section>
  );
}
