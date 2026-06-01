import Link from "next/link";

const features = [
  {
    title: "Smart Routing",
    body: "AI analyzes thousands of combinations to find cheaper, unconventional layovers and routing opportunities most travelers miss.",
  },
  {
    title: "Real-Time Data",
    body: "Direct integrations with modern flight APIs (like Duffel) deliver instant availability, dynamic fares, and accurate route intelligence.",
  },
  {
    title: "Automated Itineraries",
    body: "Say goodbye to manual planning. Generate personalized travel schedules in seconds, aligned to budget, comfort, and timing preferences.",
  },
];

export default function FlightAgentPage() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Portfolio Showcase
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Flight Agent</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
            The smartest way to book travel. Powered by AI and modern flight infrastructure.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://flightagent.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Visit flightagent.io
            </a>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              Back to Ongonix tools
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
