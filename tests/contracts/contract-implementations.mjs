import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { legacyAdapter } from './adapters/legacy.mjs';
import { newAdapter } from './adapters/new.mjs';

const ROOT_DIR = process.cwd();

/**
 * Runs one suite definition against every implementation the project has.
 *
 * The new implementation's entry is created by task T015. Until it exists the
 * suite is reported as skipped rather than silently omitted, so the same
 * assertions run against it unchanged once the entry lands.
 *
 * @param {(adapter: { name: string, entry: string, load: (entry?: string) => Promise<any> }, pending: boolean) => void} defineSuite
 */
export function forEachImplementation(defineSuite) {
  defineSuite(legacyAdapter, false);
  defineSuite(newAdapter, !existsSync(join(ROOT_DIR, newAdapter.entry)));
}
