"use client";

import { useState } from "react";
import { faviconUrl, logoDomain } from "@/lib/logos";

// Renders a service's favicon (for known brands) with a graceful fallback to a
// colored letter tile. `className` controls the box size/shape/text size.
export function ServiceLogo({
  name,
  color,
  className = "size-10 rounded-xl text-sm",
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const domain = logoDomain(name);
  const [failed, setFailed] = useState(false);

  if (domain && !failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-white ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(domain)}
          alt=""
          className="size-3/5 object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold ${className}`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {name.trim().slice(0, 1).toUpperCase() || "?"}
    </span>
  );
}
