import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function databaseEnabled() {
  return process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid verification request" }, { status: 400 });
  }

  const email = String(form.get("email") ?? "").toLowerCase();
  const otp = String(form.get("otp") ?? "");

  if (otp !== "123456") {
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 400 });
  }

  if (databaseEnabled()) {
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
  }

  return NextResponse.json({ ok: true });
}
