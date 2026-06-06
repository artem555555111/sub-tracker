"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LOCALE_LABELS } from "@/i18n/config";
import Link from "next/link";
import { logoutAction, setLocaleAction } from "@/lib/actions/auth";
import { deleteAccountAction } from "@/lib/actions/account";
import { billingPortalAction, devTogglePlan } from "@/lib/actions/billing";
import { updateSettingsAction } from "@/lib/actions/settings";
import { cn } from "@/lib/cn";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  cardClass,
  labelClass,
  selectClass,
} from "@/lib/ui";

const REMINDER_OPTIONS = [1, 2, 3, 5, 7];

export function SettingsForm({
  email,
  plan,
  currentLocale,
  currency,
  country,
  reminderDaysBefore,
  locales,
  currencies,
  countries,
  stripeReady,
  devMode,
}: {
  email: string;
  plan: string;
  currentLocale: string;
  currency: string;
  country: string | null;
  reminderDaysBefore: number;
  locales: string[];
  currencies: string[];
  countries: string[];
  stripeReady: boolean;
  devMode: boolean;
}) {
  const t = useTranslations("settings");
  const ta = useTranslations("add");
  const tplan = useTranslations("plan");
  const tcommon = useTranslations("common");
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [cur, setCur] = useState(currency);
  const [ctry, setCtry] = useState(country ?? "");
  const [rem, setRem] = useState(String(reminderDaysBefore));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingLocale, startLocale] = useTransition();

  const regionNames =
    mounted && typeof Intl?.DisplayNames === "function"
      ? new Intl.DisplayNames([currentLocale], { type: "region" })
      : null;

  function changeLocale(next: string) {
    startLocale(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  async function save() {
    setSaving(true);
    await updateSettingsAction({
      currency: cur,
      country: ctry || null,
      reminderDaysBefore: Number(rem),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 1500);
  }

  function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    setDeleting(true);
    void deleteAccountAction();
  }

  const themeOptions: Array<[string, string]> = [
    ["light", t("themeLight")],
    ["dark", t("themeDark")],
    ["system", t("themeSystem")],
  ];

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preferences")}
        </h2>

        <div>
          <label className={labelClass} htmlFor="language">
            {t("language")}
          </label>
          <select
            id="language"
            className={selectClass}
            value={currentLocale}
            onChange={(e) => changeLocale(e.target.value)}
            disabled={pendingLocale}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_LABELS[l] ?? l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>{t("theme")}</span>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTheme(val)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  mounted && theme === val
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-surface",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="currency">
            {t("currency")}
          </label>
          <select
            id="currency"
            className={selectClass}
            value={cur}
            onChange={(e) => setCur(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="country">
            {t("country")}
          </label>
          <select
            id="country"
            className={selectClass}
            value={ctry}
            onChange={(e) => setCtry(e.target.value)}
          >
            <option value="">{t("countryNone")}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {regionNames?.of(c) ?? c}
              </option>
            ))}
          </select>
          <p className="mt-1 px-1 text-xs text-muted">{t("countryHint")}</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="reminder">
            {t("defaultReminder")}
          </label>
          <select
            id="reminder"
            className={selectClass}
            value={rem}
            onChange={(e) => setRem(e.target.value)}
          >
            {REMINDER_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {ta("reminderDays", { days: d })}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={btnPrimary}
        >
          {saving ? tcommon("saving") : saved ? `✓ ${tcommon("save")}` : tcommon("save")}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("account")}
        </h2>
        <div className={cardClass}>
          <Row label={t("email")} value={email} />
          <div className="my-2 h-px bg-border" />
          <Row
            label={t("plan")}
            value={plan === "premium" ? tplan("premium") : tplan("free")}
          />
        </div>
        {plan === "premium" ? (
          stripeReady ? (
            <form action={billingPortalAction}>
              <button type="submit" className={btnSecondary}>
                {t("manageSubscription")}
              </button>
            </form>
          ) : (
            <p className="px-1 text-sm text-muted">{t("premiumActive")}</p>
          )
        ) : (
          <Link href="/upgrade" className={btnPrimary}>
            {tplan("upgrade")}
          </Link>
        )}
        {devMode && (
          <form action={devTogglePlan}>
            <button
              type="submit"
              className="w-full rounded-xl border border-dashed border-border py-2 text-xs text-muted"
            >
              {t("devToggle")}
            </button>
          </form>
        )}
        <form action={logoutAction}>
          <button type="submit" className={btnSecondary}>
            {t("logout")}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("dataTitle")}
        </h2>
        <div className={`${cardClass} space-y-2`}>
          <a href="/api/export?format=json" download className={btnSecondary}>
            {t("exportJson")}
          </a>
          <a href="/api/export?format=csv" download className={btnSecondary}>
            {t("exportCsv")}
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={btnDanger}
          >
            {deleting ? tcommon("saving") : t("deleteAccount")}
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}
