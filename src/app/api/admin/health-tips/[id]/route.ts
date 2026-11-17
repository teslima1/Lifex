import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.title     !== undefined) updateData.title     = body.title.trim();
  if (body.slug      !== undefined) updateData.slug      = body.slug.trim();
  if (body.content   !== undefined) updateData.content   = body.content.trim();
  if (body.excerpt   !== undefined) updateData.excerpt   = body.excerpt?.trim() || null;
  if (body.category  !== undefined) updateData.category  = body.category?.trim() || null;
  if (body.imageUrl  !== undefined) updateData.imageUrl  = body.imageUrl?.trim() || null;
  if (body.isPublished !== undefined) {
    updateData.isPublished = body.isPublished;
    updateData.publishedAt = body.isPublished ? new Date() : null;
  }

  const tip = await db.healthTip.update({ where: { id }, data: updateData });
  return NextResponse.json({ data: tip });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.healthTip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
