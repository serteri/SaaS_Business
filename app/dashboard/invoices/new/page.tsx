import { Plan } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getInvoiceLimitState } from "@/lib/invoices";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function NewInvoicePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });

  const effectivePlan = user?.subscriptionStatus === "ACTIVE" ? (user.plan as Plan) : Plan.FREE;
  const limitState = await getInvoiceLimitState(userId, effectivePlan);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Add invoice</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Create tracked invoices and automate follow-up reminders.</p>
      <InvoiceForm limitReached={!limitState.canCreate} activeCount={limitState.activeCount} limit={limitState.limit} plan={effectivePlan} />
    </div>
  );
}