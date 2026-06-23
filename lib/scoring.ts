export type LeetCodeStats = {
  easy: number;
  medium: number;
  hard: number;
  contestRating?: number | null;
};

export type CodeforcesStats = {
  rating?: number | null;
  contests: number;
};

export type HackerRankStats = {
  badges: number;
  stars: number;
};

export type ConsistencyStats = {
  activeDays: number;
  longestStreak: number;
};

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
}

export function scoreLeetCode(stats: LeetCodeStats) {
  return clampScore(
    stats.easy * 1 +
      stats.medium * 3 +
      stats.hard * 5 +
      Math.min((stats.contestRating ?? 0) / 40, 50)
  );
}

export function scoreCodeforces(stats: CodeforcesStats) {
  return clampScore(Math.min((stats.rating ?? 0) / 30, 100) + stats.contests * 2);
}

export function scoreHackerRank(stats: HackerRankStats) {
  return clampScore(stats.badges * 5 + stats.stars * 3);
}

export function scoreConsistency(stats: ConsistencyStats) {
  return clampScore(stats.activeDays * 2 + stats.longestStreak * 1.5);
}

export function totalScore(scores: {
  leetcodeScore: number;
  codeforcesScore: number;
  hackerrankScore: number;
  consistencyScore: number;
}) {
  return clampScore(
    scores.leetcodeScore * 0.35 +
      scores.codeforcesScore * 0.35 +
      scores.hackerrankScore * 0.2 +
      scores.consistencyScore * 0.1
  );
}
