// Money, billing-cycle math, and locale-aware formatting.
// SQLite stores amounts as Float; keep rounding at the formatting boundary.

export type BillingCycle = "monthly" | "yearly" | "quarterly" | "weekly" | "custom";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export const BILLING_CYCLES: BillingCycle[] = [
  "monthly",
  "yearly",
  "quarterly",
  "weekly",
  "custom",
];

// Currencies from the spec: EUR default + major European currencies.
export const CURRENCIES = [
  "EUR",
  "PLN",
  "GBP",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "CZK",
  "HUF",
  "RON",
] as const;
export type Currency = (typeof CURRENCIES)[number];

// Yearly equivalent per spec: monthly ×12, yearly ×1, quarterly ×4, weekly ×52.
export function yearlyAmount(
  amount: number,
  cycle: BillingCycle,
  customCycleDays?: number | null,
): number {
  switch (cycle) {
    case "monthly":
      return amount * 12;
    case "yearly":
      return amount;
    case "quarterly":
      return amount * 4;
    case "weekly":
      return amount * 52;
    case "custom": {
      const days = customCycleDays && customCycleDays > 0 ? customCycleDays : 30;
      return amount * (365 / days);
    }
  }
}

export function monthlyAmount(
  amount: number,
  cycle: BillingCycle,
  customCycleDays?: number | null,
): number {
  return yearlyAmount(amount, cycle, customCycleDays) / 12;
}

// --- Dates ---------------------------------------------------------------

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Advance a date by exactly one billing cycle.
export function addCycle(
  date: Date,
  cycle: BillingCycle,
  customCycleDays?: number | null,
): Date {
  const d = new Date(date);
  switch (cycle) {
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "custom":
      d.setDate(d.getDate() + (customCycleDays && customCycleDays > 0 ? customCycleDays : 30));
      break;
  }
  return d;
}

// Roll a due date forward until it is today or later (used by the cron job
// after a payment date passes, and to keep "next payment" sane on display).
export function rollForward(
  next: Date,
  cycle: BillingCycle,
  customCycleDays?: number | null,
  from: Date = new Date(),
): Date {
  let d = new Date(next);
  const floor = startOfDay(from);
  let guard = 0;
  while (d < floor && guard++ < 1000) {
    d = addCycle(d, cycle, customCycleDays);
  }
  return d;
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  const ms = startOfDay(date).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

// --- Formatting ----------------------------------------------------------

export function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

// Whole-currency formatting for big dashboard numbers (no cents).
export function formatMoneyRounded(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function formatDate(
  date: Date,
  locale: string,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat(locale, opts).format(date);
}

// All charge dates for a subscription within [from, to] (expands recurrences),
// used by the calendar. Starts at `start` and steps by the billing cycle.
export function occurrencesBetween(
  start: Date,
  cycle: BillingCycle,
  customCycleDays: number | null | undefined,
  from: Date,
  to: Date,
): Date[] {
  const out: Date[] = [];
  const lo = startOfDay(from);
  const hi = startOfDay(to);
  let d = startOfDay(start);
  let guard = 0;
  while (d < lo && guard++ < 5000) d = addCycle(d, cycle, customCycleDays);
  guard = 0;
  while (d <= hi && guard++ < 5000) {
    out.push(new Date(d));
    d = addCycle(d, cycle, customCycleDays);
  }
  return out;
}
