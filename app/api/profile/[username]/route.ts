import { NextResponse } from "next/server";
import { getDeveloperProfile } from "@/lib/data";
import { requireUser } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { username: string } }) {
  const access = await requireUser();
  if ("response" in access) return access.response;
  const data = await getDeveloperProfile(params.username);
  return NextResponse.json(data ?? { error: "Profile not found" }, { status: data ? 200 : 404 });
}
