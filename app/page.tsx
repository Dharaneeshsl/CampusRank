import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCityLeaderboard } from "@/lib/data";
import { formatScore } from "@/lib/utils";

export default async function HomePage() {
  const colleges = await getCityLeaderboard("Coimbatore");

  return (
    <main>
      <section className="campus-grid border-b border-white/10 bg-transparent">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Built for college coding culture
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-normal sm:text-6xl">
              CampusRank
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              A hyperlocal leaderboard where students connect LeetCode, Codeforces, and HackerRank,
              then compete inside their own college and across the city.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Join your college leaderboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/city/Coimbatore">View Coimbatore rankings</Link>
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-white/10 text-white">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                City leaderboard preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {colleges.slice(0, 5).map((college, index) => (
                <Link
                  key={college.slug}
                  href={`/leaderboard/${college.slug}`}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/10 p-4 transition-colors hover:bg-white/15"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/10 font-bold">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-semibold">{college.name}</div>
                      <div className="text-sm text-muted-foreground">{college.students} ranked students</div>
                    </div>
                  </div>
                  <div className="text-xl font-black">{formatScore(college.averageScore)}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Register", "Use a verified college email so every leaderboard stays isolated."],
            ["Connect", "Add coding profiles and pull public platform activity into one score."],
            ["Compete", "Track ranks, AI insights, and college-vs-college movement weekly."]
          ].map(([title, copy]) => (
            <Card key={title}>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{copy}</CardContent>
            </Card>
          ))}
        </div>
        <div className="glass-panel mt-10 rounded-lg p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">Demo college: PSG College of Technology</h2>
              <p className="mt-2 text-muted-foreground">Open the full leaderboard with AI insight and ranked profiles.</p>
            </div>
            <Button asChild variant="accent">
              <Link href="/leaderboard/psg-college-of-technology">
                <Building2 className="h-4 w-4" />
                Open leaderboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
