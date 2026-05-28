"use client";

import { toast } from "sonner";

type EmailOutputProps = {
  content: string;
  saved: boolean;
};

export function EmailOutput({ content, saved }: EmailOutputProps) {
  const charCount = content.length;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  }

  if (!content) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Your generated email will appear here.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Generated email</h3>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{charCount} characters</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
          >
            Copy
          </button>
        </div>
      </div>

      <pre className="max-h-96 overflow-auto rounded-xl bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100 whitespace-pre-wrap">
        {content}
      </pre>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{saved ? "Saved to history" : "Save to history after generating"}</p>
    </section>
  );
}
