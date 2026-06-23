import { NextResponse } from "next/server";
import { fetchLeetCode } from "@/lib/fetchers/leetcode";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = body.username ?? "aaravraman";
  const result = await fetchLeetCode(username);
  return NextResponse.json(result);
}
