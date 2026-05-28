import Link from "next/link";
import { EmailCapture } from "@/components/EmailCapture";

type ComingSoonProps = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <>
      <section className="px-4 pb-8 pt-20 text-center sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-zinc-50 p-10 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">{title}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
            Coming soon
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            {description}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:border-zinc-500"
          >
            Back to home
          </Link>
        </div>
      </section>

      <EmailCapture />
    </>
  );
}
