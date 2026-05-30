import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

function isNoSuchCustomerError(error: unknown) {
  const stripeErr = error as { message?: string; code?: string; param?: string };
  const message = (stripeErr.message ?? "").toLowerCase();
  return message.includes("no such customer") || (stripeErr.code === "resource_missing" && stripeErr.param === "customer");
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? request.headers.get("origin") ?? "http://localhost:3000";

    let portal;
    try {
      portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/dashboard/settings`,
      });
    } catch (error: unknown) {
      if (customerId && isNoSuchCustomerError(error)) {
        console.warn("[portal] Stored customer does not exist in current Stripe mode. Clearing customer and redirecting to pricing.", {
          userId: user.id,
          oldCustomerId: customerId,
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: null },
        });

        return NextResponse.json({ url: `${baseUrl}/pricing` });
      }

      throw error;
    }

    return NextResponse.json({ url: portal.url });
  } catch (error: unknown) {
    const stripeErr = error as { message?: string; type?: string; code?: string; param?: string };
    console.error("[portal] Stripe error details:", {
      message: stripeErr.message,
      type: stripeErr.type,
      code: stripeErr.code,
      param: stripeErr.param,
    });
    return NextResponse.json({ error: stripeErr.message ?? "Unable to open billing portal." }, { status: 500 });
  }
}
