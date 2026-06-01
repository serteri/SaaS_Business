import Link from "next/link";

type Tool = {
  title: string;
  status: "Live" | "Coming soon";
  description: string;
  price?: string;
  href?: string;
  cardHref?: string;
};

const businessTools: Tool[] = [
  {
    title: "Invoice Reminder Writer",
    status: "Live",
    description: "Automated payment reminder emails. Set it once, we handle the rest.",
    price: "From $9/month",
    href: "/signin",
    cardHref: "/tools/invoice-reminder-writer",
  },
  {
    title: "AI Cold Email Personalizer",
    status: "Live",
    description:
      "Transform cold outreach into warm conversations. Input a prospect's website or profile to generate tailored, high-converting intro lines and email templates in seconds.",
    price: "Try it free",
    href: "/tools/cold-email-personalizer",
    cardHref: "/tools/cold-email-personalizer",
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

const travelTools: Tool[] = [
  {
    title: "FlightAgent",
    status: "Live",
    description: "AI-powered travel assistant. Find and book the best flight routes in seconds.",
    price: "Try it free",
    href: "https://flightagent.io",
    cardHref: "https://flightagent.io",
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const article = (
    <article
      className={`rounded-3xl border p-8 transition-all ${
        tool.status === "Live"
          ? "border-violet-300 bg-violet-50/60 dark:border-violet-800 dark:bg-violet-950/30 cursor-pointer hover:shadow-lg hover:border-violet-500 dark:hover:border-violet-400"
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
          <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
            Try it free
          </span>
        </>
      ) : null}
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
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">Travel &amp; Discovery</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {travelTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
