"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type HistoryItem = {
  id: string;
  clientName: string;
  invoiceNumber: string;
  tone: string;
  generatedEmail: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [tone, setTone] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function loadHistory() {
    setLoading(true);
    const params = new URLSearchParams();
    if (clientName) params.set("clientName", clientName);
    if (tone) params.set("tone", tone);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const response = await fetch(`/api/history?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to load history.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteItem(id: string) {
    const response = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete email.");
      return;
    }

    toast.success("Deleted from history.");
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Email history</h1>

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-900">
        <input
          placeholder="Client name"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />
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

      <div className="space-y-4">
        {items.map((item) => (
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
    </div>
  );
}
