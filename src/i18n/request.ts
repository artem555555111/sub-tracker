import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, LOCALE_COOKIE, locales } from "./config";

// Resolve the active locale without URL prefixes: a saved cookie wins (set on
// login / in settings), otherwise we negotiate from the browser's
// Accept-Language header on first visit, then fall back to English.
async function resolveLocale(): Promise<string> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale && hasLocale(locales, cookieLocale)) return cookieLocale;

  const accept = (await headers()).get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.split(";")[0]?.trim().split("-")[0]?.toLowerCase();
    if (code && hasLocale(locales, code)) return code;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return { locale, messages };
});
