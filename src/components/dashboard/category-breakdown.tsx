import { getTranslations } from "next-intl/server";
import { categoryColor } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import type { CategoryTotal } from "@/lib/subscriptions";

export async function CategoryBreakdown({
  items,
  total,
  currency,
  locale,
}: {
  items: CategoryTotal[];
  total: number;
  currency: string;
  locale: string;
}) {
  if (items.length === 0) return null;
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("categories");

  return (
    <section>
      <h2 className="mb-3 px-1 text-sm font-semibold">{t("breakdown")}</h2>
      <div className="space-y-3.5 rounded-2xl border border-border bg-card p-4">
        {items.map((it) => {
          const pct = total > 0 ? Math.round((it.monthly / total) * 100) : 0;
          const color = categoryColor(it.category);
          return (
            <div key={it.category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {tc(it.category)}
                </span>
                <span className="tabular-nums text-muted">
                  {formatMoney(it.monthly, currency, locale)}
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
  );
}
