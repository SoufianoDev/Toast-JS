// @ts-check
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { legacyAdapter } from './adapters/legacy.mjs';
import { newAdapter } from './adapters/new.mjs';

const ROOT_DIR = process.cwd();
const contract = readFileSync(
  join(ROOT_DIR, 'specs/001-toast-js-modernization/contracts/public-api.md'),
  'utf8',
);

const FUNCTION_INTERNALS = new Set(['length', 'name', 'prototype']);

/**
 * @param {Function} implementation
 * @returns {{ statics: string[], prototypeMethods: string[] }}
 */
function surfaceOf(implementation) {
  return {
    statics: Object.getOwnPropertyNames(implementation)
      .filter((name) => !FUNCTION_INTERNALS.has(name))
      .sort(),
    prototypeMethods: Object.getOwnPropertyNames(implementation.prototype)
      .filter((name) => name !== 'constructor')
      .sort(),
  };
}

// The adapter is exercised against a fixture with the same export shape, so its
// entry resolution is tested independently of the real entry.
const ADAPTERS = [
  { name: 'legacy', load: () => legacyAdapter.load() },
  { name: 'new', load: () => newAdapter.load('tests/contracts/adapters/fixtures/esm-entry.mjs') },
];

describe('contract adapters', () => {
  it('both adapters load an implementation', async () => {
    for (const adapter of ADAPTERS) {
      expect(typeof (await adapter.load()), adapter.name).toBe('function');
    }
  });

  it('both adapters resolve to the same public surface', async () => {
    const [legacy, modern] = await Promise.all(
      ADAPTERS.map(async (adapter) => surfaceOf(await adapter.load())),
    );
    expect(modern).toEqual(legacy);
  });

  it('both adapters satisfy the shared public-api contract', async () => {
    for (const adapter of ADAPTERS) {
      const surface = surfaceOf(await adapter.load());
      const undocumented = [...surface.statics, ...surface.prototypeMethods].filter(
        (name) => !contract.includes(name),
      );
      expect(undocumented, `${adapter.name} surface is not covered by the contract`).toEqual([]);
      expect(surface.statics, adapter.name).toHaveLength(61);
      expect(surface.prototypeMethods, adapter.name).toHaveLength(21);
    }
  });

  it('the new adapter targets the new ESM entry', () => {
    expect(newAdapter.entry).toBe('src/index.mjs');
  });

  it('the new adapter reports a missing entry explicitly', async () => {
    await expect(newAdapter.load('src/not-an-entry.mjs')).rejects.toThrow(/not-an-entry/);
  });
});
