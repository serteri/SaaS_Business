import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceReminder } from "@/lib/reminders";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: session.user.id },
      include: {
        reminderLogs: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const result = await sendInvoiceReminder({ invoice, force: true });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send reminder." }, { status: 500 });
  }
}