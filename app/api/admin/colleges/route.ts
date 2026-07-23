import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
const collegeSchema = z.object({ name: z.string().trim().min(2).max(120), domain: z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/), city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), logo: z.string().trim().max(12).optional() });
export async function GET() { const access = await requireAdmin(); if ("response" in access) return access.response; return NextResponse.json(await prisma.college.findMany({ orderBy: { name: "asc" } })); }
export async function POST(request: Request) { const access = await requireAdmin(); if ("response" in access) return access.response; const parsed = collegeSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid college details." }, { status: 400 }); const data = parsed.data; try { const college = await prisma.college.create({ data: { ...data, slug: slugify(data.name) } }); return NextResponse.json(college, { status: 201 }); } catch { return NextResponse.json({ error: "A college with this name or domain already exists." }, { status: 409 }); } }