import { getTranslations } from "next-intl/server";
import { SubscriptionCard } from "@/components/subscription-card";
import type { Subscription } from "@/generated/prisma/client";

export async function UpcomingList({
  subs,
  locale,
}: {
  subs: Subscription[];
  locale: string;
}) {
  const t = await getTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-3 px-1 text-sm font-semibold">{t("upcoming")}</h2>
      {subs.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
          {t("upcomingEmpty")}
        </p>
      ) : (
        <div className="space-y-2">
          {subs.map((s) => (
            <SubscriptionCard key={s.id} sub={s} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
