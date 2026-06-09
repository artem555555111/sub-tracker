import type { MetadataRoute } from "next";

const SITE_URL = "https://sub-tracker-seven.vercel.app";

// Public, crawlable pages. The app itself (dashboard, etc.) is auth-gated and
// excluded via robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/signup", "/login", "/privacy", "/terms"];
  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
