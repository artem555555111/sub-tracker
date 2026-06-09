import type { MetadataRoute } from "next";

const SITE_URL = "https://sub-tracker-seven.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated app routes have no crawlable content (they redirect to login).
      disallow: [
        "/dashboard",
        "/calendar",
        "/audit",
        "/insights",
        "/settings",
        "/subscriptions",
        "/upgrade",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
