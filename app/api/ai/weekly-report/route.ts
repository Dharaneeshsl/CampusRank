import { NextResponse } from "next/server";
import { collegeInsight } from "@/lib/gemini";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ report: await collegeInsight(body) });
}
