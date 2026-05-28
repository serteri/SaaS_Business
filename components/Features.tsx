const features = [
  {
    title: "Add your invoice details",
    description: "Enter client information, invoice amount, due date, and payment link.",
    icon: "01",
  },
  {
    title: "Choose the situation and tone",
    description: "Pick from overdue scenarios and set the right voice from friendly to formal/legal.",
    icon: "02",
  },
  {
    title: "Send polished reminders",
    description: "Generate, copy, and track every payment email from one dashboard.",
    icon: "03",
  },
];

export function Features() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Three steps to get paid sooner</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-semibold text-white">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
