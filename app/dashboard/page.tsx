import Link from "next/link";
import { Plan } from "@prisma/client";
import { UsageCounter } from "@/components/UsageCounter";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsageForUser } from "@/lib/usage";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });

  const plan = user?.subscriptionStatus === "ACTIVE" ? user.plan : Plan.FREE;
  const usage = await getUsageForUser(userId, plan);

  const recentEmails = await prisma.emailGeneration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <UsageCounter used={usage.used} limit={usage.limit} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent emails</h2>
          <Link href="/dashboard/generate" className="text-sm font-medium text-violet-600 transition hover:text-violet-500">
            Generate new email
          </Link>
        </div>

        {recentEmails.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No emails generated yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentEmails.map((email) => (
              <li key={email.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="font-medium">{email.clientName}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Invoice {email.invoiceNumber} · {email.tone} · {email.daysOverdue} days overdue
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
