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
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    limitReached?: boolean;
    reminderUsage?: { used: number; limit: number | null };
  };

  return {
    message: data.error ?? "Unexpected error.",
    limitReached: Boolean(data.limitReached),
    reminderUsage: data.reminderUsage,
  };
}

export function InvoiceActions({ invoiceId, currentStatus, viewHref, sendReminder = false }: InvoiceActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [toneModalOpen, setToneModalOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"friendly" | "firm" | "formal">("friendly");
  const [reminderLimitState, setReminderLimitState] = useState<{ used: number; limit: number | null } | null>(null);

  async function runAction(action: string, request: RequestInit) {
    setLoadingAction(action);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}${action === "send" ? "/send-reminder" : ""}`, request);
      if (!response.ok) {
        const error = await readError(response);
        if (action === "send" && error.limitReached) {
          setReminderLimitState(error.reminderUsage ?? null);
        }
        throw new Error(error.message);
      }

      if (action === "send") {
        setReminderLimitState(null);
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
    <div className="space-y-3">
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
          <>
            <button
              type="button"
              onClick={() => setToneModalOpen(true)}
              disabled={loadingAction === "send"}
              className="rounded-full border border-violet-300 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-800 dark:text-violet-300"
            >
              {loadingAction === "send" ? "Sending..." : "Send reminder now"}
            </button>

            {toneModalOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setToneModalOpen(false)}>
                <div
                  className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h4 className="text-base font-semibold">Choose tone for this reminder</h4>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`reminder-tone-${invoiceId}`}
                        value="friendly"
                        checked={selectedTone === "friendly"}
                        onChange={() => setSelectedTone("friendly")}
                      />
                      Friendly
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`reminder-tone-${invoiceId}`}
                        value="firm"
                        checked={selectedTone === "firm"}
                        onChange={() => setSelectedTone("firm")}
                      />
                      Firm
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`reminder-tone-${invoiceId}`}
                        value="formal"
                        checked={selectedTone === "formal"}
                        onChange={() => setSelectedTone("formal")}
                      />
                      Formal
                    </label>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setToneModalOpen(false)}
                      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setToneModalOpen(false);
                        void runAction("send", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tone: selectedTone }),
                        });
                      }}
                      disabled={loadingAction === "send"}
                      className="rounded-full bg-violet-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loadingAction === "send" ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
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

      {reminderLimitState ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
          Monthly reminder limit reached.
          {reminderLimitState.limit !== null ? ` ${reminderLimitState.used}/${reminderLimitState.limit} used this month.` : ""}
          <Link href="/pricing" className="ml-1 font-semibold underline underline-offset-4">
            Upgrade your plan
          </Link>
          for more automated reminders.
        </div>
      ) : null}
    </div>
  );
}