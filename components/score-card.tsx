import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatScore } from "@/lib/utils";

export function ScoreCard({
  title,
  score,
  icon: Icon,
  tone
}: {
  title: string;
  score: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-3xl font-bold">{formatScore(score)}</div>
        <Progress value={score} />
      </CardContent>
    </Card>
  );
}
