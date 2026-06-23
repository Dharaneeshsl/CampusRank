import { NextResponse } from "next/server";
import { getCityLeaderboard } from "@/lib/data";

export async function GET(_: Request, { params }: { params: { cityName: string } }) {
  return NextResponse.json(await getCityLeaderboard(decodeURIComponent(params.cityName)));
}
