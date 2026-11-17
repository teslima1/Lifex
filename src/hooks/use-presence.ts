"use client";
import { useEffect, useRef, useCallback } from "react";
import axios from "axios";

// Sends a heartbeat to keep current user marked as online.
// Call once at the top of any authenticated layout.
export function usePresenceHeartbeat() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const beat = useCallback(async () => {
    try { await axios.post("/api/presence", { heartbeat: true }); } catch {}
  }, []);

  useEffect(() => {
    beat(); // immediate on mount
    intervalRef.current = setInterval(beat, 45_000); // every 45 s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [beat]);
}
