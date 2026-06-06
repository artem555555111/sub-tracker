// Canonical subscription categories. Labels live in i18n messages under
// `categories.<key>`; colors here drive the dashboard breakdown + card chips.

export type CategoryKey =
  | "video"
  | "music"
  | "software"
  | "gaming"
  | "utilities"
  | "internet"
  | "mobile"
  | "insurance"
  | "fitness"
  | "news"
  | "food"
  | "finance"
  | "other";

export const CATEGORIES: CategoryKey[] = [
  "video",
  "music",
  "software",
  "gaming",
  "utilities",
  "internet",
  "mobile",
  "insurance",
  "fitness",
  "news",
  "food",
  "finance",
  "other",
];

export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  video: "#ef4444",
  music: "#22c55e",
  software: "#3b82f6",
  gaming: "#8b5cf6",
  utilities: "#f59e0b",
  internet: "#06b6d4",
  mobile: "#0ea5e9",
  insurance: "#14b8a6",
  fitness: "#f97316",
  news: "#64748b",
  food: "#84cc16",
  finance: "#d946ef",
  other: "#9ca3af",
};

export function categoryColor(key: string): string {
  return CATEGORY_COLORS[key as CategoryKey] ?? CATEGORY_COLORS.other;
}

export function isCategory(key: string): key is CategoryKey {
  return (CATEGORIES as string[]).includes(key);
}
