import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendOtp, emailDeliveryConfigured, EmailDeliveryError, rateLimit, type OtpPurpose } from "@/lib/otp";

export async function POST(request: Request) {
  if (!emailDeliveryConfigured()) {
    return NextResponse.json({ ok: false, error: "Email delivery is not configured." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const purpose = String(form.get("purpose") ?? "signup") as OtpPurpose;

  if (!email || (purpose !== "signup" && purpose !== "login")) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const limited = rateLimit(`resend:${purpose}:${email}`, 3);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many resend attempts. Try again in ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (purpose === "signup" && user.emailVerified) {
    return NextResponse.json({ ok: false, error: "This email is already verified. Sign in instead." }, { status: 400 });
  }

  if (purpose === "login" && !user.emailVerified) {
    return NextResponse.json({ ok: false, error: "Verify your email before signing in." }, { status: 400 });
  }

  try {
    await createAndSendOtp(email, purpose);
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to resend code. Try again later." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
