import { formatDate, formatMoney } from "@/lib/money";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

// Standalone localized strings for background sends (cron / email), so we don't
// depend on next-intl's request scope. Falls back to English.
type Catalog = { notifications: Record<string, string> };
const CATALOGS: Record<string, Catalog> = {
  en: en as unknown as Catalog,
  pl: pl as unknown as Catalog,
};

const APP_URL = process.env.AUTH_URL ?? "http://localhost:3001";

function msg(
  locale: string,
  key: string,
  vars: Record<string, string | number> = {},
): string {
  const cat = CATALOGS[locale] ?? CATALOGS.en;
  const raw = cat.notifications?.[key] ?? CATALOGS.en.notifications[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export type NotificationContent = {
  title: string;
  body: string;
  subject: string;
  cta: string;
  url: string;
};

export function buildPaymentNotification(o: {
  locale: string;
  serviceName: string;
  amount: number;
  currency: string;
  date: Date;
}): NotificationContent {
  const amount = formatMoney(o.amount, o.currency, o.locale);
  const date = formatDate(o.date, o.locale);
  return {
    title: msg(o.locale, "paymentTitle", { service: o.serviceName }),
    body: msg(o.locale, "paymentBody", { amount, date }),
    subject: msg(o.locale, "paymentSubject", { service: o.serviceName }),
    cta: msg(o.locale, "open"),
    url: `${APP_URL}/dashboard`,
  };
}

export function buildTrialNotification(o: {
  locale: string;
  serviceName: string;
  date: Date;
}): NotificationContent {
  const date = formatDate(o.date, o.locale);
  return {
    title: msg(o.locale, "trialTitle", { service: o.serviceName }),
    body: msg(o.locale, "trialBody", { date }),
    subject: msg(o.locale, "trialSubject", { service: o.serviceName }),
    cta: msg(o.locale, "open"),
    url: `${APP_URL}/dashboard`,
  };
}

export function emailHtml(c: NotificationContent): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a">${esc(c.title)}</h2>
  <p style="color:#475569;margin:0 0 20px;font-size:14px;line-height:1.5">${esc(c.body)}</p>
  <a href="${c.url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px">${esc(c.cta)}</a>
</div>`;
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}
