/**
 * Node.js auth utilities — Route Handlers and Server Components ONLY.
 * Do NOT import this in proxy.ts. Use auth-edge.ts there.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth-edge";
import type { JWTPayload } from "@/lib/auth-edge";

// Re-export everything the rest of the app needs from auth-edge
export {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  ROLE_REDIRECTS,
  signToken,
  verifyToken,
  getSessionFromRequest,
  type JWTPayload,
} from "@/lib/auth-edge";

// Get session server-side via next/headers cookies (Node.js only)
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Set auth cookie directly on a NextResponse
export function applyAuthCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res;
}

// Clear auth cookie on a NextResponse
export function clearAuthCookieOnResponse(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}

// Role guard helper
export function requireRole(session: JWTPayload | null, ...roles: string[]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}
