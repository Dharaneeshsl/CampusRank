import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchLeetCode } from "@/lib/fetchers/leetcode";
import { fetchCodeforces } from "@/lib/fetchers/codeforces";
import { fetchHackerRank } from "@/lib/fetchers/hackerrank";
import { scoreConsistency, totalScore } from "@/lib/scoring";
import { slugify } from "@/lib/utils";

const handle = (value: FormDataEntryValue | null) => String(value ?? "").trim();
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: "Authentication is required." }, { status: 401 });
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const leetcodeUsername = handle(form.get("leetcodeUsername")); const codeforcesUsername = handle(form.get("codeforcesUsername")); const hackerrankUsername = handle(form.get("hackerrankUsername"));
  if (!leetcodeUsername || !codeforcesUsername || !hackerrankUsername || [leetcodeUsername, codeforcesUsername, hackerrankUsername].some((name) => name.length > 100)) return NextResponse.json({ ok: false, error: "Enter valid usernames for all platforms." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.emailVerified) return NextResponse.json({ ok: false, error: "Verify your college email before syncing." }, { status: 403 });
  const [leetcode, codeforces, hackerrank] = await Promise.all([fetchLeetCode(leetcodeUsername), fetchCodeforces(codeforcesUsername), fetchHackerRank(hackerrankUsername)]);
  const consistencyScore = scoreConsistency({ activeDays: 0, longestStreak: 0 });
  const scores = { leetcodeScore: leetcode.score, codeforcesScore: codeforces.score, hackerrankScore: hackerrank.score, consistencyScore, totalScore: totalScore({ leetcodeScore: leetcode.score, codeforcesScore: codeforces.score, hackerrankScore: hackerrank.score, consistencyScore }) };
  const existing = await prisma.developer.findUnique({ where: { userId: user.id } }); let username = existing?.username ?? (slugify(user.email.split("@")[0]) || "student");
  if (!existing && await prisma.developer.findUnique({ where: { username } })) username = `${username}-${user.id.slice(-6)}`;
  const developer = await prisma.developer.upsert({ where: { userId: user.id }, update: { leetcodeUsername, codeforcesUsername, hackerrankUsername, ...scores }, create: { userId: user.id, username, leetcodeUsername, codeforcesUsername, hackerrankUsername, ...scores } });
  await prisma.platformData.deleteMany({ where: { developerId: developer.id } });
  await prisma.platformData.createMany({ data: [{ developerId: developer.id, platform: "leetcode", rawData: leetcode.raw, processedScore: leetcode.score }, { developerId: developer.id, platform: "codeforces", rawData: codeforces.raw, processedScore: codeforces.score }, { developerId: developer.id, platform: "hackerrank", rawData: hackerrank.raw, processedScore: hackerrank.score }] });
  await prisma.scoreHistory.create({ data: { developerId: developer.id, totalScore: scores.totalScore } });
  return NextResponse.json({ ok: true, profiles: { leetcodeUsername, codeforcesUsername, hackerrankUsername }, scores });
}