const testimonials = [
  {
    quote: "The invoice reminder tool paid for itself in the first week. It’s saved me hours of awkward chasing.",
    name: "Alex Morgan",
    role: "Freelance Designer",
  },
  {
    quote: "I look more professional now, and my onboarding is cleaner. Clients notice the difference immediately.",
    name: "Priya Shah",
    role: "Studio Owner",
  },
  {
    quote: "The swipe files help me get paid faster without sounding pushy. That alone is worth the price.",
    name: "Jordan Lee",
    role: "Independent Developer",
  },
];

export function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Testimonials</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Loved by people who ship for a living
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex gap-1 text-violet-600" aria-label="5 star rating">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <blockquote className="mt-5 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <p className="font-semibold text-zinc-950 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
