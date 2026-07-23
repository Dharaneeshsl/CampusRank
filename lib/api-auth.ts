import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return {
      response: NextResponse.json({ error: "Authentication is required." }, { status: 401 })
    } as const;
  }
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      isAdmin: Boolean(session.user.isAdmin) || isAdminEmail(session.user.email)
    }
  } as const;
}

export async function requireAdmin() {
  const result = await requireUser();
  if ("response" in result) return result;

  if (!result.user.isAdmin) {
    return {
      response: NextResponse.json({ error: "Administrator access is required." }, { status: 403 })
    } as const;
  }
  return result;
}
