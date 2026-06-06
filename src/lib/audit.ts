import Anthropic from "@anthropic-ai/sdk";
import { type BillingCycle, monthlyAmount, yearlyAmount } from "@/lib/money";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

// --- Result schema (spec block 8) -----------------------------------------
export type CancelCandidate = { name: string; reason: string; monthly_amount: number };
export type SavingsOpportunity = { name: string; suggestion: string; yearly_saving: number };
export type AuditResult = {
  cancel_candidates: CancelCandidate[];
  savings_opportunities: SavingsOpportunity[];
  estimated_yearly_savings: number;
  currency: string;
};

export type AuditSub = {
  serviceName: string;
  category: string;
  amount: number;
  currency: string;
  billingCycle: string;
  customCycleDays: number | null;
  isUnused: boolean;
  isTrial: boolean;
};

const CATALOGS: Record<string, Record<string, Record<string, string>>> = {
  en: en as never,
  pl: pl as never,
};
function tr(locale: string, ns: string, key: string, vars: Record<string, string | number> = {}): string {
  const cat = CATALOGS[locale] ?? CATALOGS.en;
  const raw = cat?.[ns]?.[key] ?? CATALOGS.en[ns]?.[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}
const round = (n: number) => Math.round(n * 100) / 100;

// --- Entry point -----------------------------------------------------------
export async function runAudit(opts: {
  subs: AuditSub[];
  locale: string;
  currency: string;
}): Promise<{ result: AuditResult; source: "ai" | "heuristic" }> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return { result: await runWithClaude(opts), source: "ai" };
    } catch (err) {
      console.error("[audit] Claude call failed, falling back to heuristic:", err);
    }
  }
  return { result: heuristicAudit(opts), source: "heuristic" };
}

// --- Claude --------------------------------------------------------------
const SCHEMA =
  '{ "cancel_candidates": [{ "name": string, "reason": string, "monthly_amount": number }], "savings_opportunities": [{ "name": string, "suggestion": string, "yearly_saving": number }], "estimated_yearly_savings": number, "currency": string }';

async function runWithClaude({ subs, locale, currency }: { subs: AuditSub[]; locale: string; currency: string }): Promise<AuditResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";

  const system = [
    "You are a subscription auditor for a private personal-finance app.",
    "Return ONLY a JSON object (no markdown, no commentary) matching exactly this schema:",
    SCHEMA,
    `All "reason" and "suggestion" strings MUST be written in the user's language (BCP-47 locale: ${locale}).`,
    `All amounts are in ${currency}; "monthly_amount" and "yearly_saving" are plain numbers in ${currency}.`,
    "cancel_candidates: services flagged as not used, functional duplicates (e.g. two video streamers), or rarely needed.",
    "savings_opportunities: switching monthly→yearly, or cheaper alternatives/bundles.",
    "Never assert another service's price as fact — phrase alternatives as something to 'consider'.",
    "estimated_yearly_savings: a realistic yearly total. Keep text short and specific.",
  ].join("\n");

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: JSON.stringify({ locale, currency, subscriptions: subs }) }],
  });

  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  return parseAuditJson(text, currency);
}

// Defensive JSON parse — strips code fences, isolates the object, coerces types.
export function parseAuditJson(text: string, currency: string): AuditResult {
  let raw = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);

  const data = JSON.parse(raw) as Record<string, unknown>;
  const cc = Array.isArray(data.cancel_candidates) ? data.cancel_candidates : [];
  const so = Array.isArray(data.savings_opportunities) ? data.savings_opportunities : [];

  const cancel_candidates: CancelCandidate[] = cc.map((x: Record<string, unknown>) => ({
    name: String(x?.name ?? ""),
    reason: String(x?.reason ?? ""),
    monthly_amount: round(Number(x?.monthly_amount) || 0),
  }));
  const savings_opportunities: SavingsOpportunity[] = so.map((x: Record<string, unknown>) => ({
    name: String(x?.name ?? ""),
    suggestion: String(x?.suggestion ?? ""),
    yearly_saving: round(Number(x?.yearly_saving) || 0),
  }));

  const fallbackTotal =
    cancel_candidates.reduce((t, c) => t + c.monthly_amount * 12, 0) +
    savings_opportunities.reduce((t, o) => t + o.yearly_saving, 0);
  const estimated_yearly_savings = round(Number(data.estimated_yearly_savings) || fallbackTotal);

  return {
    cancel_candidates,
    savings_opportunities,
    estimated_yearly_savings,
    currency: typeof data.currency === "string" ? data.currency : currency,
  };
}

// --- Heuristic fallback (dev / no API key) ---------------------------------
function heuristicAudit({ subs, locale, currency }: { subs: AuditSub[]; locale: string; currency: string }): AuditResult {
  const cancel_candidates: CancelCandidate[] = [];
  const savings_opportunities: SavingsOpportunity[] = [];
  const m = (s: AuditSub) => monthlyAmount(s.amount, s.billingCycle as BillingCycle, s.customCycleDays);

  // Not-used flags
  for (const s of subs) {
    if (s.isUnused) {
      cancel_candidates.push({
        name: s.serviceName,
        reason: tr(locale, "audit", "reasonUnused"),
        monthly_amount: round(m(s)),
      });
    }
  }

  // Functional duplicates within entertainment categories
  const byCat: Record<string, AuditSub[]> = {};
  for (const s of subs) (byCat[s.category] ??= []).push(s);
  for (const cat of ["video", "music", "gaming"]) {
    const list = (byCat[cat] ?? []).filter((s) => !s.isUnused);
    if (list.length >= 2) {
      const cheapest = [...list].sort((a, b) => m(a) - m(b))[0];
      if (!cancel_candidates.some((c) => c.name === cheapest.serviceName)) {
        cancel_candidates.push({
          name: cheapest.serviceName,
          reason: tr(locale, "audit", "reasonDuplicate", { category: tr(locale, "categories", cat) }),
          monthly_amount: round(m(cheapest)),
        });
      }
    }
  }

  // Monthly → yearly (assume ~2 months free on annual ≈ 16%)
  for (const s of subs) {
    if (s.billingCycle === "monthly" && !s.isUnused) {
      const saving = round(yearlyAmount(s.amount, "monthly") * 0.16);
      if (saving >= 1) {
        savings_opportunities.push({
          name: s.serviceName,
          suggestion: tr(locale, "audit", "suggestYearly", { name: s.serviceName }),
          yearly_saving: saving,
        });
      }
    }
  }

  const estimated_yearly_savings = round(
    cancel_candidates.reduce((t, c) => t + c.monthly_amount * 12, 0) +
      savings_opportunities.reduce((t, o) => t + o.yearly_saving, 0),
  );

  return { cancel_candidates, savings_opportunities, estimated_yearly_savings, currency };
}
