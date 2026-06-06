"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { CURRENCIES } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  currency: z.enum(CURRENCIES),
  country: z.string().trim().max(2).nullish(),
  reminderDaysBefore: z.coerce.number().int().min(0).max(60),
});

export type SettingsInput = {
  currency: string;
  country: string | null;
  reminderDaysBefore: number;
};

export async function updateSettingsAction(
  input: SettingsInput,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "unauth" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "invalid" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currency: parsed.data.currency,
      country: parsed.data.country || null,
      reminderDaysBefore: parsed.data.reminderDaysBefore,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
