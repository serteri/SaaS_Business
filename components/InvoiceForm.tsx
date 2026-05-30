"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

type InvoiceFormProps = {
  limitReached: boolean;
  activeCount: number;
  limit: number | null;
  plan: "FREE" | "BASIC" | "PRO";
};

export function InvoiceForm({ limitReached, activeCount, limit, plan }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    clientName: "",
    clientEmail: "",
    invoiceNumber: "",
    amount: "",
    currency: "USD",
    dueDate: "",
    notes: "",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (limitReached) {
      toast.error("Invoice limit reached. Upgrade to add more active invoices.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string; limitReached?: boolean };
      if (!response.ok) {
        if (data.limitReached) {
          toast.error("Active invoice limit reached. Upgrade to increase capacity.");
          router.refresh();
          return;
        }

        throw new Error(data.error ?? "Unable to create invoice.");
      }

      toast.success("Invoice created.");
      router.push("/dashboard/invoices");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Add invoice</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {activeCount}{limit ? `/${limit}` : ""} active invoices on your {plan} plan.
            </p>
          </div>
          <Link href="/dashboard/invoices" className="text-sm font-medium text-violet-600 transition hover:text-violet-500">
            Back to invoices
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Client Name</label>
            <input
              required
              value={values.clientName}
              onChange={(event) => setValues((prev) => ({ ...prev, clientName: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Client Email</label>
            <input
              required
              type="email"
              value={values.clientEmail}
              onChange={(event) => setValues((prev) => ({ ...prev, clientEmail: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Invoice Number</label>
            <input
              required
              value={values.invoiceNumber}
              onChange={(event) => setValues((prev) => ({ ...prev, invoiceNumber: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Amount</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.amount}
              onChange={(event) => setValues((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <select
              value={values.currency}
              onChange={(event) => setValues((prev) => ({ ...prev, currency: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            >
              <option value="USD">USD</option>
              <option value="AUD">AUD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Due Date</label>
            <input
              required
              type="date"
              value={values.dueDate}
              onChange={(event) => setValues((prev) => ({ ...prev, dueDate: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            value={values.notes}
            onChange={(event) => setValues((prev) => ({ ...prev, notes: event.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading || limitReached}
          className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Invoice"}
        </button>
      </form>

      {limitReached ? (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
          You have reached your active invoice limit.
          <Link href="/pricing" className="ml-1 font-semibold underline underline-offset-4">
            Upgrade your plan
          </Link>
          to add more.
        </div>
      ) : null}
    </div>
  );
}