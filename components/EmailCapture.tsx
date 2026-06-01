export function EmailCapture() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-14 text-center text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] dark:border-zinc-800 sm:px-10 lg:px-16">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">Ongonix updates</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get notified when new tools launch
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
          Be first in line when we launch new AI tools, from business automation to smart travel.
        </p>

        <a
          href="/signin"
          className="mx-auto mt-8 inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          Get started
        </a>
        <p className="mt-4 text-xs text-zinc-400">No spam. Just product launch updates.</p>
      </div>
    </section>
  );
}
