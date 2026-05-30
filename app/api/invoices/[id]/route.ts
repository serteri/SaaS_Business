import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "overdue", "paid", "cancelled"]),
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: "Unable to load invoice." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const payload = await request.json();
    const parsed = updateStatusSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({ where: { id, userId: session.user.id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: parsed.data.status,
        paidAt: parsed.data.status === "paid" ? new Date() : null,
      },
    });

    return NextResponse.json({ invoice: updated });
  } catch {
    return NextResponse.json({ error: "Unable to update invoice." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const invoice = await prisma.invoice.findFirst({ where: { id, userId: session.user.id } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete invoice." }, { status: 500 });
  }
}