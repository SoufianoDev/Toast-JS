import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const fixture = (file) => fileURLToPath(new URL(`../fixture/${file}`, import.meta.url));
const dir = (name) => fileURLToPath(new URL(`./${name}/`, import.meta.url));

// Rolldown 1.x removed native CSS bundling (rolldown/rolldown#4271), so the
// stylesheet is emitted as a separate asset and the JS import becomes an empty
// module: the CSS ends up in its own file instead of being inlined.
const cssAsset = {
  name: 'css-asset',
  async load(id) {
    if (!id.endsWith('.css')) return null;
    this.emitFile({
      type: 'asset',
      fileName: 'style.css',
      source: await readFile(id, 'utf8'),
    });
    return { code: 'export default {};', moduleType: 'js' };
  },
};

function bundles(outDir, minify) {
  return [
    {
      input: fixture('index.mjs'),
      output: { file: `${outDir}index.mjs`, format: 'es', sourcemap: true, minify },
    },
    {
      input: fixture('browser.mjs'),
      plugins: [cssAsset],
      output: {
        file: `${outDir}browser.js`,
        format: 'iife',
        name: 'ToastPoc',
        sourcemap: true,
        minify,
      },
    },
    {
      // The injection entry keeps its stylesheet as an explicit import of the
      // published CSS asset, so it is the only JavaScript output that
      // references a stylesheet.
      input: fixture('injection.mjs'),
      external: [/style\.css$/],
      output: { file: `${outDir}injection.js`, format: 'es', sourcemap: true, minify },
    },
    {
      input: fixture('consumer.mjs'),
      output: { file: `${outDir}consumer.js`, format: 'es', sourcemap: true, minify },
    },
  ];
}

export default [...bundles(dir('dist'), false), ...bundles(dir('dist-min'), true)];
