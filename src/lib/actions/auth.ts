"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LOCALE_COOKIE } from "@/i18n/config";

export type AuthState = { error?: string; sent?: boolean };

const YEAR = 60 * 60 * 24 * 365;

async function setLocaleCookie(locale: string) {
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR });
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const agreed = formData.get("agree") != null;

  if (!agreed) return { error: "mustAgree" };
  if (!email.includes("@")) return { error: "genericError" };
  if (password.length < 8) return { error: "weakPassword" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailInUse" };

  const locale = await getLocale();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash, locale } });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return { error: "invalidCredentials" };
    throw e;
  }

  await setLocaleCookie(locale);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "invalidCredentials" };

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return { error: "invalidCredentials" };
    throw e;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) await setLocaleCookie(user.locale);
  redirect("/dashboard");
}

export async function magicLinkAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email.includes("@")) return { error: "genericError" };

  try {
    await signIn("email", { email, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return { error: "genericError" };
    throw e;
  }
  return { sent: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

// Persist a language change for the signed-in user and update the cookie.
export async function setLocaleAction(locale: string) {
  await setLocaleCookie(locale);
  const session = await auth();
  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale },
    });
  }
}
