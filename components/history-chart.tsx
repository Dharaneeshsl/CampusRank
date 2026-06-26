"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type HistoryPoint = {
  date?: Date | string;
  recordedAt?: Date | string;
  score?: number;
  totalScore?: number;
};

export function HistoryChart({ data }: { data: HistoryPoint[] }) {
  const rows = data
    .map((point) => {
      const date = point.date ?? point.recordedAt;
      const score = point.score ?? point.totalScore;

      if (!date || typeof score !== "number") return null;

      return {
        date: new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" }),
        score
      };
    })
    .filter((point): point is { date: string; score: number } => Boolean(point));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="score" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis domain={[40, 100]} tickLine={false} axisLine={false} width={34} />
          <Tooltip />
          <Area type="monotone" dataKey="score" stroke="#ffffff" strokeWidth={3} fill="url(#score)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
