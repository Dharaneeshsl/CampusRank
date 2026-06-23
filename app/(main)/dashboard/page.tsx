import Link from "next/link";
import { BarChart3, Brain, Code2, Medal, RefreshCw, Shield, Trophy } from "lucide-react";
import { HistoryChart } from "@/components/history-chart";
import { ScoreCard } from "@/components/score-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardDeveloper } from "@/lib/data";
import { studentInsight } from "@/lib/gemini";
import { formatScore } from "@/lib/utils";

export default async function DashboardPage() {
  const developer: any = await getDashboardDeveloper();
  const history = developer.history ?? developer.scoreHistory ?? [];
  const insight = await studentInsight({
    name: developer.name ?? developer.user?.name,
    score: developer.totalScore,
    rank: developer.rank ?? 1,
    leetcodeScore: developer.leetcodeScore,
    codeforcesScore: developer.codeforcesScore,
    hackerrankScore: developer.hackerrankScore
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-semibold text-primary">Student dashboard</p>
          <h1 className="text-4xl font-black">Hi, {developer.name ?? developer.user?.name}</h1>
          <p className="mt-2 text-muted-foreground">Rank #{developer.rank ?? 1} inside PSG College of Technology</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4" />
          Manual refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Total score" score={developer.totalScore} icon={Trophy} tone="border border-white/20 bg-white text-black" />
        <ScoreCard title="LeetCode" score={developer.leetcodeScore} icon={Code2} tone="border border-white/15 bg-white/10 text-white" />
        <ScoreCard title="Codeforces" score={developer.codeforcesScore} icon={BarChart3} tone="border border-white/15 bg-white/10 text-white" />
        <ScoreCard title="HackerRank" score={developer.hackerrankScore} icon={Shield} tone="border border-white/15 bg-white/10 text-white" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score history</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryChart data={history} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI performance insight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-7 text-muted-foreground">{insight}</p>
            <div className="rounded-md border border-white/10 bg-white/10 p-4">
              <div className="font-bold">What to improve</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Your fastest rank gain is HackerRank badges: reach {formatScore(developer.hackerrankScore + 6)} this week.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/leaderboard/psg-college-of-technology">
                <Medal className="h-4 w-4" />
                View college leaderboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
