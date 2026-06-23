import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { totalScore } from "@/lib/scoring";
import { collegeInsight } from "@/lib/gemini";

export const syncAllPlatforms = inngest.createFunction(
  { id: "sync-all-platforms" },
  { cron: "0 2 * * *" },
  async ({ step }) => {
    const developers = await step.run("load developers", () =>
      prisma.developer.findMany({ include: { user: true } })
    );

    for (const developer of developers) {
      await step.run(`score ${developer.id}`, async () => {
        const score = totalScore(developer);
        await prisma.developer.update({
          where: { id: developer.id },
          data: { totalScore: score, scoreHistory: { create: { totalScore: score } } }
        });
      });
    }

    return { synced: developers.length };
  }
);

export const generateCollegeInsights = inngest.createFunction(
  { id: "generate-college-insights" },
  { cron: "0 6 * * MON" },
  async ({ step }) => {
    const colleges = await step.run("load colleges", () =>
      prisma.college.findMany({ include: { users: { include: { developer: true } } } })
    );

    for (const college of colleges) {
      await step.run(`insight ${college.id}`, async () => {
        const developers = college.users.map((user) => user.developer).filter(Boolean);
        const avg =
          developers.reduce((sum, developer) => sum + (developer?.totalScore ?? 0), 0) /
          Math.max(developers.length, 1);
        const report = await collegeInsight({
          name: college.name,
          city: college.city,
          averageScore: avg,
          mostActivePlatform: "Codeforces",
          topScores: developers
            .slice(0, 10)
            .map((developer) => developer?.totalScore)
            .join(", ")
        });

        await prisma.collegeInsight.upsert({
          where: { collegeId: college.id },
          update: { weeklyReport: report, insightText: report, topSkills: ["DP", "Graphs", "SQL"] },
          create: {
            collegeId: college.id,
            weeklyReport: report,
            insightText: report,
            topSkills: ["DP", "Graphs", "SQL"]
          }
        });
      });
    }

    return { generated: colleges.length };
  }
);
