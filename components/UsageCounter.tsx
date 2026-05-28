type UsageCounterProps = {
  used: number;
  limit: number | null;
};

export function UsageCounter({ used, limit }: UsageCounterProps) {
  const percentage = limit ? Math.min(100, (used / limit) * 100) : 0;
  const widthClass =
    percentage >= 100
      ? "w-full"
      : percentage >= 90
        ? "w-11/12"
        : percentage >= 80
          ? "w-10/12"
          : percentage >= 70
            ? "w-9/12"
            : percentage >= 60
              ? "w-8/12"
              : percentage >= 50
                ? "w-7/12"
                : percentage >= 40
                  ? "w-6/12"
                  : percentage >= 30
                    ? "w-5/12"
                    : percentage >= 20
                      ? "w-4/12"
                      : percentage >= 10
                        ? "w-3/12"
                        : used > 0
                          ? "w-2/12"
                          : "w-0";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Usage this month</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        {limit ? `${used}/${limit} emails used` : `${used} emails used (unlimited plan)`}
      </p>
      {limit ? (
        <div className="mt-4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className={`h-2 rounded-full bg-violet-600 ${widthClass}`} />
        </div>
      ) : null}
    </section>
  );
}
