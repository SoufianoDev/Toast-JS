import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT_DIR = process.cwd();
const require = createRequire(join(ROOT_DIR, 'package.json'));

const source = readFileSync(join(ROOT_DIR, 'src/Toast.js'), 'utf8');
const contract = readFileSync(
  join(ROOT_DIR, 'specs/001-toast-js-modernization/contracts/public-api.md'),
  'utf8',
);
const manifest = JSON.parse(readFileSync(join(ROOT_DIR, 'package.json'), 'utf8'));

const Toast = require(join(ROOT_DIR, 'src/Toast.js'));

const FUNCTION_INTERNALS = new Set(['length', 'name', 'prototype']);

/**
 * @param {object} object
 * @returns {string[]}
 */
function ownNames(object) {
  return Object.getOwnPropertyNames(object).filter((n) => !FUNCTION_INTERNALS.has(n));
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
  it('lists every exported static member', () => {
    const missing = ownNames(Toast).filter((name) => !contract.includes(name));
    expect(missing).toEqual([]);
  });

  it('lists every prototype method', () => {
    const missing = ownNames(Toast.prototype)
      .filter((name) => name !== 'constructor')
      .filter((name) => !contract.includes(name));
    expect(missing).toEqual([]);
  });

  it('lists every accepted style alias', () => {
    const missing = styleAliases().filter((alias) => !contract.includes(alias));
    expect(missing).toEqual([]);
  });

  it('lists every event name', () => {
    const missing = eventNames().filter((event) => !contract.includes(event));
    expect(missing).toEqual([]);
  });

  it('lists every package subpath', () => {
    const missing = Object.keys(manifest.exports).filter((subpath) => !contract.includes(subpath));
    expect(missing).toEqual([]);
  });

  it('accepts every style alias at runtime', () => {
    /** @type {string[]} */
    const warned = [];
    const originalWarn = console.warn;
    console.warn = (message) => warned.push(message);

    try {
      for (const alias of styleAliases()) {
        warned.length = 0;
        const toast = Toast.makeText(null, 'x');
        toast.setStyle(alias);
        expect(warned, `alias "${alias}" was rejected at runtime`).toEqual([]);
      }
    } finally {
      console.warn = originalWarn;
    }
  });

  it('reports the frozen preset and constant counts', () => {
    const presets = ownNames(Toast).filter((name) => name.startsWith('STYLE_'));
    expect(presets).toHaveLength(21);
    expect(Object.isFrozen(Toast.STYLE_DEFAULT_1)).toBe(true);
    expect(Object.isFrozen(Toast.ICON_SIZE)).toBe(true);
    expect(Object.isFrozen(Toast.TextOverflow)).toBe(true);
  });
});
