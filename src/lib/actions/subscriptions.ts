"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { FREE_PLAN_LIMIT } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";

const cycleEnum = z.enum(["monthly", "yearly", "quarterly", "weekly", "custom"]);

const subInput = z.object({
  serviceName: z.string().trim().min(1).max(80),
  serviceId: z.string().nullish(),
  category: z.string().min(1).max(40),
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z.string().trim().length(3),
  billingCycle: cycleEnum,
  customCycleDays: z.coerce.number().int().positive().max(3650).nullish(),
  nextPaymentDate: z.string().min(8), // yyyy-mm-dd
  startDate: z.string().nullish(),
  paymentMethodLabel: z.string().trim().max(60).nullish(),
  isTrial: z.boolean().optional(),
  trialEndDate: z.string().nullish(),
  reminderDaysBefore: z.coerce.number().int().min(0).max(60).optional(),
  notes: z.string().trim().max(500).nullish(),
});

export type SubscriptionInput = z.input<typeof subInput>;
export type ActionResult = { error?: string; ok?: boolean };

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createSubscription(
  input: SubscriptionInput,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = subInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" };
  const data = parsed.data;

  // Free plan: cap active subscriptions (spec block 7) — soft paywall.
  if (user.plan === "free") {
    const active = await prisma.subscription.count({
      where: { userId: user.id, status: "active" },
    });
    if (active >= FREE_PLAN_LIMIT) return { error: "limit" };
  }

  await prisma.subscription.create({
    data: {
      userId: user.id,
      serviceName: data.serviceName,
      serviceId: data.serviceId ?? null,
      category: data.category,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      billingCycle: data.billingCycle,
      customCycleDays:
        data.billingCycle === "custom" ? (data.customCycleDays ?? 30) : null,
      nextPaymentDate: toDate(data.nextPaymentDate) ?? new Date(),
      startDate: toDate(data.startDate),
      paymentMethodLabel: data.paymentMethodLabel || null,
      isTrial: data.isTrial ?? false,
      trialEndDate: data.isTrial ? toDate(data.trialEndDate) : null,
      reminderDaysBefore: data.reminderDaysBefore ?? user.reminderDaysBefore,
      notes: data.notes || null,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

async function ownedOrThrow(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub || sub.userId !== user.id) return null;
  return { user, sub };
}

export async function updateSubscription(
  id: string,
  input: SubscriptionInput,
): Promise<ActionResult> {
  const owned = await ownedOrThrow(id);
  if (!owned) return { error: "notFound" };

  const parsed = subInput.safeParse(input);
  if (!parsed.success) return { error: "invalid" };
  const data = parsed.data;

  await prisma.subscription.update({
    where: { id },
    data: {
      serviceName: data.serviceName,
      category: data.category,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      billingCycle: data.billingCycle,
      customCycleDays:
        data.billingCycle === "custom" ? (data.customCycleDays ?? 30) : null,
      nextPaymentDate: toDate(data.nextPaymentDate) ?? undefined,
      startDate: toDate(data.startDate),
      paymentMethodLabel: data.paymentMethodLabel || null,
      isTrial: data.isTrial ?? false,
      trialEndDate: data.isTrial ? toDate(data.trialEndDate) : null,
      reminderDaysBefore: data.reminderDaysBefore,
      notes: data.notes || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/subscriptions/${id}`);
  redirect(`/subscriptions/${id}`);
}

export async function setSubscriptionStatus(
  id: string,
  status: "active" | "paused" | "cancelled",
): Promise<ActionResult> {
  const owned = await ownedOrThrow(id);
  if (!owned) return { error: "notFound" };

  await prisma.subscription.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
  revalidatePath(`/subscriptions/${id}`);
  return { ok: true };
}

export async function setSubscriptionUnused(
  id: string,
  isUnused: boolean,
): Promise<ActionResult> {
  const owned = await ownedOrThrow(id);
  if (!owned) return { error: "notFound" };

  await prisma.subscription.update({ where: { id }, data: { isUnused } });
  revalidatePath(`/subscriptions/${id}`);
  return { ok: true };
}

export async function deleteSubscription(id: string): Promise<ActionResult> {
  const owned = await ownedOrThrow(id);
  if (!owned) return { error: "notFound" };

  await prisma.subscription.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
