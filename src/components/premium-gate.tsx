import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SparklesIcon } from "@/components/icons";
import { btnPrimary } from "@/lib/ui";

// Shown in place of a Premium-only feature for free users — a small upsell card.
// Reuses the generic pricing copy so no per-feature strings are needed.
export async function PremiumGate() {
  const t = await getTranslations("pricing");
  const tp = await getTranslations("plan");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <SparklesIcon className="size-7" />
      </div>
      <h2 className="mt-3 text-lg font-bold">{t("title")}</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{t("subtitle")}</p>
      <Link href="/upgrade" className={`${btnPrimary} mt-4`}>
        {tp("upgrade")}
      </Link>
    </div>
  );
}
