import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { getDaysOffset, getReminderScheduleEntry } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { markPastDueInvoices, sendInvoiceReminder } from "@/lib/reminders";
import { getReminderUsageForUser, incrementReminderUsage } from "@/lib/usage";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") ?? "";

  if (!secret) {
    return false;
  }

  return authHeader === secret || authHeader === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        status: {
          notIn: ["paid", "cancelled"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            company: true,
            plan: true,
            subscriptionStatus: true,
            id: true,
          },
        },
        reminderLogs: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    await markPastDueInvoices(invoices);

    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const invoice of invoices) {
      const daysOffset = getDaysOffset(invoice.dueDate);
      if (!getReminderScheduleEntry(daysOffset)) {
        skippedCount += 1;
        continue;
      }

      try {
        const effectivePlan = invoice.user.subscriptionStatus === "ACTIVE" ? (invoice.user.plan as Plan) : Plan.FREE;
        const reminderUsage = await getReminderUsageForUser(invoice.user.id, effectivePlan);
        if (!reminderUsage.canSend) {
          skippedCount += 1;
          continue;
        }

        const result = await sendInvoiceReminder({ invoice });
        if (result.sent) {
          await incrementReminderUsage(invoice.user.id, reminderUsage.month);
          sentCount += 1;
        } else {
          skippedCount += 1;
        }
      } catch {
        failedCount += 1;
      }
    }

    return NextResponse.json({ ok: true, sentCount, skippedCount, failedCount });
  } catch {
    return NextResponse.json({ error: "Unable to run reminder cron." }, { status: 500 });
  }
}