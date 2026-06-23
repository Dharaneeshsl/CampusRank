import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").toLowerCase();
  const otp = String(form.get("otp") ?? "");

  if (otp !== "123456") {
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 400 });
  }

  if (process.env.DATABASE_URL && email) {
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
  }

  return NextResponse.json({ ok: true });
}
