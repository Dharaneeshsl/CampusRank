import { GoogleGenerativeAI } from "@google/generative-ai";

function fallbackInsight(prompt: string) {
  const subject = prompt.includes("college") ? "The leaderboard" : "This profile";
  return `${subject} shows strong coding momentum across problem solving and contest practice. Focus next on the lowest platform score, because balanced growth lifts the weighted CampusRank score fastest. This week, schedule three focused practice blocks and refresh the score after the next contest or badge milestone.`;
}

export async function generateGeminiText(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackInsight(prompt);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini generation failed", error);
    return fallbackInsight(prompt);
  }
}

export async function studentInsight(input: {
  name: string;
  score: number;
  rank: number;
  leetcodeScore: number;
  codeforcesScore: number;
  hackerrankScore: number;
}) {
  return generateGeminiText(
    `Based on this student's coding data: LeetCode ${input.leetcodeScore}, Codeforces ${input.codeforcesScore}, HackerRank ${input.hackerrankScore}, total score ${input.score}, rank ${input.rank} in college. Generate a 3-sentence personalized insight about their strengths, what they should focus on next, and one specific actionable tip to improve their rank this week.`
  );
}

export async function collegeInsight(input: {
  name: string;
  city: string;
  averageScore: number;
  mostActivePlatform: string;
  topScores: string;
}) {
  return generateGeminiText(
    `Based on this college's leaderboard data: college name ${input.name}, city ${input.city}, top 10 students scores ${input.topScores}, average score ${input.averageScore}, most active platform ${input.mostActivePlatform}. Generate a weekly coding culture report for this college in 4 sentences covering overall performance, top performer highlight, platform trends, and one improvement suggestion for the college.`
  );
}

export async function cityInsight(city: string, collegeData: string) {
  return generateGeminiText(
    `Compare these colleges in ${city}: ${collegeData}. Generate a 2-sentence insight about which college leads in coding culture and why based on the data.`
  );
}
