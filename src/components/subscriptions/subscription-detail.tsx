"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { ChevronLeftIcon, TrashIcon } from "@/components/icons";
import { ServiceLogo } from "@/components/service-logo";
import {
  deleteSubscription,
  setSubscriptionStatus,
  setSubscriptionUnused,
  updateSubscription,
} from "@/lib/actions/subscriptions";
import { categoryColor } from "@/lib/categories";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
  labelClass,
  selectClass,
} from "@/lib/ui";

type SubData = {
  id: string;
  serviceName: string;
  category: string;
  amount: number;
  currency: string;
  billingCycle: string;
  customCycleDays: number | null;
  nextPaymentDate: string;
  startDate: string;
  paymentMethodLabel: string;
  status: "active" | "paused" | "cancelled";
  isTrial: boolean;
  trialEndDate: string;
  isUnused: boolean;
  reminderDaysBefore: number;
  notes: string;
};

const CYCLES = ["monthly", "yearly", "quarterly", "weekly", "custom"] as const;
const REMINDER_OPTIONS = [1, 2, 3, 5, 7];

const STATUS_STYLES: Record<SubData["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled: "bg-slate-500/15 text-slate-500",
};

export function SubscriptionDetail({
  sub,
  categories,
  currencies,
  plan,
  cancelUrl,
}: {
  sub: SubData;
  categories: string[];
  currencies: string[];
  locale: string;
  plan: string;
  cancelUrl: string | null;
}) {
  const t = useTranslations("detail");
  const ta = useTranslations("add");
  const tc = useTranslations("categories");
  const tcy = useTranslations("cycles");
  const tcommon = useTranslations("common");
  const tplan = useTranslations("plan");
  const router = useRouter();
  const isPremium = plan === "premium";

  const [form, setForm] = useState(sub);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof SubData>(key: K, value: SubData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const statusLabel =
    form.status === "active"
      ? t("statusActive")
      : form.status === "paused"
        ? t("statusPaused")
        : t("statusCancelled");

  async function handleSave() {
    setError(null);
    const amount = Number(form.amount);
    if (!form.serviceName.trim()) return setError(ta("nameRequired"));
    if (!Number.isFinite(amount) || amount <= 0)
      return setError(ta("priceRequired"));

    setSaving(true);
    const res = await updateSubscription(sub.id, {
      serviceName: form.serviceName.trim(),
      serviceId: null,
      category: form.category,
      amount,
      currency: form.currency,
      billingCycle: form.billingCycle as (typeof CYCLES)[number],
      customCycleDays:
        form.billingCycle === "custom" ? Number(form.customCycleDays ?? 30) : null,
      nextPaymentDate: form.nextPaymentDate,
      startDate: form.startDate || null,
      paymentMethodLabel: form.paymentMethodLabel || null,
      isTrial: form.isTrial,
      trialEndDate: form.isTrial ? form.trialEndDate || null : null,
      reminderDaysBefore: form.reminderDaysBefore,
      notes: form.notes || null,
    });
    setSaving(false);
    if (res?.error) setError(ta("priceRequired"));
    // success redirects back to this page (revalidated)
  }

  function changeStatus(status: SubData["status"]) {
    set("status", status);
    startTransition(async () => {
      await setSubscriptionStatus(sub.id, status);
      router.refresh();
    });
  }

  function toggleUnused() {
    const next = !form.isUnused;
    set("isUnused", next);
    startTransition(async () => {
      await setSubscriptionUnused(sub.id, next);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      await deleteSubscription(sub.id);
    });
  }

  const color = categoryColor(form.category);

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          aria-label={tcommon("back")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <ServiceLogo name={form.serviceName} color={color} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight">
            {form.serviceName || t("title")}
          </h1>
          <span
            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[form.status]}`}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">
            {ta("customName")}
          </label>
          <input
            id="name"
            value={form.serviceName}
            onChange={(e) => set("serviceName", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="amount">
              {ta("price")}
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => set("amount", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="currency">
              {ta("currency")}
            </label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={selectClass}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="cycle">
            {ta("billingCycle")}
          </label>
          <select
            id="cycle"
            value={form.billingCycle}
            onChange={(e) => set("billingCycle", e.target.value)}
            className={selectClass}
          >
            {CYCLES.map((c) => (
              <option key={c} value={c}>
                {tcy(c)}
              </option>
            ))}
          </select>
        </div>

        {form.billingCycle === "custom" && (
          <div>
            <label className={labelClass} htmlFor="customDays">
              {ta("customCycleDays")}
            </label>
            <input
              id="customDays"
              type="number"
              min="1"
              value={form.customCycleDays ?? 30}
              onChange={(e) => set("customCycleDays", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="next">
            {t("nextPayment")}
          </label>
          <input
            id="next"
            type="date"
            value={form.nextPaymentDate}
            onChange={(e) => set("nextPaymentDate", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="category">
            {ta("category")}
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={selectClass}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {tc(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="pm">
            {t("paymentMethod")}
          </label>
          <input
            id="pm"
            value={form.paymentMethodLabel}
            onChange={(e) => set("paymentMethodLabel", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center justify-between gap-3">
            <span className="font-medium">{ta("isTrial")}</span>
            <input
              type="checkbox"
              checked={form.isTrial}
              onChange={(e) => set("isTrial", e.target.checked)}
              className="size-5 accent-primary"
            />
          </label>
          {form.isTrial && (
            <div className="mt-3">
              <label className={labelClass} htmlFor="trialEnd">
                {ta("trialEnd")}
              </label>
              <input
                id="trialEnd"
                type="date"
                value={form.trialEndDate}
                onChange={(e) => set("trialEndDate", e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="reminder">
            {ta("reminder")}
          </label>
          <select
            id="reminder"
            value={form.reminderDaysBefore}
            onChange={(e) => set("reminderDaysBefore", Number(e.target.value))}
            className={selectClass}
          >
            {REMINDER_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {ta("reminderDays", { days: d })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="notes">
            {t("notes")}
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder={t("notesPlaceholder")}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={btnPrimary}
        >
          {saving ? tcommon("saving") : tcommon("save")}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleUnused}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left"
      >
        <span>
          <span className="font-medium">{t("notUsed")}</span>
          <span className="mt-0.5 block text-xs text-muted">
            {t("notUsedHint")}
          </span>
        </span>
        <span
          className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${form.isUnused ? "bg-primary" : "bg-border"}`}
        >
          <span
            className={`size-5 rounded-full bg-white transition ${form.isUnused ? "translate-x-5" : ""}`}
          />
        </span>
      </button>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="font-medium">{t("cancelHelpTitle")}</p>
        {isPremium ? (
          <>
            <p className="mt-1 text-sm text-muted">{t("cancelHelpDesc")}</p>
            {cancelUrl && (
              <a
                href={cancelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnSecondary} mt-3`}
              >
                {t("cancelHelpOpen")}
              </a>
            )}
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">{t("cancelHelpLocked")}</p>
            <Link href="/upgrade" className={`${btnPrimary} mt-3`}>
              {tplan("upgrade")}
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {form.status === "paused" ? (
          <button
            type="button"
            onClick={() => changeStatus("active")}
            disabled={pending}
            className={btnSecondary}
          >
            {t("resume")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => changeStatus("paused")}
            disabled={pending || form.status === "cancelled"}
            className={btnSecondary}
          >
            {t("pause")}
          </button>
        )}

        {form.status === "cancelled" ? (
          <button
            type="button"
            onClick={() => changeStatus("active")}
            disabled={pending}
            className={btnSecondary}
          >
            {t("reactivate")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => changeStatus("cancelled")}
            disabled={pending}
            className={btnSecondary}
          >
            {t("markCancelled")}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={btnDanger}
      >
        <TrashIcon className="size-4" />
        {t("delete")}
      </button>
    </div>
  );
}
