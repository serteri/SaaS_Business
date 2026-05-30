import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { plan?: Plan };
    const plan = body.plan;
    if (!plan || (plan !== "BASIC" && plan !== "PRO")) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

    console.log("[checkout] STRIPE_SECRET_KEY prefix:", stripeKey ? stripeKey.slice(0, 10) : "MISSING");
    console.log("[checkout] STRIPE_BASIC_PRICE_ID:", basicPriceId ? basicPriceId.slice(0, 10) : "MISSING");
    console.log("[checkout] STRIPE_PRO_PRICE_ID:", proPriceId ? proPriceId.slice(0, 10) : "MISSING");
    console.log("[checkout] selected plan:", plan);

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }

    const priceId = plan === "BASIC" ? basicPriceId : proPriceId;

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price IDs are not configured." }, { status: 500 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/settings?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      metadata: {
        userId: user.id,
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[checkout] Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unable to create Stripe checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
