// @ts-check
import { describe, expect, it, vi } from 'vitest';
import { resolveStyle } from '../../../src/styles/resolveStyle.mjs';
import * as presets from '../../../src/styles/presets.mjs';
import { PRESET_BY_ALIAS, STYLE_DEFAULT_1 } from '../../../src/styles/presets.mjs';
import { Toast } from '../../../src/core/Toast.mjs';

/** The 21 public preset names, as literal types so the exports can be indexed. */
const PRESET_NAMES = /** @type {const} */ ([
  'STYLE_DEFAULT_1', 'STYLE_DEFAULT_2', 'STYLE_SUCCESS', 'STYLE_WARNING',
  'STYLE_WARNING1', 'STYLE_WARNING2', 'STYLE_WARNING3', 'STYLE_ERROR',
  'STYLE_ERROR1', 'STYLE_ERROR2', 'STYLE_INFO', 'STYLE_GRADIENT',
  'STYLE_NEON', 'STYLE_NEON1', 'STYLE_DARK_MODE', 'STYLE_LIGHT_MODE',
  'STYLE_SHADOW', 'STYLE_RETRO', 'STYLE_METALLIC', 'STYLE_GLOW',
  'STYLE_TRANSPARENT',
]);

/** Every alias the compatibility suite characterizes, and the preset it resolves to. */
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

describe('resolveStyle — aliases', () => {
  it('resolves every characterized alias to its preset', () => {
    for (const [alias, target] of Object.entries(ALIAS_TARGETS)) {
      const resolution = resolveStyle(alias);

      expect(resolution.resolved, alias).toBe(true);
      expect(resolution.warning, alias).toBeNull();
      expect(resolution.style, alias).toBe(Toast[target]);
    }
  });

  it('resolves an alias to the very object the presets module exports', () => {
    for (const [alias, target] of Object.entries(ALIAS_TARGETS)) {
      expect(resolveStyle(alias).style, alias).toBe(presets[target]);
    }
  });

  it('matches an alias case-insensitively', () => {
    expect(resolveStyle('SUCCESS').style).toBe(PRESET_BY_ALIAS.success);
    expect(resolveStyle('Dark_Mode').style).toBe(PRESET_BY_ALIAS.dark_mode);
  });

  it('falls back to the default style and owes a warning for an unknown alias', () => {
    const resolution = resolveStyle('not-a-style');

    expect(resolution.resolved).toBe(true);
    expect(resolution.style).toBe(STYLE_DEFAULT_1);
    expect(resolution.warning).toBe('unknown-alias');
  });

  it('does not trim an alias', () => {
    expect(resolveStyle(' success ').warning).toBe('unknown-alias');
  });
});

describe('resolveStyle — objects', () => {
  it('merges an object over the shared base', () => {
    const resolution = resolveStyle({ backgroundColor: '#123456' });

    expect(resolution.resolved).toBe(true);
    expect(resolution.warning).toBeNull();
    expect(resolution.style).toMatchObject({ display: 'flex', backgroundColor: '#123456' });
  });

  it('captures a string keyframes property', () => {
    const resolution = resolveStyle({ keyframes: '@keyframes x {}' });

    expect(resolution.keyframes).toBe('@keyframes x {}');
  });

  it('ignores a non-string keyframes property', () => {
    expect(resolveStyle({ keyframes: 42 }).keyframes).toBeNull();
  });

  it('does not mutate the object it was given', () => {
    const input = { backgroundColor: '#123456' };
    resolveStyle(input);

    expect(input).toEqual({ backgroundColor: '#123456' });
  });
});

describe('resolveStyle — invalid input', () => {
  it('reports an invalid type without resolving', () => {
    for (const input of [undefined, null, 42, true]) {
      const resolution = resolveStyle(input);

      expect(resolution.resolved, String(input)).toBe(false);
      expect(resolution.warning, String(input)).toBe('invalid-type');
    }
  });

  it('performs no side effect of its own', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    resolveStyle('not-a-style');
    resolveStyle(42);

    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    warn.mockRestore();
    error.mockRestore();
  });
});

describe('setStyle through the resolver', () => {
  it('keeps the warning text of the audited baseline', () => {
    /** @type {string[]} */
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(String(message));

    try {
      const toast = Toast.makeText(null, 'x');
      toast.setStyle('not-a-style');
      toast.setStyle(/** @type {any} */ (42));
      toast.setStyle('success');
    } finally {
      console.warn = originalWarn;
    }

    expect(warnings).toEqual([
      '[Toast-JS] setStyle(): Unknown style "not-a-style".',
      '[Toast-JS] setStyle(): argument must be a string or an object.',
    ]);
  });

  it('leaves the current style untouched for an invalid argument', () => {
    const toast = Toast.makeText(null, 'x');
    const originalWarn = console.warn;
    console.warn = () => {};

    try {
      toast.setStyle('success');
      const styled = toast.customStyle;
      toast.setStyle(/** @type {any} */ (42));

      expect(toast.customStyle).toBe(styled);
    } finally {
      console.warn = originalWarn;
    }
  });
});
