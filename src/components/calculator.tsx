"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { PlusIcon, SearchIcon, XIcon } from "@/components/icons";
import { ServiceLogo } from "@/components/service-logo";
import { categoryColor } from "@/lib/categories";
import {
  type BillingCycle,
  CURRENCIES,
  formatMoneyRounded,
  monthlyAmount,
  yearlyAmount,
} from "@/lib/money";
import { btnPrimary, inputClass, selectClass } from "@/lib/ui";

export type CalcPick = {
  name: string;
  category: string;
  typicalPrice: number;
  defaultCycle: string;
};

type Item = {
  id: number;
  name: string;
  category: string;
  amount: string;
  cycle: string;
};

const CYCLES = ["monthly", "yearly", "quarterly", "weekly"] as const;
const num = (s: string) => Number.parseFloat(s.replace(",", ".")) || 0;

export function Calculator({ catalog }: { catalog: CalcPick[] }) {
  const t = useTranslations("calculator");
  const ta = useTranslations("add");
  const tcy = useTranslations("cycles");
  const tdash = useTranslations("dashboard");
  const tcommon = useTranslations("common");
  const idRef = useRef(1);

  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [currency, setCurrency] = useState("EUR");

  const used = useMemo(() => new Set(items.map((i) => i.name)), [items]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((c) => !used.has(c.name) && (!q || c.name.toLowerCase().includes(q)))
      .slice(0, q ? 30 : 18);
  }, [catalog, query, used]);

  function add(p: CalcPick) {
    setItems((prev) => [
      ...prev,
      {
        id: idRef.current++,
        name: p.name,
        category: p.category,
        amount: p.typicalPrice ? String(p.typicalPrice) : "",
        cycle: p.defaultCycle || "monthly",
      },
    ]);
  }
  function addCustom() {
    const name = query.trim();
    if (!name) return;
    setItems((prev) => [
      ...prev,
      { id: idRef.current++, name, category: "other", amount: "", cycle: "monthly" },
    ]);
    setQuery("");
  }
  function patch(id: number, p: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));
  }
  function remove(id: number) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const monthly = items.reduce(
    (s, it) => s + monthlyAmount(num(it.amount), it.cycle as BillingCycle, null),
    0,
  );
  const yearly = items.reduce(
    (s, it) => s + yearlyAmount(num(it.amount), it.cycle as BillingCycle, null),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {tdash("monthly")}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {formatMoneyRounded(monthly, currency, "en")}
          </p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-accent/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {tdash("yearly")}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {formatMoneyRounded(yearly, currency, "en")}
          </p>
        </div>
      </div>

      {/* Added items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3"
            >
              <ServiceLogo name={it.name} color={categoryColor(it.category)} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{it.name}</span>
              <input
                inputMode="decimal"
                value={it.amount}
                onChange={(e) => patch(it.id, { amount: e.target.value })}
                placeholder="0"
                className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-right text-sm tabular-nums"
              />
              <select
                value={it.cycle}
                onChange={(e) => patch(it.id, { cycle: e.target.value })}
                className="rounded-lg border border-border bg-surface px-1.5 py-1.5 text-xs"
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {tcy(c)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(it.id)}
                aria-label={tcommon("delete")}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-end gap-2 px-1 pt-1">
            <span className="text-xs text-muted">{ta("currency")}</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Picker */}
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ta("searchPlaceholder")}
            className={`${inputClass} pl-10`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {results.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => add(p)}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition hover:border-primary/40"
            >
              <ServiceLogo
                name={p.name}
                color={categoryColor(p.category)}
                className="size-5 rounded-full text-[10px]"
              />
              {p.name}
            </button>
          ))}
          {query.trim() && (
            <button
              type="button"
              onClick={addCustom}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-primary"
            >
              <PlusIcon className="size-4" />
              {ta("addCustom", { name: query.trim() })}
            </button>
          )}
        </div>
        {items.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted">
            {t("empty")}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-primary/30 bg-accent/40 p-4 text-center">
        <p className="text-sm font-medium">{t("ctaTitle")}</p>
        <Link href="/signup" className={`${btnPrimary} mt-3`}>
          {t("cta")}
        </Link>
        <p className="mt-2 text-xs text-muted">{t("ctaNote")}</p>
      </div>
    </div>
  );
}
