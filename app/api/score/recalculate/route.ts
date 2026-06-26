import { NextResponse } from "next/server";
import { totalScore } from "@/lib/scoring";

function validScores(body: unknown): body is {
  leetcodeScore: number;
  codeforcesScore: number;
  hackerrankScore: number;
  consistencyScore: number;
} {
  if (!body || typeof body !== "object") return false;
  const scores = body as Record<string, unknown>;
  return ["leetcodeScore", "codeforcesScore", "hackerrankScore", "consistencyScore"].every(
    (key) => typeof scores[key] === "number" && Number.isFinite(scores[key])
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!validScores(body)) {
    return NextResponse.json({ error: "Valid platform scores are required" }, { status: 400 });
  }

  return NextResponse.json({ totalScore: totalScore(body) });
}
