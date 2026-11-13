// @ts-check
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { Toast } from '../../../src/core/Toast.mjs';
import * as presets from '../../../src/styles/presets.mjs';

const require = createRequire(import.meta.url);
const LEGACY = /** @type {any} */ (require('../../../src/Toast.js'));

/** The 21 public preset names, as literal types so the exports can be indexed. */
const PRESET_NAMES = /** @type {const} */ ([
  'STYLE_DEFAULT_1', 'STYLE_DEFAULT_2', 'STYLE_SUCCESS', 'STYLE_WARNING',
  'STYLE_WARNING1', 'STYLE_WARNING2', 'STYLE_WARNING3', 'STYLE_ERROR',
  'STYLE_ERROR1', 'STYLE_ERROR2', 'STYLE_INFO', 'STYLE_GRADIENT',
  'STYLE_NEON', 'STYLE_NEON1', 'STYLE_DARK_MODE', 'STYLE_LIGHT_MODE',
  'STYLE_SHADOW', 'STYLE_RETRO', 'STYLE_METALLIC', 'STYLE_GLOW',
  'STYLE_TRANSPARENT',
]);

/** The alias map the contract fixes, and the preset each alias resolves to. */
const ALIAS_TARGETS = /** @type {Record<string, (typeof PRESET_NAMES)[number]>} */ ({
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
});

/** The constructor's statics, indexed by the literal preset names above. */
const STATICS = Toast;

describe('style presets module', () => {
  it('exports exactly the 21 public presets', () => {
    const exported = Object.keys(presets).filter((name) => name.startsWith('STYLE_'));

    expect(exported.sort()).toEqual([...PRESET_NAMES].sort());
  });

  it('exposes the shared base and the alias map', () => {
    expect(presets.BASE_STYLE.display).toBe('flex');
    expect(Object.keys(presets.PRESET_BY_ALIAS).sort()).toEqual(Object.keys(ALIAS_TARGETS).sort());
  });

  it('freezes every preset', () => {
    for (const name of PRESET_NAMES) {
      expect(Object.isFrozen(presets[name]), name).toBe(true);
    }
  });

  it('keeps the values of the audited baseline', () => {
    for (const name of PRESET_NAMES) {
      expect(presets[name], name).toEqual(LEGACY[name]);
    }
  });

  it('gives every preset the shared base plus its own overrides', () => {
    for (const name of PRESET_NAMES) {
      for (const key of Object.keys(presets.BASE_STYLE)) {
        expect(presets[name], `${name}.${key}`).toHaveProperty(key);
      }
    }
  });

  it('resolves the historical misspellings to the very same preset objects', () => {
    expect(presets.PRESET_BY_ALIAS.defult_1).toBe(presets.PRESET_BY_ALIAS.default_1);
    expect(presets.PRESET_BY_ALIAS.defult_2).toBe(presets.PRESET_BY_ALIAS.default_2);
    expect(presets.PRESET_BY_ALIAS.defult_1).toBe(presets.STYLE_DEFAULT_1);
    expect(presets.PRESET_BY_ALIAS.defult_2).toBe(presets.STYLE_DEFAULT_2);
  });

  it('resolves every alias to its preset', () => {
    for (const [alias, target] of Object.entries(ALIAS_TARGETS)) {
      expect(presets.PRESET_BY_ALIAS[alias], alias).toBe(presets[target]);
    }
  });
});

describe('Toast statics and the presets module', () => {
  it('exposes the presets module’s own objects, not copies', () => {
    for (const name of PRESET_NAMES) {
      expect(STATICS[name], name).toBe(presets[name]);
    }
  });

  it('resolves an alias to the identical object the constructor exposes', () => {
    const toast = Toast.makeText(null, 'x');

    for (const [alias, target] of Object.entries(ALIAS_TARGETS)) {
      toast.setStyle(alias);
      expect(toast.customStyle, alias).toBe(STATICS[target]);
    }
  });

  it('matches an alias case-insensitively', () => {
    const toast = Toast.makeText(null, 'x');

    toast.setStyle('SUCCESS');
    expect(toast.customStyle).toBe(Toast.STYLE_SUCCESS);
  });

  it('defaults to STYLE_DEFAULT_1 and falls back to it for an unknown alias', () => {
    expect(Toast.makeText(null, 'x').customStyle).toBe(Toast.STYLE_DEFAULT_1);

    const toast = Toast.makeText(null, 'x');
    toast.setStyle('not-a-style');
    expect(toast.customStyle).toBe(Toast.STYLE_DEFAULT_1);
  });
});
