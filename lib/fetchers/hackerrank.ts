import { scoreHackerRank } from "../scoring";

export async function fetchHackerRank(username: string) {
  const response = await fetch(`https://www.hackerrank.com/${username}`, {
    next: { revalidate: 3600 }
  });
  const html = await response.text();
  const badges = (html.match(/badge/gi) ?? []).length;
  const stars = (html.match(/star/gi) ?? []).length;
  const stats = { badges: Math.min(badges, 20), stars: Math.min(stars, 30) };

  return { stats, score: scoreHackerRank(stats), raw: { htmlLength: html.length, badges, stars } };
}
