// @ts-check
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

/**
 * Loads an implementation through the CommonJS/UMD path.
 *
 * The default entry is the audited current-`main` implementation. `src/Toast.js`
 * is byte-identical to the audited baseline commit and is the package's
 * retained `./src/Toast.js` subpath, so it stays a stable baseline alongside
 * the ESM entry.
 *
 * @param {string} [entry] Repository-relative module path.
 * @returns {Promise<any>} The implementation's public export.
 */
export async function loadLegacy(entry = 'src/Toast.js') {
  return require(join(import.meta.dirname, '..', '..', '..', entry));
}

export const legacyAdapter = {
  name: 'legacy',
  entry: 'src/Toast.js',
  load: loadLegacy,
};
