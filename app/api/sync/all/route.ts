import { NextResponse } from "next/server";
import { scoreCodeforces, scoreConsistency, scoreHackerRank, scoreLeetCode, totalScore } from "@/lib/scoring";

function handleSignal(value: string, salt: number) {
  const chars = (value || "demo").split("");
  const raw = chars.reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + salt), 0);
  return raw;
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => new FormData());
  const leetcodeUsername = String(form.get("leetcodeUsername") ?? "demo");
  const codeforcesUsername = String(form.get("codeforcesUsername") ?? "demo");
  const hackerrankUsername = String(form.get("hackerrankUsername") ?? "demo");

  const leetcodeSignal = handleSignal(leetcodeUsername, 3);
  const codeforcesSignal = handleSignal(codeforcesUsername, 5);
  const hackerrankSignal = handleSignal(hackerrankUsername, 7);

  const leetcodeScore = scoreLeetCode({
    easy: 18 + (leetcodeSignal % 42),
    medium: 10 + (leetcodeSignal % 28),
    hard: 3 + (leetcodeSignal % 12),
    contestRating: 1300 + (leetcodeSignal % 900)
  });
  const codeforcesScore = scoreCodeforces({
    rating: 1000 + (codeforcesSignal % 1300),
    contests: 6 + (codeforcesSignal % 24)
  });
  const hackerrankScore = scoreHackerRank({
    badges: 4 + (hackerrankSignal % 15),
    stars: 3 + (hackerrankSignal % 18)
  });
  const consistencyScore = scoreConsistency({
    activeDays: 12 + ((leetcodeSignal + codeforcesSignal) % 18),
    longestStreak: 4 + ((codeforcesSignal + hackerrankSignal) % 12)
  });

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
