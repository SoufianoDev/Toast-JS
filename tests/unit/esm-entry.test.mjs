// @ts-check
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { legacyAdapter } from '../contracts/adapters/legacy.mjs';
import { newAdapter } from '../contracts/adapters/new.mjs';

const ROOT_DIR = process.cwd();
const ENTRY = 'src/index.mjs';
const LEGACY = 'src/Toast.js';

const FUNCTION_INTERNALS = new Set(['length', 'name', 'prototype']);

/**
 * Runs a probe in a plain Node.js process — no jsdom, no bundler, no Vitest
 * module graph — so the results describe the package as a consumer sees it.
 *
 * @param {string} source ESM source evaluated as the process entry point.
 * @returns {any} The parsed JSON the probe printed.
 */
function runInPlainNode(source) {
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });
  return JSON.parse(output.trim().split('\n').pop() ?? '{}');
}

describe('ESM entry', () => {
  it('loads and exposes the Toast constructor as its default export', async () => {
    const loaded = await newAdapter.load();

    expect(typeof loaded).toBe('function');
    expect(Object.getOwnPropertyNames(loaded.prototype).length).toBeGreaterThan(0);
  });

  it('exposes the same constructor as a named export', async () => {
    const namespace = await import(/* @vite-ignore */ pathToFileURL(join(ROOT_DIR, ENTRY)).href);

    expect(namespace.Toast).toBe(namespace.default);
    expect(namespace.Toast).toBe(await newAdapter.load());
  });

  it('exports exactly the public static surface of the runtime', async () => {
    const namespace = await import(/* @vite-ignore */ pathToFileURL(join(ROOT_DIR, ENTRY)).href);
    const runtime = await legacyAdapter.load();

    const runtimeStatics = Object.getOwnPropertyNames(runtime)
      .filter((name) => !FUNCTION_INTERNALS.has(name))
      .sort();
    const namedExports = Object.keys(namespace)
      .filter((name) => name !== 'default' && name !== 'Toast')
      .sort();

    expect(namedExports).toEqual(runtimeStatics);
    expect(namedExports).toHaveLength(61);
  });

  it('presents the same public surface as the legacy implementation', async () => {
    const surfaceOf = (/** @type {any} */ implementation) => ({
      statics: Object.getOwnPropertyNames(implementation)
        .filter((name) => !FUNCTION_INTERNALS.has(name))
        .sort(),
      prototypeMethods: Object.getOwnPropertyNames(implementation.prototype)
        .filter((name) => name !== 'constructor')
        .sort(),
    });

    expect(surfaceOf(await newAdapter.load())).toEqual(surfaceOf(await legacyAdapter.load()));
  });
});

describe('ESM entry in a plain Node.js process', () => {
  it('imports without touching a DOM global', () => {
    const result = runInPlainNode(`
      const touched = [];
      for (const name of ['window', 'document']) {
        Object.defineProperty(globalThis, name, {
          configurable: true,
          get() { touched.push(name); return undefined; },
        });
      }
      const namespace = await import(${JSON.stringify(pathToFileURL(join(ROOT_DIR, ENTRY)).href)});
      console.log(JSON.stringify({
        touched,
        bindings: Object.keys(namespace).length,
        defaultType: typeof namespace.default,
      }));
    `);

    // \`window\` may be read as a capability probe; \`document\` must never be.
    expect(result.touched).not.toContain('document');
    expect(result.defaultType).toBe('function');
    expect(result.bindings).toBe(63);
  });

  it('exports the runtime’s own values, not copies', () => {
    // Identity is asserted in a plain Node.js process: Vitest resolves the ESM
    // entry and `createRequire` through two different module graphs, so they
    // would hold different instances there.
    const result = runInPlainNode(`
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const namespace = await import(${JSON.stringify(pathToFileURL(join(ROOT_DIR, ENTRY)).href)});
      const cjs = require(${JSON.stringify(join(ROOT_DIR, LEGACY))});
      const copied = Object.keys(namespace)
        .filter((name) => name !== 'default' && name !== 'Toast')
        .filter((name) => namespace[name] !== cjs[name]);
      console.log(JSON.stringify({ copied }));
    `);

    expect(result.copied).toEqual([]);
  });

  it('shares one instance with the CommonJS entry', () => {
    const result = runInPlainNode(`
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const namespace = await import(${JSON.stringify(pathToFileURL(join(ROOT_DIR, ENTRY)).href)});
      const cjs = require(${JSON.stringify(join(ROOT_DIR, LEGACY))});
      console.log(JSON.stringify({
        sameExport: namespace.default === cjs,
        sameManager: namespace.default.Manager === cjs.Manager,
        sameQueue: namespace.default.Manager._queue === cjs.Manager._queue,
        sameIconSize: namespace.default.ICON_SIZE === cjs.ICON_SIZE,
        samePreset: namespace.default.STYLE_DEFAULT_1 === cjs.STYLE_DEFAULT_1,
      }));
    `);

    expect(result.sameExport).toBe(true);
    expect(result.sameManager).toBe(true);
    expect(result.sameQueue).toBe(true);
    expect(result.sameIconSize).toBe(true);
    expect(result.samePreset).toBe(true);
  });
});
