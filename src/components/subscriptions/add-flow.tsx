"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ChevronLeftIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { ServiceLogo } from "@/components/service-logo";
import { createSubscription } from "@/lib/actions/subscriptions";
import { categoryColor } from "@/lib/categories";
import { btnPrimary, btnSecondary, inputClass, labelClass, selectClass } from "@/lib/ui";

type CatalogItem = {
  id: string;
  name: string;
  category: string;
  country: string | null;
  typicalPrice: number | null;
  typicalCurrency: string | null;
  defaultCycle: string | null;
};

type GenericBill = { key: string; category: string; defaultCycle: string };

type Props = {
  catalog: CatalogItem[];
  genericBills: GenericBill[];
  userCurrency: string;
  userCountry: string | null;
  defaultReminder: number;
  categories: string[];
  currencies: string[];
};

const CYCLES = ["monthly", "yearly", "quarterly", "weekly", "custom"] as const;
const REMINDER_OPTIONS = [1, 2, 3, 5, 7];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AddFlow({
  catalog,
  genericBills,
  userCurrency,
  userCountry,
  defaultReminder,
  categories,
  currencies,
}: Props) {
  const t = useTranslations("add");
  const tc = useTranslations("categories");
  const tcy = useTranslations("cycles");
  const tg = useTranslations("genericBills");
  const tcommon = useTranslations("common");
  const tplan = useTranslations("plan");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);

  const [form, setForm] = useState({
    serviceName: "",
    serviceId: null as string | null,
    category: "other",
    amount: "",
    currency: userCurrency,
    billingCycle: "monthly",
    customCycleDays: "30",
    nextPaymentDate: todayISO(),
    paymentMethodLabel: "",
    isTrial: false,
    trialEndDate: "",
    reminderDaysBefore: String(defaultReminder),
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const localItems = useMemo(
    () => (userCountry ? catalog.filter((c) => c.country === userCountry) : []),
    [catalog, userCountry],
  );
  const popularItems = useMemo(
    () => catalog.filter((c) => c.country === null),
    [catalog],
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30);
  }, [catalog, query]);

  function pickCatalog(item: CatalogItem) {
    setForm((f) => ({
      ...f,
      serviceName: item.name,
      serviceId: item.id,
      category: item.category,
      currency: item.typicalCurrency ?? userCurrency,
      amount: item.typicalPrice != null ? String(item.typicalPrice) : "",
      billingCycle: item.defaultCycle ?? "monthly",
    }));
    setStep(2);
  }

  function pickGeneric(bill: GenericBill) {
    setForm((f) => ({
      ...f,
      serviceName: tg(bill.key),
      serviceId: null,
      category: bill.category,
      currency: userCurrency,
      amount: "",
      billingCycle: bill.defaultCycle,
    }));
    setStep(2);
  }

  function pickCustom() {
    setForm((f) => ({
      ...f,
      serviceName: query.trim(),
      serviceId: null,
      category: "other",
      currency: userCurrency,
      amount: "",
    }));
    setStep(2);
  }

  async function handleSave() {
    setError(null);
    const amount = Number.parseFloat(form.amount.replace(",", "."));
    if (!form.serviceName.trim()) {
      setError(t("nameRequired"));
      setStep(2);
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("priceRequired"));
      setStep(2);
      return;
    }

    setSaving(true);
    const res = await createSubscription({
      serviceName: form.serviceName.trim(),
      serviceId: form.serviceId,
      category: form.category,
      amount,
      currency: form.currency,
      billingCycle: form.billingCycle as (typeof CYCLES)[number],
      customCycleDays:
        form.billingCycle === "custom"
          ? Number.parseInt(form.customCycleDays, 10)
          : null,
      nextPaymentDate: form.nextPaymentDate,
      paymentMethodLabel: form.paymentMethodLabel || null,
      isTrial: form.isTrial,
      trialEndDate: form.isTrial ? form.trialEndDate || null : null,
      reminderDaysBefore: Number.parseInt(form.reminderDaysBefore, 10),
      notes: null,
    });
    setSaving(false);

    if (res?.error === "limit") setPaywall(true);
    else if (res?.error) setError(t("priceRequired"));
    // success path performs a server-side redirect to /dashboard
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
    else router.push("/dashboard");
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={tcommon("back")}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <div>
          <p className="text-xs font-medium text-muted">
            {t("step", { current: step, total: 3 })}
          </p>
          <h1 className="text-lg font-bold leading-tight">
            {step === 1
              ? t("step1Title")
              : step === 2
                ? t("step2Title")
                : t("step3Title")}
          </h1>
        </div>
      </header>

      {step === 1 && (
        <Step1
          query={query}
          setQuery={setQuery}
          results={results}
          localItems={localItems}
          popularItems={popularItems}
          genericBills={genericBills}
          onPickCatalog={pickCatalog}
          onPickGeneric={pickGeneric}
          onPickCustom={pickCustom}
          t={t}
          tc={tc}
          tg={tg}
        />
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="amount">
                {t("price")}
              </label>
              <input
                id="amount"
                inputMode="decimal"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="currency">
                {t("currency")}
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
              {t("billingCycle")}
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
                {t("customCycleDays")}
              </label>
              <input
                id="customDays"
                type="number"
                min="1"
                value={form.customCycleDays}
                onChange={(e) => set("customCycleDays", e.target.value)}
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
              {t("category")}
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
              type="text"
              value={form.paymentMethodLabel}
              onChange={(e) => set("paymentMethodLabel", e.target.value)}
              className={inputClass}
              placeholder={t("paymentMethodPlaceholder")}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={() => setStep(3)}
            className={btnPrimary}
          >
            {tcommon("continue")}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="font-medium">{t("isTrial")}</span>
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
                  {t("trialEnd")}
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
              {t("reminder")}
            </label>
            <select
              id="reminder"
              value={form.reminderDaysBefore}
              onChange={(e) => set("reminderDaysBefore", e.target.value)}
              className={selectClass}
            >
              {REMINDER_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {t("reminderDays", { days: d })}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={btnPrimary}
          >
            {saving ? tcommon("saving") : t("save")}
          </button>
        </div>
      )}

      {paywall && (
        <Paywall
          title={tplan("limitTitle")}
          desc={tplan("limitDesc", { limit: 5 })}
          upgrade={tplan("upgrade")}
          later={tplan("maybeLater")}
          onClose={() => setPaywall(false)}
        />
      )}
    </div>
  );
}

function Step1({
  query,
  setQuery,
  results,
  localItems,
  popularItems,
  genericBills,
  onPickCatalog,
  onPickGeneric,
  onPickCustom,
  t,
  tc,
  tg,
}: {
  query: string;
  setQuery: (v: string) => void;
  results: CatalogItem[];
  localItems: CatalogItem[];
  popularItems: CatalogItem[];
  genericBills: GenericBill[];
  onPickCatalog: (i: CatalogItem) => void;
  onPickGeneric: (b: GenericBill) => void;
  onPickCustom: () => void;
  t: (k: string, v?: Record<string, string | number>) => string;
  tc: (k: string) => string;
  tg: (k: string) => string;
}) {
  const showSearch = query.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`${inputClass} pl-10`}
          autoFocus
        />
      </div>

      {showSearch ? (
        <div className="space-y-2">
          {results.map((item) => (
            <ServiceRow key={item.id} item={item} label={tc(item.category)} onClick={() => onPickCatalog(item)} />
          ))}
          <button
            type="button"
            onClick={onPickCustom}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <PlusIcon className="size-5" />
            </span>
            <span className="font-medium">{t("addCustom", { name: query.trim() })}</span>
          </button>
        </div>
      ) : (
        <>
          {localItems.length > 0 && (
            <Section title={t("localServices")}>
              {localItems.map((item) => (
                <ServiceChip key={item.id} item={item} onClick={() => onPickCatalog(item)} />
              ))}
            </Section>
          )}

          <Section title={t("popular")}>
            {popularItems.map((item) => (
              <ServiceChip key={item.id} item={item} onClick={() => onPickCatalog(item)} />
            ))}
          </Section>

          <Section title={t("bills")}>
            {genericBills.map((bill) => (
              <button
                key={bill.key}
                type="button"
                onClick={() => onPickGeneric(bill)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: categoryColor(bill.category) }}
                />
                {tg(bill.key)}
              </button>
            ))}
          </Section>

          <button
            type="button"
            onClick={onPickCustom}
            className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 text-left"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <PlusIcon className="size-5" />
            </span>
            <span className="font-medium">{t("addCustomGeneric")}</span>
          </button>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function ServiceChip({ item, onClick }: { item: CatalogItem; onClick: () => void }) {
  const color = categoryColor(item.category);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition hover:border-primary/40"
    >
      <ServiceLogo name={item.name} color={color} className="size-5 rounded-full text-[10px]" />
      {item.name}
    </button>
  );
}

function ServiceRow({
  item,
  label,
  onClick,
}: {
  item: CatalogItem;
  label: string;
  onClick: () => void;
}) {
  const color = categoryColor(item.category);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition hover:border-primary/40"
    >
      <ServiceLogo name={item.name} color={color} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
      {item.country && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
          {item.country}
        </span>
      )}
    </button>
  );
}

function Paywall({
  title,
  desc,
  upgrade,
  later,
  onClose,
}: {
  title: string;
  desc: string;
  upgrade: string;
  later: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{desc}</p>
        <div className="mt-5 space-y-2">
          <a href="/upgrade" className={btnPrimary}>
            {upgrade}
          </a>
          <button type="button" onClick={onClose} className={btnSecondary}>
            {later}
          </button>
        </div>
      </div>
    </div>
  );
}
