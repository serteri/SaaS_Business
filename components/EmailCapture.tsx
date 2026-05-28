export function EmailCapture() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-14 text-center text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] dark:border-zinc-800 sm:px-10 lg:px-16">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">Stay in the loop</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get notified when new tools drop
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
          Join the list for launches, updates and occasional product notes from the studio.
        </p>

        <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="h-12 flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Subscribe
          </button>
        </form>

        <p className="mt-4 text-xs text-zinc-400">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
