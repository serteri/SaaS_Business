import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const embedSchema = z.object({
  title: z.string().min(1),
  sourceType: z.string().optional().default("upload"),
  chunks: z.array(z.object({
    chunkIndex: z.number().int().nonnegative(),
    content: z.string().min(1),
  })).min(1),
});

const EMBEDDING_DIM = 8;

function mockEmbeddingFromText(text: string): number[] {
  // Scaffold placeholder:
  // Replace with real embedding generation (Anthropic/OpenAI/local model) when wiring production.
  const values = new Array(EMBEDDING_DIM).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    values[i % EMBEDDING_DIM] += text.charCodeAt(i) % 97;
  }
  return values.map((v) => Number((v / Math.max(text.length, 1)).toFixed(6)));
}

function toVectorLiteral(values: number[]) {
  // pgvector accepts string literal format: '[0.1,0.2,0.3]'
  return `[${values.join(",")}]`;
}

/**
 * POST /api/rag/embed
 *
 * Developer guide:
 * 1) Creates a Document record for the uploaded knowledge source.
 * 2) Generates vector embeddings for each chunk.
 * 3) Persists chunks + vectors into DocumentEmbedding using Neon pgvector.
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

    const { title, sourceType, chunks } = parsed.data;

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        title,
        sourceType,
        status: "indexing",
      },
    });

    for (const chunk of chunks) {
      const embedding = mockEmbeddingFromText(chunk.content);
      const vectorLiteral = toVectorLiteral(embedding);

      // We use raw SQL for Unsupported("vector") columns.
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "DocumentEmbedding" ("id", "documentId", "chunkIndex", "chunkText", "metadata", "embedding", "createdAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4::jsonb, $5::vector, NOW())
        `,
        document.id,
        chunk.chunkIndex,
        chunk.content,
        JSON.stringify({ sourceType }),
        vectorLiteral,
      );
    }

    await prisma.document.update({
      where: { id: document.id },
      data: { status: "ready" },
    });

    return NextResponse.json({
      documentId: document.id,
      embeddedChunks: chunks.length,
      embeddingDimensions: EMBEDDING_DIM,
      nextStep: "POST user question to /api/rag/chat",
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate/store embeddings." }, { status: 500 });
  }
}
