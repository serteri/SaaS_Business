import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createHistorySchema = z.object({
  generationId: z.string().optional().nullable(),
  invoiceNumber: z.string().min(1),
  clientName: z.string().min(1),
  amount: z.string().min(1),
  daysOverdue: z.number().int().nonnegative(),
  tone: z.string().min(1),
  generatedEmail: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get("clientName") ?? "";
    const tone = searchParams.get("tone") ?? "";
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";
    const tab = searchParams.get("tab") ?? "generated";

    const dateFilter = dateFrom || dateTo
      ? {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
        }
      : undefined;

    if (tab === "reminders") {
      const items = await prisma.reminderLog.findMany({
        where: {
          invoice: {
            userId: session.user.id,
            ...(clientName ? { clientName: { contains: clientName, mode: "insensitive" } } : {}),
          },
          ...(dateFilter ? { sentAt: dateFilter } : {}),
        },
        include: {
          invoice: {
            select: {
              clientName: true,
              invoiceNumber: true,
            },
          },
        },
        orderBy: { sentAt: "desc" },
      });

      return NextResponse.json({
        tab,
        items: items.map((item) => ({
          id: item.id,
          clientName: item.invoice.clientName,
          invoiceNumber: item.invoice.invoiceNumber,
          subject: item.emailSubject,
          emailBody: item.emailBody,
          status: item.status,
          sentAt: item.sentAt,
        })),
      });
    }

    const items = await prisma.emailGeneration.findMany({
      where: {
        userId: session.user.id,
        ...(clientName ? { clientName: { contains: clientName, mode: "insensitive" } } : {}),
        ...(tone ? { tone } : {}),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tab, items });
  } catch {
    return NextResponse.json({ error: "Unable to load history." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    await prisma.emailGeneration.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete email." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createHistorySchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    if (parsed.data.generationId) {
      const existing = await prisma.emailGeneration.findFirst({
        where: {
          id: parsed.data.generationId,
          userId: session.user.id,
        },
      });

      if (existing) {
        return NextResponse.json({ ok: true, id: existing.id, alreadyExisted: true });
      }
    }

    const created = await prisma.emailGeneration.create({
      data: {
        userId: session.user.id,
        invoiceNumber: parsed.data.invoiceNumber,
        clientName: parsed.data.clientName,
        amount: parsed.data.amount,
        daysOverdue: parsed.data.daysOverdue,
        tone: parsed.data.tone,
        generatedEmail: parsed.data.generatedEmail,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch {
    return NextResponse.json({ error: "Unable to save history item." }, { status: 500 });
  }
}
