// src/components/dashboard-datetime.tsx
// Client component untuk render date/time - avoid hydration mismatch

"use client";

import { useEffect, useState } from "react";

export function DashboardDateTime() {
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const now = new Date();
    
    const date = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const time = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setDateStr(date);
    setTimeStr(time);
    setMounted(true);
  }, []);

  // Show placeholder while hydrating
  if (!mounted) {
    return <div className="h-12 bg-blue-100/50 rounded animate-pulse" />;
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-2 text-right">
      <p className="text-sm font-semibold text-blue-900">{dateStr}</p>
      <p className="mt-1 text-xs text-blue-700">{timeStr}</p>
    </div>
  );
}
