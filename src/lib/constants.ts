export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "SubTrack";

// Free plan: up to 5 active subscriptions (spec block 7).
export const FREE_PLAN_LIMIT = 5;

// Countries offered in settings (used only to highlight local services).
// Names are rendered with Intl.DisplayNames in the user's locale.
export const COUNTRIES = [
  "PL",
  "DE",
  "FR",
  "ES",
  "IT",
  "GB",
  "NL",
  "PT",
  "IE",
  "BE",
  "AT",
  "CH",
  "SE",
  "NO",
  "DK",
  "FI",
  "CZ",
  "SK",
  "HU",
  "RO",
  "GR",
] as const;
