import { NextResponse } from "next/server";

// Registration is disabled — the clinic uses a single admin account.
// Use `npm run seed` to create or reset the admin user.
export async function POST() {
  return NextResponse.json(
    { error: "Registration is not available. This is a clinic staff portal." },
    { status: 403 }
  );
}
