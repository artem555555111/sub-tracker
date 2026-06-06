"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DownloadIcon, ShareIcon, XIcon } from "@/components/icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Cross-platform install affordance:
// - Android / desktop Chrome: capture `beforeinstallprompt`, offer a button.
// - iOS Safari: no programmatic prompt, so show Add-to-Home-Screen steps.
// Hidden entirely when already installed (standalone) or dismissed.
export function InstallPrompt({ className = "" }: { className?: string }) {
  const t = useTranslations("install");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(true); // assume installed until known (avoids flash)
  const [dismissed, setDismissed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    setStandalone(isStandalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || dismissed) return null;
  // Nothing to offer: not iOS and no captured prompt yet.
  if (!isIOS && !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <DownloadIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("title")}</p>
          <p className="mt-0.5 text-sm text-muted">{t("desc")}</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("dismiss")}
          className="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-accent"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {deferred ? (
        <button
          type="button"
          onClick={install}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <DownloadIcon className="size-4" />
          {t("install")}
        </button>
      ) : isIOS ? (
        <>
          <button
            type="button"
            onClick={() => setShowSteps((s) => !s)}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold"
          >
            {t("iosHow")}
          </button>
          {showSteps && (
            <ol className="mt-3 space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <ShareIcon className="size-4 shrink-0 text-primary" />
                {t("iosStep1")}
              </li>
              <li>{t("iosStep2")}</li>
            </ol>
          )}
        </>
      ) : null}
    </div>
  );
}
