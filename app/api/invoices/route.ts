import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDaysOffset, getInvoiceLimitState } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";

const createInvoiceSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  invoiceNumber: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.enum(["USD", "AUD", "GBP", "EUR", "CAD"]),
  dueDate: z.string().min(1),
  notes: z.string().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "";
    const allowedStatuses = ["pending", "overdue", "paid", "cancelled"] as const;
    const statusFilter = allowedStatuses.includes(status as (typeof allowedStatuses)[number]) ? status : "";

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ invoices });
  } catch {
    return NextResponse.json({ error: "Unable to load invoices." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createInvoiceSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, subscriptionStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const effectivePlan = user.subscriptionStatus === "ACTIVE" ? (user.plan as Plan) : Plan.FREE;
    const limitState = await getInvoiceLimitState(session.user.id, effectivePlan);

    if (!limitState.canCreate) {
      return NextResponse.json(
        {
          error: "Active invoice limit reached. Upgrade to add more invoices.",
          limitReached: true,
          limit: limitState.limit,
          activeCount: limitState.activeCount,
        },
        { status: 403 },
      );
    }

    const dueDate = new Date(parsed.data.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
    }

    const status = getDaysOffset(dueDate) > 0 ? "overdue" : "pending";

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientName: parsed.data.clientName,
        clientEmail: parsed.data.clientEmail,
        invoiceNumber: parsed.data.invoiceNumber,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        dueDate,
        notes: parsed.data.notes || null,
        status,
      },
    });

    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: "Unable to create invoice." }, { status: 500 });
  }
}