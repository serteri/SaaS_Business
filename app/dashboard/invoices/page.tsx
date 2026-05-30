import Link from "next/link";
import { Plan } from "@prisma/client";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { InvoiceActions } from "@/components/InvoiceActions";

function getBadgeClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300";
    case "cancelled":
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    default:
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

type InvoicesPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const status = resolvedSearchParams.status ?? "";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });

  const effectivePlan = user?.subscriptionStatus === "ACTIVE" ? user.plan : Plan.FREE;
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      ...(status && ["pending", "overdue", "paid", "cancelled"].includes(status) ? { status } : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const activeCount = await prisma.invoice.count({
    where: { userId, status: { in: ["pending", "overdue"] } },
  });

  const limit = effectivePlan === Plan.PRO ? null : effectivePlan === Plan.BASIC ? 10 : 3;
  const limitReached = limit !== null && activeCount >= limit;

  const statusFilters = [
    { key: "", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "overdue", label: "Overdue" },
    { key: "paid", label: "Paid" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track invoice statuses, reminders, and payment follow-ups.</p>
        </div>
        <Link href="/dashboard/invoices/new" className="inline-flex h-11 items-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500">
          Add Invoice
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const active = status === filter.key;
          return (
            <Link
              key={filter.key || "all"}
              href={filter.key ? `/dashboard/invoices?status=${filter.key}` : "/dashboard/invoices"}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "border border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {limitReached ? (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200">
          You have reached your active invoice limit. Upgrade to add more reminders and invoices.
        </div>
      ) : null}

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-lg font-medium">No invoices yet. Add your first one.</p>
          <Link href="/dashboard/invoices/new" className="mt-4 inline-flex h-11 items-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500">
            Add Invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-950/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reminders</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="align-top">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{invoice.invoiceNumber}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">{formatCurrency(invoice.amount, invoice.currency)}</td>
                  <td className="px-4 py-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBadgeClasses(invoice.status)}`}>{invoice.status}</span>
                  </td>
                  <td className="px-4 py-4 text-sm">{invoice.remindersSent}</td>
                  <td className="px-4 py-4">
                    <InvoiceActions invoiceId={invoice.id} currentStatus={invoice.status} viewHref={`/dashboard/invoices/${invoice.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}