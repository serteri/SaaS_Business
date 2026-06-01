import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chunkText, extractTextFromUpload } from "@/lib/rag";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  text: z.string().min(1),
  chunkSize: z.number().int().min(300).max(4000).optional().default(1000),
  overlap: z.number().int().min(0).max(800).optional().default(200),
});

/**
 * POST /api/rag/upload
 *
 * Developer guide:
 * 1) Accepts a PDF or TXT upload and extracts the raw text.
 * 2) Saves the parent Document row immediately so the user has a persisted knowledge source.
 * 3) Splits the extracted text into LLM-friendly chunks for the embed step.
 *
 * Notes for buyers of this kit:
 * - The parser is intentionally small and explicit so it is easy to replace with a custom pipeline later.
 * - Chunking is paragraph-aware first, then falls back to a sliding window for long sections.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, documentCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { planTier: true },
      }),
      prisma.document.count({
        where: { userId: session.user.id },
      }),
    ]);

    if ((user?.planTier ?? "FREE") === "FREE" && documentCount >= 3) {
      return NextResponse.json({ error: "Free plan limit reached. Please upgrade to Pro." }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    let fileName = "uploaded-document";
    let sourceType = "upload";
    let text = "";
    let chunkSize = 1000;
    let overlap = 200;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const uploadedFile = formData.get("file");

      if (!(uploadedFile instanceof File)) {
        return NextResponse.json({ error: "Please attach a PDF or TXT file." }, { status: 400 });
      }

      const chunkSizeValue = Number(formData.get("chunkSize") ?? 1000);
      const overlapValue = Number(formData.get("overlap") ?? 200);
      chunkSize = Number.isFinite(chunkSizeValue) ? chunkSizeValue : 1000;
      overlap = Number.isFinite(overlapValue) ? overlapValue : 200;

      // The upload route owns file parsing so the frontend only needs to send raw bytes.
      // That keeps the buyer experience simple: drop a file in and immediately get chunks back.
      const parsedFile = await extractTextFromUpload(uploadedFile);
      fileName = parsedFile.fileName;
      text = parsedFile.text;
      sourceType = parsedFile.mimeType === "application/pdf" ? "pdf" : "text";
    } else {
      const payload = await request.json();
      const parsed = uploadSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
      }

      fileName = parsed.data.fileName;
      text = parsed.data.text;
      chunkSize = parsed.data.chunkSize;
      overlap = parsed.data.overlap;
    }

    const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    if (!normalizedText) {
      return NextResponse.json({ error: "No readable text was found in the upload." }, { status: 400 });
    }

    // Save the parent Document first so the retrieval flow always has a durable anchor row.
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        title: fileName,
        sourceType,
        status: "processing",
        metadata: {
          fileName,
          sourceType,
          chunkSize,
          overlap,
          extractedCharacters: normalizedText.length,
        },
      },
    });

    const chunks = chunkText(text, chunkSize, overlap);

    if (chunks.length === 0) {
      await prisma.document.update({
        where: { id: document.id },
        data: { status: "failed" },
      });

      return NextResponse.json({ error: "No chunkable text found." }, { status: 400 });
    }

    return NextResponse.json({
      documentId: document.id,
      fileName,
      sourceType,
      chunks,
      totalChunks: chunks.length,
      nextStep: "POST chunks to /api/rag/embed",
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
