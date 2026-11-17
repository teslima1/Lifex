// In-memory presence store. Resets on cold start (acceptable for small clinic).
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

interface PresenceEntry {
  status: PresenceStatus;
  updatedAt: number; // epoch ms
  manual: boolean;   // true = user explicitly set this status
}

// Module-level store — persists across requests in the same Node process
const store = new Map<string, PresenceEntry>();
const STALE_MS = 90_000; // 90 s without heartbeat → offline

function isOnline(entry: PresenceEntry): boolean {
  if (entry.manual && entry.status === "offline") return false;
  if (!entry.manual && Date.now() - entry.updatedAt > STALE_MS) return false;
  return true;
}

function resolveStatus(entry: PresenceEntry): PresenceStatus {
  if (!isOnline(entry)) return "offline";
  return entry.status;
}

// GET /api/presence?userIds=id1,id2,...
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("userIds")?.split(",").filter(Boolean) ?? [];

  const result: Record<string, PresenceStatus> = {};
  for (const id of ids) {
    const entry = store.get(id);
    result[id] = entry ? resolveStatus(entry) : "offline";
  }

  return NextResponse.json({ data: result }, {
    headers: { "Cache-Control": "no-store" },
  });
}

// POST /api/presence  body: { status?: PresenceStatus, heartbeat?: true }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { status, heartbeat } = body as { status?: PresenceStatus; heartbeat?: boolean };

  const existing = store.get(session.sub);

  if (heartbeat) {
    // Just refresh timestamp unless manually set to offline
    const currentStatus = existing?.status ?? "online";
    const isManual = existing?.manual ?? false;
    store.set(session.sub, {
      status: isManual ? currentStatus : "online",
      updatedAt: Date.now(),
      manual: isManual,
    });
  } else if (status) {
    store.set(session.sub, {
      status,
      updatedAt: Date.now(),
      manual: true,
    });
  }

  return NextResponse.json({ ok: true });
}
