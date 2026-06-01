import { NextResponse } from "next/server";
import { z } from "zod";

const inputSchema = z.object({
  prospectUrl: z.string().url(),
  offering: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = inputSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload. Please provide a valid URL and offering details." },
        { status: 400 },
      );
    }

    const { prospectUrl, offering } = parsed.data;
    const domain = new URL(prospectUrl).hostname.replace(/^www\./, "");

    const generatedEmail = `Subject: Quick idea for ${domain}

Hi there,

I came across ${domain} and noticed the team is focused on delivering a strong experience for your audience.

I help businesses like yours with ${offering.trim()}.

Based on your positioning, I believe we could quickly improve response rates with a tailored outreach sequence and highly personalized opening lines.

If useful, I can send over 2-3 custom intro variations for your current campaign so you can test them right away.

Would you be open to a quick 15-minute chat this week?

Best,
[Your Name]`;

    return NextResponse.json({ generatedEmail });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}