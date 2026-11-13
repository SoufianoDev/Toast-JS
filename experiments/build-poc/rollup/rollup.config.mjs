import { fileURLToPath } from 'node:url';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';

const fixture = (file) => fileURLToPath(new URL(`../fixture/${file}`, import.meta.url));
const dir = (name) => fileURLToPath(new URL(`./${name}/`, import.meta.url));

// The injection entry keeps its stylesheet as an explicit import of the published
// CSS asset, so it is the only JavaScript output that references a stylesheet.
const externalStylesheet = {
  name: 'external-stylesheet',
  resolveId(source) {
    if (source.endsWith('.css')) return { id: source, external: true };
  },
};

function bundles(outDir, minify) {
  const minifiers = () => (minify ? [terser()] : []);

  return [
    {
      input: fixture('index.mjs'),
      output: { file: `${outDir}index.mjs`, format: 'es', sourcemap: true },
      plugins: minifiers(),
    },
    {
      input: fixture('browser.mjs'),
      output: { file: `${outDir}browser.js`, format: 'iife', name: 'ToastPoc', sourcemap: true },
      plugins: [...minifiers(), css({ output: 'style.css' })],
    },
    {
      input: fixture('injection.mjs'),
      output: { file: `${outDir}injection.js`, format: 'es', sourcemap: true },
      plugins: [...minifiers(), externalStylesheet],
    },
    {
      input: fixture('consumer.mjs'),
      output: { file: `${outDir}consumer.js`, format: 'es', sourcemap: true },
      plugins: minifiers(),
    },
  ];
}

export default [...bundles(dir('dist'), false), ...bundles(dir('dist-min'), true)];
