import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDaysOffset, getReminderScheduleEntry } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { markPastDueInvoices, sendInvoiceReminder } from "@/lib/reminders";

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
        const result = await sendInvoiceReminder({ invoice });
        if (result.sent) {
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