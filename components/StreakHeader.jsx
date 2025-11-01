"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function StreakHeader({ tasks = [], goal = 7 }) {
  const [toast, setToast] = useState(null);

  const avg = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;
    const sum = tasks.reduce((s, t) => s + (t.currentStreak || 0), 0);
    return sum / tasks.length;
  }, [tasks]);

  const pct = Math.min(100, Math.round((avg / goal) * 100));

  useEffect(() => {
    // simple milestone toast: if any task has currentStreak >= 3/7/30 show a brief toast
    const max = tasks.reduce((m, t) => Math.max(m, t.currentStreak || 0), 0);
    let achieved = null;
    if (max >= 30) achieved = "🎉 30-day streak milestone!";
    else if (max >= 7) achieved = "🎉 7-day streak milestone!";
    else if (max >= 3) achieved = "✨ 3-day streak milestone!";
    if (achieved) {
      setToast(achieved);
      const id = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(id);
    }
  }, [tasks]);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Global streak progress</div>
        <div className="text-sm">{Math.round(avg)} / {goal}</div>
      </div>
      <div className="w-full progress-track rounded-full h-3 overflow-hidden">
        <div className="progress-fill bg-gradient-to-r from-accent to-pink-500" style={{ width: `${pct}%` }} />
      </div>
      {toast && (
        <div role="status" aria-live="polite" className="mt-3 text-sm text-green-300">
          {toast}
        </div>
      )}
    </div>
  );
}
