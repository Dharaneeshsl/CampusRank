import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatScore, initials } from "@/lib/utils";

export function LeaderboardTable({ rows }: { rows: any[] }) {
  return (
    <div className="glass-panel overflow-hidden rounded-lg">
      <div className="grid grid-cols-[64px_1.4fr_repeat(4,minmax(86px,1fr))] gap-3 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground max-lg:hidden">
        <span>Rank</span>
        <span>Student</span>
        <span>Total</span>
        <span>LeetCode</span>
        <span>Codeforces</span>
        <span>HackerRank</span>
      </div>
      {rows.map((row) => (
        <Link
          href={`/profile/${row.username}`}
          key={row.username}
          className="grid gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 hover:bg-white/10 lg:grid-cols-[64px_1.4fr_repeat(4,minmax(86px,1fr))] lg:items-center"
        >
          <div className="text-lg font-bold text-white">#{row.rank}</div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(row.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{row.name}</div>
              <div className="text-sm text-muted-foreground">@{row.username}</div>
            </div>
          </div>
          <ScorePill label="Total" value={row.totalScore} strong />
          <ScorePill label="LC" value={row.leetcodeScore} />
          <ScorePill label="CF" value={row.codeforcesScore} />
          <ScorePill label="HR" value={row.hackerrankScore} />
        </Link>
      ))}
    </div>
  );
}

function ScorePill({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-white/10 px-3 py-2 text-sm lg:block lg:bg-transparent lg:px-0 lg:py-0">
      <span className="font-medium text-muted-foreground lg:hidden">{label}</span>
      <span className={strong ? "text-xl font-bold" : "font-semibold"}>{formatScore(value)}</span>
    </div>
  );
}
