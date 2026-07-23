import { prisma } from "../lib/prisma";

async function main() {
  await prisma.college.upsert({
    where: { domain: "psgtech.ac.in" },
    update: {
      name: "PSG College of Technology",
      slug: "psg-college-of-technology",
      city: "Coimbatore",
      state: "Tamil Nadu"
    },
    create: {
      name: "PSG College of Technology",
      slug: "psg-college-of-technology",
      domain: "psgtech.ac.in",
      city: "Coimbatore",
      state: "Tamil Nadu",
      logo: "PSG"
    }
  });

  console.info("Seeded PSG College of Technology (psgtech.ac.in).");
  console.info("Admin email allowlist: 24z218@psgtech.ac.in — register that address to unlock admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
