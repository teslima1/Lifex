// GET  /api/health-tips — public listing of published tips
// POST /api/health-tips — admin creates a tip
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all"); // ?all=true for admin (includes drafts)

  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  const tips = await db.healthTip.findMany({
    where: (all && isAdmin) ? {} : { isPublished: true },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ data: tips });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { title, slug, content, excerpt, category, imageUrl, isPublished } = body as Record<string, unknown>;
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  // Auto-generate slug from title if not provided
  const finalSlug = slug
    ? String(slug)
    : String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const tip = await db.healthTip.create({
    data: {
      title:       String(title),
      slug:        finalSlug,
      content:     String(content),
      excerpt:     excerpt     ? String(excerpt)   : undefined,
      category:    category    ? String(category)  : undefined,
      imageUrl:    imageUrl    ? String(imageUrl)  : undefined,
      isPublished: isPublished ? Boolean(isPublished) : false,
      publishedAt: isPublished ? new Date() : undefined,
      authorId:    session.sub,
    },
  });

  return NextResponse.json({ data: tip }, { status: 201 });
}
