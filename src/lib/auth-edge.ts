/**
 * Edge Runtime-safe auth utilities.
 * No next/headers, no @prisma/client — only jose + NextRequest.
 * Used exclusively by proxy.ts (middleware).
 */
import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

export const COOKIE_NAME = "lifex_token";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lifex-secret-change-in-production-32chars"
);

export interface JWTPayload {
  sub: string;
  name: string;
  email: string;
  role: "ADMIN";
  iat?: number;
  exp?: number;
}

export async function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};
