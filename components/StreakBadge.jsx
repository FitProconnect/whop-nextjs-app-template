"use client";

import React from "react";

export default function StreakBadge({ task }) {
  const current = task?.currentStreak ?? 0;
  const best = task?.bestStreak ?? 0;
  // Mark badge as new-best briefly if current equals best and best > 0
  const isNewBest = task && typeof task._justGotBest !== 'undefined' ? task._justGotBest : false;
  return (
    <div className="flex items-center gap-2 text-sm" aria-hidden>
      <div className={`px-2 py-0.5 rounded-md text-xs streak-badge ${current >= 1 ? 'streak-current' : ''}`} aria-label={`Current streak ${current}`}>
        <span className="sr-only">Current streak</span>
        🔥 {current}
      </div>
      <div className={`px-2 py-0.5 rounded-md text-xs streak-badge ${best >= 1 ? 'streak-best' : ''} ${isNewBest ? 'new-best' : ''}`} aria-label={`Best streak ${best}`}>
        <span className="sr-only">Best streak</span>
        🏆 {best}
      </div>
    </div>
  );
}
