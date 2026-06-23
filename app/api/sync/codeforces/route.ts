import { NextResponse } from "next/server";
import { fetchCodeforces } from "@/lib/fetchers/codeforces";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = body.username ?? "tourist";
  const result = await fetchCodeforces(username);
  return NextResponse.json(result);
}
