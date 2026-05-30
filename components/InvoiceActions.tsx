"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type InvoiceActionsProps = {
  invoiceId: string;
  currentStatus: string;
  viewHref?: string;
  sendReminder?: boolean;
};

async function readError(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  return data.error ?? "Unexpected error.";
}

export function InvoiceActions({ invoiceId, currentStatus, viewHref, sendReminder = false }: InvoiceActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function runAction(action: string, request: RequestInit) {
    setLoadingAction(action);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}${action === "send" ? "/send-reminder" : ""}`, request);
      if (!response.ok) {
        throw new Error(await readError(response));
      }

      toast.success(
        action === "paid"
          ? "Marked as paid."
          : action === "cancelled"
            ? "Invoice cancelled."
            : action === "deleted"
              ? "Invoice deleted."
              : "Reminder sent.",
      );

      if (action === "deleted") {
        router.push("/dashboard/invoices");
        return;
      }

      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {viewHref ? (
        <Link
          href={viewHref}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
        >
          View
        </Link>
      ) : null}
      {sendReminder ? (
        <button
          type="button"
          onClick={() => void runAction("send", { method: "POST" })}
          disabled={loadingAction === "send"}
          className="rounded-full border border-violet-300 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-800 dark:text-violet-300"
        >
          {loadingAction === "send" ? "Sending..." : "Send reminder now"}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => void runAction("paid", { method: "PATCH", body: JSON.stringify({ status: "paid" }), headers: { "Content-Type": "application/json" } })}
        disabled={loadingAction === "paid" || currentStatus === "paid"}
        className="rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900 dark:text-emerald-300"
      >
        {loadingAction === "paid" ? "Saving..." : "Mark as paid"}
      </button>
      <button
        type="button"
        onClick={() => void runAction("cancelled", { method: "PATCH", body: JSON.stringify({ status: "cancelled" }), headers: { "Content-Type": "application/json" } })}
        disabled={loadingAction === "cancelled" || currentStatus === "cancelled"}
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100"
      >
        {loadingAction === "cancelled" ? "Saving..." : "Cancel"}
      </button>
      <button
        type="button"
        onClick={() => void runAction("deleted", { method: "DELETE" })}
        disabled={loadingAction === "deleted"}
        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === "deleted" ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}