// Currency conversion for aggregated totals.
//
// Subscriptions can each be in a different currency (the add form lets you pick
// any of CURRENCIES), but dashboard/calendar/audit need a single number in the
// user's display currency. Adding raw amounts across currencies is wrong
// (10 EUR + 10 PLN ≠ 20 of anything), so every cross-currency sum routes
// through convert() first.
//
// Rates are static, EUR-based (units of currency per 1 EUR), approximate
// mid-market values. That's intentional for an MVP spend tracker: totals are
// "roughly what you spend", not accounting figures. To make them live later,
// replace RATES with a fetched+cached ECB map (e.g. frankfurter.app) — convert()
// and every caller stay the same.

// Units of each currency per 1 EUR. Approximate, early 2026.
export const RATES: Record<string, number> = {
  EUR: 1,
  PLN: 4.3,
  GBP: 0.84,
  CHF: 0.94,
  SEK: 11.3,
  NOK: 11.7,
  DKK: 7.46,
  CZK: 25.0,
  HUF: 395,
  RON: 4.97,
};

export function isSupportedCurrency(code: string): boolean {
  return code in RATES;
}

// Convert `amount` from one currency to another via EUR as the pivot.
// Unknown currencies fall back to a 1:1 rate so a sum is never silently dropped.
export function convert(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rFrom = RATES[from] ?? 1;
  const rTo = RATES[to] ?? 1;
  return (amount / rFrom) * rTo;
}
