"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type SubInput = { endpoint: string; p256dh: string; auth: string };

export async function savePushSubscription(
  sub: SubInput,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauth" };
  if (!sub.endpoint || !sub.p256dh || !sub.auth) return { error: "invalid" };

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { userId: user.id, p256dh: sub.p256dh, auth: sub.auth },
    create: {
      userId: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  });
  return { ok: true };
}

export async function deletePushSubscription(
  endpoint: string,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauth" };
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: user.id },
  });
  return { ok: true };
}
