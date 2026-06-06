import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATALOG } from "../src/lib/catalog-data";

// Deterministic id from name + country so re-seeding is idempotent
// (avoids duplicates from SQLite's NULL-distinct unique behaviour).
function slug(name: string, country: string | null): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${country ? country.toLowerCase() : "eu"}`;
}

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  let n = 0;
  for (const s of CATALOG) {
    const id = slug(s.name, s.country ?? null);
    const data = {
      name: s.name,
      category: s.category,
      country: s.country ?? null,
      defaultCycle: s.defaultCycle ?? null,
      typicalPrice: s.typicalPrice ?? null,
      typicalCurrency: s.typicalCurrency ?? null,
    };
    await prisma.serviceCatalog.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    n++;
  }

  console.log(`Seeded ${n} catalog entries (${CATALOG.length} total).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
