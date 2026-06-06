import { getLocale, getTranslations } from "next-intl/server";
import { NotificationToggle } from "@/components/settings/notification-toggle";
import { SettingsForm } from "@/components/settings/settings-form";
import { locales } from "@/i18n/config";
import { COUNTRIES } from "@/lib/constants";
import { CURRENCIES } from "@/lib/money";
import { requireUser } from "@/lib/session";
import { stripeConfigured } from "@/lib/stripe";

export default async function SettingsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <SettingsForm
        email={user.email}
        plan={user.plan}
        currentLocale={locale}
        currency={user.currency}
        country={user.country}
        reminderDaysBefore={user.reminderDaysBefore}
        locales={[...locales]}
        currencies={[...CURRENCIES]}
        countries={[...COUNTRIES]}
        stripeReady={stripeConfigured()}
        devMode={process.env.NODE_ENV !== "production"}
      />
      <NotificationToggle />
    </div>
  );
}
