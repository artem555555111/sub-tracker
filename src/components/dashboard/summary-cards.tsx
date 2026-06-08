import { getTranslations } from "next-intl/server";
import { formatMoneyRounded } from "@/lib/money";

export async function SummaryCards({
  monthly,
  yearly,
  currency,
  locale,
  approx = false,
}: {
  monthly: number;
  yearly: number;
  currency: string;
  locale: string;
  // When subscriptions span multiple currencies, totals are FX-approximated.
  approx?: boolean;
}) {
  const t = await getTranslations("dashboard");
  const prefix = approx ? "≈ " : "";

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t("monthly")}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {prefix}
          {formatMoneyRounded(monthly, currency, locale)}
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t("yearly")}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {prefix}
          {formatMoneyRounded(yearly, currency, locale)}
        </p>
      </div>
    </div>
  );
}
