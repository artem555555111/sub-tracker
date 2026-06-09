"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SparklesIcon } from "@/components/icons";
import { runAuditAction } from "@/lib/actions/audit";
import type { AuditResult } from "@/lib/audit";
import { cancelUrlFor } from "@/lib/cancel-guides";
import { formatMoney, formatMoneyRounded } from "@/lib/money";
import { btnPrimary } from "@/lib/ui";

type Initial = { result: AuditResult; source: string; createdAt: string } | null;

export function AuditView({
  plan,
  locale,
  currency,
  initial,
}: {
  plan: string;
  locale: string;
  currency: string;
  initial: Initial;
}) {
  const t = useTranslations("audit");
  const td = useTranslations("detail");
  const [result, setResult] = useState<AuditResult | null>(initial?.result ?? null);
  const [source, setSource] = useState<string | null>(initial?.source ?? null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    const res = await runAuditAction();
    setRunning(false);
    if (res.error) {
      setError(res.error === "premium" ? t("premiumDesc") : t("error"));
      return;
    }
    if (res.result) {
      setResult(res.result);
      setSource(res.source ?? null);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </header>

      {plan !== "premium" ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <SparklesIcon className="size-7" />
          </div>
          <h2 className="mt-3 text-lg font-bold">{t("premiumTitle")}</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{t("premiumDesc")}</p>
          <Link href="/upgrade" className={`${btnPrimary} mt-4`}>
            {t("premiumCta")}
          </Link>
        </div>
      ) : (
        <>
          <button type="button" onClick={run} disabled={running} className={btnPrimary}>
            {running ? t("running") : result ? t("rerun") : t("run")}
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}

          {result && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-primary/30 bg-accent/40 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {t("potentialTitle")}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {formatMoneyRounded(result.estimated_yearly_savings, result.currency, locale)}
                </p>
                <p className="text-xs text-muted">{t("perYear")}</p>
              </div>

              <section>
                <h2 className="mb-2 px-1 text-sm font-semibold">{t("cancelTitle")}</h2>
                {result.cancel_candidates.length === 0 ? (
                  <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
                    {t("cancelEmpty")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.cancel_candidates.map((c, i) => {
                      const cancelUrl = cancelUrlFor(c.name);
                      return (
                        <div key={i} className="rounded-2xl border border-border bg-card p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{c.name}</span>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">
                              {formatMoney(c.monthly_amount, result.currency, locale)}
                              <span className="text-xs text-muted">{t("perMonthShort")}</span>
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted">{c.reason}</p>
                          {cancelUrl && (
                            <a
                              href={cancelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-block text-xs font-semibold text-primary"
                            >
                              {td("cancelHelpOpen")} →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-2 px-1 text-sm font-semibold">{t("savingsTitle")}</h2>
                {result.savings_opportunities.length === 0 ? (
                  <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted">
                    {t("savingsEmpty")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.savings_opportunities.map((o, i) => (
                      <div key={i} className="rounded-2xl border border-border bg-card p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{o.name}</span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            −{formatMoney(o.yearly_saving, result.currency, locale)}
                            <span className="text-xs">{t("perYearShort")}</span>
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted">{o.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <p className="text-center text-xs text-muted">
                {t("disclaimer")}
                {source === "heuristic" ? ` · ${t("mockNote")}` : ""}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
