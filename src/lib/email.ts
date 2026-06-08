// Email sender. Uses Resend when RESEND_API_KEY is set; otherwise logs to the
// server console (same dev approach as the magic-link provider).
type SendArgs = { to: string; subject: string; html: string; text?: string };

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendArgs): Promise<{ ok: boolean; via: "resend" | "console" }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "SubTrack <onboarding@resend.dev>";

  if (key) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(key);
      // Resend does NOT throw on API errors — it returns { data, error }. Must
      // check `error`, otherwise a failed send (unverified domain, bad address,
      // rate limit) would be recorded as success and never retried.
      const { error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text: text ?? stripHtml(html),
      });
      if (error) {
        console.error(`[email] Resend error to ${to}: ${error.name} — ${error.message}`);
        return { ok: false, via: "resend" };
      }
      return { ok: true, via: "resend" };
    } catch (err) {
      console.error(`[email] Resend threw sending to ${to}:`, err);
      return { ok: false, via: "resend" };
    }
  }

  // No API key → dev mode: log to the server console instead of sending.
  console.log(
    `\n📧 [email:dev] to=${to}\n   subject: ${subject}\n   ${text ?? stripHtml(html)}\n`,
  );
  return { ok: true, via: "console" };
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
