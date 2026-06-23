import { NextResponse } from "next/server";
import { fetchHackerRank } from "@/lib/fetchers/hackerrank";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = body.username ?? "aaravraman";
  const result = await fetchHackerRank(username);
  return NextResponse.json(result);
}
