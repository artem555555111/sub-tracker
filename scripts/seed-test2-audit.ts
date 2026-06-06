import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// Give the premium test2 account a realistic mix so the audit has signal:
// two video services (duplicate), an unused one, all monthly (yearly savings).
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

function day(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "test2@subtrack.dev" } });
  if (!user) throw new Error("test2 not found");

  await prisma.aiAudit.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  const cur = user.currency;
  const mk = (serviceName: string, category: string, amount: number, isUnused = false) =>
    prisma.subscription.create({
      data: {
        userId: user.id, serviceName, category, amount, currency: cur,
        billingCycle: "monthly", nextPaymentDate: day(6), reminderDaysBefore: 2,
        status: "active", isUnused,
      },
    });

  await mk("Netflix", "video", 13.99);
  await mk("Disney+", "video", 8.99); // duplicate video category
  await mk("Spotify", "music", 10.99);
  await mk("Notion", "software", 9.99, true); // flagged not used

  console.log("Seeded 4 subs for test2 (plan:", user.plan, ", currency:", cur, ")");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
