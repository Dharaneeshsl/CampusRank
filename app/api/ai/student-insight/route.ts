import { NextResponse } from "next/server";
import { studentInsight } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ insight: await studentInsight(body) });
}
