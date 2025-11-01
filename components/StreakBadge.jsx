"use client";

import React from "react";

export default function StreakBadge({ task }) {
  const current = task?.currentStreak ?? 0;
  const best = task?.bestStreak ?? 0;
  return (
    <div className="flex items-center gap-2 text-sm" aria-hidden>
      <div className="px-2 py-0.5 rounded-md bg-white/6 text-white/90 text-xs" aria-label={`Current streak ${current}`}>
        🔥 {current}
      </div>
      <div className="px-2 py-0.5 rounded-md bg-white/3 text-white/70 text-xs" aria-label={`Best streak ${best}`}>
        🏆 {best}
      </div>
    </div>
  );
}
