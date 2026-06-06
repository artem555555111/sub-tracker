import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

async function setPlanByCustomer(customerId: string, plan: "free" | "premium") {
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan },
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, sig, secret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId ?? s.client_reference_id ?? undefined;
      const customerId =
        typeof s.customer === "string" ? s.customer : s.customer?.id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "premium", ...(customerId ? { stripeCustomerId: customerId } : {}) },
        });
      } else if (customerId) {
        await setPlanByCustomer(customerId, "premium");
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const active = sub.status === "active" || sub.status === "trialing";
      await setPlanByCustomer(customerId, active ? "premium" : "free");
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await setPlanByCustomer(customerId, "free");
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
