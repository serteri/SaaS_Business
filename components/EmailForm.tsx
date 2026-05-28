"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmailOutput } from "@/components/EmailOutput";

type GeneratorResponse = {
  generatedEmail: string;
  saved: boolean;
  usage: {
    used: number;
    limit: number | null;
  };
};

export function EmailForm() {
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const [formValues, setFormValues] = useState({
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
          toast.error("Monthly email limit reached. Upgrade to Pro for unlimited usage.");
        } else {
          toast.error(data.error ?? "Failed to generate email.");
        }
        return;
      }

      setGeneratedEmail(data.generatedEmail);
      setSaved(data.saved);
      toast.success("Email generated successfully.");
    } catch {
      toast.error("Unexpected error while generating email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onGenerate} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">Generate new email</h2>

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
      </form>

      <EmailOutput content={generatedEmail} saved={saved} />
    </div>
  );
}
