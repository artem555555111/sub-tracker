// Direct cancellation / manage-subscription links for popular services.
// The deep link is the bulk of the value; a generic localized instruction
// (detail.cancelHelpDesc) covers everything else, including custom and local
// services. These are starting points — exact cancel flows and regional
// domains can change; when no link is known, only the generic guidance shows.

const CANCEL_URLS: Record<string, string> = {
  Netflix: "https://www.netflix.com/cancelplan",
  Spotify: "https://www.spotify.com/account/subscription/",
  "Disney+": "https://www.disneyplus.com/account/subscription",
  "Amazon Prime Video": "https://www.amazon.com/gp/video/settings",
  "Amazon Music": "https://www.amazon.com/music/settings",
  "YouTube Premium": "https://www.youtube.com/paid_memberships",
  "YouTube Music": "https://www.youtube.com/paid_memberships",
  "Apple Music": "https://apps.apple.com/account/subscriptions",
  "Apple TV+": "https://apps.apple.com/account/subscriptions",
  "iCloud+": "https://apps.apple.com/account/subscriptions",
  "Google One": "https://play.google.com/store/account/subscriptions",
  "Microsoft 365": "https://account.microsoft.com/services",
  "Xbox Game Pass": "https://account.microsoft.com/services",
  "Adobe Creative Cloud": "https://account.adobe.com/plans",
  Dropbox: "https://www.dropbox.com/account/plan",
  "LinkedIn Premium": "https://www.linkedin.com/premium/manage/",
  Audible: "https://www.audible.com/account/membership",
  Canva: "https://www.canva.com/settings/billing-and-plans",
  Deezer: "https://www.deezer.com/account/subscription",
  Tidal: "https://account.tidal.com/",
  "Paramount+": "https://www.paramountplus.com/account/",
  Max: "https://play.max.com/settings/subscription",
  "PlayStation Plus": "https://www.playstation.com/subscriptions/",
  "Nintendo Switch Online": "https://ec.nintendo.com/my/subscriptions",
  DAZN: "https://www.dazn.com/account",
  "ChatGPT Plus": "https://chatgpt.com/#settings/Subscription",
  Notion: "https://www.notion.so/my-account",
};

const BY_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(CANCEL_URLS).map(([k, v]) => [k.trim().toLowerCase(), v]),
);

// Returns the known cancellation link for a service, or null (→ generic guidance).
export function cancelUrlFor(serviceName: string): string | null {
  return BY_NORM[serviceName.trim().toLowerCase()] ?? null;
}
