// GET  /api/health-tips/[slug] — single tip by slug (public)
// PATCH /api/health-tips/[slug] — admin updates
// DELETE /api/health-tips/[slug] — admin deletes
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const tip = await db.healthTip.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!tip || !tip.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: tip });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));

  const updated = await db.healthTip.update({
    where: { slug },
    data: {
      ...body,
      publishedAt: body.isPublished && !body.publishedAt ? new Date() : body.publishedAt,
    },
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  await db.healthTip.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
