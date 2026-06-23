"use client";

import Link from "next/link";
import { ArrowRight, Calculator, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatScore } from "@/lib/utils";

type SyncResult = {
  ok: boolean;
  profiles: {
    leetcodeUsername: string;
    codeforcesUsername: string;
    hackerrankUsername: string;
  };
  scores: {
    leetcodeScore: number;
    codeforcesScore: number;
    hackerrankScore: number;
    consistencyScore: number;
    totalScore: number;
  };
};

export default function LoginPage() {
  const [result, setResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/sync/all", { method: "POST", body: form });
    setResult(await response.json());
    setLoading(false);
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="font-semibold text-primary">Login and sync</p>
        <h1 className="mt-2 text-4xl font-black">Bring your coding profiles in immediately</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Enter your college login and coding handles here. CampusRank listens to those profile
          names, calculates the weighted score, and gets your leaderboard dashboard ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Student login and score sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">College email</Label>
                <Input id="email" name="email" type="email" placeholder="student@psgtech.ac.in" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your password" required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="leetcodeUsername">LeetCode</Label>
                <Input id="leetcodeUsername" name="leetcodeUsername" placeholder="leetcode handle" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeforcesUsername">Codeforces</Label>
                <Input id="codeforcesUsername" name="codeforcesUsername" placeholder="codeforces handle" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hackerrankUsername">HackerRank</Label>
                <Input id="hackerrankUsername" name="hackerrankUsername" placeholder="hackerrank handle" required />
              </div>
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              Calculate score
            </Button>
          </form>

          {result ? (
            <div className="mt-5 rounded-lg border border-white/10 bg-white/10 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">CampusRank score</div>
                  <div className="text-4xl font-black">{formatScore(result.scores.totalScore)}</div>
                </div>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
                <ScoreLine label="LeetCode" value={result.scores.leetcodeScore} />
                <ScoreLine label="Codeforces" value={result.scores.codeforcesScore} />
                <ScoreLine label="HackerRank" value={result.scores.hackerrankScore} />
                <ScoreLine label="Consistency" value={result.scores.consistencyScore} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{formatScore(value)}</div>
    </div>
  );
}
