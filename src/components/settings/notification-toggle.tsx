"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BellIcon } from "@/components/icons";
import { deletePushSubscription, savePushSubscription } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function NotificationToggle() {
  const t = useTranslations("notifications");
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const ok =
      "serviceWorker" in navigator && "PushManager" in window && !!VAPID_KEY;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  async function enable() {
    setBusy(true);
    setNote(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg?.active) {
        setNote(t("devOnly"));
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setNote(t("denied"));
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY as string) as BufferSource,
      });
      const json = sub.toJSON() as {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      await savePushSubscription({
        endpoint: json.endpoint ?? sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      setSubscribed(true);
    } catch {
      setNote(t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setNote(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg && (await reg.pushManager.getSubscription());
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await deletePushSubscription(endpoint);
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("section")}
      </h2>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
            <BellIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("enableTitle")}</p>
            <p className="mt-0.5 text-sm text-muted">{t("enableDesc")}</p>
          </div>
        </div>

        {!supported ? (
          <p className="mt-3 text-sm text-muted">{t("unsupported")}</p>
        ) : subscribed ? (
          <>
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold disabled:opacity-60"
            >
              {t("disable")}
            </button>
            <p className="mt-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t("enabled")}
            </p>
          </>
        ) : (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "…" : t("enable")}
          </button>
        )}

        {note && <p className="mt-2 text-sm text-muted">{note}</p>}
      </div>
    </section>
  );
}
