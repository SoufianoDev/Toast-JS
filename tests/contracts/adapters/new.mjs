import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Loads an implementation through the ESM path.
 *
 * The default entry is `src/index.mjs`, the primary ESM entry created by task
 * T015. Until that file exists the adapter fails with an explicit error
 * instead of a bare module-not-found.
 *
 * @param {string} [entry] Repository-relative module path.
 * @returns {Promise<any>} The implementation's public export.
 */
export async function loadNew(entry = 'src/index.mjs') {
  const entryPath = join(import.meta.dirname, '..', '..', '..', entry);

  if (!existsSync(entryPath)) {
    throw new Error(`[contract adapter] Entry "${entry}" does not exist (${entryPath}).`);
  }

  const loaded = await import(/* @vite-ignore */ pathToFileURL(entryPath).href);
  // The ESM export shape is not settled until T015; accept a default or a named export.
  return loaded.default ?? loaded.Toast;
}

export const newAdapter = {
  name: 'new',
  entry: 'src/index.mjs',
  load: loadNew,
};
