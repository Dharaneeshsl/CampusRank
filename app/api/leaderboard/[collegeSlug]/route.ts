import { NextResponse } from "next/server";
import { getCollegeLeaderboard } from "@/lib/data";
import { requireUser } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { collegeSlug: string } }) {
  const access = await requireUser();
  if ("response" in access) return access.response;
  const data = await getCollegeLeaderboard(params.collegeSlug);
  return NextResponse.json(data ?? { error: "College not found" }, { status: data ? 200 : 404 });
}
