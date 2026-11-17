"use client";
import React from "react";

interface TopbarProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 lg:ml-0 ml-12">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            typeof subtitle === "string"
              ? <p className="text-sm text-gray-500">{subtitle}</p>
              : <div className="flex items-center">{subtitle}</div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
