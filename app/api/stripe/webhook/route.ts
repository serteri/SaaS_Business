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

async function handleSubscriptionCreatedOrUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = mapPriceToPlan(priceId);

  console.log("[stripe-webhook] subscription created/updated received", {
    customerId,
    priceId,
    mappedPlan: plan,
    stripeStatus: subscription.status,
  });

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true },
  });

  if (!user) {
    console.warn("[stripe-webhook] no user found for stripeCustomerId", { customerId });
    return;
  }

  console.log("[stripe-webhook] user found for update", {
    userId: user.id,
    email: user.email,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    },
  });

  console.log("[stripe-webhook] user plan/status updated", {
    userId: user.id,
    plan,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const mappedStatus = mapStripeStatus(subscription.status);

  console.log("[stripe-webhook] subscription deleted received", {
    customerId,
    stripeStatus: subscription.status,
    mappedStatus,
  });

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true },
  });

  if (!user) {
    console.warn("[stripe-webhook] no user found for stripeCustomerId on delete", { customerId });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: mappedStatus,
    },
  });

  console.log("[stripe-webhook] user subscription status updated", {
    userId: user.id,
    subscriptionStatus: mappedStatus,
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[stripe-webhook] checkout.session.completed received", {
    customer: session.customer,
    metadataPlan: session.metadata?.plan,
  });

  if (!session.customer || typeof session.customer !== "string") {
    console.warn("[stripe-webhook] checkout session has no string customer id");
    return;
  }

  const plan = mapMetadataPlan(session.metadata?.plan);

  const updated = await prisma.user.updateMany({
    where: { stripeCustomerId: session.customer },
    data: {
      plan,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    },
  });

  console.log("[stripe-webhook] checkout completion update result", {
    customerId: session.customer,
    updatedCount: updated.count,
    plan,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
  });
}

function summarizeRawBody(payload: string) {
  const normalized = payload.replace(/\s+/g, " ");
  return normalized.length > 400 ? `${normalized.slice(0, 400)}...` : normalized;
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
    console.log("[stripe-webhook] raw body:", summarizeRawBody(payload));
    console.log("[stripe-webhook] signature header:", signature);

    console.log("Webhook received:", "pending_verification");
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error("[stripe-webhook] signature verification failed", error);
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    console.log("Webhook received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await handleSubscriptionCreatedOrUpdated(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        console.log("[stripe-webhook] unhandled event type", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] handler failed", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
