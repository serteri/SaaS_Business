"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmailOutput } from "@/components/EmailOutput";

type GeneratorResponse = {
  generatedEmail: string;
  saved: boolean;
  generationId?: string;
  usage: {
    used: number;
    limit: number | null;
  };
};

export function EmailForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const [formValues, setFormValues] = useState({
    clientEmail: "",
    clientName: "",
    invoiceNumber: "",
    amount: "",
    originalDueDate: "",
    situation: "Standard overdue",
    tone: "Friendly",
    yourName: "",
    paymentLink: "",
  });

  const daysOverdue = useMemo(() => {
    if (!formValues.originalDueDate) {
      return 0;
    }

    const dueDate = new Date(formValues.originalDueDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [formValues.originalDueDate]);

  async function onGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formValues,
          daysOverdue,
        }),
      });

      const data = (await response.json()) as GeneratorResponse & { error?: string; limitReached?: boolean };

      if (!response.ok) {
        if (data.limitReached) {
          setLimitReached(true);
          toast.error("Monthly email limit reached. Upgrade to Pro for unlimited usage.");
        } else {
          toast.error(data.error ?? "Failed to generate email.");
        }
        return;
      }

      setLimitReached(false);
      setGeneratedEmail(data.generatedEmail);
      setSaved(data.saved);
      setGenerationId(data.generationId ?? null);
      toast.success("Email generated successfully.");
    } catch {
      toast.error("Unexpected error while generating email.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveToHistory() {
    if (!generatedEmail) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId,
          invoiceNumber: formValues.invoiceNumber,
          clientName: formValues.clientName,
          amount: formValues.amount,
          daysOverdue,
          tone: formValues.tone,
          generatedEmail,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save to history.");
      }

      setSaved(true);
      toast.success("Saved to history.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onGenerate} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">Generate new email</h2>

        <div>
          <label className="mb-1 block text-sm font-medium">Client Email (optional)</label>
          <input
            type="email"
            value={formValues.clientEmail}
            onChange={(event) => setFormValues((prev) => ({ ...prev, clientEmail: event.target.value }))}
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Client Name</label>
          <input
            required
            value={formValues.clientName}
            onChange={(event) => setFormValues((prev) => ({ ...prev, clientName: event.target.value }))}
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice Number</label>
            <input
              required
              value={formValues.invoiceNumber}
              onChange={(event) => setFormValues((prev) => ({ ...prev, invoiceNumber: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount Owed</label>
            <input
              required
              value={formValues.amount}
              onChange={(event) => setFormValues((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Original Due Date</label>
            <input
              type="date"
              required
              value={formValues.originalDueDate}
              onChange={(event) => setFormValues((prev) => ({ ...prev, originalDueDate: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Days Overdue</label>
            <input
              value={daysOverdue}
              readOnly
              className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Situation</label>
            <select
              value={formValues.situation}
              onChange={(event) => setFormValues((prev) => ({ ...prev, situation: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            >
              <option>Standard overdue</option>
              <option>Client not responding</option>
              <option>Client says already paid</option>
              <option>Partial payment received</option>
              <option>Final notice</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tone</label>
            <select
              value={formValues.tone}
              onChange={(event) => setFormValues((prev) => ({ ...prev, tone: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            >
              <option>Friendly</option>
              <option>Firm</option>
              <option>Formal/Legal</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Your Name</label>
            <input
              required
              value={formValues.yourName}
              onChange={(event) => setFormValues((prev) => ({ ...prev, yourName: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Payment Link (optional)</label>
            <input
              value={formValues.paymentLink}
              onChange={(event) => setFormValues((prev) => ({ ...prev, paymentLink: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating...
            </span>
          ) : (
            "Generate Email"
          )}
        </button>

        {limitReached ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
            You have reached your Basic plan limit this month.
            <Link href="/pricing" className="ml-1 font-semibold underline underline-offset-4">
              Upgrade to Pro
            </Link>
            for unlimited emails.
          </div>
        ) : null}
      </form>

      <EmailOutput
        content={generatedEmail}
        clientEmail={formValues.clientEmail}
        saved={saved}
        saving={saving}
        onSave={onSaveToHistory}
      />
    </div>
  );
}
