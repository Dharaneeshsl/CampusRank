import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp, emailDeliveryConfigured, EmailDeliveryError, rateLimit } from "@/lib/otp";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !emailDeliveryConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Registration is unavailable until email delivery and the database are configured." },
      { status: 503 }
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid registration request." }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const domain = email.split("@")[1] ?? "";

  if (
    name.length < 2 ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !passwordRule.test(password)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Use a valid email and a 12+ character password with upper, lower, number, and symbol."
      },
      { status: 400 }
    );
  }

  const limited = rateLimit(`register:${email}`);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const college = await prisma.college.findUnique({ where: { domain } });
  if (!college) {
    return NextResponse.json(
      { ok: false, error: "Your institution has not been provisioned yet. Contact your campus administrator." },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.emailVerified) {
    return NextResponse.json({ ok: false, error: "An account already exists for this email." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  try {
    if (existing && !existing.emailVerified) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, password: passwordHash, collegeId: college.id, collegeEmail: email }
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          collegeEmail: email,
          password: passwordHash,
          collegeId: college.id
        }
      });
    }

    await createAndSendOtp(email, "signup");
  } catch (error) {
    if (!existing) {
      await prisma.user.deleteMany({ where: { email, emailVerified: false } });
    }
    const message =
      error instanceof EmailDeliveryError
        ? error.message
        : "Unable to send verification email. Try again later.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
