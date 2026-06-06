"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { type AuthState, loginAction, magicLinkAction } from "@/lib/actions/auth";
import { btnPrimary, btnSecondary, inputClass, labelClass } from "@/lib/ui";

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    {},
  );
  const [magic, magicSubmit, magicPending] = useActionState<AuthState, FormData>(
    magicLinkAction,
    {},
  );

  return (
    <div className="space-y-5">
      <form action={action} className="space-y-3">
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
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        {state.error && <p className="text-sm text-danger">{t(state.error)}</p>}
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "…" : t("login")}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        {t("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={magicSubmit} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="magic-email">
            {t("magicLink")}
          </label>
          <input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>
        {magic.sent ? (
          <p className="rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
            {t("magicLinkSent")} {t("magicLinkDevHint")}
          </p>
        ) : (
          <button type="submit" disabled={magicPending} className={btnSecondary}>
            {magicPending ? "…" : t("sendMagicLink")}
          </button>
        )}
        {magic.error && <p className="text-sm text-danger">{t(magic.error)}</p>}
      </form>

      <p className="text-center text-sm text-muted">
        {t("dontHaveAccount")}{" "}
        <Link href="/signup" className="font-semibold text-primary">
          {t("signup")}
        </Link>
      </p>
    </div>
  );
}
