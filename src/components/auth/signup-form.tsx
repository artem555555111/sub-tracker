"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { type AuthState, signupAction } from "@/lib/actions/auth";
import { btnPrimary, inputClass, labelClass } from "@/lib/ui";

export function SignupForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signupAction,
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className={labelClass} htmlFor="name">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          name="agree"
          type="checkbox"
          className="mt-0.5 size-4 rounded border-border accent-primary"
        />
        <span>
          {t.rich("agree", {
            terms: (c) => (
              <Link href="/terms" className="font-medium text-primary">
                {c}
              </Link>
            ),
            privacy: (c) => (
              <Link href="/privacy" className="font-medium text-primary">
                {c}
              </Link>
            ),
          })}
        </span>
      </label>
      {state.error && <p className="text-sm text-danger">{t(state.error)}</p>}
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "…" : t("signup")}
      </button>
      <p className="text-center text-sm text-muted">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
