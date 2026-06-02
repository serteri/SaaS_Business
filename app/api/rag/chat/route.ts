import OpenAI from "openai";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "tool"]),
      content: z.any(),
    }),
  ),
});

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part && typeof (part as { text?: unknown }).text === "string") {
          return (part as { text: string }).text;
        }

        return "";
      })
      .join(" ")
      .trim();
  }

  if (content && typeof content === "object" && "text" in content && typeof (content as { text?: unknown }).text === "string") {
    return (content as { text: string }).text;
  }

  return "";
}

/**
 * POST /api/rag/chat
 *
 * Developer guide:
 * 1) Accepts the chat messages array from the client.
 * 2) Streams the response from Anthropic Claude through the Vercel AI SDK.
 * 3) Returns a data stream response that works seamlessly with `useChat`.
 *
 * This file is intentionally verbose as starter-kit documentation for buyers.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = chatSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
    }

    const startOfDayUtc = new Date();
    startOfDayUtc.setUTCHours(0, 0, 0, 0);

    const [user, todayChatCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { planTier: true },
      }),
      prisma.ragChatMessage.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfDayUtc },
        },
      }),
    ]);

    if ((user?.planTier ?? "FREE") === "FREE" && todayChatCount >= 10) {
      return NextResponse.json({ error: "Free plan daily chat limit reached. Please upgrade to Pro." }, { status: 403 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY." }, { status: 500 });
    }

    const latestUserMessage = [...parsed.data.messages].reverse().find((message) => message.role === "user");
    const latestUserText = latestUserMessage ? extractTextFromContent(latestUserMessage.content) : "";

    if (!latestUserText) {
      return NextResponse.json({ error: "No user message found for retrieval." }, { status: 400 });
    }

    await prisma.ragChatMessage.create({
      data: {
        userId: session.user.id,
      },
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestUserText,
    });

    const vector = embeddingResponse.data[0]?.embedding;
    if (!vector) {
      return NextResponse.json({ error: "Failed to generate query embedding." }, { status: 502 });
    }

    const vectorLiteral = `[${vector.join(",")}]`;

    type MatchRow = {
      chunkText: string;
      documentTitle: string;
      distance: number;
    };

    const matches = await prisma.$queryRaw<MatchRow[]>`
      SELECT
        de."chunkText" AS "chunkText",
        d."title" AS "documentTitle",
        de."embedding" <=> ${vectorLiteral}::vector AS "distance"
      FROM "DocumentEmbedding" de
      INNER JOIN "Document" d ON d."id" = de."documentId"
      WHERE d."userId" = ${session.user.id}
      ORDER BY de."embedding" <=> ${vectorLiteral}::vector ASC
      LIMIT 5
    `;

    const context = matches.length
      ? matches
          .map((match, index) => `Context ${index + 1} from ${match.documentTitle} (distance ${match.distance.toFixed(4)}):\n${match.chunkText}`)
          .join("\n\n")
      : "No relevant context was retrieved from the knowledge base.";

    const result = streamText({
      model: anthropic("claude-3-5-sonnet-20240620"),
      messages: parsed.data.messages,
      system: `You are a helpful assistant. Use the following retrieved context to answer the user's question. Context: ${context}`,
    });

    return result.toDataStreamResponse();
  } catch {
    return NextResponse.json({ error: "RAG chat pipeline failed." }, { status: 500 });
  }
}
