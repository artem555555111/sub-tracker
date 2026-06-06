"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GDPR account deletion (spec block 13). Removes the user and — via
// onDelete: Cascade — all their subscriptions, sessions, push subscriptions,
// notification logs and audit. Then signs out and returns to the landing page.
export async function deleteAccountAction(): Promise<void> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return;

  await prisma.user.delete({ where: { id } });
  await signOut({ redirectTo: "/" });
}
