// Map well-known service names to domains so we can show their favicon as a
// logo. Unknown / custom / local services fall back to a colored letter.
const DOMAINS: Record<string, string> = {
  // Video
  Netflix: "netflix.com",
  "Disney+": "disneyplus.com",
  Max: "max.com",
  "Amazon Prime Video": "primevideo.com",
  "Apple TV+": "tv.apple.com",
  "Paramount+": "paramountplus.com",
  SkyShowtime: "skyshowtime.com",
  "YouTube Premium": "youtube.com",
  Viaplay: "viaplay.com",
  DAZN: "dazn.com",
  // Music / audio
  Spotify: "spotify.com",
  "Apple Music": "music.apple.com",
  "YouTube Music": "music.youtube.com",
  Tidal: "tidal.com",
  Deezer: "deezer.com",
  "Amazon Music": "music.amazon.com",
  Audible: "audible.com",
  // Software / cloud
  "Microsoft 365": "microsoft.com",
  "Google One": "one.google.com",
  "iCloud+": "icloud.com",
  "Adobe Creative Cloud": "adobe.com",
  "ChatGPT Plus": "openai.com",
  Canva: "canva.com",
  Dropbox: "dropbox.com",
  Notion: "notion.so",
  "LinkedIn Premium": "linkedin.com",
  // Games
  "Xbox Game Pass": "xbox.com",
  "PlayStation Plus": "playstation.com",
  "Nintendo Switch Online": "nintendo.com",
  // A few common local providers
  Vodafone: "vodafone.com",
  Orange: "orange.com",
  Sky: "sky.com",
  "Basic-Fit": "basic-fit.com",
};

export function logoDomain(name: string): string | null {
  return DOMAINS[name.trim()] ?? null;
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
