import type { Invoice, ReminderLog } from "@prisma/client";
import { getAnthropicClient } from "@/lib/anthropic";
import { formatCurrency, getDaysOffset, getReminderLabel, getReminderScheduleEntry } from "@/lib/invoices";
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
  reminderNumber: number;
  sentReminderCount: number;
  tone: ReminderTone;
  userName: string;
  userCompany?: string;
};

type GeneratedReminderEmail = {
  subject: string;
  body: string;
};

export type InvoiceWithLogs = Invoice & {
  user: {
    name: string | null;
    company: string | null;
  };
  reminderLogs: ReminderLog[];
};

export type ReminderTone = "friendly" | "firm" | "formal/legal";

export function getToneForDaysOffset(daysOffset: number): ReminderTone {
  if (daysOffset === -3 || daysOffset === 0) {
    return "friendly";
  }

  if (daysOffset === 3 || daysOffset === 7) {
    return "firm";
  }

  if (daysOffset === 14) {
    return "formal/legal";
  }

  return daysOffset > 7 ? "formal/legal" : "firm";
}

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
  const signatureCompanyLine = input.userCompany ? `\n${input.userCompany}` : "";

  return `clientName: ${input.clientName}
invoiceNumber: ${input.invoiceNumber}
amount: ${formatCurrency(input.amount, input.currency)}
currency: ${input.currency}
dueDate: ${input.dueDate.toISOString()}
daysOffset: ${input.daysOffset}
reminderNumber: ${input.reminderNumber}
sentReminderCount: ${input.sentReminderCount}
tone: ${input.tone}
userName: ${input.userName}
userCompany: ${input.userCompany || "(none)"}

Generate a professional invoice reminder email.
Tone should match urgency: friendly for early reminders, firm for overdue ones, formal/legal for serious overdue reminders.
Do not use placeholders like [Your Name] or [Your Company].
Use reminderNumber to set an accurate subject line:
- reminderNumber = 1 -> no reminder/follow-up prefix. Example: "Invoice #123 Due Today - $100.00"
- reminderNumber = 2 -> use "Follow-up:" prefix (first follow-up). Example: "Follow-up: Invoice #123 Overdue - $100.00"
- reminderNumber = 3 -> use "2nd Follow-up:" prefix. Example: "2nd Follow-up: Invoice #123 - $100.00"
- reminderNumber >= 4 -> use "Final Notice:" prefix. Example: "Final Notice: Invoice #123 - $100.00"
The email body must end with this signature exactly:
Best regards,
${input.userName}${signatureCompanyLine}
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
      'Generate a professional invoice reminder email. Tone should match urgency: friendly for early reminders, firm for overdue ones, formal/legal for serious overdue reminders. Ensure subject line format matches reminderNumber rules provided by the user prompt. Do not use placeholders such as [Your Name] or [Your Company]. Always include the sender signature exactly as provided. Return JSON: { subject: string, body: string }',
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

export async function sendInvoiceReminder(params: { invoice: InvoiceWithLogs; force?: boolean; manualTone?: ReminderTone }) {
  const { invoice, force = false, manualTone } = params;

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

  const sentReminderCount = await prisma.reminderLog.count({
    where: {
      invoiceId: invoice.id,
      status: "sent",
    },
  });
  const reminderNumber = sentReminderCount + 1;
  const tone = manualTone ?? getToneForDaysOffset(daysOffset);
  const userName = invoice.user.name?.trim() || "Accounts Team";
  const userCompany = invoice.user.company?.trim() || "";

  try {
    const generated = await generateReminderEmail({
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      daysOffset,
      reminderNumber,
      sentReminderCount,
      tone,
      userName,
      userCompany,
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