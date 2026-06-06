import webpush from "web-push";

// Web Push sender. VAPID keys come from env; when absent (e.g. not configured
// yet) sends become no-ops so the cron job still runs.
let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
    pub,
    priv,
  );
  configured = true;
  return true;
}

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export type PushPayload = { title: string; body: string; url?: string; tag?: string };

export async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<{ ok: boolean; gone?: boolean }> {
  if (!ensureConfigured()) return { ok: false };
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (err) {
    const code = (err as { statusCode?: number })?.statusCode;
    // 404/410 → the subscription is dead and should be removed.
    return { ok: false, gone: code === 404 || code === 410 };
  }
}
