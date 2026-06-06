"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { createCheckout } from "@/lib/actions/billing";
import { formatMoney } from "@/lib/money";
import { PLAN_CURRENCY, PLANS } from "@/lib/plans";

export function PricingPlans({
  locale,
  stripeReady,
}: {
  locale: string;
  stripeReady: boolean;
}) {
  const t = useTranslations("pricing");
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function choose(id: string) {
    setNote(null);
    setBusyId(id);
    startTransition(async () => {
      const res = await createCheckout(id);
      setBusyId(null);
      if (res?.error === "not_configured") setNote(t("notConfigured"));
      else if (res?.error) setNote(t("error"));
      // success → server redirects to Stripe Checkout
    });
  }

  return (
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
            className={`rounded-2xl border p-4 ${p.recommended ? "border-primary bg-accent/40" : "border-border bg-card"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{t(`plan_${p.id}`)}</p>
                <p className="text-sm text-muted">
                  <span className="text-lg font-bold text-foreground">{price}</span>{" "}
                  {period}
                </p>
              </div>
              {p.recommended && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {t("recommended")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => choose(p.id)}
              disabled={pending}
              className={`mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition disabled:opacity-60 ${p.recommended ? "bg-primary text-primary-foreground" : "border border-border bg-surface"}`}
            >
              {busyId === p.id ? "…" : t("choose")}
            </button>
          </div>
        );
      })}
      {!stripeReady && <p className="px-1 text-xs text-muted">{t("testModeHint")}</p>}
      {note && <p className="px-1 text-sm text-danger">{note}</p>}
    </div>
  );
}
