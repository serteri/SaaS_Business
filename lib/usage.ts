import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthKey } from "@/lib/month";

const BASIC_LIMIT = 10;

export async function getUsageForUser(userId: string, plan: Plan) {
  const month = getCurrentMonthKey();
  const usage = await prisma.usageTracking.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });

  const used = usage?.emailCount ?? 0;
  return {
    month,
    used,
    limit: plan === Plan.BASIC ? BASIC_LIMIT : null,
    canGenerate: plan === Plan.PRO || used < BASIC_LIMIT,
  };
}

export async function incrementUsage(userId: string, month: string) {
  await prisma.usageTracking.upsert({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
    create: {
      userId,
      month,
      emailCount: 1,
    },
    update: {
      emailCount: {
        increment: 1,
      },
    },
  });
}
