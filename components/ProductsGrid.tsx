import Link from "next/link";

const products = [
  {
    category: "AI Tool",
    name: "AI Invoice Reminder",
    description: "Automate payment follow-ups so you spend less time chasing invoices.",
    price: "$19/mo",
  },
  {
    category: "PDF Guide",
    name: "Late Payment Swipe File",
    description: "Ready-to-send scripts for handling awkward payment conversations.",
    price: "$19",
  },
  {
    category: "AI Tool",
    name: "AI Case Study Generator",
    description: "Turn project notes into polished case studies that sell your work.",
    price: "$29/mo",
  },
  {
    category: "PDF Guide",
    name: "Google Review Reply Pack",
    description: "Copy-and-paste replies for polished, professional client feedback.",
    price: "$19",
  },
  {
    category: "Notion Template",
    name: "Freelancer Client OS",
    description: "A lightweight operating system for onboarding, delivery and retention.",
    price: "$49",
  },
  {
    category: "AI Tool",
    name: "AI SOP Generator",
    description: "Create process docs fast and keep your delivery consistent.",
    price: "$39/mo",
  },
];

export function ProductsGrid() {
  return (
    <section id="products" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div id="pricing" className="sr-only" aria-hidden="true" />
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Products</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Practical assets for solo builders who want to ship faster, look sharper and get paid sooner.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="group flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-500/60 dark:hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.55)]"
            >
              <span className="inline-flex w-fit rounded-full bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-600 dark:bg-violet-500/10">
                {product.category}
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {product.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {product.description}
              </p>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <p className="text-lg font-semibold text-zinc-950 dark:text-white">{product.price}</p>
                <Link
                  href="#pricing"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-950 transition hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:text-white dark:hover:border-violet-500 dark:hover:text-violet-400"
                >
                  Get it
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
