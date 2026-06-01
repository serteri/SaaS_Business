import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAnthropicClient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

const chatSchema = z.object({
  question: z.string().min(1),
  topK: z.number().int().min(1).max(12).optional().default(5),
});

const QUERY_EMBED_DIM = 8;

function mockEmbeddingFromText(text: string): number[] {
  // Scaffold placeholder. Swap this for your embedding provider in production.
  const values = new Array(QUERY_EMBED_DIM).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    values[i % QUERY_EMBED_DIM] += text.charCodeAt(i) % 89;
  }
  return values.map((v) => Number((v / Math.max(text.length, 1)).toFixed(6)));
}

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

/**
 * POST /api/rag/chat
 *
 * Developer guide:
 * 1) Builds a query embedding from the user's question.
 * 2) Runs pgvector similarity search in Neon (DocumentEmbedding.embedding <=> query_vector).
 * 3) Sends retrieved context + user question to Claude.
 * 4) Streams the generated answer back to the client.
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

    const anthropic = getAnthropicClient();
    if (!anthropic) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY." }, { status: 500 });
    }

    const { question, topK } = parsed.data;
    const queryEmbedding = toVectorLiteral(mockEmbeddingFromText(question));

    type MatchRow = {
      chunkText: string;
      documentTitle: string;
      distance: number;
    };

    // Vector similarity search against pgvector in Neon.
    // Smaller distance = more relevant chunk.
    const matches = await prisma.$queryRawUnsafe<MatchRow[]>(
      `
      SELECT
        de."chunkText" AS "chunkText",
        d."title" AS "documentTitle",
        (de."embedding" <=> $1::vector) AS "distance"
      FROM "DocumentEmbedding" de
      INNER JOIN "Document" d ON d."id" = de."documentId"
      WHERE d."userId" = $2
      ORDER BY de."embedding" <=> $1::vector ASC
      LIMIT $3
      `,
      queryEmbedding,
      session.user.id,
      topK,
    );

    const context = matches
      .map((m, idx) => `Source ${idx + 1} (${m.documentTitle}, distance=${m.distance.toFixed(4)}):\n${m.chunkText}`)
      .join("\n\n");

    const llm = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system:
        "You are a RAG assistant. Use provided context first. If context is insufficient, state uncertainty clearly and suggest what additional data is needed.",
      messages: [
        {
          role: "user",
          content: `Question:\n${question}\n\nRetrieved Context:\n${context || "No context found."}`,
        },
      ],
    });

    const finalText = llm.content
      .map((item) => (item.type === "text" ? item.text : ""))
      .join("\n")
      .trim();

    if (!finalText) {
      return NextResponse.json({ error: "No chat response generated." }, { status: 502 });
    }

    // Stream response to client for chat UX (token-like chunks).
    const encoder = new TextEncoder();
    const chunks = finalText.match(/.{1,80}/g) ?? [finalText];

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "RAG chat pipeline failed." }, { status: 500 });
  }
}
