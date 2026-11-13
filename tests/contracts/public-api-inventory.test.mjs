import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT_DIR = process.cwd();
const require = createRequire(join(ROOT_DIR, 'package.json'));

const contract = readFileSync(
  join(ROOT_DIR, 'specs/001-toast-js-modernization/contracts/public-api.md'),
  'utf8',
);
const manifest = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));
const source = readFileSync(join(ROOT_DIR, 'src/Toast.js'), 'utf8');

const Toast = require(join(ROOT_DIR, 'src/Toast.js'));

const FUNCTION_INTERNALS = new Set(['length', 'name', 'prototype']);

// The audited current-`main` surface, pinned. These sets are compared to the
// runtime by equality, so any drift in either direction fails the test.
const EXPECTED_STATICS = [
  'LENGTH_SHORT', 'LENGTH_LONG',
  'POSITION_TOP_LEFT', 'POSITION_TOP_CENTER', 'POSITION_TOP_RIGHT',
  'POSITION_BOTTOM_LEFT', 'POSITION_BOTTOM_CENTER', 'POSITION_BOTTOM_RIGHT',
  'ICON_POSITION_START', 'ICON_POSITION_END', 'ICON_SIZE',
  'ICON_SHAPE_CIRCLE', 'ICON_SHAPE_SQUARE', 'ICON_SHAPE_SQUIRCLE',
  'FADE', 'SLIDE_IN_TOP', 'SLIDE_OUT_TOP', 'SLIDE_IN_BOTTOM', 'SLIDE_OUT_BOTTOM',
  'SLIDE_IN_TOP_CENTER', 'SLIDE_OUT_TOP_CENTER', 'SLIDE_IN_BOTTOM_CENTER',
  'SLIDE_OUT_BOTTOM_CENTER', 'SLIDE_IN_RIGHT', 'SLIDE_OUT_RIGHT', 'SLIDE_IN_LEFT',
  'SLIDE_OUT_LEFT', 'LIGHT_SPEED_IN_RIGHT', 'LIGHT_SPEED_OUT_RIGHT',
  'LIGHT_SPEED_IN_LEFT', 'LIGHT_SPEED_OUT_LEFT', 'WAVE_IN', 'WAVE_OUT',
  'WOBBLE_IN', 'WOBBLE_OUT',
  'STYLE_DEFAULT_1', 'STYLE_DEFAULT_2', 'STYLE_SUCCESS', 'STYLE_WARNING',
  'STYLE_WARNING1', 'STYLE_WARNING2', 'STYLE_WARNING3', 'STYLE_ERROR',
  'STYLE_ERROR1', 'STYLE_ERROR2', 'STYLE_INFO', 'STYLE_GRADIENT', 'STYLE_NEON',
  'STYLE_NEON1', 'STYLE_DARK_MODE', 'STYLE_LIGHT_MODE', 'STYLE_SHADOW',
  'STYLE_RETRO', 'STYLE_METALLIC', 'STYLE_GLOW', 'STYLE_TRANSPARENT',
  'TextOverflow', 'getWebAppContext', 'getContextFor', 'makeText', 'Manager',
];

const EXPECTED_PROTOTYPE_METHODS = [
  '_resolveContext', 'setDuration', 'setStyle', 'setPosition', 'setAnimation',
  '_resolveAnimation', 'setIcon', 'setIconShape', 'setDismissible',
  'setTextOverflow', 'on', 'off', '_emit', 'addCallback', '_createIconElement',
  '_createCloseButton', '_getPositionStyles', 'show', '_doShow',
  '_cleanupInjectedStyles', 'hide',
];

const EXPECTED_ALIASES = [
  'default_1', 'defult_1', 'default_2', 'defult_2', 'success', 'error',
  'error1', 'error2', 'warning', 'warning1', 'warning2', 'warning3', 'info',
  'gradient', 'neon', 'neon1', 'shadow', 'retro', 'metallic', 'glow',
  'transparent', 'dark_mode', 'light_mode',
];

const EXPECTED_EVENTS = ['show', 'hide', 'dismiss'];

const EXPECTED_SUBPATHS = ['.', './src/Toast.js'];

// Package metadata names, module-format keywords, animation prefixes, language
// primitives, DOM terms and parameter names. The contract is allowed to
// mention these; they are not members of the public surface.
const NON_MEMBER_TERMS = new Set([
  'main', 'exports', 'module', 'browser', 'unpkg', 'jsdelivr', 'files', 'types',
  'Toast', 'import', 'require', 'default',
  'SLIDE_', 'LIGHT_SPEED_', 'WAVE_', 'WOBBLE_',
  'undefined', 'null', 'true', 'false', 'this', 'Boolean', 'TypeError', 'Error',
  'DOMException', 'ToastManager',
  'keyframes', 'iconPath', 'size', 'callback',
  'div', 'span', 'overflow', 'wrap', 'clip', 'video', 'img', 'x',
  'autoplay', 'loop', 'muted', 'playsInline', 'setTimeout',
]);

/**
 * @param {object} implementation
 * @returns {string[]}
 */
function ownNames(implementation) {
  return Object.getOwnPropertyNames(implementation).filter(
    (name) => !FUNCTION_INTERNALS.has(name),
  );
}

/** Identifiers the contract mentions in backticks, compared exactly. */
function documentedIdentifiers() {
  return new Set([...contract.matchAll(/`([^`]+)`/g)].map((match) => match[1]));
}

/** Aliases accepted by setStyle(), read from the frozen baseline source. */
function styleAliases() {
  const block = source.match(/var styleMap = \{([\s\S]*?)\n\s*\};/);
  if (!block) throw new Error('styleMap literal not found in src/Toast.js');
  return [...block[1].matchAll(/([A-Za-z0-9_]+)\s*:\s*Toast\./g)].map((m) => m[1]);
}

/** Event names accepted by on(), read from the frozen baseline source. */
function eventNames() {
  const match = source.match(/var valid = \[([^\]]*)\];\s*\n\s*if \(!valid\.includes\(event\)\)/);
  if (!match) throw new Error('on() event allowlist not found in src/Toast.js');
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe('current-main public API inventory', () => {
  it('exposes exactly the audited static members', () => {
    expect(new Set(ownNames(Toast))).toEqual(new Set(EXPECTED_STATICS));
  });

  it('exposes exactly the audited prototype methods', () => {
    const methods = ownNames(Toast.prototype).filter((name) => name !== 'constructor');
    expect(new Set(methods)).toEqual(new Set(EXPECTED_PROTOTYPE_METHODS));
  });

  it('accepts exactly the audited style aliases', () => {
    expect(new Set(styleAliases())).toEqual(new Set(EXPECTED_ALIASES));
  });

  it('accepts exactly the audited event names', () => {
    expect(new Set(eventNames())).toEqual(new Set(EXPECTED_EVENTS));
  });

  it('declares exactly the audited package subpaths', () => {
    expect(new Set(Object.keys(manifest.exports))).toEqual(new Set(EXPECTED_SUBPATHS));
  });

  it('documents every audited member exactly', () => {
    const documented = documentedIdentifiers();
    const missing = [
      ...EXPECTED_STATICS,
      ...EXPECTED_PROTOTYPE_METHODS,
      ...EXPECTED_ALIASES,
      ...EXPECTED_EVENTS,
      ...EXPECTED_SUBPATHS,
    ].filter((name) => !documented.has(name));

    expect(missing).toEqual([]);
  });

  it('names no member that does not exist', () => {
    const surface = new Set([
      ...EXPECTED_STATICS,
      ...EXPECTED_PROTOTYPE_METHODS,
      ...EXPECTED_ALIASES,
      ...EXPECTED_EVENTS,
      ...EXPECTED_SUBPATHS,
      ...Object.keys(Toast.ICON_SIZE),
      ...Object.keys(Toast.TextOverflow),
      ...Object.keys(Toast.makeText(null, 'x')),
      ...Object.keys(Toast.Manager),
    ]);

    const claimed = [...documentedIdentifiers()]
      .filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
      .filter((name) => !surface.has(name) && !NON_MEMBER_TERMS.has(name));

    expect(claimed).toEqual([]);
  });

  it('freezes only the outer ICON_SIZE container', () => {
    expect(Object.isFrozen(Toast.ICON_SIZE)).toBe(true);
    expect(Object.isFrozen(Toast.ICON_SIZE.SMALL)).toBe(false);
    expect(Object.isFrozen(Toast.ICON_SIZE.MEDIUM)).toBe(false);
    expect(Object.isFrozen(Toast.ICON_SIZE.LARGE)).toBe(false);
    expect(Object.isFrozen(Toast.ICON_SIZE.EXTRA_LARGE)).toBe(false);
  });

  it('freezes the text overflow, icon shape and style preset constants', () => {
    expect(Object.isFrozen(Toast.TextOverflow)).toBe(true);
    expect(Object.isFrozen(Toast.ICON_SHAPE_CIRCLE)).toBe(true);
    expect(Object.isFrozen(Toast.ICON_SHAPE_SQUARE)).toBe(true);
    expect(Object.isFrozen(Toast.ICON_SHAPE_SQUIRCLE)).toBe(true);
    for (const name of EXPECTED_STATICS.filter((n) => n.startsWith('STYLE_'))) {
      expect(Object.isFrozen(Toast[name]), name).toBe(true);
    }
  });

  it('accepts every style alias at runtime', () => {
    /** @type {string[]} */
    const warned = [];
    const originalWarn = console.warn;
    console.warn = (message) => warned.push(String(message));

    try {
      for (const alias of EXPECTED_ALIASES) {
        warned.length = 0;
        Toast.makeText(null, 'x').setStyle(alias);
        expect(warned, `alias "${alias}" was rejected at runtime`).toEqual([]);
      }
    } finally {
      console.warn = originalWarn;
    }
  });
});
