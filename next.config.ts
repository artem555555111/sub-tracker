import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Native modules must not be bundled for the server — keep them external.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
