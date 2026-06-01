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

    const effectivePlan = user.subscriptionStatus === "ACTIVE" ? (user.plan as Plan) : Plan.FREE;
    const usage = await getUsageForUser(user.id, effectivePlan);
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

    // ── Tier-aware model & prompt selection ───────────────────────────────
    const isPro = effectivePlan === Plan.PRO;

    const model = isPro
      ? "claude-sonnet-4-20250514"   // premium, highly capable model for Pro
      : "claude-3-haiku-20240307";   // faster, cost-efficient model for Free / Basic

    const systemPrompt = isPro
      ? "You are an expert B2B collections specialist. Analyze the provided context (industry, past communication style, tone). Write a highly psychological, personalized, and conversion-optimized follow-up email that perfectly mimics the user's natural tone while securing the payment. Be persuasive yet professional. Always include all invoice details provided."
      : `You are an assistant. Write a standard, polite invoice reminder for a delayed payment of ${input.amount}. Keep it professional and concise. Always include the invoice details provided.`;

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
      model,
      max_tokens: isPro ? 1200 : 800,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const rawEmail = response.content
      .map((item) => (item.type === "text" ? item.text : ""))
      .join("\n")
      .trim();

    if (!rawEmail) {
      return NextResponse.json({ error: "No email generated." }, { status: 502 });
    }

    // ── Branding watermark (Free & Basic only) ────────────────────────────
    const branding = `\n\n---\nSent via <a href="https://ongonix.com" style="color:gray;">Ongonix</a>`;
    const generatedEmail = isPro ? rawEmail : `${rawEmail}${branding}`;

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
    const freshUsage = await getUsageForUser(user.id, effectivePlan);

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
