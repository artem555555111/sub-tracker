import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/session";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const t = await getTranslations("auth");

  return (
    <AuthShell>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {t("signupTitle")}
      </h1>
      <SignupForm />
    </AuthShell>
  );
}
