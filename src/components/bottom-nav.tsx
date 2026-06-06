"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarIcon,
  HomeIcon,
  SettingsIcon,
  SparklesIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", key: "home", Icon: HomeIcon },
  { href: "/calendar", key: "calendar", Icon: CalendarIcon },
  { href: "/audit", key: "audit", Icon: SparklesIcon },
  { href: "/settings", key: "settings", Icon: SettingsIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, key, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-6" strokeWidth={active ? 2.4 : 2} />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
