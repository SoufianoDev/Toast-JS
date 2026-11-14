// @ts-check
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '../../../src/core/Toast.mjs';
import { ToastManager, toastManager } from '../../../src/core/ToastManager.mjs';

const TOP_LEFT = Toast.POSITION_TOP_LEFT;
const BOTTOM_CENTER = Toast.POSITION_BOTTOM_CENTER;

/** @type {ToastManager} */
let manager;

/**
 * @param {string} position
 * @param {string} text
 * @returns {any}
 */
function toastAt(position, text) {
  const toast = Toast.makeText(document.body, text);
  toast.setPosition(position);
  return toast;
}

beforeEach(() => {
  document.body.innerHTML = '';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  manager = new ToastManager();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ToastManager — coordination', () => {
  it('is the singleton exposed as Toast.Manager', () => {
    expect(Toast.Manager).toBe(toastManager);
  });

  it('displays a managed notification and marks it managed', () => {
    const toast = toastAt(BOTTOM_CENTER, 'hello');

    manager.show(toast);

    expect(toast.toastElement).not.toBeNull();
    expect(toast.toastElement?.parentNode).toBe(document.body);
    expect(toast._manager).toBe(manager);
  });

  it('logs an error and ignores an argument that is not a Toast', () => {
    manager.show(/** @type {any} */ ({ position: BOTTOM_CENTER }));

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(String(/** @type {any} */ (console.error).mock.calls[0]?.[0])).toContain('must be a Toast instance');
  });

  it('gives a managed notification a stack offset', () => {
    const first = toastAt(BOTTOM_CENTER, 'first');
    const second = toastAt(BOTTOM_CENTER, 'second');

    manager.show(first);
    manager.show(second);

    expect(first._stackOffset).toBe(0);
    expect(second._stackOffset).toBe(72);
  });

  it('releases the slot of a notification that could not be rendered', () => {
    const broken = toastAt(BOTTOM_CENTER, 'broken');
    broken.show = () => broken;

    manager.show(broken);

    expect(broken.toastElement).toBeNull();
    expect(broken._manager).toBeNull();
  });

  it('admits the next waiting notification when a render fails', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(BOTTOM_CENTER, 1);
    const first = toastAt(BOTTOM_CENTER, 'first');
    const broken = toastAt(BOTTOM_CENTER, 'broken');
    const waiting = toastAt(BOTTOM_CENTER, 'waiting');
    broken.show = () => broken;

    manager.show(first);
    manager.show(broken);
    manager.show(waiting);
    expect(broken.toastElement).toBeNull();
    expect(waiting.toastElement).toBeNull();

    // The freed slot admits the broken notification, whose render fails; the
    // failed render must give its slot back so the waiting one is admitted.
    first.hide();
    vi.advanceTimersByTime(350);

    expect(broken.toastElement).toBeNull();
    expect(waiting.toastElement).not.toBeNull();
  });
});

describe('ToastManager — independent per-position limits', () => {
  it('defaults to three visible notifications per position', () => {
    expect(manager.visibleLimit(TOP_LEFT)).toBe(3);
    expect(manager.visibleLimit(BOTTOM_CENTER)).toBe(3);
  });

  it('configures the limit of one position independently', () => {
    expect(manager.setVisibleLimit(TOP_LEFT, 1)).toBe(true);

    expect(manager.visibleLimit(TOP_LEFT)).toBe(1);
    expect(manager.visibleLimit(BOTTOM_CENTER)).toBe(3);
  });

  it('ignores an invalid limit and keeps the current one', () => {
    manager.setVisibleLimit(TOP_LEFT, 2);

    expect(manager.setVisibleLimit(TOP_LEFT, 0)).toBe(false);
    expect(manager.setVisibleLimit(TOP_LEFT, -1)).toBe(false);
    expect(manager.setVisibleLimit(TOP_LEFT, /** @type {any} */ ('two'))).toBe(false);
    expect(manager.visibleLimit(TOP_LEFT)).toBe(2);
  });

  it('reads maxVisible as the default for every position', () => {
    manager.maxVisible = 1;

    expect(manager.visibleLimit(TOP_LEFT)).toBe(1);
    expect(manager.visibleLimit(BOTTOM_CENTER)).toBe(1);
  });

  it('does not let one position consume another position’s capacity', () => {
    manager.setVisibleLimit(TOP_LEFT, 1);

    const top = toastAt(TOP_LEFT, 'top');
    const bottom = toastAt(BOTTOM_CENTER, 'bottom');

    manager.show(top);
    manager.show(bottom);

    expect(top.toastElement).not.toBeNull();
    expect(bottom.toastElement).not.toBeNull();
  });
});

describe('ToastManager — queue admission', () => {
  it('queues a notification once its position is at capacity', () => {
    manager.setVisibleLimit(TOP_LEFT, 1);

    const first = toastAt(TOP_LEFT, 'first');
    const second = toastAt(TOP_LEFT, 'second');

    manager.show(first);
    manager.show(second);

    expect(first.toastElement).not.toBeNull();
    expect(second.toastElement).toBeNull();
  });

  it('admits the waiting notification in order once a slot is released', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(TOP_LEFT, 1);

    const first = toastAt(TOP_LEFT, 'first');
    const second = toastAt(TOP_LEFT, 'second');
    const third = toastAt(TOP_LEFT, 'third');

    manager.show(first);
    manager.show(second);
    manager.show(third);

    first.hide();
    vi.advanceTimersByTime(350);

    expect(second.toastElement).not.toBeNull();
    expect(third.toastElement).toBeNull();
  });

  it('keeps the slot accounted for while the notification is exiting', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(TOP_LEFT, 1);

    const first = toastAt(TOP_LEFT, 'first');
    const second = toastAt(TOP_LEFT, 'second');

    manager.show(first);
    manager.show(second);
    first.hide();

    // The exit has started but the removal has not completed.
    vi.advanceTimersByTime(349);
    expect(second.toastElement).toBeNull();

    vi.advanceTimersByTime(1);
    expect(second.toastElement).not.toBeNull();
  });

  it('releases the slot only after the removal completes', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(TOP_LEFT, 1);

    const first = toastAt(TOP_LEFT, 'first');
    const second = toastAt(TOP_LEFT, 'second');

    manager.show(first);
    manager.show(second);
    first.hide();

    vi.advanceTimersByTime(350);

    expect(first.toastElement).toBeNull();
    expect(second.toastElement).not.toBeNull();
  });

  it('re-stacks the notifications that remain visible', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(BOTTOM_CENTER, 3);

    const first = toastAt(BOTTOM_CENTER, 'first');
    const second = toastAt(BOTTOM_CENTER, 'second');
    const third = toastAt(BOTTOM_CENTER, 'third');

    manager.show(first);
    manager.show(second);
    manager.show(third);
    expect(third._stackOffset).toBe(144);

    first.hide();
    vi.advanceTimersByTime(350);

    expect(second._stackOffset).toBe(0);
    expect(third._stackOffset).toBe(72);
  });
});

describe('ToastManager — boundary cases', () => {
  it('shows a notification with no position set', () => {
    const toast = Toast.makeText(document.body, 'hello');

    manager.show(toast);

    expect(toast.toastElement).not.toBeNull();
  });

  it('ignores a repeated release of the same notification', () => {
    vi.useFakeTimers();
    manager.setVisibleLimit(TOP_LEFT, 1);

    const first = toastAt(TOP_LEFT, 'first');
    const second = toastAt(TOP_LEFT, 'second');

    manager.show(first);
    manager.show(second);
    first.hide();
    vi.advanceTimersByTime(350);

    expect(second.toastElement).not.toBeNull();

    manager._onHide(first);
    expect(second.toastElement).not.toBeNull();
  });

  it('leaves the position limits untouched after a notification is shown', () => {
    const toast = toastAt(TOP_LEFT, 'hello');

    manager.show(toast);

    expect(toast.toastElement).not.toBeNull();
    expect(manager.visibleLimit(TOP_LEFT)).toBe(3);
  });
});
