import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getResendClient } from "@/lib/resend";

const waitlistSchema = z.object({
  email: z.string().email(),
});

const ADMIN_RECIPIENT =
  process.env.WAITLIST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "reminders@ongonix.com";

/**
 * POST /api/waitlist
 *
 * Developer notes:
 * - Saves the subscriber email to the Waitlist table.
 * - Sends an admin notification email after the DB write succeeds.
 * - Email failures are logged and returned as non-blocking metadata.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = waitlistSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const record = await prisma.waitlist.upsert({
      where: { email },
      create: {
        email,
        productName: "Claude RAG Kit",
      },
      update: {
        productName: "Claude RAG Kit",
      },
    });

    let emailSent = false;
    let emailError: string | null = null;

    try {
      const resend = getResendClient();
      if (!resend) {
        throw new Error("Missing RESEND_API_KEY.");
      }

      await resend.emails.send({
        from: "Ongonix <reminders@ongonix.com>",
        to: ADMIN_RECIPIENT,
        subject: "New Waitlist Signup: RAG Kit",
        text: `New waitlist signup received for Claude RAG Kit.\n\nSubscriber email: ${email}\nProduct: Claude RAG Kit\nTime: ${new Date().toISOString()}`,
      });

      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Unable to send admin notification.";
    }

    return NextResponse.json({
      ok: true,
      signup: {
        id: record.id,
        email: record.email,
        productName: record.productName,
      },
      emailSent,
      emailError,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
