import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://sub-tracker-seven.vercel.app";
const SHARE_TITLE = `${APP_NAME} — Take control of your subscriptions`;
const SHARE_DESC =
  "See what you really spend on subscriptions. Reminders before every payment, multi-currency, AI audit — private by design.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — Subscription tracker for Europe`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Track your subscriptions and recurring bills in one place. Find out how much you really spend, get reminders before every payment. Private, multilingual, multi-currency.",
  keywords: [
    "subscription tracker",
    "subscription manager",
    "recurring payments",
    "subscription cost",
    "bill reminders",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    url: SITE_URL,
    title: SHARE_TITLE,
    description: SHARE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESC,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
