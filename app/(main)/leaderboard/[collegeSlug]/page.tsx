import { Brain, Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCollegeLeaderboard } from "@/lib/data";

export default async function CollegeLeaderboardPage({ params }: { params: { collegeSlug: string } }) {
  const data = await getCollegeLeaderboard(params.collegeSlug);
  if (!data) return <main className="p-10">College not found.</main>;

  const mostImproved = data.rows[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md border border-white/20 bg-white text-lg font-black text-black">
            {data.college.logo ?? data.college.name.slice(0, 3)}
          </div>
          <p className="font-semibold text-primary">{data.college.city} college leaderboard</p>
          <h1 className="text-4xl font-black">{data.college.name}</h1>
          <p className="mt-2 text-muted-foreground">Top students ranked by weighted platform score.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name" />
          </div>
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            Platform strength
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <LeaderboardTable rows={data.rows} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI college insight
              </CardTitle>
            </CardHeader>
            <CardContent className="leading-7 text-muted-foreground">{data.insight}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Most improved
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mostImproved ? (
                <>
                  <div className="text-2xl font-black">{mostImproved.name}</div>
                  <p className="mt-2 text-muted-foreground">+8.4 points this week across contests and streak activity.</p>
                </>
              ) : (
                <p className="text-muted-foreground">No ranked students yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
