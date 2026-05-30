import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ACTIVE_INVOICE_STATUSES = ["pending", "overdue"] as const;
export const REMINDER_OFFSETS = [-3, 0, 3, 7, 14] as const;

const FREE_LIMIT = 3;
const BASIC_LIMIT = 10;

type ActiveInvoiceStatus = (typeof ACTIVE_INVOICE_STATUSES)[number];

export type ReminderScheduleEntry = {
  daysOffset: number;
  label: string;
  reminderNumber: string;
};

export function getActiveInvoiceLimit(plan: Plan) {
  if (plan === Plan.PRO) {
    return null;
  }

  return plan === Plan.BASIC ? BASIC_LIMIT : FREE_LIMIT;
}

export async function getActiveInvoiceCount(userId: string) {
  return prisma.invoice.count({
    where: {
      userId,
      status: {
        in: [...ACTIVE_INVOICE_STATUSES],
      },
    },
  });
}

export async function getInvoiceLimitState(userId: string, plan: Plan) {
  const [activeCount, limit] = await Promise.all([getActiveInvoiceCount(userId), Promise.resolve(getActiveInvoiceLimit(plan))]);

  return {
    activeCount,
    limit,
    canCreate: limit === null || activeCount < limit,
  };
}

export function isActiveInvoiceStatus(status: string): status is ActiveInvoiceStatus {
  return ACTIVE_INVOICE_STATUSES.includes(status as ActiveInvoiceStatus);
}

export function normalizeCurrencyCode(currency: string) {
  return currency.toUpperCase();
}

export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizeCurrencyCode(currency),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizeCurrencyCode(currency)} ${amount.toFixed(2)}`;
  }
}

export function formatMoneyBreakdown(items: Array<{ amount: number; currency: string }>) {
  if (items.length === 0) {
    return "$0.00";
  }

  const grouped = new Map<string, number>();
  for (const item of items) {
    const currency = normalizeCurrencyCode(item.currency);
    grouped.set(currency, (grouped.get(currency) ?? 0) + item.amount);
  }

  return Array.from(grouped.entries())
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ");
}

export function getDaysOffset(dueDate: Date, referenceDate = new Date()) {
  const dueUtc = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());
  const referenceUtc = Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate());
  return Math.round((referenceUtc - dueUtc) / 86_400_000);
}

export function getReminderLabel(daysOffset: number) {
  if (daysOffset < 0) {
    return "Coming up";
  }

  if (daysOffset === 0) {
    return "Due today";
  }

  if (daysOffset === 3) {
    return "3 days overdue";
  }

  if (daysOffset === 7) {
    return "1 week overdue";
  }

  if (daysOffset === 14) {
    return "2 weeks overdue";
  }

  return daysOffset > 0 ? `${daysOffset} days overdue` : `${Math.abs(daysOffset)} days before due`;
}

export function getReminderNumberLabel(index: number) {
  const labels = ["1st", "2nd", "3rd", "4th", "5th"];
  return labels[index] ?? `${index + 1}th`;
}

export function getReminderScheduleEntry(daysOffset: number): ReminderScheduleEntry | null {
  const index = REMINDER_OFFSETS.indexOf(daysOffset as (typeof REMINDER_OFFSETS)[number]);

  if (index < 0) {
    return null;
  }

  return {
    daysOffset,
    label: getReminderLabel(daysOffset),
    reminderNumber: getReminderNumberLabel(index),
  };
}

export function getReminderScheduleEntries() {
  return REMINDER_OFFSETS.map((daysOffset, index) => ({
    daysOffset,
    label: getReminderLabel(daysOffset),
    reminderNumber: getReminderNumberLabel(index),
  }));
}

export function getNextScheduledReminder(dueDate: Date, sentOffsets: number[] = [], referenceDate = new Date()) {
  const currentOffset = getDaysOffset(dueDate, referenceDate);
  const sentOffsetSet = new Set(sentOffsets);

  for (const daysOffset of REMINDER_OFFSETS) {
    if (daysOffset < currentOffset) {
      continue;
    }

    if (sentOffsetSet.has(daysOffset)) {
      continue;
    }

    const targetDate = new Date(dueDate);
    targetDate.setUTCDate(targetDate.getUTCDate() + daysOffset);

    return {
      daysOffset,
      label: getReminderLabel(daysOffset),
      reminderNumber: getReminderNumberLabel(REMINDER_OFFSETS.indexOf(daysOffset)),
      scheduledFor: targetDate,
    };
  }

  return null;
}