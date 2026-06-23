import { Linkedin, Share2, Twitter } from "lucide-react";
import { HistoryChart } from "@/components/history-chart";
import { ScoreCard } from "@/components/score-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeveloperProfile } from "@/lib/data";
import { studentInsight } from "@/lib/gemini";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile: any = await getDeveloperProfile(params.username);
  const name = profile.name ?? profile.user?.name;
  const insight = await studentInsight({
    name,
    score: profile.totalScore,
    rank: profile.rank ?? 1,
    leetcodeScore: profile.leetcodeScore,
    codeforcesScore: profile.codeforcesScore,
    hackerrankScore: profile.hackerrankScore
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-semibold text-primary">Public profile</p>
          <h1 className="text-4xl font-black">{name}</h1>
          <p className="mt-2 text-muted-foreground">@{profile.username} · Rank #{profile.rank ?? 1}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard title="Total" score={profile.totalScore} icon={Share2} tone="border border-white/20 bg-white text-black" />
        <ScoreCard title="LeetCode" score={profile.leetcodeScore} icon={Share2} tone="border border-white/15 bg-white/10 text-white" />
        <ScoreCard title="Codeforces" score={profile.codeforcesScore} icon={Share2} tone="border border-white/15 bg-white/10 text-white" />
        <ScoreCard title="HackerRank" score={profile.hackerrankScore} icon={Share2} tone="border border-white/15 bg-white/10 text-white" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryChart data={profile.history ?? profile.scoreHistory ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI profile summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 leading-7 text-muted-foreground">
            <p>{insight}</p>
            <div className="flex flex-wrap gap-2">
              {["Dynamic Programming", "Graphs", "Contest Speed", "SQL"].map((badge) => (
                <span key={badge} className="rounded-md border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  {badge}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
