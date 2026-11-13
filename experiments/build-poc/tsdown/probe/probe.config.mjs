// Experiments for questions 1, 2 and 3 of the tsdown proof of concept.
//
//   POC_PROBE=inline   -> `?inline` route: the stylesheet becomes a JS string
//                         and the entry inserts it into the DOM itself.
//   POC_PROBE=inject   -> `css.inject: true`: the stylesheet import is kept in
//                         the JS for the consumer's bundler.
//   POC_PROBE=extract  -> default: the stylesheet is extracted to its own file
//                         and the import is removed from the JS.
//   POC_PROBE=jsdoc    -> declaration file generated from JSDoc annotations in
//                         a plain `.mjs` source file.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const fixture = (file) => fileURLToPath(new URL(`../../fixture/${file}`, import.meta.url));
const probe = (file) => fileURLToPath(new URL(`./${file}`, import.meta.url));
const here = fileURLToPath(new URL('.', import.meta.url));

const mode = process.env.POC_PROBE ?? 'inline';

const ENTRIES = {
  inline: { 'inline-injection': probe('inline-injection.mjs') },
  inject: { injection: fixture('injection.mjs') },
  extract: { injection: fixture('injection.mjs') },
  jsdoc: { 'jsdoc-entry': probe('jsdoc-entry.mjs') },
};

export default defineConfig({
  entry: ENTRIES[mode],
  format: 'esm',
  platform: 'node',
  cwd: here,
  outDir: `dist-${mode}`,
  clean: true,
  sourcemap: true,
  dts: mode === 'jsdoc',
  css: { inject: mode === 'inject' },
});
