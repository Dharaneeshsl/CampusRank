import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const databaseEnabled = process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
  let database: "disabled" | "connected" | "unreachable" = databaseEnabled ? "unreachable" : "disabled";

  if (databaseEnabled) {
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
    ai: process.env.USE_AI === "true" && Boolean(process.env.GEMINI_API_KEY) ? "enabled" : "disabled",
    time: new Date().toISOString()
  });
}
