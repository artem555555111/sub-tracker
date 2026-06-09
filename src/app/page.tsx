import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  BellIcon,
  GlobeIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/icons";
import { InstallPrompt } from "@/components/install-prompt";
import { LandingPricing } from "@/components/landing-pricing";
import { APP_NAME } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { btnPrimary } from "@/lib/ui";

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");
  const t = await getTranslations("landing");
  const tcalc = await getTranslations("calculator");

  const features = [
    { Icon: ShieldIcon, title: t("privacyTitle"), desc: t("privacyDesc") },
    { Icon: GlobeIcon, title: t("langTitle"), desc: t("langDesc") },
    { Icon: BellIcon, title: t("remindersTitle"), desc: t("remindersDesc") },
    { Icon: SparklesIcon, title: t("aiTitle"), desc: t("aiDesc") },
  ];

  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <header className="mb-12 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
        <Link href="/login" className="text-sm font-semibold text-primary">
          {t("ctaLogin")}
        </Link>
      </header>

      <section className="mb-12">
        <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-balance text-muted">{t("subtitle")}</p>
        <Link href="/signup" className={`${btnPrimary} mt-7`}>
          {t("ctaStart")}
        </Link>
        <Link
          href="/calculator"
          className="mt-3 block text-center text-sm font-semibold text-primary"
        >
          {tcalc("title")} →
        </Link>
      </section>

      <InstallPrompt className="mb-12" />

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("featuresTitle")}
        </h2>
        {features.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <f.Icon className="size-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-0.5 text-sm text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <LandingPricing />
    </div>
  );
}
