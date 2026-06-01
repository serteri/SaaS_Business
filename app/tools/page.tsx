"use client";

import { useState } from "react";
import Link from "next/link";

type Category = "All" | "Business & Productivity" | "Developer Kits" | "Travel & Discovery";

type Tool = {
  title: string;
  status: "Live" | "Coming soon";
  description: string;
  category: Category;
  price?: string;
  cardHref?: string;
};

const allTools: Tool[] = [
  // ── Business & Productivity ──────────────────────────────────────────
  {
    title: "Invoice Reminder Writer",
    status: "Live",
    description: "Automated payment reminder emails. Set it once, we handle the rest.",
    category: "Business & Productivity",
    price: "From $9/month",
    cardHref: "/tools/invoice-reminder-writer",
  },
  {
    title: "AI Cold Email Personalizer",
    status: "Live",
    description:
      "Transform cold outreach into warm conversations. Input a prospect's website or profile to generate tailored, high-converting intro lines and email templates in seconds.",
    category: "Business & Productivity",
    price: "Try it free",
    cardHref: "/tools/cold-email-personalizer",
  },
  {
    title: "Proposal Follow-up Assistant",
    status: "Coming soon",
    description: "More tools launching soon",
    category: "Business & Productivity",
  },
  {
    title: "Client Intake Copilot",
    status: "Coming soon",
    description: "More tools launching soon",
    category: "Business & Productivity",
  },
  {
    title: "Project Update Writer",
    status: "Coming soon",
    description: "More tools launching soon",
    category: "Business & Productivity",
  },
  // ── Developer Kits ──────────────────────────────────────────────────
  {
    title: "Claude RAG SaaS Starter Kit",
    status: "Live",
    description:
      "Production-ready Next.js + Anthropic scaffold with RAG pipelines, auth, and Stripe billing baked in. Ship your AI SaaS in days, not months.",
    category: "Developer Kits",
    price: "Try it free",
    cardHref: "/tools/claude-rag-starter",
  },
  {
    title: "AI API Boilerplate",
    status: "Coming soon",
    description: "More developer kits launching soon",
    category: "Developer Kits",
  },
  // ── Travel & Discovery ───────────────────────────────────────────────
  {
    title: "FlightAgent",
    status: "Live",
    description: "AI-powered travel assistant. Find and book the best flight routes in seconds.",
    category: "Travel & Discovery",
    price: "Try it free",
    cardHref: "https://flightagent.io",
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Business & Productivity",
  "Developer Kits",
  "Travel & Discovery",
];

function ToolCard({ tool }: { tool: Tool }) {
  const article = (
    <article
      className={`h-full rounded-3xl border p-8 transition-all ${
        tool.status === "Live"
          ? "cursor-pointer border-violet-300 bg-violet-50/60 hover:border-violet-500 hover:shadow-lg dark:border-violet-800 dark:bg-violet-950/30 dark:hover:border-violet-400"
          : "border-zinc-200 bg-zinc-100/70 opacity-75 dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          tool.status === "Live"
            ? "bg-violet-600 text-white"
            : "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
        }`}
      >
        {tool.status}
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tool.description}</p>
      {tool.status === "Live" && (
        <>
          <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.price}</p>
          <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
            Try it free
          </span>
        </>
      )}
    </article>
  );

  return tool.cardHref ? (
    <Link href={tool.cardHref} className="block">
      {article}
    </Link>
  ) : (
    <div>{article}</div>
  );
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const visibleTools =
    activeCategory === "All" ? allTools : allTools.filter((t) => t.category === activeCategory);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Our tools</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose the tool you need today
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            A growing ecosystem of independent AI tools — filter by category to find exactly what you need.
          </p>
        </div>

        {/* Filter pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
