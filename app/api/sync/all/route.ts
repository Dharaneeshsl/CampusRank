import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreCodeforces, scoreConsistency, scoreHackerRank, scoreLeetCode, totalScore } from "@/lib/scoring";
import { slugify } from "@/lib/utils";

function handleSignal(value: string, salt: number) {
  const chars = (value || "demo").split("");
  const raw = chars.reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + salt), 0);
  return raw;
}

function databaseEnabled() {
  return process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
}

function usernameFromEmail(email: string) {
  return slugify(email.split("@")[0] || "student") || "student";
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => new FormData());
  const email = String(form.get("email") ?? "").toLowerCase();
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

  const scores = {
    leetcodeScore,
    codeforcesScore,
    hackerrankScore,
    consistencyScore,
    totalScore: totalScore({ leetcodeScore, codeforcesScore, hackerrankScore, consistencyScore })
  };

  if (databaseEnabled()) {
    const session = await auth();
    const userEmail = session?.user?.email ?? email;

    if (!userEmail) {
      return NextResponse.json({ ok: false, error: "Sign in before syncing scores" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const existingDeveloper = await prisma.developer.findUnique({ where: { userId: user.id } });
    let username = existingDeveloper?.username ?? usernameFromEmail(user.email);
    if (!existingDeveloper) {
      const usernameOwner = await prisma.developer.findUnique({ where: { username } });
      if (usernameOwner) username = `${username}-${user.id.slice(0, 6)}`;
    }

    const developer = await prisma.developer.upsert({
      where: { userId: user.id },
      update: {
        leetcodeUsername,
        codeforcesUsername,
        hackerrankUsername,
        ...scores
      },
      create: {
        userId: user.id,
        username,
        leetcodeUsername,
        codeforcesUsername,
        hackerrankUsername,
        ...scores
      }
    });

    await prisma.platformData.deleteMany({ where: { developerId: developer.id } });
    await prisma.platformData.createMany({
      data: [
        {
          developerId: developer.id,
          platform: "leetcode",
          rawData: { username: leetcodeUsername, signal: leetcodeSignal },
          processedScore: leetcodeScore
        },
        {
          developerId: developer.id,
          platform: "codeforces",
          rawData: { username: codeforcesUsername, signal: codeforcesSignal },
          processedScore: codeforcesScore
        },
        {
          developerId: developer.id,
          platform: "hackerrank",
          rawData: { username: hackerrankUsername, signal: hackerrankSignal },
          processedScore: hackerrankScore
        }
      ]
    });
    await prisma.scoreHistory.create({
      data: {
        developerId: developer.id,
        totalScore: scores.totalScore
      }
    });
  }

  return NextResponse.json({
    ok: true,
    profiles: { leetcodeUsername, codeforcesUsername, hackerrankUsername },
    scores
  });
}
