import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "CampusRank",
    time: new Date().toISOString()
  });
}
