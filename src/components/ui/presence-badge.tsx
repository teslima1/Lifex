"use client";
import { cn } from "@/lib/utils";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

const STATUS_COLOR: Record<PresenceStatus, string> = {
  online:  "bg-green-500",
  away:    "bg-amber-400",
  busy:    "bg-red-500",
  offline: "bg-gray-300",
};

const STATUS_LABEL: Record<PresenceStatus, string> = {
  online:  "Online",
  away:    "Away",
  busy:    "Busy",
  offline: "Offline",
};

interface PresenceBadgeProps {
  status: PresenceStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function PresenceBadge({ status, size = "sm", showLabel = false, className }: PresenceBadgeProps) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("rounded-full shrink-0 ring-2 ring-white", dot, STATUS_COLOR[status])} />
      {showLabel && (
        <span className="text-xs text-gray-500">{STATUS_LABEL[status]}</span>
      )}
    </span>
  );
}

export { STATUS_LABEL };
