import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, ROLE_REDIRECTS } from "@/lib/auth-edge";

// Routes accessible without any login
const PUBLIC_PATHS = ["/", "/login", "/book", "/requests", "/health-tips"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static files, API routes, and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(req);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin can only access /admin/*
  if (!pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS[session.role] ?? "/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
