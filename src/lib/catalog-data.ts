import type { CategoryKey } from "./categories";
import type { BillingCycle } from "./money";

// Seed data for the shared European service library (spec block 6).
// country = null  -> pan-European service
// country = "PL"  -> local service (highlighted for users in that country)
// Typical prices are editable suggestions, in EUR unless noted.

export type CatalogSeed = {
  name: string;
  category: CategoryKey;
  country: string | null;
  defaultCycle?: BillingCycle;
  typicalPrice?: number;
  typicalCurrency?: string;
};

const EU = (
  name: string,
  category: CategoryKey,
  typicalPrice: number,
  defaultCycle: BillingCycle = "monthly",
): CatalogSeed => ({
  name,
  category,
  country: null,
  defaultCycle,
  typicalPrice,
  typicalCurrency: "EUR",
});

const LOCAL = (
  name: string,
  category: CategoryKey,
  country: string,
  typicalCurrency: string,
  defaultCycle: BillingCycle = "monthly",
): CatalogSeed => ({ name, category, country, defaultCycle, typicalCurrency });

export const CATALOG: CatalogSeed[] = [
  // --- Pan-European: Video ---
  EU("Netflix", "video", 13.99),
  EU("Disney+", "video", 8.99),
  EU("Max", "video", 9.99),
  EU("Amazon Prime Video", "video", 8.99),
  EU("Apple TV+", "video", 9.99),
  EU("Paramount+", "video", 7.99),
  EU("SkyShowtime", "video", 6.99),
  EU("YouTube Premium", "video", 12.99),
  EU("Viaplay", "video", 11.99),
  EU("DAZN", "video", 24.99),

  // --- Pan-European: Music / audio ---
  EU("Spotify", "music", 10.99),
  EU("Apple Music", "music", 10.99),
  EU("YouTube Music", "music", 10.99),
  EU("Tidal", "music", 10.99),
  EU("Deezer", "music", 11.99),
  EU("Amazon Music", "music", 10.99),
  EU("Audible", "music", 9.99),

  // --- Pan-European: Software / cloud ---
  EU("Microsoft 365", "software", 7.0),
  EU("Google One", "software", 1.99),
  EU("iCloud+", "software", 0.99),
  EU("Adobe Creative Cloud", "software", 59.99),
  EU("ChatGPT Plus", "software", 22.0),
  EU("Canva", "software", 11.99),
  EU("Dropbox", "software", 11.99),
  EU("Notion", "software", 9.99),
  EU("LinkedIn Premium", "software", 29.99),

  // --- Pan-European: Games ---
  EU("Xbox Game Pass", "gaming", 12.99),
  EU("PlayStation Plus", "gaming", 8.99),
  EU("Nintendo Switch Online", "gaming", 19.99, "yearly"),

  // --- Poland ---
  LOCAL("Play", "mobile", "PL", "PLN"),
  LOCAL("Orange", "mobile", "PL", "PLN"),
  LOCAL("Plus", "mobile", "PL", "PLN"),
  LOCAL("T-Mobile", "mobile", "PL", "PLN"),
  LOCAL("Netia", "internet", "PL", "PLN"),
  LOCAL("Player", "video", "PL", "PLN"),
  LOCAL("TVP VOD", "video", "PL", "PLN"),
  LOCAL("Canal+ online", "video", "PL", "PLN"),
  LOCAL("PZU", "insurance", "PL", "PLN"),
  LOCAL("Warta", "insurance", "PL", "PLN"),
  LOCAL("MultiSport", "fitness", "PL", "PLN"),
  LOCAL("Medicover", "insurance", "PL", "PLN"),

  // --- Germany ---
  LOCAL("Telekom (MagentaTV)", "video", "DE", "EUR"),
  LOCAL("Vodafone", "mobile", "DE", "EUR"),
  LOCAL("O2", "mobile", "DE", "EUR"),
  LOCAL("1&1", "internet", "DE", "EUR"),
  LOCAL("RTL+", "video", "DE", "EUR"),
  LOCAL("WOW", "video", "DE", "EUR"),
  LOCAL("Sky", "video", "DE", "EUR"),
  LOCAL("Allianz", "insurance", "DE", "EUR"),
  LOCAL("HUK-Coburg", "insurance", "DE", "EUR"),
  LOCAL("McFit", "fitness", "DE", "EUR"),
  LOCAL("FitX", "fitness", "DE", "EUR"),

  // --- France ---
  LOCAL("Orange", "mobile", "FR", "EUR"),
  LOCAL("SFR", "mobile", "FR", "EUR"),
  LOCAL("Bouygues", "mobile", "FR", "EUR"),
  LOCAL("Free", "mobile", "FR", "EUR"),
  LOCAL("Canal+ (myCanal)", "video", "FR", "EUR"),
  LOCAL("Molotov", "video", "FR", "EUR"),
  LOCAL("OCS", "video", "FR", "EUR"),
  LOCAL("Basic-Fit", "fitness", "FR", "EUR"),

  // --- Spain ---
  LOCAL("Movistar", "mobile", "ES", "EUR"),
  LOCAL("Vodafone", "mobile", "ES", "EUR"),
  LOCAL("Orange", "mobile", "ES", "EUR"),
  LOCAL("Yoigo", "mobile", "ES", "EUR"),
  LOCAL("Movistar Plus+", "video", "ES", "EUR"),
  LOCAL("Filmin", "video", "ES", "EUR"),
  LOCAL("Mapfre", "insurance", "ES", "EUR"),
  LOCAL("Basic-Fit", "fitness", "ES", "EUR"),

  // --- Italy ---
  LOCAL("TIM", "mobile", "IT", "EUR"),
  LOCAL("Vodafone", "mobile", "IT", "EUR"),
  LOCAL("WindTre", "mobile", "IT", "EUR"),
  LOCAL("Iliad", "mobile", "IT", "EUR"),
  LOCAL("Sky Italia", "video", "IT", "EUR"),
  LOCAL("NOW", "video", "IT", "EUR"),
  LOCAL("Mediaset Infinity", "video", "IT", "EUR"),
  LOCAL("Generali", "insurance", "IT", "EUR"),

  // --- United Kingdom ---
  LOCAL("BT", "internet", "GB", "GBP"),
  LOCAL("EE", "mobile", "GB", "GBP"),
  LOCAL("Vodafone", "mobile", "GB", "GBP"),
  LOCAL("O2", "mobile", "GB", "GBP"),
  LOCAL("Three", "mobile", "GB", "GBP"),
  LOCAL("Sky", "video", "GB", "GBP"),
  LOCAL("NOW", "video", "GB", "GBP"),
  LOCAL("BritBox", "video", "GB", "GBP"),
  LOCAL("Bupa", "insurance", "GB", "GBP"),
  LOCAL("PureGym", "fitness", "GB", "GBP"),
];

// Generic recurring bills the user fills in themselves (spec block 6).
// These are quick-start presets in the add flow, not catalog rows.
export type GenericBill = { key: string; category: CategoryKey; defaultCycle: BillingCycle };

export const GENERIC_BILLS: GenericBill[] = [
  { key: "electricity", category: "utilities", defaultCycle: "monthly" },
  { key: "gas", category: "utilities", defaultCycle: "monthly" },
  { key: "water", category: "utilities", defaultCycle: "monthly" },
  { key: "heating", category: "utilities", defaultCycle: "monthly" },
  { key: "home_internet", category: "internet", defaultCycle: "monthly" },
  { key: "mobile_phone", category: "mobile", defaultCycle: "monthly" },
  { key: "health_insurance", category: "insurance", defaultCycle: "monthly" },
  { key: "car_insurance", category: "insurance", defaultCycle: "yearly" },
  { key: "home_insurance", category: "insurance", defaultCycle: "yearly" },
  { key: "gym", category: "fitness", defaultCycle: "monthly" },
  { key: "news", category: "news", defaultCycle: "monthly" },
  { key: "food_box", category: "food", defaultCycle: "monthly" },
  { key: "loan", category: "finance", defaultCycle: "monthly" },
  { key: "other", category: "other", defaultCycle: "monthly" },
];
