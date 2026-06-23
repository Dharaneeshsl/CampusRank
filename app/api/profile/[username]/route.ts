import { NextResponse } from "next/server";
import { getDeveloperProfile } from "@/lib/data";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  const data = await getDeveloperProfile(params.username);
  return NextResponse.json(data ?? { error: "Profile not found" }, { status: data ? 200 : 404 });
}
