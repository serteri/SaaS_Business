"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";

type UploadStatus = "uploading" | "processing" | "ready" | "error";

type UploadedDoc = {
  id: string;
  fileName: string;
  status: UploadStatus;
  progress: number;
  chunks?: number;
  error?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UploadResponse = {
  fileName: string;
  chunks: Array<{ chunkIndex: number; content: string }>;
  totalChunks: number;
};

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function markdownToHtml(markdown: string) {
  const escaped = escapeHtml(markdown);

  const withInline = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-zinc-800 px-1 py-0.5 text-zinc-100\">$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-violet-300 underline\">$1</a>");

  const lines = withInline.split("\n");
  const blocks: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        blocks.push("</ul>");
        inList = false;
      }
      blocks.push("<div class=\"h-2\"></div>");
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        blocks.push("<ul class=\"list-disc pl-5 space-y-1\">");
        inList = true;
      }
      blocks.push(`<li>${trimmed.slice(2)}</li>`);
      continue;
    }

    if (inList) {
      blocks.push("</ul>");
      inList = false;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(`<h3 class=\"text-sm font-semibold\">${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      blocks.push(`<h2 class=\"text-base font-semibold\">${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      blocks.push(`<h1 class=\"text-lg font-semibold\">${trimmed.slice(2)}</h1>`);
    } else {
      blocks.push(`<p>${trimmed}</p>`);
    }
  }

  if (inList) {
    blocks.push("</ul>");
  }

  return blocks.join("");
}

function MarkdownMessage({ content }: { content: string }) {
  const html = useMemo(() => markdownToHtml(content), [content]);
  return <div className="space-y-2 text-sm leading-6" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function RagKitDemoPage() {
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "Welcome to the **Legal Contract Analyzer** demo. Upload documents on the left, then ask context-aware questions here.",
    },
  ]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function updateDoc(id: string, patch: Partial<UploadedDoc>) {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function simulateProgress(id: string) {
    let p = 0;
    const timer = setInterval(() => {
      p += Math.floor(Math.random() * 10) + 6;
      if (p >= 92) {
        p = 92;
        clearInterval(timer);
      }
      updateDoc(id, { progress: p, status: "uploading" });
    }, 140);

    return () => clearInterval(timer);
  }

  async function extractFileText(file: File) {
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md")) {
      return file.text();
    }

    // PDF extraction is intentionally kept lightweight for this front-end demo.
    // In production, parse PDF content server-side and pass clean text into /api/rag/upload.
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return `Document title: ${file.name}\n\nThis is a placeholder extraction for PDF upload in demo mode. Replace this with real PDF-to-text parsing before production deployment.`;
    }

    return file.text();
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => {
      const name = file.name.toLowerCase();
      return name.endsWith(".txt") || name.endsWith(".pdf") || name.endsWith(".md");
    });

    for (const file of files) {
      const id = createId();
      setDocuments((prev) => [
        {
          id,
          fileName: file.name,
          status: "uploading",
          progress: 5,
        },
        ...prev,
      ]);

      const stopProgress = simulateProgress(id);

      try {
        const text = await extractFileText(file);

        const uploadResp = await fetch("/api/rag/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            text,
            chunkSize: 1200,
            overlap: 150,
          }),
        });

        const uploadData = (await uploadResp.json()) as UploadResponse & { error?: string };
        if (!uploadResp.ok) {
          throw new Error(uploadData.error ?? "Upload pipeline failed.");
        }

        updateDoc(id, { status: "processing", progress: 96, chunks: uploadData.totalChunks });

        const embedResp = await fetch("/api/rag/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.name,
            sourceType: "upload",
            chunks: uploadData.chunks,
          }),
        });

        const embedData = (await embedResp.json()) as { error?: string };
        if (!embedResp.ok) {
          throw new Error(embedData.error ?? "Embedding pipeline failed.");
        }

        updateDoc(id, { status: "ready", progress: 100 });
      } catch (error) {
        updateDoc(id, {
          status: "error",
          progress: 100,
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      } finally {
        stopProgress();
      }
    }
  }

  async function onFilePickerChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    await handleFiles(files);
    event.target.value = "";
  }

  async function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    if (event.dataTransfer.files?.length) {
      await handleFiles(event.dataTransfer.files);
    }
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
  }

  async function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || chatLoading) {
      return;
    }

    const userMsg: ChatMessage = { id: createId(), role: "user", content: question };
    const assistantId = createId();

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, topK: 5 }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Chat request failed.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream available.");
      }

      const decoder = new TextDecoder();
      let done = false;
      let aggregated = "";

      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          aggregated += decoder.decode(result.value, { stream: true });
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: aggregated } : m)));
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `**Error:** ${error instanceof Error ? error.message : "Unable to retrieve answer."}`,
              }
            : m,
        ),
      );
    } finally {
      setChatLoading(false);
    }
  }

  const suggestion = "Summarize the termination clauses in the uploaded contract.";

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.45),_transparent_45%)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Vertical template demo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Legal Contract Analyzer</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            Upload legal contracts to build a private knowledge base, then query Claude with grounded context from your own documents.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(280px,30%)_1fr]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Knowledge Base</h2>
              <p className="mt-1 text-xs text-zinc-400">Drop PDF/TXT files to process and index into Neon pgvector.</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.md"
              multiple
              className="hidden"
              onChange={onFilePickerChange}
            />

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`rounded-2xl border border-dashed p-6 text-center transition-all ${
                isDragActive
                  ? "border-violet-400 bg-violet-500/10"
                  : "border-zinc-700 bg-zinc-900/60 hover:border-zinc-500"
              }`}
            >
              <p className="text-sm font-medium text-zinc-100">Drag & drop PDF/TXT here</p>
              <p className="mt-1 text-xs text-zinc-400">or click to browse files</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-zinc-600 px-4 text-xs font-medium text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-800/70"
              >
                Select Files
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-xs font-medium text-zinc-100">{doc.fileName}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          doc.status === "ready"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : doc.status === "error"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-violet-500/20 text-violet-300"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${doc.progress}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{doc.progress}%</span>
                      <span>{doc.chunks ? `${doc.chunks} chunks` : ""}</span>
                    </div>
                    {doc.error ? <p className="mt-2 text-[11px] text-rose-300">{doc.error}</p> : null}
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="flex min-h-[620px] flex-col rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Claude RAG Assistant</h2>
                <p className="mt-1 text-xs text-zinc-400">Ask grounded questions from uploaded legal knowledge.</p>
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setInput(suggestion)}
                className="inline-flex items-center rounded-full border border-violet-500/60 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
              >
                {suggestion}
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "border border-violet-500/40 bg-violet-600 text-white"
                        : "border border-zinc-700 bg-zinc-950 text-zinc-100"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownMessage content={message.content || "..."} />
                    ) : (
                      <p className="text-sm leading-6">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendChat} className="mt-4 flex items-end gap-3">
              <textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about indemnity terms, termination obligations, renewal clauses..."
                className="w-full resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {chatLoading ? "Thinking..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
