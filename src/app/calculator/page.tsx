import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Calculator, type CalcPick } from "@/components/calculator";
import { CATALOG } from "@/lib/catalog-data";
import { APP_NAME } from "@/lib/constants";

// Public, no-login tool — a top-of-funnel acquisition asset (shareable + SEO).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calculator");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: "/calculator" },
  };
}

const PICKS: CalcPick[] = CATALOG.filter(
  (c) => c.country === null && c.typicalPrice != null,
).map((c) => ({
  name: c.name,
  category: c.category,
  typicalPrice: c.typicalPrice ?? 0,
  defaultCycle: c.defaultCycle ?? "monthly",
}));

export default async function CalculatorPage() {
  const t = await getTranslations("calculator");
  const tl = await getTranslations("landing");

  return (
    <div className="mx-auto w-full max-w-md px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {APP_NAME}
        </Link>
        <Link href="/login" className="text-sm font-semibold text-primary">
          {tl("ctaLogin")}
        </Link>
      </header>

      <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
        {t("title")}
      </h1>
      <p className="mb-6 mt-2 text-balance text-sm text-muted">{t("subtitle")}</p>

      <Calculator catalog={PICKS} />
    </div>
  );
}
