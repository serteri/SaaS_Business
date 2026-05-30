import type { Invoice, ReminderLog } from "@prisma/client";
import { getAnthropicClient } from "@/lib/anthropic";
import { formatCurrency, getDaysOffset, getReminderLabel, getReminderNumberLabel, getReminderScheduleEntry } from "@/lib/invoices";
import { getResendClient } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

const REMINDER_FROM_ADDRESS = "reminders@ongonix.com";

type ReminderInput = {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: Date;
  daysOffset: number;
  reminderNumber: string;
};

type GeneratedReminderEmail = {
  subject: string;
  body: string;
};

export type InvoiceWithLogs = Invoice & {
  reminderLogs: ReminderLog[];
};

function extractJsonObject(rawText: string) {
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Claude did not return JSON.");
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as GeneratedReminderEmail;
}

function getReminderPrompt(input: ReminderInput) {
  return `clientName: ${input.clientName}
invoiceNumber: ${input.invoiceNumber}
amount: ${formatCurrency(input.amount, input.currency)}
currency: ${input.currency}
dueDate: ${input.dueDate.toISOString()}
daysOffset: ${input.daysOffset}
reminderNumber: ${input.reminderNumber}

Generate a professional invoice reminder email.
Tone should match urgency: friendly for early reminders, firm for overdue ones.
Return JSON: { subject: string, body: string }`;
}

export async function generateReminderEmail(input: ReminderInput) {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 700,
    system:
      'Generate a professional invoice reminder email. Tone should match urgency: friendly for early reminders, firm for overdue ones. Return JSON: { subject: string, body: string }',
    messages: [{ role: "user", content: getReminderPrompt(input) }],
  });

  const text = response.content
    .map((item) => (item.type === "text" ? item.text : ""))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Claude did not generate reminder content.");
  }

  return extractJsonObject(text);
}

export async function sendReminderEmail(params: { to: string; subject: string; body: string }) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return resend.emails.send({
    from: REMINDER_FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    text: params.body,
  });
}

export async function logReminderEvent(params: { invoiceId: string; daysOffset: number; subject: string; status: string }) {
  return prisma.reminderLog.create({
    data: {
      invoiceId: params.invoiceId,
      daysOffset: params.daysOffset,
      emailSubject: params.subject,
      status: params.status,
    },
  });
}

export async function sendInvoiceReminder(params: { invoice: InvoiceWithLogs; force?: boolean }) {
  const { invoice, force = false } = params;

  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return { sent: false, reason: "inactive" as const };
  }

  const daysOffset = getDaysOffset(invoice.dueDate);
  const scheduleEntry = getReminderScheduleEntry(daysOffset);

  if (!force && !scheduleEntry) {
    return { sent: false, reason: "not_scheduled" as const };
  }

  if (!force) {
    const duplicate = invoice.reminderLogs.some((log) => log.daysOffset === daysOffset && log.status === "sent");
    if (duplicate) {
      return { sent: false, reason: "duplicate" as const };
    }
  }

  const reminderNumber = scheduleEntry?.reminderNumber ?? getReminderNumberLabel(Math.max(0, invoice.remindersSent));
  try {
    const generated = await generateReminderEmail({
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      daysOffset,
      reminderNumber,
    });

    await sendReminderEmail({
      to: invoice.clientEmail,
      subject: generated.subject,
      body: generated.body,
    });

    await logReminderEvent({
      invoiceId: invoice.id,
      daysOffset,
      subject: generated.subject,
      status: "sent",
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        remindersSent: {
          increment: 1,
        },
        lastReminderAt: new Date(),
        status: daysOffset > 0 ? "overdue" : invoice.status,
      },
    });

    return {
      sent: true,
      subject: generated.subject,
      body: generated.body,
      daysOffset,
      label: getReminderLabel(daysOffset),
    };
  } catch (error) {
    await logReminderEvent({
      invoiceId: invoice.id,
      daysOffset,
      subject: invoice.invoiceNumber,
      status: "failed",
    });

    throw error;
  }
}

export async function markPastDueInvoices(invoices: Array<{ id: string; dueDate: Date; status: string }>) {
  const updates = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled" && getDaysOffset(invoice.dueDate) > 0);

  await Promise.all(
    updates.map((invoice) =>
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "overdue" },
      }),
    ),
  );
}