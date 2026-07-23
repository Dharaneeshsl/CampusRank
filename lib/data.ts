import { prisma } from "./prisma";
import { auth } from "./auth";

export async function getCityLeaderboard(city: string) {
  const records = await prisma.college.findMany({
    where: { city: { equals: city, mode: "insensitive" } },
    include: { users: { include: { developer: true } } }
  });
  return records.map((college) => {
    const developers = college.users.map((user) => user.developer).filter(Boolean);
    const averageScore = developers.reduce((sum, developer) => sum + (developer?.totalScore ?? 0), 0) / Math.max(developers.length, 1);
    const top = developers.sort((a, b) => (b?.totalScore ?? 0) - (a?.totalScore ?? 0))[0];
    return { ...college, students: developers.length, averageScore: Number(averageScore.toFixed(1)), topStudent: top ? { name: college.users.find((user) => user.developer?.id === top.id)?.name ?? "Top student" } : undefined };
  }).sort((a, b) => b.averageScore - a.averageScore);
}

export async function getCollegeLeaderboard(collegeSlug: string) {
  const college = await prisma.college.findUnique({ where: { slug: collegeSlug }, include: { aiInsight: true, users: { include: { developer: { include: { scoreHistory: { orderBy: { recordedAt: "asc" } } } } } } } });
  if (!college) return null;
  return { college, rows: college.users.filter((user) => user.developer).map((user) => ({ ...user.developer!, name: user.name, email: user.email })).sort((a, b) => b.totalScore - a.totalScore).map((row, index) => ({ ...row, rank: index + 1 })), insight: college.aiInsight?.weeklyReport ?? "Insights will appear after sufficient verified activity is available." };
}

export async function getDeveloperProfile(username: string) {
  return prisma.developer.findUnique({ where: { username }, include: { user: { include: { college: true } }, scoreHistory: { orderBy: { recordedAt: "asc" } } } });
}

export async function getDashboardDeveloper() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.developer.findFirst({ where: { user: { email: session.user.email } }, include: { user: { include: { college: true } }, scoreHistory: { orderBy: { recordedAt: "asc" } } } });
}