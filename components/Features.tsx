import Link from "next/link";

const businessTools = [
  {
    title: "Invoice Reminder Writer",
    status: "Live",
    description: "Automated payment reminder emails. Set it once, we handle the rest.",
    price: "From $9/month",
    href: "/signin",
  },
  {
    title: "Proposal Follow-up Assistant",
    status: "Coming soon",
    description: "More tools launching soon",
  },
  {
    title: "Client Intake Copilot",
    status: "Coming soon",
    description: "More tools launching soon",
  },
  {
    title: "Project Update Writer",
    status: "Coming soon",
    description: "More tools launching soon",
  },
];

const travelTools = [
  {
    title: "FlightAgent",
    status: "Live",
    description: "AI-powered travel assistant. Find and book the best flight routes in seconds.",
    price: "Try it free",
    href: "https://flightagent.io",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8" id="tools">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Our tools</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Explore our product ecosystem</h2>
        </div>

        <div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">Business &amp; Productivity</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {businessTools.map((tool) => (
              <article
                key={tool.title}
                className={`rounded-3xl border p-8 ${
                  tool.status === "Live"
                    ? "border-violet-300 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/30"
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
                <h4 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{tool.title}</h4>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tool.description}</p>

                {tool.status === "Live" ? (
                  <>
                    <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.price}</p>
                    <Link
                      href={tool.href ?? "/signin"}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      Try it free
                    </Link>
                  </>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">Travel &amp; Discovery</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {travelTools.map((tool) => (
              <article
                key={tool.title}
                className={`rounded-3xl border p-8 ${
                  tool.status === "Live"
                    ? "border-violet-300 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/30"
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
                <h4 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">{tool.title}</h4>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{tool.description}</p>

                {tool.status === "Live" ? (
                  <>
                    <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.price}</p>
                    <Link
                      href={tool.href ?? "/signin"}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      Try it free
                    </Link>
                  </>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
