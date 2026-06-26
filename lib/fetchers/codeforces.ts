import { scoreCodeforces } from "../scoring";

export async function fetchCodeforces(username: string) {
  const stats = { rating: 0, contests: 0 };

  try {
    const [infoResponse, ratingResponse] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, { next: { revalidate: 3600 } }),
      fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(username)}`, { next: { revalidate: 3600 } })
    ]);

    if (!infoResponse.ok || !ratingResponse.ok) {
      return {
        stats,
        score: scoreCodeforces(stats),
        raw: { error: `Codeforces returned ${infoResponse.status}/${ratingResponse.status}` }
      };
    }

    const info = await infoResponse.json();
    const rating = await ratingResponse.json();
    const currentRating = info.result?.[0]?.rating ?? 0;
    const contests = Array.isArray(rating.result) ? rating.result.length : 0;
    const resolvedStats = { rating: currentRating, contests };

    return { stats: resolvedStats, score: scoreCodeforces(resolvedStats), raw: { info, rating } };
  } catch (error) {
    return {
      stats,
      score: scoreCodeforces(stats),
      raw: { error: error instanceof Error ? error.message : "Codeforces fetch failed" }
    };
  }
}
