import Link from "next/link";
import { Building2, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCityLeaderboard } from "@/lib/data";
import { cityInsight } from "@/lib/gemini";
import { formatScore } from "@/lib/utils";

export default async function CityPage({ params }: { params: { cityName: string } }) {
  const city = decodeURIComponent(params.cityName);
  const rows = await getCityLeaderboard(city);
  const insight = await cityInsight(
    city,
    rows.map((row) => `${row.name}: ${row.averageScore}`).join(", ")
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="font-semibold text-primary">City leaderboard</p>
        <h1 className="text-4xl font-black">{city} Top Colleges</h1>
        <p className="mt-2 text-muted-foreground">College-vs-college ranking by average student CampusRank score.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p className="leading-7 text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <Card key={row.slug}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/15 bg-white/10 text-lg font-black">
                  #{index + 1}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{row.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {row.students} students &middot; top performer {row.topStudent?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="text-2xl font-black">{formatScore(row.averageScore)}</div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Avg score</div>
                </div>
                <Button asChild variant="outline" size="icon">
                  <Link href={`/leaderboard/${row.slug}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            College ranking method
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Average score is calculated from ranked students in each college using the CampusRank scoring formula.
        </CardContent>
      </Card>
    </main>
  );
}
