import { NextResponse } from "next/server";
import { studentInsight } from "@/lib/gemini";
import { requireUser } from "@/lib/api-auth";

export async function POST(request: Request) {
  const access = await requireUser();
  if ("response" in access) return access.response;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  return NextResponse.json({ insight: await studentInsight(body) });
}
