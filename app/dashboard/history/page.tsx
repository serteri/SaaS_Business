"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type GeneratedHistoryItem = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  tone: string;
  generatedEmail: string;
  createdAt: string;
};

type ReminderHistoryItem = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  subject: string;
  emailBody: string | null;
  status: string;
  sentAt: string;
};

export default function HistoryPage() {
  const [generatedItems, setGeneratedItems] = useState<GeneratedHistoryItem[]>([]);
  const [reminderItems, setReminderItems] = useState<ReminderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [tone, setTone] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState<"generated" | "reminders">("generated");
  const [viewingReminder, setViewingReminder] = useState<ReminderHistoryItem | null>(null);

  async function loadHistory() {
    setLoading(true);
    const params = new URLSearchParams();
    if (clientName) params.set("clientName", clientName);
    if (tone && activeTab === "generated") params.set("tone", tone);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("tab", activeTab);

    const response = await fetch(`/api/history?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to load history.");
      setGeneratedItems([]);
      setReminderItems([]);
      setLoading(false);
      return;
    }

    if (activeTab === "generated") {
      setGeneratedItems(data.items ?? []);
    } else {
      setReminderItems(data.items ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function deleteItem(id: string) {
    const response = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete email.");
      return;
    }

    toast.success("Deleted from history.");
    setGeneratedItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Email history</h1>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("generated")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "generated"
              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
              : "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          Generated Emails
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reminders")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "reminders"
              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
              : "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          Invoice Reminders
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-900">
        <input
          placeholder="Client name"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        {activeTab === "generated" ? (
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          >
            <option value="">All tones</option>
            <option value="Friendly">Friendly</option>
            <option value="Firm">Firm</option>
            <option value="Formal/Legal">Formal/Legal</option>
          </select>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
            Reminder filters use client and date.
          </div>
        )}
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
        <button
          type="button"
          onClick={() => void loadHistory()}
          className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white"
        >
          Apply filters
        </button>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Loading...</p> : null}

      {activeTab === "generated" ? (
        <div className="space-y-4">
          {generatedItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Invoice {item.invoiceNumber} · {item.tone} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copy(item.generatedEmail)}
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteItem(item.id)}
                    className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-3 font-mono text-xs text-zinc-100">
                {item.generatedEmail}
              </pre>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reminderItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.clientName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Invoice {item.invoiceNumber} · {new Date(item.sentAt).toLocaleDateString()} · {item.status}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{item.subject}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReminder(item)}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
                >
                  View email
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewingReminder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setViewingReminder(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{viewingReminder.subject}</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Invoice {viewingReminder.invoiceNumber} · {viewingReminder.clientName} · {new Date(viewingReminder.sentAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReminder(null)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
              >
                Close
              </button>
            </div>

            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
              {viewingReminder.emailBody ?? "Email body not available for this reminder."}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
