import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp, createLoginTicket, emailDeliveryConfigured, EmailDeliveryError, rateLimit } from "@/lib/otp";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !emailDeliveryConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Sign-in is unavailable until email delivery and the database are configured." },
      { status: 503 }
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid sign-in request." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || password.length < 12) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 400 });
  }

  const limited = rateLimit(`login:${email}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.password || !user.emailVerified) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
  }

  try {
    await createAndSendOtp(email, "login");
    const ticket = await createLoginTicket(email);
    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    const message =
      error instanceof EmailDeliveryError
        ? error.message
        : "Unable to send sign-in code. Try again later.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
