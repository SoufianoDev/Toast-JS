// @ts-check
import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '../../../src/core/Toast.mjs';

const require = createRequire(import.meta.url);
const LEGACY = /** @type {any} */ (require('../../../src/Toast.js'));

/** The three public event names, as the contract fixes them. */
const EVENTS = /** @type {const} */ (['show', 'hide', 'dismiss']);

beforeEach(() => {
  document.body.innerHTML = '';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('event API — registration', () => {
  it('registers a callback for a public event', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    expect(toast.on('show', callback)).toBe(toast);
    toast._emit('show');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(toast);
  });

  it('allows multiple callbacks for one event, in registration order', () => {
    const toast = new Toast(document.body, 'hello');
    /** @type {string[]} */
    const order = [];

    toast.on('show', () => order.push('first'));
    toast.on('show', () => order.push('second'));
    toast.on('show', () => order.push('third'));
    toast._emit('show');

    expect(order).toEqual(['first', 'second', 'third']);
  });

  it('warns for a callback that is not a function, and registers nothing', () => {
    const toast = new Toast(document.body, 'hello');

    expect(toast.on('show', /** @type {any} */ ('not a function'))).toBe(toast);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(toast._events.show).toBeUndefined();
  });

  it('warns for an unknown event, and registers nothing', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    expect(toast.on('explode', callback)).toBe(toast);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(toast._events.explode).toBeUndefined();
  });

  it('accepts each of the three public event names', () => {
    const toast = new Toast(document.body, 'hello');

    for (const event of EVENTS) {
      expect(toast.on(event, vi.fn()), event).toBe(toast);
    }
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('event API — removal', () => {
  it('removes the given callback', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    toast.on('show', callback);
    toast.off('show', callback);
    toast._emit('show');

    expect(callback).not.toHaveBeenCalled();
  });

  it('removes only the given callback', () => {
    const toast = new Toast(document.body, 'hello');
    const kept = vi.fn();
    const removed = vi.fn();

    toast.on('show', kept);
    toast.on('show', removed);
    toast.off('show', removed);
    toast._emit('show');

    expect(kept).toHaveBeenCalledTimes(1);
    expect(removed).not.toHaveBeenCalled();
  });

  it('ignores an unknown event and a non-function callback silently', () => {
    const toast = new Toast(document.body, 'hello');

    expect(toast.off('explode', vi.fn())).toBe(toast);
    expect(toast.off('show', /** @type {any} */ ('not a function'))).toBe(toast);
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe('event API — addCallback', () => {
  it('registers the callback on the show event', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    expect(toast.addCallback(callback)).toBe(toast);
    toast._emit('show');

    expect(callback).toHaveBeenCalledWith(toast);
  });

  it('ignores a non-function argument silently', () => {
    const toast = new Toast(document.body, 'hello');

    expect(toast.addCallback(/** @type {any} */ ('not a function'))).toBe(toast);
    expect(console.warn).not.toHaveBeenCalled();
    expect(toast._events.show).toBeUndefined();
  });
});

describe('event API — dispatch', () => {
  it('keeps running later callbacks when one throws', () => {
    const toast = new Toast(document.body, 'hello');
    const later = vi.fn();

    toast.on('show', () => { throw new Error('boom'); });
    toast.on('show', later);
    toast._emit('show');

    expect(later).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('logs the failing event name', () => {
    const toast = new Toast(document.body, 'hello');

    toast.on('hide', () => { throw new Error('boom'); });
    toast._emit('hide');

    expect(String(/** @type {any} */ (console.error).mock.calls[0]?.[0])).toContain('hide');
  });
});

describe('event API — emission points', () => {
  it('emits show after the element is attached and before the dismissal timer', () => {
    const toast = new Toast(document.body, 'hello');
    let attachedAtShow = false;
    let timerAtShow = true;

    toast.on('show', (instance) => {
      attachedAtShow = instance.toastElement?.parentNode === document.body;
      timerAtShow = instance._timeoutId === null;
    });

    toast.show();

    expect(attachedAtShow).toBe(true);
    expect(timerAtShow).toBe(true);
  });

  it('emits dismiss immediately before hide', () => {
    vi.useFakeTimers();
    const toast = new Toast(document.body, 'hello');
    toast.setDismissible(true);
    /** @type {string[]} */
    const order = [];

    toast.on('dismiss', () => order.push('dismiss'));
    toast.on('hide', () => order.push('hide'));
    toast.show();

    toast.toastElement?.querySelector('.toast-js-close-btn')?.dispatchEvent(
      new window.MouseEvent('click', { bubbles: true }),
    );

    vi.advanceTimersByTime(350);

    expect(order).toEqual(['dismiss', 'hide']);
  });

  it('emits hide after the element has been removed', () => {
    vi.useFakeTimers();
    const toast = new Toast(document.body, 'hello');
    let elementAtHide = null;
    let parentAtHide = null;

    toast.on('hide', (instance) => {
      elementAtHide = instance.toastElement;
      parentAtHide = instance.toastElement?.parentNode ?? null;
    });

    toast.show();
    const element = toast.toastElement;
    toast.hide();
    vi.advanceTimersByTime(350);

    expect(elementAtHide).toBeNull();
    expect(element?.parentNode).toBeNull();
    expect(parentAtHide).toBeNull();
  });
});

describe('event API — equivalence with the audited baseline', () => {
  it('warns with the same messages', () => {
    const legacyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const modernWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const legacy = new LEGACY(document.body, 'hello');
    const modern = new Toast(document.body, 'hello');

    for (const toast of [legacy, modern]) {
      toast.on('show', /** @type {any} */ ('not a function'));
      toast.on('explode', vi.fn());
    }

    expect(modernWarn.mock.calls.map((call) => call[0]))
      .toEqual(legacyWarn.mock.calls.map((call) => call[0]));
  });

  it('registers and removes callbacks the same way', () => {
    const legacy = new LEGACY(document.body, 'hello');
    const modern = new Toast(document.body, 'hello');
    const legacyCallback = vi.fn();
    const modernCallback = vi.fn();

    legacy.on('show', legacyCallback);
    modern.on('show', modernCallback);
    legacy.off('show', legacyCallback);
    modern.off('show', modernCallback);
    legacy._emit('show');
    modern._emit('show');

    expect(legacyCallback).not.toHaveBeenCalled();
    expect(modernCallback).not.toHaveBeenCalled();
  });

  it('keeps the event API inside the owning lifecycle module', () => {
    // The contract fixes the public surface: the three event methods belong to
    // the Toast constructor, so no separate event module is justified.
    const members = Object.getOwnPropertyNames(Toast.prototype)
      .filter((name) => name !== 'constructor');

    expect(members).toContain('on');
    expect(members).toContain('off');
    expect(members).toContain('addCallback');
    expect(members).toHaveLength(21);
  });
});
