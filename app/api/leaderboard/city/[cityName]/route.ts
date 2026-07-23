import { NextResponse } from "next/server";
import { getCityLeaderboard } from "@/lib/data";
import { requireUser } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { cityName: string } }) {
  const access = await requireUser();
  if ("response" in access) return access.response;
  return NextResponse.json(await getCityLeaderboard(decodeURIComponent(params.cityName)));
}
