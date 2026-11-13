import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const fixture = (file) => fileURLToPath(new URL(`../fixture/${file}`, import.meta.url));

const minify = process.env.POC_MIN === '1';
const target = process.env.POC_TARGET ?? 'index';

// One tsdown invocation per output group. `index` and `modules` are separate
// because a shared chunk between them would keep `UNUSED_MARKER` alive in the
// consumer bundle. The first invocation cleans the output directory; the later
// ones must not, or they would wipe what the earlier one wrote.
const GROUPS = {
  index: {
    entry: { index: fixture('index.mjs') },
    format: 'esm',
    platform: 'node',
    clean: true,
    dts: true,
    cssInject: false,
  },
  modules: {
    entry: {
      injection: fixture('injection.mjs'),
      consumer: fixture('consumer.mjs'),
    },
    format: 'esm',
    platform: 'node',
    clean: false,
    dts: false,
    cssInject: true,
  },
  browser: {
    entry: { browser: fixture('browser.mjs') },
    format: 'umd',
    platform: 'browser',
    clean: false,
    dts: false,
    cssInject: false,
  },
};

const group = GROUPS[target];

export default defineConfig({
  entry: group.entry,
  format: group.format,
  platform: group.platform,
  outDir: minify ? 'dist-min' : 'dist',
  clean: group.clean,
  sourcemap: true,
  minify,
  globalName: 'ToastPoc',
  dts: group.dts && !minify,
  // `css.inject` keeps the stylesheet import in the JS for the consumer's
  // bundler; it is not a runtime DOM injection.
  css: { inject: group.cssInject },
  outputOptions: {
    entryFileNames: (chunk) => (chunk.name === 'index' ? 'index.mjs' : '[name].js'),
  },
});
