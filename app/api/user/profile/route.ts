import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(120).optional().default(""),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, company: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid profile payload." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        company: parsed.data.company || null,
      },
      select: { id: true, name: true, email: true, company: true },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}