import { scoreHackerRank } from "../scoring";

export async function fetchHackerRank(username: string) {
  const stats = { badges: 0, stars: 0 };

  try {
    const response = await fetch(`https://www.hackerrank.com/${encodeURIComponent(username)}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return { stats, score: scoreHackerRank(stats), raw: { error: `HackerRank returned ${response.status}` } };
    }

    const html = await response.text();
    const badges = (html.match(/badge/gi) ?? []).length;
    const stars = (html.match(/star/gi) ?? []).length;
    const resolvedStats = { badges: Math.min(badges, 20), stars: Math.min(stars, 30) };

    return { stats: resolvedStats, score: scoreHackerRank(resolvedStats), raw: { htmlLength: html.length, badges, stars } };
  } catch (error) {
    return {
      stats,
      score: scoreHackerRank(stats),
      raw: { error: error instanceof Error ? error.message : "HackerRank fetch failed" }
    };
  }
}
