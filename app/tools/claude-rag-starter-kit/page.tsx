import Link from "next/link";

const highlights = [
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

        <div className="mt-16 rounded-3xl border border-zinc-200 bg-gradient-to-br from-zinc-950 to-violet-950 p-8 sm:p-10 dark:border-zinc-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Tech stack</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Built on the modern AI SaaS stack</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">What you get in the kit</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              A fully integrated vector database architecture powered by Neon pgvector, so buyers can run RAG without third-party services like Pinecone.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
            </div>
          ))}
          </div>
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