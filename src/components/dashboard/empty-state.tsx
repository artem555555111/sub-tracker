import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PlusIcon } from "@/components/icons";
import { btnPrimary } from "@/lib/ui";

export async function EmptyState() {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
        <PlusIcon className="size-7" />
      </div>
      <div>
        <h2 className="text-lg font-bold">{t("emptyTitle")}</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          {t("emptyDesc")}
        </p>
      </div>
      <Link href="/subscriptions/new" className={`${btnPrimary} max-w-xs`}>
        {t("emptyCta")}
      </Link>
    </div>
  );
}
