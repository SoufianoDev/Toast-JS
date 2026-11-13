# tsdown probe experiments

These files answer the questions the tsdown proof of concept has to answer
empirically. They are not part of the published package and are not part of the
measured `dist/` / `dist-min/` outputs.

| File | Question |
|---|---|
| `probe.config.mjs` | Builds one probe at a time. `POC_PROBE=inline\|inject\|extract\|jsdoc` selects the mode. |
| `inline-injection.mjs` | `?inline` route: the fixture stylesheet is imported as a JavaScript string and inserted into a `<style>` element by the entry itself. |
| `jsdoc-entry.mjs` | Declaration generation from JSDoc annotations in a plain `.mjs` source file. |
| `tsconfig.json` | Probe-only tsconfig: adds the DOM `lib` so the JSDoc `@param {HTMLElement}` resolves. |
| `tsconfig.isolated.json` | Same, with `isolatedDeclarations: true`, to test the `oxc-transform` declaration path. |
| `attw.mjs` | Runs the `@arethetypeswrong/core` API against the packed tarball and prints the problems verbatim. |

Run them:

```sh
cd experiments/build-poc/tsdown
POC_PROBE=inline  ./node_modules/.bin/tsdown -c probe/probe.config.mjs
POC_PROBE=inject  ./node_modules/.bin/tsdown -c probe/probe.config.mjs
POC_PROBE=extract ./node_modules/.bin/tsdown -c probe/probe.config.mjs
POC_PROBE=jsdoc   ./node_modules/.bin/tsdown -c probe/probe.config.mjs
POC_PROBE=jsdoc   ./node_modules/.bin/tsdown -c probe/probe.config.mjs --tsconfig probe/tsconfig.isolated.json
node probe/attw.mjs
```
