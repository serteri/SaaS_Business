import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const reminder = await prisma.reminderLog.findFirst({
      where: {
        id,
        invoice: {
          userId: session.user.id,
        },
      },
      include: {
        invoice: {
          select: {
            id: true,
            remindersSent: true,
          },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.reminderLog.delete({
        where: { id: reminder.id },
      });

      if (reminder.status === "sent") {
        const latestSentLog = await tx.reminderLog.findFirst({
          where: {
            invoiceId: reminder.invoice.id,
            status: "sent",
          },
          orderBy: {
            sentAt: "desc",
          },
          select: {
            sentAt: true,
          },
        });

        await tx.invoice.update({
          where: { id: reminder.invoice.id },
          data: {
            remindersSent: {
              decrement: reminder.invoice.remindersSent > 0 ? 1 : 0,
            },
            lastReminderAt: latestSentLog?.sentAt ?? null,
          },
        });
      }
    });

    return NextResponse.json({ ok: true, deletedId: reminder.id });
  } catch {
    return NextResponse.json({ error: "Unable to delete reminder." }, { status: 500 });
  }
}