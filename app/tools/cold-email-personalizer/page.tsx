"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

type PersonalizeResponse = {
  generatedEmail: string;
};

export default function ColdEmailPersonalizerPage() {
  const [prospectUrl, setProspectUrl] = useState("");
  const [offering, setOffering] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectUrl,
          offering,
        }),
      });

      const data = (await response.json()) as PersonalizeResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to generate personalised email.");
      }

      setGeneratedEmail(data.generatedEmail);
      toast.success("Personalised email generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unexpected error while generating email.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!generatedEmail.trim()) {
      toast.error("Generate an email first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Live tool</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">AI Cold Email Personalizer</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Transform cold outreach into warm conversations with tailored intros and ready-to-send draft emails.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold tracking-tight">Generate personalised email</h2>

            <div>
              <label htmlFor="prospectUrl" className="mb-1 block text-sm font-medium">
                Prospect&apos;s Website URL or LinkedIn Profile
              </label>
              <input
                id="prospectUrl"
                type="url"
                required
                placeholder="https://example.com or https://www.linkedin.com/in/name"
                value={prospectUrl}
                onChange={(event) => setProspectUrl(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-violet-500 dark:border-zinc-700"
              />
            </div>

            <div>
              <label htmlFor="offering" className="mb-1 block text-sm font-medium">
                What product/service are you offering?
              </label>
              <textarea
                id="offering"
                required
                rows={6}
                placeholder="Describe your offer, target pain points, and desired CTA."
                value={offering}
                onChange={(event) => setOffering(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-violet-500 dark:border-zinc-700"
              />
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
                "Generate Personalised Email"
              )}
            </button>
          </form>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">Generated response</h2>
              {generatedEmail ? (
                <button
                  type="button"
                  onClick={onCopy}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-100"
                >
                  Copy to Clipboard
                </button>
              ) : null}
            </div>

            {generatedEmail ? (
              <pre className="max-h-[420px] overflow-auto rounded-xl bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100 whitespace-pre-wrap">
                {generatedEmail}
              </pre>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Your personalised cold email will appear here after generation.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}