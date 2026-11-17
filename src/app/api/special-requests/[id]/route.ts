// PATCH /api/special-requests/[id] — admin updates status, notes, quoted price
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const { status, staffNotes, quotedPrice } = body as {
    status?: string;
    staffNotes?: string;
    quotedPrice?: number;
  };

  const updated = await db.specialRequest.update({
    where: { id },
    data: {
      ...(status      ? { status: status as any }  : {}),
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      ...(quotedPrice !== undefined ? { quotedPrice } : {}),
    },
  });

  return NextResponse.json({ data: updated });
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
  await db.specialRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
