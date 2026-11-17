import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceTypeSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  // Admin can see all; public sees active only
  const session = all ? await getSession() : null;
  const showAll = all && session?.role === "ADMIN";

  const services = await db.serviceType.findMany({
    where: showAll ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: services });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = serviceTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const service = await db.serviceType.create({ data: parsed.data });
  return NextResponse.json({ data: service }, { status: 201 });
}
