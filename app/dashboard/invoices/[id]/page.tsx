import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatCurrency, getDaysOffset, getNextScheduledReminder, getReminderLabel } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { InvoiceActions } from "@/components/InvoiceActions";
import { ReminderHistory } from "@/components/ReminderHistory";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      reminderLogs: {
        orderBy: { sentAt: "asc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const sentOffsets = invoice.reminderLogs.map((log) => log.daysOffset);
  const nextReminder = invoice.status === "paid" || invoice.status === "cancelled" ? null : getNextScheduledReminder(invoice.dueDate, sentOffsets);
  const daysOffset = getDaysOffset(invoice.dueDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invoice {invoice.invoiceNumber}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{invoice.clientName} · {invoice.clientEmail}</p>
        </div>
        <InvoiceActions invoiceId={invoice.id} currentStatus={invoice.status} viewHref="/dashboard/invoices" sendReminder />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Amount</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Due Date</p>
          <p className="mt-2 text-2xl font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{getReminderLabel(daysOffset)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Status</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getBadgeClasses(invoice.status)}`}>{invoice.status}</span>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Reminders sent: {invoice.remindersSent}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Client</dt>
              <dd className="font-medium">{invoice.clientName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="font-medium">{invoice.clientEmail}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Invoice number</dt>
              <dd className="font-medium">{invoice.invoiceNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Currency</dt>
              <dd className="font-medium">{invoice.currency}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
              <dd className="font-medium">{new Date(invoice.createdAt).toLocaleString()}</dd>
            </div>
            {invoice.notes ? (
              <div className="space-y-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Notes</dt>
                <dd className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950/40">{invoice.notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">Next scheduled reminder</h2>
          {nextReminder ? (
            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{nextReminder.label}</p>
              <p>Reminder number: {nextReminder.reminderNumber}</p>
              <p>Scheduled for: {nextReminder.scheduledFor.toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No further reminders are scheduled.</p>
          )}

          <h3 className="mt-6 text-base font-semibold">Reminder history</h3>
          <ReminderHistory logs={invoice.reminderLogs} />
        </div>
      </section>
    </div>
  );
}