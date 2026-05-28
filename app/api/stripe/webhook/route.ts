import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

function mapPriceToPlan(priceId?: string): Plan {
  if (priceId && priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return Plan.PRO;
  }
  return Plan.BASIC;
}

function mapMetadataPlan(value?: string | null): Plan {
  if (value === "PRO") {
    return Plan.PRO;
  }
  return Plan.BASIC;
}

function mapStripeStatus(status: string): SubscriptionStatus {
  if (status === "active" || status === "trialing") {
    return SubscriptionStatus.ACTIVE;
  }
  if (status === "past_due" || status === "unpaid") {
    return SubscriptionStatus.PAST_DUE;
  }
  return SubscriptionStatus.CANCELED;
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const plan = mapPriceToPlan(subscription.items.data[0]?.price?.id);
  const subscriptionStatus = mapStripeStatus(subscription.status);

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan, subscriptionStatus },
  });
}

export async function POST(request: Request) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing webhook signature configuration." }, { status: 400 });
    }

    const payload = await request.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && typeof session.customer === "string") {
          await prisma.user.updateMany({
            where: { stripeCustomerId: session.customer },
            data: {
              plan: mapMetadataPlan(session.metadata?.plan),
              subscriptionStatus: SubscriptionStatus.ACTIVE,
            },
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
