"use client";

import { useMemo, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { toast } from "sonner";

type EmailOutputProps = {
  content: string;
  clientEmail?: string;
  saved: boolean;
  saving?: boolean;
  onSave?: () => void;
};

function getSubjectAndBody(rawContent: string) {
  const lines = rawContent.split("\n");
  const subjectLine = lines.find((line) => /^subject\s*:/i.test(line.trim()));

  if (!subjectLine) {
    return {
      subject: "Payment reminder",
      body: rawContent,
    };
  }

  const subject = subjectLine.replace(/^subject\s*:/i, "").trim() || "Payment reminder";
  const body = lines.filter((line) => line !== subjectLine).join("\n").trim();

  return {
    subject,
    body: body || rawContent,
  };
}

export function EmailOutput({ content, clientEmail = "", saved, saving = false, onSave }: EmailOutputProps) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const charCount = content.length;
  const { subject, body } = useMemo(() => getSubjectAndBody(content), [content]);

  function openSendModal() {
    if (!content.trim()) {
      toast.error("Generate an email first.");
      return;
    }

    setIsSendModalOpen(true);
  }

  function closeSendModal() {
    setIsSendModalOpen(false);
  }

  function openInGmail() {
    if (!content.trim()) {
      toast.error("Generate an email first.");
      return;
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  }

  function openInOutlook() {
    if (!content.trim()) {
      toast.error("Generate an email first.");
      return;
    }

    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(outlookUrl, "_blank", "noopener,noreferrer");
  }

  async function copyEmailText() {
    if (!content.trim()) {
      toast.error("Generate an email first.");
      return;
    }

    const fullEmail = `Subject: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(fullEmail);
      toast.success("Email text copied.");
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  }

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
            disabled={!onSave || saved || saving}
            onClick={onSave}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100"
          >
            {saved ? "Saved" : saving ? "Saving..." : "Save to history"}
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={openSendModal}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
          >
            <IconSend size={14} />
            Send Email
          </button>
        </div>
      </div>

      <pre className="max-h-96 overflow-auto rounded-xl bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100 whitespace-pre-wrap">
        {content}
      </pre>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{saved ? "Saved to history" : "Click Save to store this email in your history."}</p>

      {isSendModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-email-modal-title"
          onClick={closeSendModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h4 id="send-email-modal-title" className="text-lg font-semibold">
                Send this email
              </h4>
              <button
                type="button"
                onClick={closeSendModal}
                className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
              >
                Close
              </button>
            </div>

            {clientEmail.trim() ? (
              <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">Recipient: {clientEmail.trim()}</p>
            ) : null}

            <div className="space-y-3">
              <button
                type="button"
                onClick={openInGmail}
                className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Open in Gmail
              </button>
              <button
                type="button"
                onClick={openInOutlook}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
              >
                Open in Outlook
              </button>
              <button
                type="button"
                onClick={copyEmailText}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
              >
                Copy email text
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
