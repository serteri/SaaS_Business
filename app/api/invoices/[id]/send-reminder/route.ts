import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceReminder } from "@/lib/reminders";

const manualToneSchema = z.object({
  tone: z.enum(["friendly", "firm", "formal"]).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    const parsedTone = manualToneSchema.safeParse(payload);
    if (!parsedTone.success) {
      return NextResponse.json({ error: "Invalid tone selection." }, { status: 400 });
    }

    const manualTone =
      parsedTone.data.tone === "formal"
        ? "formal/legal"
        : parsedTone.data.tone;

    const { id } = await context.params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            company: true,
          },
        },
        reminderLogs: {
          orderBy: { sentAt: "asc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const result = await sendInvoiceReminder({ invoice, force: true, manualTone });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send reminder." }, { status: 500 });
  }
}