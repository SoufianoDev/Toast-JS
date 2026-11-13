import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const FIXTURE_URL = new URL('../fixture/', import.meta.url);

const fixture = (name) => fileURLToPath(new URL(name, FIXTURE_URL));

/**
 * One format per invocation: Vite library mode emits a single format per run.
 * Entries sharing no module can share a run; index and consumer cannot, because
 * a multi-entry ES run splits shared modules into extra chunk files.
 */
const TARGETS = {
  esm: {
    format: 'es',
    entries: { index: fixture('index.mjs'), injection: fixture('injection.mjs') },
    files: { index: 'index.mjs', injection: 'injection.js' },
  },
  consumer: {
    format: 'es',
    entries: { consumer: fixture('consumer.mjs') },
    files: { consumer: 'consumer.js' },
  },
  browser: {
    format: 'iife',
    entries: { browser: fixture('browser.mjs') },
    files: { browser: 'browser.js' },
  },
};

export default defineConfig(() => {
  const target = TARGETS[process.env.POC_TARGET] ?? TARGETS.esm;
  const minify = process.env.POC_MIN === '1';

  return {
    build: {
      outDir: minify ? 'dist-min' : 'dist',
      emptyOutDir: process.env.POC_CLEAN === '1',
      sourcemap: true,
      minify: minify ? 'oxc' : false,
      cssCodeSplit: false,
      lib: {
        entry: target.entries,
        formats: [target.format],
        name: 'ToastPoc',
        fileName: (_format, entryName) => target.files[entryName],
        cssFileName: 'style',
      },
    },
  };
});
