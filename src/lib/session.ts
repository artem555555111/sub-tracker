import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./db";
import type { User } from "@/generated/prisma/client";

// Current user row (fresh from DB so plan/locale/currency changes apply
// immediately, rather than reading stale values from the JWT).
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

// Use in protected pages/layouts: redirects to /login when signed out.
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
