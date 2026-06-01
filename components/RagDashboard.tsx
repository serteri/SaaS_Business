"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import { IconSend, IconUpload } from "@tabler/icons-react";
import Link from "next/link";

type DocumentItem = {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  createdAt: string | Date;
};

type RagDashboardProps = {
  initialDocuments: DocumentItem[];
};

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderMessageText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) {
        return null;
      }

      if (trimmed.startsWith("- ")) {
        return (
          <ul key={index} className="list-disc space-y-1 pl-5">
            {trimmed.split(/\n/).map((line, lineIndex) => (
              <li key={lineIndex}>{line.replace(/^-\s*/, "")}</li>
            ))}
          </ul>
        );
      }

      return (
        <p key={index} className="whitespace-pre-wrap leading-7 text-zinc-200">
          {trimmed}
        </p>
      );
    });
}

export function RagDashboard({ initialDocuments }: RagDashboardProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState("Drop a PDF or TXT file to start building your knowledge base.");
  const [isChatReady, setIsChatReady] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("Free plan limit reached. Please upgrade to Pro.");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/rag/chat",
    onResponse(response) {
      if (response.status === 403) {
        setUpgradeMessage("Free plan daily chat limit reached. Please upgrade to Pro.");
        setShowUpgradeModal(true);
      }
    },
  });

  useEffect(() => {
    setIsChatReady(true);
  }, []);

  const activeDocuments = useMemo(() => documents.filter((document) => document.status !== "failed"), [documents]);

  async function handleUpload(file: File) {
    if (showUpgradeModal) {
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chunkSize", "1000");
      formData.append("overlap", "200");

      const uploadResponse = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = (await uploadResponse.json()) as {
        documentId?: string;
        fileName?: string;
        sourceType?: string;
        chunks?: Array<{ chunkIndex: number; content: string }>;
        error?: string;
      };

      if (uploadResponse.status === 403) {
        setUpgradeMessage(uploadResult.error || "Free plan limit reached. Please upgrade to Pro.");
        setShowUpgradeModal(true);
        setUploadStatus("idle");
        return;
      }

      if (!uploadResponse.ok || !uploadResult.documentId || !uploadResult.chunks || !uploadResult.fileName) {
        throw new Error(uploadResult.error || "Upload failed.");
      }

      setUploadStatus("processing");
      setUploadMessage(`Processing ${uploadResult.fileName}...`);

      const embedResponse = await fetch("/api/rag/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: uploadResult.documentId,
          title: uploadResult.fileName,
          sourceType: uploadResult.sourceType || "upload",
          chunks: uploadResult.chunks,
        }),
      });

      const embedResult = (await embedResponse.json()) as { error?: string };
      if (embedResponse.status === 403) {
        setUpgradeMessage(embedResult.error || "Free plan limit reached. Please upgrade to Pro.");
        setShowUpgradeModal(true);
        setUploadStatus("idle");
        return;
      }

      if (!embedResponse.ok) {
        throw new Error(embedResult.error || "Embedding failed.");
      }

      setDocuments((current) => [
        {
          id: uploadResult.documentId!,
          title: uploadResult.fileName!,
          sourceType: uploadResult.sourceType || "upload",
          status: "ready",
          createdAt: new Date(),
        },
        ...current,
      ]);

      setUploadStatus("complete");
      setUploadMessage(`${uploadResult.fileName} is indexed and ready to chat.`);
      setTimeout(() => setUploadStatus("idle"), 2500);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    void handleUpload(file);
  }

  return (
    <div className="relative min-h-[calc(100vh-8rem)] rounded-[2rem] border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/40">
      <div className="grid min-h-[calc(100vh-8rem)] gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-800 bg-zinc-950/90 p-6 backdrop-blur xl:border-b-0 xl:border-r">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Knowledge Base</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Retrieval Workspace</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Upload source files, generate embeddings, and keep your assistant grounded in your own documents.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-zinc-700 bg-white/5 p-5 transition hover:border-emerald-400/70 hover:bg-emerald-400/5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <IconUpload size={20} />
                </span>
                <div>
                  <p className="font-medium text-zinc-100">
                    {uploadStatus === "uploading" ? "Uploading..." : uploadStatus === "processing" ? "Processing..." : "Upload a document"}
                  </p>
                  <p className="text-sm text-zinc-400">PDF or TXT. Click to choose a file.</p>
                </div>
              </div>
            </label>

            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm text-zinc-300">
              <p className="font-medium text-zinc-100">Status</p>
              <p className="mt-2 leading-6 text-zinc-400">{uploadMessage}</p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/25"
            >
              Manage Subscription
            </Link>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Active Documents</h2>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300">{activeDocuments.length}</span>
              </div>

              <div className="space-y-3">
                {activeDocuments.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm text-zinc-400">
                    No documents indexed yet. Upload your first file to start retrieval.
                  </div>
                ) : (
                  activeDocuments.map((document) => (
                    <article key={document.id} className="rounded-2xl border border-zinc-800 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-zinc-100">{document.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{document.sourceType}</p>
                        </div>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                          {document.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">Indexed {formatDate(document.createdAt)}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),linear-gradient(180deg,_rgba(9,9,11,1)_0%,_rgba(3,7,18,1)_100%)] p-6 lg:p-8">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">AI Assistant</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Ask questions over your uploaded files</h2>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              {isChatReady ? (isLoading ? "Thinking..." : "Ready") : "Starting..."}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-white/5 p-6 text-zinc-300">
                  <p className="font-medium text-white">Try asking:</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    “Summarize the key obligations from the employee handbook.” or “What deadlines are mentioned in the Q3 report?”
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-3xl rounded-3xl border p-5 ${message.role === "user" ? "ml-auto border-emerald-400/20 bg-emerald-400/10" : "border-zinc-800 bg-white/5"}`}
                  >
                    <p className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">{message.role}</p>
                    <div className="space-y-3 text-sm text-zinc-200">{renderMessageText(message.content)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/95 pt-4 backdrop-blur"
            onSubmit={(event) => {
              if (showUpgradeModal) {
                event.preventDefault();
                return;
              }

              event.preventDefault();
              void handleSubmit(event);
            }}
          >
            <div className="flex items-end gap-3 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-lg shadow-black/20">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask something about your knowledge base..."
                rows={2}
                className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || showUpgradeModal}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconSend size={18} />
                Send
              </button>
            </div>
          </form>
        </main>
      </div>

      {showUpgradeModal ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[2rem] bg-black/65 p-6 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Upgrade Required</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">Upgrade to Pro</h3>
            <p className="mt-4 text-sm leading-7 text-zinc-200">{upgradeMessage}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Manage Subscription
              </Link>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-900/70 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}