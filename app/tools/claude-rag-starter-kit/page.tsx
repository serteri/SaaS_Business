import Link from "next/link";

const highlights = [
  {
    title: "Claude API built in",
    body: "Ship with a pre-wired AI layer that is ready for production workflows and iterative prompt tuning.",
  },
  {
    title: "Vector DB integration",
    body: "Store, retrieve, and ground responses with a structured retrieval layer designed for SaaS products.",
  },
  {
    title: "Vertical templates",
    body: "Start from focused app templates instead of blank pages, so you can launch faster with stronger product-market fit.",
  },
];

export default function ClaudeRagStarterKitPage() {
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
              href="/signin"
              className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Join Waitlist
            </Link>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Back to Tools
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-violet-300 bg-violet-50/60 p-8 dark:border-violet-800 dark:bg-violet-950/30 sm:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">Pre-order</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                $149 one-time
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Get access to the starter kit, scaffold, and core boilerplate that helps you launch an AI SaaS
                without stitching everything together from scratch.
              </p>
            </div>
            <Link
              href="/signin"
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}