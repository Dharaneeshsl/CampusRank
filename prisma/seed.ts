import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { colleges, demoDevelopers } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  for (const college of colleges) {
    await prisma.college.upsert({
      where: { domain: college.domain },
      update: college,
      create: college
    });
  }

  const password = await hash("campusrank123", 10);

  for (const developer of demoDevelopers) {
    const college = await prisma.college.findUniqueOrThrow({
      where: { slug: developer.collegeSlug }
    });

    const user = await prisma.user.upsert({
      where: { email: developer.email },
      update: {},
      create: {
        name: developer.name,
        email: developer.email,
        collegeEmail: developer.email,
        password,
        emailVerified: true,
        collegeId: college.id
      }
    });

    const dev = await prisma.developer.upsert({
      where: { username: developer.username },
      update: {
        totalScore: developer.totalScore,
        leetcodeScore: developer.leetcodeScore,
        codeforcesScore: developer.codeforcesScore,
        hackerrankScore: developer.hackerrankScore,
        consistencyScore: developer.consistencyScore,
        rank: developer.rank
      },
      create: {
        userId: user.id,
        username: developer.username,
        leetcodeUsername: developer.leetcodeUsername,
        codeforcesUsername: developer.codeforcesUsername,
        hackerrankUsername: developer.hackerrankUsername,
        totalScore: developer.totalScore,
        leetcodeScore: developer.leetcodeScore,
        codeforcesScore: developer.codeforcesScore,
        hackerrankScore: developer.hackerrankScore,
        consistencyScore: developer.consistencyScore,
        rank: developer.rank
      }
    });

    await prisma.scoreHistory.deleteMany({ where: { developerId: dev.id } });
    for (const point of developer.history) {
      await prisma.scoreHistory.create({
        data: {
          developerId: dev.id,
          totalScore: point.score,
          recordedAt: point.date
        }
      });
    }
  }

  for (const college of colleges) {
    const record = await prisma.college.findUniqueOrThrow({ where: { slug: college.slug } });
    await prisma.leaderboard.upsert({
      where: { collegeId: record.id },
      update: {},
      create: { collegeId: record.id }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
