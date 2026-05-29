import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageForUser } from "@/lib/usage";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const effectivePlan = user.subscriptionStatus === "ACTIVE" ? user.plan : Plan.FREE;
    const usage = await getUsageForUser(session.user.id, effectivePlan);

    return NextResponse.json({
      plan: effectivePlan,
      status: user.subscriptionStatus,
      used: usage.used,
      limit: usage.limit,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load usage." }, { status: 500 });
  }
}
