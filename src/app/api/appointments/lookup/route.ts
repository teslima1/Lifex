import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/appointments/lookup?phone=xxx
 * Returns the most recent booking for this phone number.
 * Used by the booking form to auto-fill returning patient details.
 */
/** Strip all non-digits, then return the last 10 digits (the local number core). */
function coreDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10); // e.g. +2348165822979 → "8165822979", 08165822979 → "8165822979"
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone")?.trim();
  if (!phone || phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ data: null });
  }

  const core = coreDigits(phone);

  try {
    const last = await db.appointment.findFirst({
      where: { guestPhone: { endsWith: core } },
      orderBy: { createdAt: "desc" },
      select: {
        guestName:   true,
        guestEmail:  true,
        guestPhone:  true,
        guestGender: true,
        guestCountry: true,
      },
    });

    if (!last) return NextResponse.json({ data: null });

    // Parse name back into parts (best-effort)
    const nameParts = last.guestName.trim().split(" ");
    const title = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Alhaji", "Alhaja"]
      .find((t) => nameParts[0] === t) || "";
    const remaining = title ? nameParts.slice(1) : nameParts;
    const firstName  = remaining[0] || "";
    const lastName   = remaining.slice(1).join(" ") || "";

    return NextResponse.json({
      data: {
        title,
        firstName,
        lastName,
        email:   last.guestEmail,
        phone:   last.guestPhone,
        gender:  last.guestGender  || "",
        country: last.guestCountry || "Nigeria",
      },
    });
  } catch (err) {
    console.error("[Lookup]", err);
    return NextResponse.json({ data: null });
  }
}
