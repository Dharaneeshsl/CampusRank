import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeOtp, rateLimit } from "@/lib/otp";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid verification request." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const otp = String(form.get("otp") ?? "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ ok: false, error: "Enter the 6-digit verification code." }, { status: 400 });
  }

  const limited = rateLimit(`verify:${email}`, 10);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "This verification code is invalid or expired." }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const valid = await consumeOtp(email, otp, "signup");
  if (!valid) {
    return NextResponse.json({ ok: false, error: "This verification code is invalid or expired." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true }
  });

  return NextResponse.json({ ok: true });
}
