import Link from "next/link";

const features = [
  {
    icon: "⚙️",
    title: "Set it once",
    body: "Connect your invoice and configure your preferences once. We automatically schedule and send reminders at the right time — no manual follow-up needed.",
  },
  {
    icon: "✍️",
    title: "AI handles the tone",
    body: "Our AI adapts the email tone to match the situation — friendly for first reminders, firm for final notices. Every email sounds professional and human.",
  },
  {
    icon: "💸",
    title: "Get paid faster",
    body: "Businesses using automated reminders get paid up to 3× faster than those who chase manually. Less awkward conversations, more results.",
  },
];

const pricingFeatures = [
  "10 AI-written reminder emails per month",
  "10 active invoices tracked",
  "50 automated reminders per month",
  "Full email history & search",
  "Copy, export, and send via Gmail or Outlook",
  "Upgrade to Pro for unlimited usage",
];

export default function InvoiceReminderWriterPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Live
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Invoice Reminder Writer
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
            Stop chasing payments manually. Our AI writes professional, personalised payment reminder emails
            in seconds — set it once and get paid faster.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Try it Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything handled for you</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300">
              Built for freelancers, consultants, and small business owners who are tired of awkward follow-ups.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 px-4 py-16 sm:px-6 lg:px-8 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">Simple, honest pricing</h2>
          <div className="mt-8 rounded-3xl border border-violet-300 bg-violet-50/60 p-8 text-left dark:border-violet-800 dark:bg-violet-950/30">
            <p className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              From $9<span className="text-lg font-normal text-zinc-500">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              {pricingFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-0.5 font-semibold text-violet-600">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/signin"
              className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-violet-600 px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Stop chasing. Start getting paid.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-violet-100">
            Join freelancers and small business owners who use Ongonix to automate their invoice follow-ups
            and get paid without the awkward conversations.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
            >
              Try it free today
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-violet-400 px-6 text-sm font-medium text-white transition hover:border-white"
            >
              View all plans
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
