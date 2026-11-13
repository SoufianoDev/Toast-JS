// @ts-check
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '../../../src/core/Toast.mjs';

const require = createRequire(import.meta.url);
const LEGACY = /** @type {any} */ (require('../../../src/Toast.js'));

const ROOT_DIR = process.cwd();

/** The public instance properties the contract fixes. */
const DOCUMENTED_DEFAULTS = {
  duration: 3000,
  position: 'bottom-center',
  icon: null,
  iconPosition: 'start',
  enterAnimation: 'fade',
  exitAnimation: 'fade',
  dismissible: false,
  closeButtonColor: '#fff',
  textOverflow: 'ellipsis',
  customKeyframes: null,
  toastElement: null,
};

/**
 * @param {any} toast
 * @returns {Record<string, unknown>}
 */
function observableState(toast) {
  return {
    text: toast.text,
    duration: toast.duration,
    position: toast.position,
    icon: toast.icon,
    iconSize: { ...toast.iconSize },
    iconPosition: toast.iconPosition,
    iconShape: { ...toast.iconShape },
    enterAnimation: toast.enterAnimation,
    exitAnimation: toast.exitAnimation,
    dismissible: toast.dismissible,
    closeButtonColor: toast.closeButtonColor,
    textOverflow: toast.textOverflow,
    customKeyframes: toast.customKeyframes,
    toastElement: toast.toastElement,
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Toast instance — constructor and defaults', () => {
  it('rejects a non-string text', () => {
    expect(() => new Toast(document.body, /** @type {any} */ (42))).toThrow(TypeError);
    expect(() => new Toast(document.body, /** @type {any} */ (42))).toThrow("'text' must be a string");
  });

  it('exposes the documented defaults', () => {
    const toast = new Toast(document.body, 'hello');

    expect(observableState(toast)).toMatchObject(DOCUMENTED_DEFAULTS);
    expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
    expect(toast.iconSize).toEqual(Toast.ICON_SIZE.MEDIUM);
    expect(toast.iconShape).toBe(Toast.ICON_SHAPE_CIRCLE);
    expect(toast.context).toBe(document.body);
  });

  it('keeps a positive numeric duration and falls back otherwise', () => {
    expect(new Toast(document.body, 'x', 1200).duration).toBe(1200);
    expect(new Toast(document.body, 'x', 0).duration).toBe(Toast.LENGTH_SHORT);
    expect(new Toast(document.body, 'x', -5).duration).toBe(Toast.LENGTH_SHORT);
    expect(new Toast(document.body, 'x', /** @type {any} */ ('nope')).duration).toBe(Toast.LENGTH_SHORT);
  });
});

describe('Toast instance — setters', () => {
  it('chains every setter and returns the same instance', () => {
    const toast = new Toast(document.body, 'hello');

    expect(toast.setDuration(1200)).toBe(toast);
    expect(toast.setStyle('success')).toBe(toast);
    expect(toast.setPosition(Toast.POSITION_TOP_LEFT)).toBe(toast);
    expect(toast.setAnimation(Toast.FADE, Toast.FADE)).toBe(toast);
    expect(toast.setIcon('https://example.com/icon.png')).toBe(toast);
    expect(toast.setIconShape(Toast.ICON_SHAPE_SQUARE)).toBe(toast);
    expect(toast.setDismissible(true)).toBe(toast);
    expect(toast.setTextOverflow(Toast.TextOverflow.WRAP)).toBe(toast);
  });

  it('resolves every accepted style alias, including the historical misspellings', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setStyle('defult_1');
    expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
    toast.setStyle('defult_2');
    expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_2);
    toast.setStyle('DARK_MODE');
    expect(toast.customStyle).toBe(Toast.STYLE_DARK_MODE);
  });

  it('warns and falls back to the default style for an unknown alias', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setStyle('not-a-style');

    expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
    expect(console.warn).toHaveBeenCalled();
  });

  it('ignores an invalid duration with a warning', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setDuration(0);

    expect(toast.duration).toBe(Toast.LENGTH_SHORT);
    expect(console.warn).toHaveBeenCalled();
  });

  it('falls back to the bottom-center position for an invalid position', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setPosition('middle');

    expect(toast.position).toBe(Toast.POSITION_BOTTOM_CENTER);
    expect(console.warn).toHaveBeenCalled();
  });

  it('falls back to the circle icon shape without warning', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setIconShape(/** @type {any} */ ('triangle'));

    expect(toast.iconShape).toBe(Toast.ICON_SHAPE_CIRCLE);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('falls back to ellipsis for an invalid text overflow', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setTextOverflow('scroll');

    expect(toast.textOverflow).toBe(Toast.TextOverflow.ELLIPSIS);
    expect(console.warn).toHaveBeenCalled();
  });

  it('rejects a non-string icon path and inline SVG', () => {
    const toast = new Toast(document.body, 'hello');

    expect(() => toast.setIcon('')).toThrow(TypeError);
    expect(() => toast.setIcon('<svg></svg>')).toThrow(/Inline SVG/);
  });

  it('accepts a known icon size key and warns for an unknown one', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setIcon('https://example.com/icon.png', 'large');
    expect(toast.iconSize).toEqual(Toast.ICON_SIZE.LARGE);

    toast.setIcon('https://example.com/icon.png', 'gigantic');
    expect(console.warn).toHaveBeenCalled();
  });

  it('merges a style object over the shared base and captures keyframes', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setStyle({ backgroundColor: '#123456', keyframes: '@keyframes x {}' });

    expect(toast.customStyle.backgroundColor).toBe('#123456');
    expect(toast.customStyle.display).toBe('flex');
    expect(toast.customKeyframes).toBe('@keyframes x {}');
  });

  it('coerces dismissible and falls back to a non-string close colour', () => {
    const toast = new Toast(document.body, 'hello');

    toast.setDismissible(/** @type {any} */ (1), /** @type {any} */ (42));
    expect(toast.dismissible).toBe(true);
    expect(toast.closeButtonColor).toBe('#fff');
  });
});

describe('Toast instance — events', () => {
  it('registers and removes callbacks', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    toast.on('show', callback);
    toast._emit('show');
    expect(callback).toHaveBeenCalledTimes(1);

    toast.off('show', callback);
    toast._emit('show');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('warns for an unknown event and a non-function callback', () => {
    const toast = new Toast(document.body, 'hello');

    toast.on('explode', () => {});
    toast.on('show', /** @type {any} */ ('not a function'));

    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('registers addCallback on the show event', () => {
    const toast = new Toast(document.body, 'hello');
    const callback = vi.fn();

    toast.addCallback(callback);
    toast._emit('show');

    expect(callback).toHaveBeenCalledWith(toast);
  });

  it('keeps running later callbacks when one throws', () => {
    const toast = new Toast(document.body, 'hello');
    const later = vi.fn();

    toast.on('show', () => { throw new Error('boom'); });
    toast.on('show', later);
    toast._emit('show');

    expect(later).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('Toast instance — lifecycle', () => {
  it('renders the documented accessibility attributes and removes the node on hide', () => {
    const toast = new Toast(document.body, 'hello');

    toast.show();
    const element = toast.toastElement;
    expect(element).not.toBeNull();
    expect(element?.getAttribute('role')).toBe('alert');
    expect(element?.getAttribute('aria-live')).toBe('assertive');
    expect(element?.getAttribute('aria-atomic')).toBe('true');
    expect(element?.parentNode).toBe(document.body);

    toast.hide();
    expect(toast.hide()).toBeUndefined();
  });

  it('emits show and hide around the element lifecycle', () => {
    const toast = new Toast(document.body, 'hello');
    /** @type {string[]} */
    const order = [];
    toast.on('show', () => order.push('show'));
    toast.on('hide', () => order.push('hide'));

    toast.show();
    vi.useFakeTimers();
    toast.hide();
    vi.advanceTimersByTime(350);
    vi.useRealTimers();

    expect(order).toEqual(['show', 'hide']);
  });
});

describe('Toast instance — equivalence with the audited baseline', () => {
  it('produces the same observable state as the current implementation', () => {
    const legacy = new LEGACY(document.body, 'hello');
    const modern = new Toast(document.body, 'hello');

    legacy.setDuration(1200);
    modern.setDuration(1200);
    legacy.setStyle('defult_1');
    modern.setStyle('defult_1');
    legacy.setPosition(Toast.POSITION_TOP_RIGHT);
    modern.setPosition(Toast.POSITION_TOP_RIGHT);
    legacy.setIcon('https://example.com/icon.png', 'large', Toast.ICON_POSITION_END);
    modern.setIcon('https://example.com/icon.png', 'large', Toast.ICON_POSITION_END);
    legacy.setIconShape(LEGACY.ICON_SHAPE_SQUIRCLE);
    modern.setIconShape(Toast.ICON_SHAPE_SQUIRCLE);
    legacy.setDismissible(true, '#000');
    modern.setDismissible(true, '#000');
    legacy.setTextOverflow(Toast.TextOverflow.CLIP);
    modern.setTextOverflow(Toast.TextOverflow.CLIP);
    legacy.setStyle({ backgroundColor: '#123456' });
    modern.setStyle({ backgroundColor: '#123456' });

    expect(observableState(modern)).toEqual(observableState(legacy));
  });

  it('warns with the same messages as the current implementation', () => {
    const legacyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const modernWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const legacy = new LEGACY(document.body, 'hello');
    const modern = new Toast(document.body, 'hello');
    legacy.setStyle('nope');
    modern.setStyle('nope');
    legacy.setPosition('middle');
    modern.setPosition('middle');
    legacy.setDuration(-1);
    modern.setDuration(-1);
    legacy.setTextOverflow('scroll');
    modern.setTextOverflow('scroll');

    expect(modernWarn.mock.calls.map((call) => call[0]))
      .toEqual(legacyWarn.mock.calls.map((call) => call[0]));
  });

  it('exposes the same prototype members as the current implementation', () => {
    /**
     * @param {any} implementation
     * @returns {string[]}
     */
    const members = (implementation) => Object.getOwnPropertyNames(implementation.prototype)
      .filter((name) => name !== 'constructor')
      .sort();

    expect(members(Toast)).toEqual(members(LEGACY));
  });
});

describe('Toast instance — module evaluation', () => {
  it('touches no DOM global when imported in a bare Node process', () => {
    const probe = `
      const touched = [];
      for (const name of ['window', 'document']) {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          get() { touched.push(name); return undefined; },
        });
      }
      const { Toast } = await import(${JSON.stringify(join(ROOT_DIR, 'src/core/Toast.mjs'))});
      console.log(JSON.stringify({ touched, type: typeof Toast }));
    `;
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });
    const result = JSON.parse(output.trim().split('\n').pop() ?? '{}');

    expect(result.touched).not.toContain('document');
    expect(result.type).toBe('function');
  });
});
