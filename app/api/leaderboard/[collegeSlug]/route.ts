import { NextResponse } from "next/server";
import { getCollegeLeaderboard } from "@/lib/data";

export async function GET(_: Request, { params }: { params: { collegeSlug: string } }) {
  const data = await getCollegeLeaderboard(params.collegeSlug);
  return NextResponse.json(data ?? { error: "College not found" }, { status: data ? 200 : 404 });
}
