import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  let settings = await db.clinicSettings.findFirst();
  if (!settings) {
    settings = await db.clinicSettings.create({
      data: {
        clinicName: "LIFEX Mobile Clinic",
        phone:      "+234 703 724 4339",
        email:      "lifexmobileclinic@gmail.com",
        whatsapp:   "+2347037244339",
      },
    });
  }
  return NextResponse.json({ data: settings }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { clinicName, tagline, address, phone, email, whatsapp, bankName, accountNumber, accountName, logoUrl } = body;

  if (!clinicName || !phone || !email) {
    return NextResponse.json({ error: "Clinic name, phone and email are required" }, { status: 400 });
  }

  const existing = await db.clinicSettings.findFirst();
  const settings = existing
    ? await db.clinicSettings.update({
        where: { id: existing.id },
        data: { clinicName, tagline, address, phone, email, whatsapp, bankName, accountNumber, accountName, logoUrl },
      })
    : await db.clinicSettings.create({
        data: { clinicName, tagline, address, phone, email, whatsapp, bankName, accountNumber, accountName, logoUrl },
      });

  return NextResponse.json({ data: settings });
}
