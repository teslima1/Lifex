// GET /api/appointments — list all (admin only)
// POST /api/appointments — guest creates a booking (no auth)
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
  const date   = searchParams.get("date"); // YYYY-MM-DD

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (date) {
    const start = new Date(date);
    const end   = new Date(date);
    end.setDate(end.getDate() + 1);
    where.slotDatetime = { gte: start, lt: end };
  }

  const appointments = await db.appointment.findMany({
    where,
    include: { serviceType: { select: { id: true, name: true } } },
    orderBy: { slotDatetime: "asc" },
  });

  return NextResponse.json({ data: appointments });
}

export async function POST(req: NextRequest) {
  // Public endpoint — no auth required
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    guestName, guestEmail, guestPhone,
    guestGender, guestCountry, numberOfPeople,
    serviceTypeId, slotDatetime, guestNotes,
  } = body as Record<string, string | number>;

  if (!guestName || !guestEmail || !guestPhone || !serviceTypeId || !slotDatetime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify service exists
  const service = await db.serviceType.findUnique({ where: { id: String(serviceTypeId) } });
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const appointment = await db.appointment.create({
    data: {
      guestName:     String(guestName),
      guestEmail:    String(guestEmail),
      guestPhone:    String(guestPhone),
      guestGender:   guestGender   ? String(guestGender)   : undefined,
      guestCountry:  guestCountry  ? String(guestCountry)  : undefined,
      numberOfPeople: numberOfPeople ? Number(numberOfPeople) : 1,
      serviceTypeId: String(serviceTypeId),
      slotDatetime:  new Date(String(slotDatetime)),
      guestNotes:    guestNotes    ? String(guestNotes)    : undefined,
      status:        "PENDING",
    },
    include: { serviceType: { select: { name: true } } },
  });

  return NextResponse.json({ data: appointment }, { status: 201 });
}
