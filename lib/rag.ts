import { readFile } from "node:fs/promises";

type Chunk = {
  chunkIndex: number;
  content: string;
};

type UploadedTextSource = {
  fileName: string;
  mimeType: string;
  text: string;
};

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function splitLongSegment(segment: string, chunkSize: number, overlap: number, chunks: Chunk[], startIndex: number) {
  // When a paragraph is too large, we fall back to a sliding window.
  // The overlap keeps neighboring chunks semantically connected so retrieval has more context.
  let cursor = 0;
  let chunkIndex = startIndex;

  while (cursor < segment.length) {
    const end = Math.min(cursor + chunkSize, segment.length);
    const content = segment.slice(cursor, end).trim();
    if (content) {
      chunks.push({ chunkIndex, content });
      chunkIndex += 1;
    }

    if (end >= segment.length) {
      break;
    }

    cursor = Math.max(0, end - overlap);
  }

  return chunkIndex;
}

export function chunkText(input: string, chunkSize = 1000, overlap = 200): Chunk[] {
  const normalized = normalizeText(input);
  if (!normalized) {
    return [];
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let chunkIndex = 0;
  let buffer = "";

  for (const paragraph of paragraphs) {
    // Prefer paragraph boundaries first so chunks stay readable when the source text already has structure.
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;

    if (candidate.length <= chunkSize) {
      buffer = candidate;
      continue;
    }

    if (buffer) {
      chunks.push({ chunkIndex, content: buffer });
      chunkIndex += 1;
      buffer = "";
    }

    if (paragraph.length > chunkSize) {
      chunkIndex = splitLongSegment(paragraph, chunkSize, overlap, chunks, chunkIndex);
      continue;
    }

    buffer = paragraph;
  }

  if (buffer) {
    chunks.push({ chunkIndex, content: buffer });
  }

  return chunks;
}

export async function extractTextFromUpload(file: File): Promise<UploadedTextSource> {
  const fileName = file.name || "uploaded-document";
  const mimeType = file.type || "application/octet-stream";
  const lowerName = fileName.toLowerCase();
  const isPdf = mimeType === "application/pdf" || lowerName.endsWith(".pdf");
  const isText = mimeType.startsWith("text/") || lowerName.endsWith(".txt");

  if (isPdf) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule as unknown as (buffer: Buffer) => Promise<{ text: string }>;
    const buffer = Buffer.from(await file.arrayBuffer());

    // pdf-parse reads raw PDF bytes and returns the extracted page text.
    // This keeps ingestion simple for buyers who upload research, contracts, and docs.
    const parsed = await pdfParse(buffer);

    return {
      fileName,
      mimeType,
      text: parsed.text,
    };
  }

  if (isText) {
    return {
      fileName,
      mimeType,
      text: await file.text(),
    };
  }

  throw new Error("Unsupported file type. Please upload a PDF or plain text file.");
}

export async function readUploadTextFallback(filePath: string) {
  const contents = await readFile(filePath, "utf8");
  return contents;
}
