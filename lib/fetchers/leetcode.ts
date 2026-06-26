import { scoreLeetCode, type LeetCodeStats } from "../scoring";

type LeetCodeResponse = {
  data?: {
    matchedUser?: {
      submitStats?: { acSubmissionNum: { difficulty: string; count: number }[] };
      userContestRanking?: { rating: number; attendedContestsCount: number } | null;
    };
  };
};

export async function fetchLeetCode(username: string) {
  const stats: LeetCodeStats = { easy: 0, medium: 0, hard: 0, contestRating: 0 };

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `query userStats($username: String!) {
          matchedUser(username: $username) {
            submitStats { acSubmissionNum { difficulty count } }
            userContestRanking { rating attendedContestsCount }
          }
        }`,
        variables: { username }
      }),
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return { stats, score: scoreLeetCode(stats), raw: { error: `LeetCode returned ${response.status}` } };
    }

    const json = (await response.json()) as LeetCodeResponse;
    const counts = json.data?.matchedUser?.submitStats?.acSubmissionNum ?? [];
    const resolvedStats: LeetCodeStats = {
      easy: counts.find((item) => item.difficulty === "Easy")?.count ?? 0,
      medium: counts.find((item) => item.difficulty === "Medium")?.count ?? 0,
      hard: counts.find((item) => item.difficulty === "Hard")?.count ?? 0,
      contestRating: json.data?.matchedUser?.userContestRanking?.rating ?? 0
    };
    return { stats: resolvedStats, score: scoreLeetCode(resolvedStats), raw: json };
  } catch (error) {
    return {
      stats,
      score: scoreLeetCode(stats),
      raw: { error: error instanceof Error ? error.message : "LeetCode fetch failed" }
    };
  }
}
