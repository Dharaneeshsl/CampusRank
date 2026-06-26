import { NextResponse } from "next/server";
import { collegeInsight } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return NextResponse.json({ report: await collegeInsight(body) });
}
