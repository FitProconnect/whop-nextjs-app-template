"use client";

import React from "react";

export default function TaskSyncIndicator({ lastSavedAt }) {
  if (!lastSavedAt) return null;
  const delta = Math.floor((Date.now() - lastSavedAt) / 1000);
  const label = delta < 3 ? "Saved locally" : `Saved ${delta}s ago`;
  return (
    <div aria-live="polite" className="text-xs text-muted-foreground">
      {label}
    </div>
  );
}
