# Build Proof of Concept — Acceptance Criteria (identical for both tools)

Both proof-of-concepts build **the same input** from `experiments/build-poc/fixture/`. The fixture is shared on purpose: identical inputs are what make the comparison fair.

## Fixture entries

| Entry | Purpose |
|---|---|
| `fixture/index.mjs` | The primary ESM entry. Must have no DOM access and no CSS side effect. |
| `fixture/browser.mjs` | Browser entry. Imports the CSS so the build must extract it. |
| `fixture/injection.mjs` | Opt-in CSS injection entry. Proves injection can be confined to an explicit entry. |
| `fixture/consumer.mjs` | Imports only `render`. `UNUSED_MARKER` must not survive in the built consumer bundle. |
| `fixture/core.mjs` | Pure logic plus the `UNUSED_MARKER` export. |

## Required acceptance criteria

1. **Native `.mjs` entry and ESM output.** The primary output is a real ESM module with named exports preserved.
2. **Browser standalone output without forcing CommonJS.** The browser output has no top-level `import`/`export` statements.
3. **CSS extraction as a separate file.** The CSS ends up in its own `.css` file, not inlined into JavaScript.
4. **Opt-in injection without core side effects.** The primary ESM output contains no CSS reference; the injection entry carries the CSS.
5. **Source maps.** Source maps are produced and referenced from the outputs.
6. **Minification.** A minified build exists and is measurably smaller than the unminified build.
7. **Tree-shaking.** The consumer bundle does not contain `UNUSED_MARKER`.
8. **Stable output.** Two consecutive builds produce byte-identical output.
9. **No runtime dependency.** The package under test declares no `dependencies`.
10. **Valid `exports` and real pack contents.** Every path declared in the PoC's `package.json` `exports` exists in the `npm pack` file list.
11. **Node/SSR import safety.** Importing the primary ESM output in Node, with no DOM, neither throws nor touches `window` or `document`.
12. **Development Node version.** The build runs on the Node version installed in this environment.

## Required layout

Each proof of concept lives in its own directory with its own `package.json` and lockfile, so neither tool enters the project's dependency graph.

```
experiments/build-poc/<tool>/
  package.json      private, type: module, exports, devDependencies for the tool only
  <tool>.config.mjs
  dist/             unminified outputs
  dist-min/         minified outputs
  outputs.json      names the outputs, so both tools are measured identically
  measurements.json produced by ../measure.mjs
```

The PoC's `package.json` must have a `build` script that produces **both** `dist/` and `dist-min/`, and must be idempotent: the measurement script runs it twice and compares the results byte for byte.

`outputs.json` shape:

```json
{
  "esm": "dist/index.mjs",
  "browser": "dist/browser.js",
  "injection": "dist/injection.js",
  "consumer": "dist/consumer.js",
  "css": "dist/style.css",
  "minDir": "dist-min"
}
```

## Measurement

Both proof-of-concepts are measured by the same script, `experiments/build-poc/measure.mjs`, which reads `outputs.json` and writes `measurements.json`. Do not hand-write measurements.

## Out of scope

Do not modify `src/`, `libs/js/`, the project's `package.json`, or any production file. Do not choose a tool — the comparison is recorded, the selection is a later task.
