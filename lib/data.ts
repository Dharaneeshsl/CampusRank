import { prisma } from "./prisma";
import { collegeRows, colleges, demoDevelopers, demoLeaderboard } from "./demo-data";

function isPrismaReady() {
  return process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
}

export async function getCityLeaderboard(city = "Coimbatore") {
  if (!isPrismaReady()) {
    return collegeRows()
      .filter((college) => college.city.toLowerCase() === city.toLowerCase())
      .sort((a, b) => b.averageScore - a.averageScore);
  }

  try {
    const records = await prisma.college.findMany({
      where: { city: { equals: city, mode: "insensitive" } },
      include: { users: { include: { developer: true } } }
    });

    return records
      .map((college) => {
        const developers = college.users.map((user) => user.developer).filter(Boolean);
        const averageScore =
          developers.reduce((sum, developer) => sum + (developer?.totalScore ?? 0), 0) /
          Math.max(developers.length, 1);
        const top = developers.sort((a, b) => (b?.totalScore ?? 0) - (a?.totalScore ?? 0))[0];
        return {
          name: college.name,
          slug: college.slug,
          domain: college.domain,
          city: college.city,
          state: college.state,
          logo: college.logo,
          students: developers.length,
          averageScore: Number(averageScore.toFixed(1)),
          topStudent: top
            ? { name: college.users.find((user) => user.developer?.id === top.id)?.name ?? "Top student" }
            : { name: "No students yet" }
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  } catch {
    console.warn("Falling back to demo city leaderboard");
    return collegeRows()
      .filter((college) => college.city.toLowerCase() === city.toLowerCase())
      .sort((a, b) => b.averageScore - a.averageScore);
  }
}

export async function getCollegeLeaderboard(collegeSlug: string) {
  if (!isPrismaReady()) {
    const college = colleges.find((item) => item.slug === collegeSlug) ?? colleges[0];
    return {
      college,
      rows: demoLeaderboard(college.slug),
      insight:
        "PSG has a deep contest bench with LeetCode consistency improving week over week. The next lift is bringing HackerRank badge depth closer to its Codeforces strength."
    };
  }

  try {
    const college = await prisma.college.findUnique({
      where: { slug: collegeSlug },
      include: {
        aiInsight: true,
        users: {
          include: {
            developer: { include: { scoreHistory: { orderBy: { recordedAt: "asc" } } } }
          }
        }
      }
    });

    if (!college) return null;

    return {
      college,
      rows: college.users
        .filter((user) => user.developer)
        .map((user) => ({ ...user.developer!, name: user.name, email: user.email }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((row, index) => ({ ...row, rank: index + 1 })),
      insight: college.aiInsight?.weeklyReport ?? "AI insight will appear after the weekly report job runs."
    };
  } catch {
    console.warn("Falling back to demo college leaderboard");
    const college = colleges.find((item) => item.slug === collegeSlug) ?? colleges[0];
    return {
      college,
      rows: demoLeaderboard(college.slug),
      insight:
        "PSG has a deep contest bench with LeetCode consistency improving week over week. The next lift is bringing HackerRank badge depth closer to its Codeforces strength."
    };
  }
}

export async function getDeveloperProfile(username: string) {
  if (!isPrismaReady()) {
    return demoDevelopers.find((developer) => developer.username === username) ?? demoDevelopers[0];
  }

  try {
    const developer = await prisma.developer.findUnique({
      where: { username },
      include: {
        user: { include: { college: true } },
        scoreHistory: { orderBy: { recordedAt: "asc" } }
      }
    });

    return developer;
  } catch {
    console.warn("Falling back to demo developer profile");
    return demoDevelopers.find((developer) => developer.username === username) ?? demoDevelopers[0];
  }
}

export async function getDashboardDeveloper() {
  return getDeveloperProfile("aaravraman");
}
