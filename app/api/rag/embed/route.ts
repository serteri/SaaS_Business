import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const embedSchema = z.object({
  documentId: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.string().optional().default("upload"),
  chunks: z
    .array(
      z.object({
        chunkIndex: z.number().int().nonnegative(),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

function toVectorLiteral(values: number[]) {
  // pgvector accepts string literal format: '[0.1,0.2,0.3]'
  return `[${values.join(",")}]`;
}

/**
 * POST /api/rag/embed
 *
 * Developer guide:
 * 1) Receives chunked text from the upload step.
 * 2) Sends each chunk to OpenAI's text-embedding-3-small model.
 * 3) Persists the resulting vectors into DocumentEmbedding using pgvector.
 *
 * Important:
 * - Prisma currently maps vector as Unsupported("vector").
 * - We write embedding values with SQL cast (::vector) to preserve pgvector behavior.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = embedSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid embed payload." }, { status: 400 });
    }

    const { documentId, title, sourceType, chunks } = parsed.data;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Batch embedding keeps the buyer's retrieval pipeline fast and reduces network overhead.
    // OpenAI returns the embeddings in the same order as the input array, so we can map by index.
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks.map((chunk) => chunk.content),
    });

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
      select: { id: true },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const embedding = embeddingResponse.data[index]?.embedding;

      if (!embedding) {
        throw new Error(`Missing embedding for chunk ${chunk.chunkIndex}.`);
      }

      const vectorLiteral = toVectorLiteral(embedding);

      // Raw SQL is the safest path here because Prisma models pgvector columns as Unsupported("vector").
      // The vector string is cast directly in Postgres so the database stores the exact floating-point array.
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding" ("id", "documentId", "chunkIndex", "chunkText", "metadata", "embedding", "createdAt")
        VALUES (${crypto.randomUUID()}, ${documentId}, ${chunk.chunkIndex}, ${chunk.content}, ${JSON.stringify({ sourceType, title })}::jsonb, ${vectorLiteral}::vector, NOW())
      `;
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "ready" },
    });

    return NextResponse.json({
      documentId: document.id,
      embeddedChunks: chunks.length,
      embeddingModel: "text-embedding-3-small",
      nextStep: "POST user question to /api/rag/chat",
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate/store embeddings." }, { status: 500 });
  }
}
