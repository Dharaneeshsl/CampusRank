import { NextResponse } from "next/server";
import { studentInsight } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return NextResponse.json({ insight: await studentInsight(body) });
}
