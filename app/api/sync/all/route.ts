import { NextResponse } from "next/server";
import { scoreCodeforces, scoreConsistency, scoreHackerRank, scoreLeetCode, totalScore } from "@/lib/scoring";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => new FormData());
  const leetcodeUsername = String(form.get("leetcodeUsername") ?? "demo");
  const codeforcesUsername = String(form.get("codeforcesUsername") ?? "demo");
  const hackerrankUsername = String(form.get("hackerrankUsername") ?? "demo");

  const leetcodeScore = scoreLeetCode({ easy: 38, medium: 24, hard: 8, contestRating: 1680 });
  const codeforcesScore = scoreCodeforces({ rating: 1540, contests: 18 });
  const hackerrankScore = scoreHackerRank({ badges: 10, stars: 8 });
  const consistencyScore = scoreConsistency({ activeDays: 22, longestStreak: 9 });

  return NextResponse.json({
    ok: true,
    profiles: { leetcodeUsername, codeforcesUsername, hackerrankUsername },
    scores: {
      leetcodeScore,
      codeforcesScore,
      hackerrankScore,
      consistencyScore,
      totalScore: totalScore({ leetcodeScore, codeforcesScore, hackerrankScore, consistencyScore })
    }
  });
}
