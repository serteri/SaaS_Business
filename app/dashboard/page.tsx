import Link from "next/link";
import { Plan } from "@prisma/client";
import { UsageCounter } from "@/components/UsageCounter";
import { auth } from "@/lib/auth";
import { formatMoneyBreakdown } from "@/lib/invoices";
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

  const activeInvoices = await prisma.invoice.findMany({
    where: {
      userId,
      status: { in: ["pending", "overdue"] },
    },
    select: {
      amount: true,
      currency: true,
      status: true,
    },
  });

  const activeInvoiceCount = activeInvoices.length;
  const overdueInvoiceCount = activeInvoices.filter((invoice) => invoice.status === "overdue").length;
  const totalOutstanding = formatMoneyBreakdown(activeInvoices.map((invoice) => ({ amount: invoice.amount, currency: invoice.currency })));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Invoices</p>
          <p className="mt-2 text-3xl font-semibold">{activeInvoiceCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Overdue Invoices</p>
          <p className="mt-2 text-3xl font-semibold">{overdueInvoiceCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Outstanding</p>
          <p className="mt-2 text-2xl font-semibold">{totalOutstanding}</p>
          <Link href="/dashboard/invoices" className="mt-3 inline-flex text-sm font-medium text-violet-600 transition hover:text-violet-500">
            View invoices
          </Link>
        </div>
      </section>

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
