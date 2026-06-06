import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/constants";

// Generates /manifest.webmanifest; Next auto-links it from <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — Subscription tracker`,
    short_name: APP_NAME,
    description:
      "Track your subscriptions and recurring bills across Europe. Private, multilingual, multi-currency.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    lang: "en",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
