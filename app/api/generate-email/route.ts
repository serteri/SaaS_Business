import { NextResponse } from "next/server";
import { Plan } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAnthropicClient } from "@/lib/anthropic";
import { getCurrentMonthKey } from "@/lib/month";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUsageForUser, incrementUsage } from "@/lib/usage";

const inputSchema = z.object({
  clientName: z.string().min(1),
  invoiceNumber: z.string().min(1),
  amount: z.string().min(1),
  originalDueDate: z.string().min(1),
  daysOverdue: z.number().int().nonnegative(),
  situation: z.string().min(1),
  tone: z.string().min(1),
  yourName: z.string().min(1),
  paymentLink: z.string().optional().default(""),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limiter = checkRateLimit(session.user.id);
    if (!limiter.ok) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });
    }

    const payload = await request.json();
    const parsed = inputSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const usage = await getUsageForUser(user.id, user.plan as Plan);
    if (!usage.canGenerate) {
      return NextResponse.json(
        { error: "Monthly email limit reached. Upgrade to Pro for unlimited emails.", limitReached: true },
        { status: 403 },
      );
    }

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY." }, { status: 500 });
    }

    const input = parsed.data;
    const prompt = `Client Name: ${input.clientName}
Invoice Number: ${input.invoiceNumber}
Amount Owed: ${input.amount}
Original Due Date: ${input.originalDueDate}
Days Overdue: ${input.daysOverdue}
Situation: ${input.situation}
Tone: ${input.tone}
Your Name: ${input.yourName}
Payment Link: ${input.paymentLink || "Not provided"}

Write one complete email ready to send.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system:
        "You are an expert at writing professional payment reminder emails. Write clear, professional emails that maintain the client relationship while firmly requesting payment. Never be rude. Always include the invoice details provided.",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedEmail = response.content
      .map((item) => (item.type === "text" ? item.text : ""))
      .join("\n")
      .trim();

    if (!generatedEmail) {
      return NextResponse.json({ error: "No email generated." }, { status: 502 });
    }

    const created = await prisma.emailGeneration.create({
      data: {
        userId: user.id,
        invoiceNumber: input.invoiceNumber,
        clientName: input.clientName,
        amount: input.amount,
        daysOverdue: input.daysOverdue,
        tone: input.tone,
        generatedEmail,
      },
    });

    await incrementUsage(user.id, getCurrentMonthKey());
    const freshUsage = await getUsageForUser(user.id, user.plan as Plan);

    return NextResponse.json({
      generatedEmail,
      saved: true,
      generationId: created.id,
      usage: {
        used: freshUsage.used,
        limit: freshUsage.limit,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
