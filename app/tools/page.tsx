"use client";

import { useState } from "react";
import Link from "next/link";
import { TOOLS, type ToolCategory } from "@/lib/data/tools";

type Filter = "All" | ToolCategory;

const FILTERS: Filter[] = [
  "All",
  "Business & Productivity",
  "Developer Boilerplates",
  "Travel & Discovery",
];

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const article = (
    <article
      className="h-full cursor-pointer rounded-3xl border border-violet-300 bg-violet-50/60 p-8 transition-all hover:border-violet-500 hover:shadow-lg dark:border-violet-800 dark:bg-violet-950/30 dark:hover:border-violet-400"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {tool.lifecycle === "LIVE" ? "Live" : "Planned"}
        </span>
        <span className="inline-flex rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
          {tool.category}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tool.description}</p>
      <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.price}</p>
      <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
        {tool.actionLabel}
      </span>
    </article>
  );

  return (
    <Link href={tool.href} className="block">
      {article}
    </Link>
  );
}

export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const visibleTools =
    activeFilter === "All" ? TOOLS : TOOLS.filter((t) => t.category === activeFilter);

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
          {FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilter(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                activeFilter === cat
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-transparent text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white transition-all dark:border-gray-800 dark:hover:border-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
