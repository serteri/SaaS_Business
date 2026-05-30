import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthKey } from "@/lib/month";

const FREE_EMAIL_LIMIT = 3;
const BASIC_EMAIL_LIMIT = 10;
const FREE_REMINDER_LIMIT = 10;
const BASIC_REMINDER_LIMIT = 50;

async function getMonthlyUsage(userId: string, month: string) {
  return prisma.usageTracking.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  });
}

export async function getUsageForUser(userId: string, plan: Plan) {
  const month = getCurrentMonthKey();
  const usage = await getMonthlyUsage(userId, month);

  const used = usage?.emailCount ?? 0;
  const limit = plan === Plan.PRO ? null : plan === Plan.BASIC ? BASIC_EMAIL_LIMIT : FREE_EMAIL_LIMIT;

  const reminderUsed = usage?.reminderCount ?? 0;
  const reminderLimit = plan === Plan.PRO ? null : plan === Plan.BASIC ? BASIC_REMINDER_LIMIT : FREE_REMINDER_LIMIT;

  return {
    month,
    used,
    limit,
    canGenerate: limit === null || used < limit,
    reminderUsed,
    reminderLimit,
    canSendReminder: reminderLimit === null || reminderUsed < reminderLimit,
  };
}

export async function getReminderUsageForUser(userId: string, plan: Plan) {
  const month = getCurrentMonthKey();
  const usage = await getMonthlyUsage(userId, month);
  const used = usage?.reminderCount ?? 0;
  const limit = plan === Plan.PRO ? null : plan === Plan.BASIC ? BASIC_REMINDER_LIMIT : FREE_REMINDER_LIMIT;

  return {
    month,
    used,
    limit,
    canSend: limit === null || used < limit,
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
      reminderCount: 0,
    },
    update: {
      emailCount: {
        increment: 1,
      },
    },
  });
}

export async function incrementReminderUsage(userId: string, month: string) {
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
      emailCount: 0,
      reminderCount: 1,
    },
    update: {
      reminderCount: {
        increment: 1,
      },
    },
  });
}
