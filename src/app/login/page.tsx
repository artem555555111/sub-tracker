import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const t = await getTranslations("auth");

  return (
    <AuthShell>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">{t("loginTitle")}</h1>
      <LoginForm />
    </AuthShell>
  );
}
