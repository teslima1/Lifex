// GET /api/special-requests — admin only
// POST /api/special-requests — public guest submission
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type   = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type)   where.type   = type;

  const requests = await db.specialRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: requests });
}

export async function POST(req: NextRequest) {
  // Public endpoint — no auth required
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { guestName, guestEmail, guestPhone, type, details } = body as Record<string, unknown>;

  if (!guestName || !guestEmail || !guestPhone || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const VALID_TYPES = ["HOME_VISIT", "HOSPITAL_ASSIST", "MEDICAL_TOURISM"];
  if (!VALID_TYPES.includes(String(type))) {
    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  }

  const request = await db.specialRequest.create({
    data: {
      guestName:  String(guestName),
      guestEmail: String(guestEmail),
      guestPhone: String(guestPhone),
      type:       String(type) as any,
      details:    (details as object) ?? {},
      status:     "PENDING",
    },
  });

  return NextResponse.json({ data: request }, { status: 201 });
}
