import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: null },
    });

    return NextResponse.json({
      success: true,
      message: "Stripe customer ID reset. A new customer will be created on next checkout.",
    });
  } catch {
    return NextResponse.json({ error: "Unable to reset Stripe customer." }, { status: 500 });
  }
}
