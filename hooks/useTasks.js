"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const STORAGE_KEY = "whop:todos:v1";

function supportsLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch (e) {
    return false;
  }
}

function seedDemo() {
  return [
    { id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 9), text: "Welcome to Whop Todos", done: false },
    { id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 9), text: "Add tasks with the input", done: false },
    { id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 9), text: "Persisted locally in your browser", done: false },
  ];
}

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const storageAvailable = useRef(supportsLocalStorage());
  const transientTimers = useRef({});

  // initialize
  useEffect(() => {
    if (storageAvailable.current) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setTasks(JSON.parse(raw));
          setLastSavedAt(Date.now());
          return;
        }
      } catch (e) {
        // fallthrough to seed
      }
    }
    const seeded = seedDemo().map((t) => ({
      // ensure streak fields exist on seeded tasks
      ...t,
      lastCompletedAt: t.lastCompletedAt ?? null,
      currentStreak: typeof t.currentStreak === "number" ? t.currentStreak : 0,
      bestStreak: typeof t.bestStreak === "number" ? t.bestStreak : 0,
    }));
    // On load, ensure stale streaks are reset (older than yesterday)
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const normalized = seeded.map((s) => {
      if (!s.lastCompletedAt) return { ...s, currentStreak: 0 };
      if (s.lastCompletedAt === today || s.lastCompletedAt === yesterday) return s;
      return { ...s, currentStreak: 0 };
    });
    setTasks(normalized);
    try {
      if (storageAvailable.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      setLastSavedAt(Date.now());
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      if (storageAvailable.current) {
        // strip transient fields (like _justGotBest) before persisting
        const sanitized = next.map((t) => {
          const copy = { ...t };
          if (copy._justGotBest) delete copy._justGotBest;
          return copy;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }
      setLastSavedAt(Date.now());
    } catch (e) {
      // localStorage may be disabled; we silently continue with in-memory tasks
      console.warn("useTasks: failed to persist to localStorage", e);
    }
  }, []);

  const fetchTasks = useCallback(() => tasks, [tasks]);

  const addTask = useCallback((task) => {
    const t = {
      id: task.id || (crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 9)),
      text: task.text || "",
      done: !!task.done,
      // streak fields
      lastCompletedAt: null,
      currentStreak: 0,
      bestStreak: 0,
    };
    setTasks((s) => {
      const next = [t, ...s];
      persist(next);
      return next;
    });
    return t;
  }, [persist]);

  // mark a task as completed today and update streaks
  const markComplete = useCallback((id) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setTasks((s) => {
      const next = s.map((t) => {
        if (t.id !== id) return t;
        const last = t.lastCompletedAt || null;
        let current = typeof t.currentStreak === "number" ? t.currentStreak : 0;
        const prevBest = typeof t.bestStreak === "number" ? t.bestStreak : 0;
        let best = prevBest;
        if (last === today) {
          // already completed today, no-op
          return { ...t, done: true };
        }
        if (last === yesterday) {
          current = current + 1;
        } else {
          current = 1;
        }
        if (current > best) best = current;
        const updated = { ...t, done: true, lastCompletedAt: today, currentStreak: current, bestStreak: best };
        // transient flag to trigger pulse animation when a new best is reached
        if (best > prevBest) {
          updated._justGotBest = true;
          // clear existing timer for this id
          if (transientTimers.current[id]) clearTimeout(transientTimers.current[id]);
          transientTimers.current[id] = setTimeout(() => {
            // clear the transient flag
            setTasks((cur) => {
              const cleared = cur.map((tt) => (tt.id === id ? { ...tt, _justGotBest: false } : tt));
              // persist sanitized
              try {
                if (storageAvailable.current) {
                  const sanitized = cleared.map((x) => {
                    const copy = { ...x };
                    if (copy._justGotBest) delete copy._justGotBest;
                    return copy;
                  });
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
                }
                setLastSavedAt(Date.now());
              } catch (e) {
                /* ignore */
              }
              return cleared;
            });
            delete transientTimers.current[id];
          }, 900);
        }
        return updated;
      });
      persist(next);
      return next;
    });
  }, [persist]);

  // undo today's completion safely
  const markIncomplete = useCallback((id) => {
    const today = new Date().toISOString().slice(0, 10);
    setTasks((s) => {
      const next = s.map((t) => {
        if (t.id !== id) return t;
        const last = t.lastCompletedAt || null;
        let current = typeof t.currentStreak === "number" ? t.currentStreak : 0;
        // Only undo if the completion was today; otherwise treat as a simple un-complete
        if (last === today) {
          current = Math.max(0, current - 1);
          // We cannot reliably restore previous lastCompletedAt without history.
          // Clear today's completion; keep bestStreak as-is.
          const updated = { ...t, done: false, lastCompletedAt: null, currentStreak: current };
          if (updated._justGotBest) delete updated._justGotBest;
          return updated;
        }
        return { ...t, done: false };
      });
      persist(next);
      return next;
    });
  }, [persist]);

  const updateTask = useCallback((id, patch) => {
    setTasks((s) => {
      const next = s.map((t) => (t.id === id ? { ...t, ...patch } : t));
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteTask = useCallback((id) => {
    setTasks((s) => {
      const next = s.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  // expose a reload-from-storage utility (useful for tests)
  const reload = useCallback(() => {
    if (!storageAvailable.current) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    tasks,
    lastSavedAt,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    markComplete,
    markIncomplete,
    reload,
  };
}

// TODO: consider migrating persistence to server-side storage or connect to Whop API for per-user storage.
