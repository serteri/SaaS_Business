import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  text: z.string().min(1),
  chunkSize: z.number().int().min(300).max(4000).optional().default(1200),
  overlap: z.number().int().min(0).max(800).optional().default(150),
});

type Chunk = {
  chunkIndex: number;
  content: string;
};

function chunkText(input: string, chunkSize: number, overlap: number): Chunk[] {
  // This is a simple character-based splitter for the scaffold.
  // In production, replace with token-aware chunking (e.g. sentence / semantic boundaries).
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const chunks: Chunk[] = [];
  let start = 0;
  let idx = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const content = normalized.slice(start, end).trim();
    if (content) {
      chunks.push({ chunkIndex: idx, content });
      idx += 1;
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

/**
 * POST /api/rag/upload
 *
 * Developer guide:
 * 1) Receives extracted text from an uploaded file (PDF, DOCX, Markdown, etc).
 * 2) Splits text into chunks that are suitable for embedding.
 * 3) Returns chunk payload to be sent to /api/rag/embed.
 *
 * Notes for buyers of this kit:
 * - This route intentionally does not lock you to one parser.
 * - You can parse file bytes in this route, or upload bytes to storage and process async.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = uploadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
    }

    const { fileName, text, chunkSize, overlap } = parsed.data;
    const chunks = chunkText(text, chunkSize, overlap);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No chunkable text found." }, { status: 400 });
    }

    return NextResponse.json({
      fileName,
      chunks,
      totalChunks: chunks.length,
      nextStep: "POST chunks to /api/rag/embed",
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
