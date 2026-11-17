// GET /api/appointments/[id]
// PATCH /api/appointments/[id] — admin updates status / staff notes
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const appt = await db.appointment.findUnique({
    where: { id },
    include: { serviceType: true },
  });
  if (!appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: appt });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, staffNotes } = body as { status?: string; staffNotes?: string };

  const appt = await db.appointment.update({
    where: { id },
    data: {
      ...(status     ? { status: status as any } : {}),
      ...(staffNotes !== undefined ? { staffNotes } : {}),
    },
    include: { serviceType: { select: { name: true } } },
  });

  return NextResponse.json({ data: appt });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await db.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
