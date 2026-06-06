// Locales that have message files today. Architecture supports adding the
// rest of the spec's languages (de, fr, es, it, nl, pt) by dropping in a
// messages/<locale>.json and extending this list.
export const locales = ["en", "pl", "de", "fr", "es", "it", "nl", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

// Native language names for the language picker. Includes planned locales so
// the labels are ready when their message files land.
export const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pt: "Português",
};
