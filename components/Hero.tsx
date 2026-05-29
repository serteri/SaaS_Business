import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[34rem] max-w-6xl bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_55%),radial-gradient(circle_at_left,_rgba(124,58,237,0.08),_transparent_40%),radial-gradient(circle_at_right,_rgba(24,24,27,0.05),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_55%),radial-gradient(circle_at_left,_rgba(124,58,237,0.12),_transparent_40%),radial-gradient(circle_at_right,_rgba(255,255,255,0.04),_transparent_36%)]" />

      <div className="absolute left-1/2 top-14 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl animate-drift" />
      <div className="absolute right-0 top-32 -z-10 h-64 w-64 rounded-full bg-zinc-200/70 blur-3xl dark:bg-zinc-800/40 animate-drift-slow" />

      <div className="mx-auto max-w-4xl py-12 text-center sm:py-16 lg:py-20 animate-fade-up">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Ongonix</p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-7xl dark:text-white">
          Get paid faster. Write better payment reminders.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
          AI-crafted payment reminder emails for freelancers and small businesses. Keep your tone professional while staying firm about payment.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signin"
            className="inline-flex h-12 items-center justify-center rounded-full bg-violet-600 px-6 text-sm font-medium text-white transition hover:bg-violet-500"
          >
            Start free trial
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500 dark:hover:bg-zinc-900"
          >
            View pricing
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Trusted by freelancers, agencies, and small businesses worldwide
        </p>
      </div>
    </section>
  );
}
