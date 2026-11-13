import { beforeAll, describe, expect, it } from 'vitest';
import { forEachImplementation } from './contract-implementations.mjs';

/** The shared base every preset spreads. */
const BASE_STYLE = {
  display: 'flex',
  borderRadius: '10px',
  fontSize: 'clamp(12px, 3vw, 14px)',
  padding: '8px 16px',
  width: 'fit-content',
  maxWidth: '400px',
  height: 'auto',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'all 0.3s ease',
  WebkitTransition: 'all 0.3s ease',
  MozTransition: 'all 0.3s ease',
  msTransition: 'all 0.3s ease',
  boxSizing: 'border-box',
};

/** What each preset adds on top of the base. */
/** @type {Record<string, Record<string, string>>} */
const PRESET_OVERRIDES = {
  STYLE_DEFAULT_1: {
    backgroundColor: '#323232',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  STYLE_DEFAULT_2: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  STYLE_SUCCESS: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    boxShadow: '0 6px 10px rgba(16, 185, 129, 0.2)',
  },
  STYLE_WARNING: {
    backgroundColor: '#FF9800',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  STYLE_WARNING1: {
    background: 'linear-gradient(90deg, #f39c12, #e67e22)',
    color: '#fff',
  },
  STYLE_WARNING2: {
    background: 'linear-gradient(90deg, #e67e22, #f39c12)',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(230, 126, 34, 0.3)',
  },
  STYLE_WARNING3: {
    background: 'linear-gradient(90deg, #f39c12, #e67e22)',
    color: '#000000',
  },
  STYLE_ERROR: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    boxShadow: '0 6px 10px rgba(220, 38, 38, 0.2)',
  },
  STYLE_ERROR1: {
    backgroundColor: '#E74C3C',
    color: '#fff',
  },
  STYLE_ERROR2: {
    background: 'linear-gradient(90deg, #f44336, #e57373)',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  STYLE_INFO: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    boxShadow: '0 6px 10px rgba(37, 99, 235, 0.2)',
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backdropFilter: 'blur(6px)',
  },
  STYLE_GRADIENT: {
    background: 'linear-gradient(90deg, #ff9a9e, #fad0c4)',
    color: '#000',
    boxShadow: '0 5px 15px rgba(255, 154, 158, 0.3)',
  },
  STYLE_NEON: {
    background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)',
    color: '#fff',
    boxShadow: '0 0 15px #00d2ff, 0 0 30px #3a7bd5',
  },
  STYLE_NEON1: {
    backgroundColor: '#0ff',
    color: '#000',
    fontFamily: 'monospace',
    boxShadow: '0 0 10px #0ff, 0 0 40px #0ff',
  },
  STYLE_DARK_MODE: {
    background: '#1f2937',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  STYLE_LIGHT_MODE: {
    background: '#fff',
    color: '#000',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
  },
  STYLE_SHADOW: {
    backgroundColor: '#000000',
    color: '#fff',
    fontFamily: 'Verdana, sans-serif',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  STYLE_RETRO: {
    backgroundColor: '#FCD34D',
    color: '#000',
    boxShadow: '0 6px 12px rgba(252, 211, 77, 0.2)',
  },
  STYLE_METALLIC: {
    background: 'linear-gradient(145deg, #d3d3d3, #a8a8a8)',
    color: '#222',
    fontFamily: 'Tahoma, sans-serif',
    boxShadow: 'inset 3px 3px 6px #999, inset -3px -3px 6px #ddd',
  },
  STYLE_GLOW: {
    backgroundColor: '#5A67D8',
    color: '#fff',
    boxShadow: '0 0 15px rgba(90, 103, 216, 0.8)',
  },
  STYLE_TRANSPARENT: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
  },
};

/** Every accepted alias and the preset it resolves to. */
/** @type {Record<string, string>} */
const ALIAS_TARGETS = {
  default_1: 'STYLE_DEFAULT_1',
  defult_1: 'STYLE_DEFAULT_1',
  default_2: 'STYLE_DEFAULT_2',
  defult_2: 'STYLE_DEFAULT_2',
  success: 'STYLE_SUCCESS',
  error: 'STYLE_ERROR',
  error1: 'STYLE_ERROR1',
  error2: 'STYLE_ERROR2',
  warning: 'STYLE_WARNING',
  warning1: 'STYLE_WARNING1',
  warning2: 'STYLE_WARNING2',
  warning3: 'STYLE_WARNING3',
  info: 'STYLE_INFO',
  gradient: 'STYLE_GRADIENT',
  neon: 'STYLE_NEON',
  neon1: 'STYLE_NEON1',
  shadow: 'STYLE_SHADOW',
  retro: 'STYLE_RETRO',
  metallic: 'STYLE_METALLIC',
  glow: 'STYLE_GLOW',
  transparent: 'STYLE_TRANSPARENT',
  dark_mode: 'STYLE_DARK_MODE',
  light_mode: 'STYLE_LIGHT_MODE',
};

const PRESET_NAMES = Object.keys(PRESET_OVERRIDES);

/**
 * @param {{ name: string, entry: string, load: (entry?: string) => Promise<any> }} adapter
 * @param {boolean} pending
 */
function defineStylesSuite(adapter, pending) {
  const suite = pending ? describe.skip : describe;

  suite(`${adapter.name} implementation`, () => {
    /** @type {Record<string, any>} */
    let Toast;

    beforeAll(async () => {
      Toast = await adapter.load();
    });

    it('exposes exactly the 21 characterised presets', () => {
      const exposed = Object.getOwnPropertyNames(Toast).filter((name) =>
        name.startsWith('STYLE_'),
      );
      expect(new Set(exposed)).toEqual(new Set(PRESET_NAMES));
    });

    it('gives every preset the shared base plus its own overrides', () => {
      for (const name of PRESET_NAMES) {
        const expected = new Set([...Object.keys(BASE_STYLE), ...Object.keys(PRESET_OVERRIDES[name])]);
        expect(new Set(Object.keys(Toast[name])), name).toEqual(expected);
      }
    });

    it('holds no nested object inside a preset', () => {
      for (const name of PRESET_NAMES) {
        for (const [key, value] of Object.entries(Toast[name])) {
          expect(typeof value, `${name}.${key}`).toBe('string');
        }
      }
    });

    it('freezes every preset and refuses writes', () => {
      for (const name of PRESET_NAMES) {
        expect(Object.isFrozen(Toast[name]), name).toBe(true);
        const color = Toast[name].color;
        expect(() => {
          Toast[name].color = '#000000';
        }, name).toThrow(TypeError);
        expect(Toast[name].color, name).toBe(color);
      }
    });

    it('pins the value of every preset', () => {
      for (const name of PRESET_NAMES) {
        expect(Toast[name], name).toEqual({ ...BASE_STYLE, ...PRESET_OVERRIDES[name] });
      }
    });

    it('resolves every alias to its preset', () => {
      for (const [alias, target] of Object.entries(ALIAS_TARGETS)) {
        const toast = Toast.makeText(null, 'x');
        toast.setStyle(alias);
        expect(toast.customStyle, alias).toBe(Toast[target]);
      }
    });

    it('matches an alias to its preset case-insensitively', () => {
      const toast = Toast.makeText(null, 'x');
      toast.setStyle('SUCCESS');
      expect(toast.customStyle).toBe(Toast.STYLE_SUCCESS);
    });

    it('defaults to STYLE_DEFAULT_1 and falls back to it for an unknown alias', () => {
      expect(Toast.makeText(null, 'x').customStyle).toBe(Toast.STYLE_DEFAULT_1);

      const warned = [];
      const originalWarn = console.warn;
      console.warn = (message) => warned.push(String(message));

      try {
        const toast = Toast.makeText(null, 'x');
        toast.setStyle('not-a-style');
        expect(warned.length).toBeGreaterThan(0);
        expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
      } finally {
        console.warn = originalWarn;
      }
    });
  });
}

forEachImplementation(defineStylesSuite);
