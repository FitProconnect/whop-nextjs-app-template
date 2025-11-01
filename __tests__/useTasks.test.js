/** @jest-environment jsdom */
import React from 'react'
import { render, act, screen } from '@testing-library/react'
import useTasks from '../hooks/useTasks'

// Helper test component to access hook actions via a ref-like object
function TestHarness({ bridge }) {
  const hook = useTasks();
  // expose to outer test
  bridge.current = hook;
  return null;
}

describe('useTasks hook (integration)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes and persists tasks', () => {
    const bridge = { current: null };
    render(<TestHarness bridge={bridge} />);
    // use a getter so we always read the latest hook object after re-renders
    const hook = () => bridge.current;
    expect(hook().tasks.length).toBeGreaterThanOrEqual(1);

    act(() => {
      hook().addTask({ text: 'test item' });
    });
    expect(hook().tasks.some(t => t.text === 'test item')).toBe(true);

    const item = hook().tasks.find(t => t.text === 'test item');
    expect(item).toBeDefined();

    act(() => {
      hook().updateTask(item.id, { done: true });
    });
    const updated = hook().tasks.find(t => t.id === item.id);
    expect(updated.done).toBe(true);

    act(() => {
      hook().deleteTask(item.id);
    });
    expect(hook().tasks.find(t => t.id === item.id)).toBeUndefined();

    // persist test
    act(() => {
      hook().addTask({ text: 'persisted' });
    });
    const savedId = hook().tasks.find(t => t.text === 'persisted').id;

    // new harness should pick up from storage
    const bridge2 = { current: null };
    render(<TestHarness bridge={bridge2} />);
    const hook2 = () => bridge2.current;
    expect(hook2().tasks.find(t => t.id === savedId)).toBeDefined();
  });
});
