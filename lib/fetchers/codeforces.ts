import { scoreCodeforces } from "../scoring";

export async function fetchCodeforces(username: string) {
  const [infoResponse, ratingResponse] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${username}`, { next: { revalidate: 3600 } }),
    fetch(`https://codeforces.com/api/user.rating?handle=${username}`, { next: { revalidate: 3600 } })
  ]);

  const info = await infoResponse.json();
  const rating = await ratingResponse.json();
  const currentRating = info.result?.[0]?.rating ?? 0;
  const contests = Array.isArray(rating.result) ? rating.result.length : 0;
  const stats = { rating: currentRating, contests };

  return { stats, score: scoreCodeforces(stats), raw: { info, rating } };
}
