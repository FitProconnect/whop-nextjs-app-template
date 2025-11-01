/** @jest-environment jsdom */
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import useTasks from '../hooks/useTasks'

// Note: these tests rely on a jsdom environment where localStorage is available.
describe('useTasks hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes with seeded tasks if storage empty', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks.length).toBeGreaterThanOrEqual(1);
  });

  test('add, update, delete, and reload', () => {
    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.addTask({ text: 'test item' });
    });
    expect(result.current.tasks.some(t => t.text === 'test item')).toBe(true);

    const item = result.current.tasks.find(t => t.text === 'test item');
    expect(item).toBeDefined();

    act(() => {
      result.current.updateTask(item.id, { done: true });
    });
    const updated = result.current.tasks.find(t => t.id === item.id);
    expect(updated.done).toBe(true);

    act(() => {
      result.current.deleteTask(item.id);
    });
    expect(result.current.tasks.find(t => t.id === item.id)).toBeUndefined();

    // ensure reload reads from storage
    // First, add one and then create a fresh hook instance
    act(() => {
      result.current.addTask({ text: 'persisted' });
    });
    const savedId = result.current.tasks.find(t => t.text === 'persisted').id;
    // mount a new hook and check it picks up from localStorage
    const { result: r2 } = renderHook(() => useTasks());
    expect(r2.current.tasks.find(t => t.id === savedId)).toBeDefined();
  });
});
