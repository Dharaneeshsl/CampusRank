import { subDays } from "date-fns";

export const colleges = [
  {
    name: "PSG College of Technology",
    slug: "psg-college-of-technology",
    domain: "psgtech.ac.in",
    city: "Coimbatore",
    state: "Tamil Nadu",
    logo: "PSG"
  },
  {
    name: "Amrita University",
    slug: "amrita-university",
    domain: "cb.amrita.edu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    logo: "AU"
  },
  {
    name: "CIT Coimbatore",
    slug: "cit-coimbatore",
    domain: "citchennai.net",
    city: "Coimbatore",
    state: "Tamil Nadu",
    logo: "CIT"
  },
  {
    name: "SNS College",
    slug: "sns-college",
    domain: "snscollege.ac.in",
    city: "Coimbatore",
    state: "Tamil Nadu",
    logo: "SNS"
  },
  {
    name: "KPR Institute",
    slug: "kpr-institute",
    domain: "kpriet.ac.in",
    city: "Coimbatore",
    state: "Tamil Nadu",
    logo: "KPR"
  }
];

const names = [
  ["Aarav Raman", "aaravraman", "psg-college-of-technology", 92, 88, 74, 86],
  ["Maya Krishnan", "mayak", "psg-college-of-technology", 78, 95, 70, 91],
  ["Nikhil Rao", "nikhilrao", "psg-college-of-technology", 86, 81, 78, 82],
  ["Diya Iyer", "diyai", "amrita-university", 84, 79, 90, 88],
  ["Vikram S", "vikrams", "amrita-university", 74, 92, 80, 84],
  ["Janani V", "jananiv", "amrita-university", 90, 76, 72, 79],
  ["Kavin Prakash", "kavinp", "cit-coimbatore", 70, 88, 68, 76],
  ["Ishaan Menon", "ishaanm", "cit-coimbatore", 82, 74, 86, 72],
  ["Rhea Thomas", "rheat", "sns-college", 76, 70, 91, 84],
  ["Surya Narayan", "suryan", "sns-college", 68, 82, 77, 78],
  ["Meera Selvam", "meeras", "kpr-institute", 80, 77, 73, 90],
  ["Arjun Dev", "arjund", "kpr-institute", 72, 84, 69, 80]
] as const;

export const demoDevelopers = names.map(
  ([name, username, collegeSlug, leetcodeScore, codeforcesScore, hackerrankScore, consistencyScore], index) => {
    const totalScore =
      leetcodeScore * 0.35 +
      codeforcesScore * 0.35 +
      hackerrankScore * 0.2 +
      consistencyScore * 0.1;

    return {
      name,
      username,
      collegeSlug,
      email: `${username}@${colleges.find((college) => college.slug === collegeSlug)?.domain}`,
      leetcodeUsername: username,
      codeforcesUsername: username,
      hackerrankUsername: username,
      leetcodeScore,
      codeforcesScore,
      hackerrankScore,
      consistencyScore,
      totalScore: Number(totalScore.toFixed(1)),
      rank: index + 1,
      history: Array.from({ length: 30 }, (_, day) => ({
        date: subDays(new Date(), 29 - day),
        score: Number((totalScore - 8 + day * 0.28 + Math.sin(day + index) * 2).toFixed(1))
      }))
    };
  }
);

export function collegeRows() {
  return colleges.map((college) => {
    const developers = demoDevelopers.filter((developer) => developer.collegeSlug === college.slug);
    const averageScore =
      developers.reduce((total, developer) => total + developer.totalScore, 0) / developers.length;
    return {
      ...college,
      students: developers.length,
      averageScore: Number(averageScore.toFixed(1)),
      topStudent: developers.sort((a, b) => b.totalScore - a.totalScore)[0]
    };
  });
}

export function demoLeaderboard(collegeSlug = "psg-college-of-technology") {
  return demoDevelopers
    .filter((developer) => developer.collegeSlug === collegeSlug)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((developer, index) => ({ ...developer, rank: index + 1 }));
}
