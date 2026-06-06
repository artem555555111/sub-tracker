import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "serviceName",
  "category",
  "amount",
  "currency",
  "billingCycle",
  "customCycleDays",
  "nextPaymentDate",
  "startDate",
  "status",
  "isTrial",
  "trialEndDate",
  "isUnused",
  "reminderDaysBefore",
  "paymentMethodLabel",
  "notes",
  "createdAt",
] as const;

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GDPR data export of the signed-in user's own data (spec block 13).
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const format = new URL(req.url).searchParams.get("format") === "csv" ? "csv" : "json";
  const subs = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const lines = [COLUMNS.join(",")];
    for (const s of subs) {
      lines.push(COLUMNS.map((c) => csvCell((s as Record<string, unknown>)[c])).join(","));
    }
    return new Response(lines.join("\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="subtrack-${stamp}.csv"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      locale: user.locale,
      currency: user.currency,
      country: user.country,
      plan: user.plan,
    },
    subscriptions: subs,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="subtrack-${stamp}.json"`,
    },
  });
}
