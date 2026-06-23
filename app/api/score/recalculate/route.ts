import { NextResponse } from "next/server";
import { totalScore } from "@/lib/scoring";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({
    leetcodeScore: 82,
    codeforcesScore: 88,
    hackerrankScore: 75,
    consistencyScore: 84
  }));
  return NextResponse.json({ totalScore: totalScore(body) });
}
