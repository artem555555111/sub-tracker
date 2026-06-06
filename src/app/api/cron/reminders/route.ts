import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { addCycle, type BillingCycle, daysUntil, startOfDay } from "@/lib/money";
import {
  buildPaymentNotification,
  buildTrialNotification,
  emailHtml,
  type NotificationContent,
} from "@/lib/notifications";
import { sendPush } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron hits this daily (see vercel.json). Protected by CRON_SECRET,
// which Vercel forwards as `Authorization: Bearer <secret>`.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // unset → allow (local convenience)
  const header = req.headers.get("authorization");
  const qs = new URL(req.url).searchParams.get("secret");
  return header === `Bearer ${secret}` || qs === secret;
}

function loadSubs() {
  return prisma.subscription.findMany({
    where: { status: "active" },
    include: { user: true },
  });
}
type SubWithUser = Awaited<ReturnType<typeof loadSubs>>[number];

// Send push (to all the user's devices) + email once per (subscription, type,
// targetDate). The NotificationLog row makes the daily job idempotent.
async function notifyOnce(
  sub: SubWithUser,
  type: "payment" | "trial",
  targetDate: Date,
  content: NotificationContent,
): Promise<{ push: number; email: number } | null> {
  const day = startOfDay(targetDate);
  const existing = await prisma.notificationLog.findUnique({
    where: {
      subscriptionId_type_targetDate: { subscriptionId: sub.id, type, targetDate: day },
    },
  });
  if (existing) return null;

  const pushSubs = await prisma.pushSubscription.findMany({
    where: { userId: sub.userId },
  });
  let push = 0;
  for (const ps of pushSubs) {
    const r = await sendPush(ps, {
      title: content.title,
      body: content.body,
      url: content.url,
      tag: `${type}-${sub.id}`,
    });
    if (r.ok) push++;
    else if (r.gone)
      await prisma.pushSubscription
        .delete({ where: { endpoint: ps.endpoint } })
        .catch(() => {});
  }

  const mail = await sendEmail({
    to: sub.user.email,
    subject: content.subject,
    html: emailHtml(content),
  });

  await prisma.notificationLog.create({
    data: {
      userId: sub.userId,
      subscriptionId: sub.id,
      type,
      targetDate: day,
      sentPush: push > 0,
      sentEmail: mail.ok,
    },
  });
  return { push, email: mail.ok ? 1 : 0 };
}

async function run() {
  const today = startOfDay(new Date());
  const subs = await loadSubs();
  let paymentReminders = 0;
  let trialReminders = 0;
  let rolled = 0;
  let pushSent = 0;
  let emailSent = 0;

  for (const s of subs) {
    const locale = s.user.locale || "en";

    // Payment reminder — fire within [0, reminderDaysBefore] days of the due date.
    const dPay = daysUntil(s.nextPaymentDate, today);
    if (dPay >= 0 && dPay <= s.reminderDaysBefore) {
      const res = await notifyOnce(
        s,
        "payment",
        s.nextPaymentDate,
        buildPaymentNotification({
          locale,
          serviceName: s.serviceName,
          amount: s.amount,
          currency: s.currency,
          date: s.nextPaymentDate,
        }),
      );
      if (res) {
        paymentReminders++;
        pushSent += res.push;
        emailSent += res.email;
      }
    }

    // Trial-end reminder.
    if (s.isTrial && s.trialEndDate) {
      const dTrial = daysUntil(s.trialEndDate, today);
      if (dTrial >= 0 && dTrial <= s.reminderDaysBefore) {
        const res = await notifyOnce(
          s,
          "trial",
          s.trialEndDate,
          buildTrialNotification({
            locale,
            serviceName: s.serviceName,
            date: s.trialEndDate,
          }),
        );
        if (res) {
          trialReminders++;
          pushSent += res.push;
          emailSent += res.email;
        }
      }
    }

    // Once a due date has passed, roll it forward to the next future period.
    if (startOfDay(s.nextPaymentDate) < today) {
      let next = new Date(s.nextPaymentDate);
      let guard = 0;
      while (startOfDay(next) < today && guard++ < 1000) {
        next = addCycle(next, s.billingCycle as BillingCycle, s.customCycleDays);
      }
      await prisma.subscription.update({
        where: { id: s.id },
        data: { nextPaymentDate: next },
      });
      rolled++;
    }
  }

  return { processed: subs.length, paymentReminders, trialReminders, rolled, pushSent, emailSent };
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = GET;
