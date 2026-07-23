import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailDeliveryConfigured } from "@/lib/otp";

export async function GET() {
  let database: "connected" | "unreachable" | "unconfigured" = process.env.DATABASE_URL
    ? "unreachable"
    : "unconfigured";

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {
      database = "unreachable";
    }
  }

  return NextResponse.json({
    ok: true,
    app: "CampusRank",
    database,
    email: emailDeliveryConfigured() ? "configured" : "unconfigured",
    ai: process.env.USE_AI === "true" && Boolean(process.env.GEMINI_API_KEY) ? "enabled" : "disabled",
    time: new Date().toISOString()
  });
}
