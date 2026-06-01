import Link from "next/link";
import { EmailCapture } from "@/components/EmailCapture";
import { Hero } from "@/components/Hero";
import { TOOLS } from "@/lib/data/tools";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="px-4 py-20 sm:px-6 lg:px-8" id="tools">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Our tools</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Explore our product ecosystem</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link key={tool.title} href={tool.href} className="block">
                <article className="h-full cursor-pointer rounded-3xl border border-violet-300 bg-violet-50/60 p-8 transition-all hover:border-violet-500 hover:shadow-lg dark:border-violet-800 dark:bg-violet-950/30 dark:hover:border-violet-400">
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
              </Link>
            ))}
          </div>
        </div>
      </section>
      <EmailCapture />
    </>
  );
}
