// @ts-check
import { describe, expect, it } from 'vitest';
import { ToastQueue } from '../../../src/core/ToastQueue.mjs';

const TOP_LEFT = 'top-left';
const BOTTOM_CENTER = 'bottom-center';

/**
 * @param {string} position
 * @param {number} [id]
 * @returns {{ position: string, id: number }}
 */
function item(position, id) {
  return { position, id: id ?? 0 };
}

describe('ToastQueue — FIFO order within a position', () => {
  it('admits items while the position has capacity', () => {
    const queue = new ToastQueue();
    const first = item(TOP_LEFT, 1);
    const second = item(TOP_LEFT, 2);

    expect(queue.enqueue(first)).toBe('visible');
    expect(queue.enqueue(second)).toBe('visible');
    expect(queue.visibleItems(TOP_LEFT)).toEqual([first, second]);
  });

  it('keeps pending items in admission order', () => {
    const queue = new ToastQueue(1);
    const first = item(TOP_LEFT, 1);
    const second = item(TOP_LEFT, 2);
    const third = item(TOP_LEFT, 3);

    queue.enqueue(first);
    queue.enqueue(second);
    queue.enqueue(third);

    expect(queue.pendingItems(TOP_LEFT)).toEqual([second, third]);
  });

  it('admits the waiting items in the order they arrived', () => {
    const queue = new ToastQueue(1);
    const first = item(TOP_LEFT, 1);
    const second = item(TOP_LEFT, 2);
    const third = item(TOP_LEFT, 3);

    queue.enqueue(first);
    queue.enqueue(second);
    queue.enqueue(third);

    expect(queue.release(first)).toBe(second);
    expect(queue.release(second)).toBe(third);
    expect(queue.release(third)).toBeNull();
  });

  it('has no priority scheduler — the first in is the first out', () => {
    const queue = new ToastQueue(1);
    const first = item(TOP_LEFT, 1);
    const second = item(TOP_LEFT, 2);

    queue.enqueue(first);
    queue.enqueue(second);

    expect(queue.release(first)).toBe(second);
    expect(queue.visibleItems(TOP_LEFT)).toEqual([second]);
  });
});

describe('ToastQueue — independence between positions', () => {
  it('does not let one position consume another position’s capacity', () => {
    const queue = new ToastQueue(1);
    const top = item(TOP_LEFT, 1);
    const bottom = item(BOTTOM_CENTER, 2);

    expect(queue.enqueue(top)).toBe('visible');
    expect(queue.enqueue(bottom)).toBe('visible');

    expect(queue.visibleCount(TOP_LEFT)).toBe(1);
    expect(queue.visibleCount(BOTTOM_CENTER)).toBe(1);
  });

  it('releases only the position it was asked about', () => {
    const queue = new ToastQueue(1);
    const top = item(TOP_LEFT, 1);
    const topNext = item(TOP_LEFT, 2);
    const bottom = item(BOTTOM_CENTER, 3);

    queue.enqueue(top);
    queue.enqueue(topNext);
    queue.enqueue(bottom);

    expect(queue.release(top)).toBe(topNext);
    expect(queue.visibleCount(BOTTOM_CENTER)).toBe(1);
    expect(queue.visibleItems(BOTTOM_CENTER)).toEqual([bottom]);
  });

  it('configures the limit of each position independently', () => {
    const queue = new ToastQueue();

    expect(queue.setVisibleLimit(TOP_LEFT, 1)).toBe(true);
    expect(queue.setVisibleLimit(BOTTOM_CENTER, 5)).toBe(true);

    expect(queue.visibleLimit(TOP_LEFT)).toBe(1);
    expect(queue.visibleLimit(BOTTOM_CENTER)).toBe(5);
    expect(queue.visibleLimit('unknown')).toBe(3);
  });

  it('ignores an invalid limit and keeps the current one', () => {
    const queue = new ToastQueue();
    queue.setVisibleLimit(TOP_LEFT, 2);

    expect(queue.setVisibleLimit(TOP_LEFT, 0)).toBe(false);
    expect(queue.setVisibleLimit(TOP_LEFT, -1)).toBe(false);
    expect(queue.setVisibleLimit(TOP_LEFT, /** @type {any} */ ('two'))).toBe(false);
    expect(queue.visibleLimit(TOP_LEFT)).toBe(2);
  });
});

describe('ToastQueue — visible-slot accounting', () => {
  it('defaults to three visible notifications per position', () => {
    const queue = new ToastQueue();

    expect(queue.visibleLimit(TOP_LEFT)).toBe(3);
    expect(queue.enqueue(item(TOP_LEFT, 1))).toBe('visible');
    expect(queue.enqueue(item(TOP_LEFT, 2))).toBe('visible');
    expect(queue.enqueue(item(TOP_LEFT, 3))).toBe('visible');
    expect(queue.enqueue(item(TOP_LEFT, 4))).toBe('queued');
  });

  it('counts visible and pending items separately', () => {
    const queue = new ToastQueue(1);
    const visible = item(TOP_LEFT, 1);
    const waiting = item(TOP_LEFT, 2);

    queue.enqueue(visible);
    queue.enqueue(waiting);

    expect(queue.visibleCount(TOP_LEFT)).toBe(1);
    expect(queue.pendingCount(TOP_LEFT)).toBe(1);
    // The queue tracks the very item it was given, by identity.
    expect(queue.isVisible(visible)).toBe(true);
    expect(queue.isVisible(waiting)).toBe(false);
  });

  it('keeps a slot accounted for while an item is exiting', () => {
    const queue = new ToastQueue(1);
    const exiting = item(TOP_LEFT, 1);
    const waiting = item(TOP_LEFT, 2);

    queue.enqueue(exiting);
    queue.enqueue(waiting);

    // The exit has started, but the removal has not completed: nothing is released.
    expect(queue.visibleCount(TOP_LEFT)).toBe(1);
    expect(queue.pendingCount(TOP_LEFT)).toBe(1);
    expect(queue.isVisible(exiting)).toBe(true);
    expect(queue.isVisible(waiting)).toBe(false);
  });

  it('admits the waiting item once the slot is released', () => {
    const queue = new ToastQueue(1);
    const removed = item(TOP_LEFT, 1);
    const waiting = item(TOP_LEFT, 2);

    queue.enqueue(removed);
    queue.enqueue(waiting);

    const admitted = queue.release(removed);

    expect(admitted).toBe(waiting);
    expect(queue.isVisible(waiting)).toBe(true);
    expect(queue.pendingCount(TOP_LEFT)).toBe(0);
    expect(queue.visibleCount(TOP_LEFT)).toBe(1);
  });

  it('frees the slot even when nothing is waiting', () => {
    const queue = new ToastQueue(1);
    const only = item(TOP_LEFT, 1);

    queue.enqueue(only);

    expect(queue.release(only)).toBeNull();
    expect(queue.visibleCount(TOP_LEFT)).toBe(0);
    expect(queue.pendingCount(TOP_LEFT)).toBe(0);
  });
});

describe('ToastQueue — failure and cleanup paths', () => {
  it('drops a pending item without freeing a slot', () => {
    const queue = new ToastQueue(1);
    const visible = item(TOP_LEFT, 1);
    const dropped = item(TOP_LEFT, 2);

    queue.enqueue(visible);
    queue.enqueue(dropped);

    expect(queue.release(dropped)).toBeNull();
    expect(queue.pendingCount(TOP_LEFT)).toBe(0);
    expect(queue.visibleCount(TOP_LEFT)).toBe(1);
  });

  it('ignores a release for an item it never held', () => {
    const queue = new ToastQueue();
    const stranger = item(TOP_LEFT, 9);

    expect(queue.release(stranger)).toBeNull();
    expect(queue.visibleCount(TOP_LEFT)).toBe(0);
  });

  it('does not admit a second item when released twice', () => {
    const queue = new ToastQueue(1);
    const first = item(TOP_LEFT, 1);
    const second = item(TOP_LEFT, 2);
    const third = item(TOP_LEFT, 3);

    queue.enqueue(first);
    queue.enqueue(second);
    queue.enqueue(third);

    expect(queue.release(first)).toBe(second);
    expect(queue.release(first)).toBeNull();
    expect(queue.visibleItems(TOP_LEFT)).toEqual([second]);
    expect(queue.pendingCount(TOP_LEFT)).toBe(1);
  });

  it('leaves the other positions untouched when an item is released', () => {
    const queue = new ToastQueue(1);
    const top = item(TOP_LEFT, 1);
    const bottom = item(BOTTOM_CENTER, 2);

    queue.enqueue(top);
    queue.enqueue(bottom);
    queue.release(top);

    expect(queue.visibleItems(BOTTOM_CENTER)).toEqual([bottom]);
    expect(queue.visibleCount(BOTTOM_CENTER)).toBe(1);
  });
});

describe('ToastQueue — boundary cases', () => {
  it('reports empty queues for a position it has never seen', () => {
    const queue = new ToastQueue();

    expect(queue.visibleCount('never-seen')).toBe(0);
    expect(queue.pendingCount('never-seen')).toBe(0);
    expect(queue.visibleItems('never-seen')).toEqual([]);
    expect(queue.pendingItems('never-seen')).toEqual([]);
    expect(queue.isVisible(item('never-seen', 1))).toBe(false);
  });

  it('survives repeated enqueue and release of the same item', () => {
    const queue = new ToastQueue(1);
    const only = item(TOP_LEFT, 1);

    for (let round = 0; round < 5; round += 1) {
      expect(queue.enqueue(only)).toBe('visible');
      expect(queue.visibleCount(TOP_LEFT)).toBe(1);
      expect(queue.release(only)).toBeNull();
      expect(queue.visibleCount(TOP_LEFT)).toBe(0);
      expect(queue.pendingCount(TOP_LEFT)).toBe(0);
    }
  });

  it('handles a limit of one and a limit larger than the traffic', () => {
    const single = new ToastQueue(1);
    const many = new ToastQueue(10);

    expect(single.enqueue(item(TOP_LEFT, 1))).toBe('visible');
    expect(single.enqueue(item(TOP_LEFT, 2))).toBe('queued');

    for (let id = 1; id <= 10; id += 1) {
      expect(many.enqueue(item(TOP_LEFT, id))).toBe('visible');
    }
    expect(many.visibleCount(TOP_LEFT)).toBe(10);
  });

  it('treats a fractional limit as a whole number of slots', () => {
    const queue = new ToastQueue();
    queue.setVisibleLimit(TOP_LEFT, 2.7);

    expect(queue.visibleLimit(TOP_LEFT)).toBe(2);
    expect(queue.enqueue(item(TOP_LEFT, 1))).toBe('visible');
    expect(queue.enqueue(item(TOP_LEFT, 2))).toBe('visible');
    expect(queue.enqueue(item(TOP_LEFT, 3))).toBe('queued');
  });
});
