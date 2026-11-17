import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";

interface CardProps {
  className?: string;
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ className, children, padding = "md" }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", paddings[padding], className)}>
      {children}
    </div>
  );
}

function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h2>
  );
}

function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  note?: string;
  color?: "green" | "teal" | "amber" | "red" | "gray";
  className?: string;
  href?: string; // optional — makes the card a clickable link
}

function StatCard({ label, value, icon, trend, note, color = "green", className, href }: StatCardProps) {
  const colors = {
    green: "bg-[#E8F5EE] text-[#1A5C38]",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };

  const inner = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
        {note && !trend && (
          <p className="text-xs mt-1 text-gray-500">{note}</p>
        )}
      </div>
      {icon && (
        <div className={cn("p-3 rounded-lg", colors[color])}>
          {icon}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={cn("hover:shadow-md hover:border-[#1A5C38]/30 transition-all cursor-pointer", className)}>
          {inner}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      {inner}
    </Card>
  );
}

export { Card, CardHeader, CardTitle, CardContent, StatCard };
