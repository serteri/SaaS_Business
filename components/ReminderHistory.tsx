"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { getReminderLabel } from "@/lib/invoices";

type ReminderHistoryItem = {
  id: string;
  sentAt: string | Date;
  daysOffset: number;
  emailSubject: string;
  status: string;
};

type ReminderHistoryProps = {
  logs: ReminderHistoryItem[];
};

export function ReminderHistory({ logs }: ReminderHistoryProps) {
  const router = useRouter();
  const [items, setItems] = useState(logs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteReminder(id: string) {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete reminder.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
      toast.success("Reminder deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete reminder.");
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">No reminders sent yet.</p>;
  }

  return (
    <ol className="mt-4 space-y-4 border-l border-zinc-200 pl-4 dark:border-zinc-800">
      {items.map((log) => (
        <li key={log.id} className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">{getReminderLabel(log.daysOffset)}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(log.sentAt).toLocaleString()}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{log.emailSubject}</p>
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{log.status}</p>
            </div>
            <button
              type="button"
              onClick={() => void deleteReminder(log.id)}
              disabled={deletingId === log.id}
              className="rounded-full border border-red-300 p-2 text-red-600 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Delete reminder"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}