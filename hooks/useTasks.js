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
    const seeded = seedDemo();
    setTasks(seeded);
    try {
      if (storageAvailable.current) localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      setLastSavedAt(Date.now());
    } catch (e) {
      // ignore
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      if (storageAvailable.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
    };
    setTasks((s) => {
      const next = [t, ...s];
      persist(next);
      return next;
    });
    return t;
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
    reload,
  };
}

// TODO: consider migrating persistence to server-side storage or connect to Whop API for per-user storage.
