import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tips = await db.healthTip.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ data: tips });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, slug, content, excerpt, category, imageUrl, isPublished } = body;

  if (!title?.trim() || !content?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title, slug and content are required" }, { status: 400 });
  }

  const tip = await db.healthTip.create({
    data: {
      title:       title.trim(),
      slug:        slug.trim(),
      content:     content.trim(),
      excerpt:     excerpt?.trim() || null,
      category:    category?.trim() || null,
      imageUrl:    imageUrl?.trim() || null,
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
      authorId:    session.sub,
    },
  });

  return NextResponse.json({ data: tip }, { status: 201 });
}
