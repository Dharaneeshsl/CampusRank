import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { colleges } from "@/lib/demo-data";
import { slugify } from "@/lib/utils";

function acceptsDomain(domain: string) {
  return domain.endsWith(".ac.in") || colleges.some((college) => college.domain === domain);
}

function databaseEnabled() {
  return process.env.USE_DATABASE === "true" && Boolean(process.env.DATABASE_URL);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "Invalid registration request" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "").toLowerCase();
  const password = String(form.get("password") ?? "");
  const domain = email.split("@")[1] ?? "";

  if (!name || !email || password.length < 6 || !acceptsDomain(domain)) {
    return NextResponse.json({ ok: false, error: "Invalid registration details" }, { status: 400 });
  }

  if (!databaseEnabled()) {
    return NextResponse.json({ ok: true, otp: "123456", demo: true });
  }

  const seededCollege = colleges.find((college) => college.domain === domain);
  const college = await prisma.college.upsert({
    where: { domain },
    update: {},
    create: {
      name: seededCollege?.name ?? `${domain.split(".")[0].toUpperCase()} College`,
      slug: seededCollege?.slug ?? slugify(domain.replace(/\./g, "-")),
      domain,
      city: seededCollege?.city ?? "Coimbatore",
      state: seededCollege?.state ?? "Tamil Nadu",
      logo: seededCollege?.logo ?? domain.slice(0, 3).toUpperCase()
    }
  });

  const hashedPassword = await hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name, password: hashedPassword, collegeEmail: email, collegeId: college.id },
    create: {
      name,
      email,
      collegeEmail: email,
      password: hashedPassword,
      collegeId: college.id
    }
  });

  return NextResponse.json({ ok: true, otp: "123456" });
}
