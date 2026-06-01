"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const features = [
  {
    title: "Zero external vector vendor lock-in",
    body: "Neon + pgvector is wired directly into the app. No Pinecone, no extra vector bill, no extra network hops.",
  },
  {
    title: "RAG routes included",
    body: "Upload, embed, and chat endpoints are scaffolded with comments so your team can ship retrieval features immediately.",
  },
  {
    title: "Production auth + billing",
    body: "NextAuth and Stripe are already connected, so monetization and account access are ready from day one.",
  },
  {
    title: "Claude-native workflows",
    body: "Prompt architecture and API patterns are optimized for Anthropic Claude out of the box.",
  },
  {
    title: "Neon-ready schema",
    body: "Document and DocumentEmbedding models are pre-structured for pgvector similarity search.",
  },
  {
    title: "Fast launch templates",
    body: "Opinionated vertical starters help you move from MVP idea to deployable app in hours.",
  },
];

const techStack = [
  { name: "Next.js 15", detail: "App Router + server-first architecture" },
  { name: "Neon (pgvector)", detail: "Postgres + vector similarity in one database" },
  { name: "NextAuth", detail: "Authentication + session management" },
  { name: "Stripe", detail: "Billing, checkout, and subscriptions" },
  { name: "Claude API", detail: "Generation and RAG answers with Anthropic" },
];

export default function ClaudeRagStarterKitPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || submitted) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string; emailSent?: boolean; emailError?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to join the waitlist.");
      }

      setSubmitted(true);
      setEmailSent(Boolean(data.emailSent));
      if (data.emailError) {
        setError(data.emailError);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to join the waitlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Live
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Claude RAG SaaS Starter Kit
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Launch your AI app in hours. A production-ready Next.js boilerplate featuring Claude API, Vector DB
            integration, and vertical templates.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tools"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Back to Ongonix tools
            </Link>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm text-emerald-200">
              <p className="text-lg font-semibold text-emerald-100">✓ You&apos;re on the list!</p>
              <p className="mt-2 text-emerald-200/80">
                {emailSent ? "Your email has been saved and the team has been notified." : "Your email has been saved."}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="h-12 flex-1 rounded-full border border-zinc-300 bg-transparent px-5 text-sm text-zinc-950 outline-none transition focus:border-violet-500 dark:border-zinc-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-950/20 dark:border-t-zinc-950" />
                    Joining...
                  </span>
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </form>
          )}
          {error ? <p className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">{error}</p> : null}
        </div>

        <div className="mt-16 rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-violet-950 p-8 sm:p-10 dark:border-zinc-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Tech stack</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built on the modern AI SaaS stack
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-200">
              Everything buyers need is already integrated: auth, billing, LLM, and a native vector database layer.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {techStack.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              What you get in the kit
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              A fully integrated vector database architecture powered by Neon pgvector, so buyers can run RAG without third-party services like Pinecone.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}