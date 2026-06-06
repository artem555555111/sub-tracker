import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// Seeds deterministic subscriptions for the test user to exercise the cron:
// a payment due in 2 days, a trial ending tomorrow, and an overdue one.
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
  const user = await prisma.user.findUnique({ where: { email: "test@subtrack.dev" } });
  if (!user) throw new Error("test user not found — sign up test@subtrack.dev first");

  const names = ["Spotify (reminder test)", "Trial test", "Overdue test"];
  await prisma.notificationLog.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({
    where: { userId: user.id, serviceName: { in: names } },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id, serviceName: names[0], category: "music",
      amount: 10.99, currency: user.currency, billingCycle: "monthly",
      nextPaymentDate: day(2), reminderDaysBefore: 2, status: "active",
    },
  });
  await prisma.subscription.create({
    data: {
      userId: user.id, serviceName: names[1], category: "video",
      amount: 9.99, currency: user.currency, billingCycle: "monthly",
      nextPaymentDate: day(20), isTrial: true, trialEndDate: day(1),
      reminderDaysBefore: 2, status: "active",
    },
  });
  const overdue = await prisma.subscription.create({
    data: {
      userId: user.id, serviceName: names[2], category: "software",
      amount: 5, currency: user.currency, billingCycle: "monthly",
      nextPaymentDate: day(-3), reminderDaysBefore: 2, status: "active",
    },
  });

  console.log("user locale:", user.locale);
  console.log("overdue id:", overdue.id);
  console.log("overdue nextPayment BEFORE:", overdue.nextPaymentDate.toISOString().slice(0, 10));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
