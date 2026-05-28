const features = [
  {
    title: "Built for solo builders",
    description: "Lightweight tools that solve one problem really well.",
    icon: "01",
  },
  {
    title: "Instant access",
    description: "Download or start using everything immediately after purchase.",
    icon: "02",
  },
  {
    title: "Constantly updated",
    description: "New products ship every month so the library keeps growing.",
    icon: "03",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
