import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { legacyAdapter } from './adapters/legacy.mjs';
import { newAdapter } from './adapters/new.mjs';

const ROOT_DIR = process.cwd();

const CONTRACT = {
  durations: { LENGTH_SHORT: 3000, LENGTH_LONG: 6500 },
  positions: {
    POSITION_TOP_LEFT: 'top-left',
    POSITION_TOP_CENTER: 'top-center',
    POSITION_TOP_RIGHT: 'top-right',
    POSITION_BOTTOM_LEFT: 'bottom-left',
    POSITION_BOTTOM_CENTER: 'bottom-center',
    POSITION_BOTTOM_RIGHT: 'bottom-right',
  },
  iconPositions: { ICON_POSITION_START: 'start', ICON_POSITION_END: 'end' },
  animations: {
    FADE: 'fade',
    SLIDE_IN_TOP: 'slide-in-top',
    SLIDE_OUT_TOP: 'slide-out-top',
    SLIDE_IN_BOTTOM: 'slide-in-bottom',
    SLIDE_OUT_BOTTOM: 'slide-out-bottom',
    SLIDE_IN_TOP_CENTER: 'slide-in-top-center',
    SLIDE_OUT_TOP_CENTER: 'slide-out-top-center',
    SLIDE_IN_BOTTOM_CENTER: 'slide-in-bottom-center',
    SLIDE_OUT_BOTTOM_CENTER: 'slide-out-bottom-center',
    SLIDE_IN_RIGHT: 'slide-in-right',
    SLIDE_OUT_RIGHT: 'slide-out-right',
    SLIDE_IN_LEFT: 'slide-in-left',
    SLIDE_OUT_LEFT: 'slide-out-left',
    LIGHT_SPEED_IN_RIGHT: 'light-speed-in-right',
    LIGHT_SPEED_OUT_RIGHT: 'light-speed-out-right',
    LIGHT_SPEED_IN_LEFT: 'light-speed-in-left',
    LIGHT_SPEED_OUT_LEFT: 'light-speed-out-left',
    WAVE_IN: 'wave-in',
    WAVE_OUT: 'wave-out',
    WOBBLE_IN: 'wobble-in',
    WOBBLE_OUT: 'wobble-out',
  },
  textOverflow: { ELLIPSIS: 'ellipsis', WRAP: 'wrap', CLIP: 'clip' },
  iconSizes: {
    SMALL: { width: '20px', height: '20px' },
    MEDIUM: { width: '24px', height: '24px' },
    LARGE: { width: '32px', height: '32px' },
    EXTRA_LARGE: { width: '48px', height: '48px' },
  },
  iconShapes: {
    ICON_SHAPE_CIRCLE: { borderRadius: '50%', overflow: 'hidden' },
    ICON_SHAPE_SQUARE: { borderRadius: '0%' },
    ICON_SHAPE_SQUIRCLE: { borderRadius: '20px', overflow: 'hidden' },
  },
  presets: [
    'STYLE_DEFAULT_1', 'STYLE_DEFAULT_2', 'STYLE_SUCCESS', 'STYLE_WARNING',
    'STYLE_WARNING1', 'STYLE_WARNING2', 'STYLE_WARNING3', 'STYLE_ERROR',
    'STYLE_ERROR1', 'STYLE_ERROR2', 'STYLE_INFO', 'STYLE_GRADIENT',
    'STYLE_NEON', 'STYLE_NEON1', 'STYLE_DARK_MODE', 'STYLE_LIGHT_MODE',
    'STYLE_SHADOW', 'STYLE_RETRO', 'STYLE_METALLIC', 'STYLE_GLOW',
    'STYLE_TRANSPARENT',
  ],
  aliases: [
    'default_1', 'defult_1', 'default_2', 'defult_2', 'success', 'error',
    'error1', 'error2', 'warning', 'warning1', 'warning2', 'warning3', 'info',
    'gradient', 'neon', 'neon1', 'shadow', 'retro', 'metallic', 'glow',
    'transparent', 'dark_mode', 'light_mode',
  ],
  events: ['show', 'hide', 'dismiss'],
  publicMethods: [
    'setDuration', 'setStyle', 'setPosition', 'setAnimation', 'setIcon',
    'setIconShape', 'setDismissible', 'setTextOverflow', 'on', 'off',
    'addCallback', 'show', 'hide',
  ],
};

/**
 * @param {'warn' | 'error'} method
 * @param {() => void} fn
 * @returns {string[]}
 */
function captureConsole(method, fn) {
  /** @type {string[]} */
  const messages = [];
  const original = console[method];
  console[method] = (message) => messages.push(String(message));

  try {
    fn();
  } finally {
    console[method] = original;
  }

  return messages;
}

/**
 * @param {{ name: string, entry: string, load: (entry?: string) => Promise<any> }} adapter
 * @param {boolean} pending
 */
function defineContractSuite(adapter, pending) {
  const suite = pending ? describe.skip : describe;

  suite(`${adapter.name} implementation`, () => {
    /** @type {Record<string, any>} */
    let Toast;

    beforeAll(async () => {
      Toast = await adapter.load();
    });

    beforeEach(() => {
      vi.useFakeTimers();
      document.body.innerHTML = '';
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('exports the audited static members', () => {
      for (const [name, value] of Object.entries(CONTRACT.durations)) {
        expect(Toast[name], name).toBe(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.positions)) {
        expect(Toast[name], name).toBe(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.iconPositions)) {
        expect(Toast[name], name).toBe(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.animations)) {
        expect(Toast[name], name).toBe(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.textOverflow)) {
        expect(Toast.TextOverflow[name], name).toBe(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.iconSizes)) {
        expect(Toast.ICON_SIZE[name], name).toEqual(value);
      }
      for (const [name, value] of Object.entries(CONTRACT.iconShapes)) {
        expect(Toast[name], name).toEqual(value);
      }
    });

    it('freezes the constants and the style presets', () => {
      expect(Object.isFrozen(Toast.ICON_SIZE)).toBe(true);
      expect(Object.isFrozen(Toast.TextOverflow)).toBe(true);
      expect(Object.isFrozen(Toast.ICON_SHAPE_CIRCLE)).toBe(true);

      for (const name of CONTRACT.presets) {
        expect(Toast[name], name).toBeDefined();
        expect(Object.isFrozen(Toast[name]), name).toBe(true);
      }
      const rendered = CONTRACT.presets.map((name) => JSON.stringify(Toast[name]));
      expect(new Set(rendered).size, 'presets must be distinct').toBe(CONTRACT.presets.length);
    });

    it('exposes the public instance methods', () => {
      for (const name of CONTRACT.publicMethods) {
        expect(typeof Toast.prototype[name], name).toBe('function');
      }
    });

    it('creates instances with the documented defaults', () => {
      const toast = Toast.makeText(document.body, 'hello');

      expect(toast.text).toBe('hello');
      expect(toast.duration).toBe(Toast.LENGTH_SHORT);
      expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
      expect(toast.position).toBe(Toast.POSITION_BOTTOM_CENTER);
      expect(toast.icon).toBeNull();
      expect(toast.iconSize).toBe(Toast.ICON_SIZE.MEDIUM);
      expect(toast.iconPosition).toBe(Toast.ICON_POSITION_START);
      expect(toast.iconShape).toBe(Toast.ICON_SHAPE_CIRCLE);
      expect(toast.enterAnimation).toBe(Toast.FADE);
      expect(toast.exitAnimation).toBe(Toast.FADE);
      expect(toast.dismissible).toBe(false);
      expect(toast.closeButtonColor).toBe('#fff');
      expect(toast.textOverflow).toBe(Toast.TextOverflow.ELLIPSIS);
      expect(toast.customKeyframes).toBeNull();
      expect(toast.toastElement).toBeNull();
    });

    it('rejects a non-string text', () => {
      expect(() => Toast.makeText(document.body, 123)).toThrow(TypeError);
    });

    it('chains every setter and returns the same instance', () => {
      const toast = Toast.makeText(document.body, 'hello');

      /** @type {Record<string, any[]>} */
      const argumentsFor = {
        setDuration: [1000],
        setStyle: ['success'],
        setPosition: [Toast.POSITION_TOP_LEFT],
        setAnimation: [Toast.FADE],
        setIcon: ['icon.svg'],
        setIconShape: [Toast.ICON_SHAPE_SQUARE],
        setDismissible: [true],
        setTextOverflow: [Toast.TextOverflow.WRAP],
        on: ['show', () => {}],
        off: ['show', () => {}],
        addCallback: [() => {}],
      };

      for (const name of Object.keys(argumentsFor)) {
        expect(toast[name](...argumentsFor[name]), name).toBe(toast);
      }
    });

    it('resolves every accepted style alias', () => {
      for (const alias of CONTRACT.aliases) {
        const warned = captureConsole('warn', () => {
          Toast.makeText(document.body, 'hello').setStyle(alias);
        });
        expect(warned, `alias "${alias}" must be accepted`).toEqual([]);
      }
    });

    it('falls back to the default style for an unknown alias', () => {
      const warned = captureConsole('warn', () => {
        const toast = Toast.makeText(document.body, 'hello');
        toast.setStyle('not-a-style');
        expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
      });
      expect(warned.length).toBeGreaterThan(0);
    });

    it('accepts the documented argument forms', () => {
      const toast = Toast.makeText(document.body, 'hello', 5000);
      expect(toast.duration).toBe(5000);

      const styled = Toast.makeText(document.body, 'hello');
      styled.setStyle({ backgroundColor: '#123456' });
      expect(styled.customStyle.backgroundColor).toBe('#123456');

      const animated = Toast.makeText(document.body, 'hello');
      animated.setAnimation(Toast.FADE, Toast.WAVE_IN);
      expect(animated.enterAnimation).toBe(Toast.FADE);
      expect(animated.exitAnimation).toBe(Toast.WAVE_IN);

      const iconed = Toast.makeText(document.body, 'hello');
      iconed.setIcon('icon.svg', 'LARGE', Toast.ICON_POSITION_END);
      expect(iconed.icon).toBe('icon.svg');
      expect(iconed.iconSize).toBe(Toast.ICON_SIZE.LARGE);
      expect(iconed.iconPosition).toBe(Toast.ICON_POSITION_END);
    });

    it('ignores invalid input with a warning', () => {
      const warned = captureConsole('warn', () => {
        const toast = Toast.makeText(document.body, 'hello');

        toast.setDuration(-1);
        expect(toast.duration).toBe(Toast.LENGTH_SHORT);

        toast.setPosition('nowhere');
        expect(toast.position).toBe(Toast.POSITION_BOTTOM_CENTER);

        toast.setTextOverflow('nope');
        expect(toast.textOverflow).toBe(Toast.TextOverflow.ELLIPSIS);

        toast.on('not-an-event', () => {});
      });
      expect(warned.length).toBeGreaterThan(0);
    });

    it('emits the lifecycle events in order with the instance as payload', () => {
      /** @type {Array<[string, any]>} */
      const events = [];
      const toast = Toast.makeText(document.body, 'hello');
      toast.setDismissible(true);

      for (const event of CONTRACT.events) {
        toast.on(event, (/** @type {any} */ payload) => events.push([event, payload]));
      }

      toast.show();
      expect(events.map(([event]) => event)).toEqual(['show']);
      expect(events[0][1]).toBe(toast);

      toast.toastElement.querySelector('.toast-js-close-btn').click();
      expect(events.map(([event]) => event)).toEqual(['show', 'dismiss']);

      vi.advanceTimersByTime(350);
      expect(events.map(([event]) => event)).toEqual(['show', 'dismiss', 'hide']);
    });

    it('registers and removes callbacks', () => {
      /** @type {any[]} */
      const seen = [];
      const toast = Toast.makeText(document.body, 'hello');

      toast.addCallback((/** @type {any} */ instance) => seen.push(instance));
      toast.show();
      expect(seen).toEqual([toast]);

      toast.off('show', seen[0]);
      toast.hide();
      vi.advanceTimersByTime(350);
    });

    it('keeps running later callbacks when one throws', () => {
      /** @type {string[]} */
      const seen = [];
      const errors = captureConsole('error', () => {
        const toast = Toast.makeText(document.body, 'hello');
        toast.on('show', () => {
          throw new Error('boom');
        });
        toast.on('show', () => seen.push('second'));

        toast.show();
      });
      expect(errors.length).toBeGreaterThan(0);
      expect(seen).toEqual(['second']);
    });

    it('renders the documented accessibility attributes and removes the node on hide', () => {
      const toast = Toast.makeText(document.body, 'hello');
      toast.show();

      const element = toast.toastElement;
      expect(element.getAttribute('role')).toBe('alert');
      expect(element.getAttribute('aria-live')).toBe('assertive');
      expect(element.getAttribute('aria-atomic')).toBe('true');
      expect(element.className).toContain('toast-js-element');
      expect(document.body.contains(element)).toBe(true);

      toast.hide();
      vi.advanceTimersByTime(350);

      expect(document.body.contains(element)).toBe(false);
      expect(toast.toastElement).toBeNull();
    });
  });
}

defineContractSuite(legacyAdapter, false);

// The new implementation does not exist until T015 creates src/index.mjs. Its
// block is reported as skipped, not silently omitted, and the same assertions
// run against it as soon as the entry lands.
defineContractSuite(
  newAdapter,
  !existsSync(join(ROOT_DIR, newAdapter.entry)),
);
