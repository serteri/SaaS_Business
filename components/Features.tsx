const howItWorks = [
  {
    title: "Add your invoices",
    description: "Enter client details, amount and due date once. That's it.",
    icon: "01",
  },
  {
    title: "We send reminders automatically",
    description: "The system emails your clients at the right time — before and after the due date.",
    icon: "02",
  },
  {
    title: "Mark as paid and move on",
    description: "When payment arrives, mark it done. Reminders stop automatically.",
    icon: "03",
  },
];

const productFeatures = [
  {
    title: "Automated Reminders",
    description: "Set it once. We send reminders at -3 days, due date, +3, +7 and +14 days automatically.",
  },
  {
    title: "AI-Written Emails",
    description: "Every reminder is written by AI — professional, firm, and never awkward.",
  },
  {
    title: "Invoice Dashboard",
    description: "See all your invoices, their status, and reminder history in one place.",
  },
  {
    title: "Tone Control",
    description: "Friendly for early reminders. Formal for overdue ones. Automatic.",
  },
];

export function Features() {
  return (
    <div className="px-4 py-20 sm:px-6 lg:px-8">
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">How it works</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Three steps to get paid sooner</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {howItWorks.map((step) => (
              <div
                key={step.title}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-semibold text-white">
                  {step.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to get paid</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {productFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
