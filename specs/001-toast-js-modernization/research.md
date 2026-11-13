# Research: Toast-JS Runtime Modernization

**Status:** Initial research ledger; technical PoCs remain unexecuted.  
**Baseline:** `SoufianoDev/Toast-JS` `main` at `701371fd42423d034fc649aeac900f13b99b183d`.

## 1. Confirmed Repository Facts

| Topic | Finding | Source / evidence | Consequence |
|---|---|---|---|
| Active source | `src/Toast.js` is the current active UMD/IIFE-oriented runtime source | Static audit and GitHub `main` tree | New `.mjs` source must become the actual build input; do not assume the existing file is already ESM. |
| Disconnected core helpers | `src/core/context.js`, `dom.js`, and `env.js` exist but are not connected to the active build path per audit | Static audit | Reuse only after review; avoid two competing implementations. |
| Build | `scripts/build.js` derives output by copying/extracting source rather than bundling an ESM module graph | Static audit | A real module-aware bundler is required. |
| Existing outputs | `dist/toast.esm.js` and `dist/toast.umd.js` exist | GitHub `main` tree | Output formats must be validated against actual package consumers. |
| Historical assets | `libs/js/v1.0.0`, `v2.0.0`, `v2.1.0-beta` exist | GitHub `main` tree | Leave these paths and contents unchanged. |
| Tests | `tests/unit`, `tests/integration`, and `tests/regression` contain `.gitkeep` only | GitHub `main` tree | Build a real test harness and characterization coverage. |
| Test script | `npm test` references `tests/regression/issue4/verify-issue4.js`, which is absent | `package.json` plus GitHub tree | Replace with an intentional test command when the test harness is added. |
| Package entry | `package.json` includes `./src/Toast.js` | `package.json` | Preserve or migrate deliberately after investigating downstream use. |
| Package engine | `engines.node` currently says `>=12.0.0` | `package.json` | Treat as an existing declaration, not proof of tested runtime support. |
| Package version metadata | `package.json` says `2.1.0`; README prominently references `2.1.0-beta` docs/distribution | Current `package.json` and `README.md` | Do not infer a new release version from either value; verify registry/tags before release planning. |
| Tooling | `package.json` lists Playwright and Puppeteer as development dependencies | `package.json` | Development-tool Node requirements must be separated from library runtime support. |
| Repository hygiene | Audited tree contains a large tracked `node_modules/` directory and no root `.gitignore` | Static audit | Keep cleanup as a separate scoped change. |
| Branch baseline (T001) | Working branch `chore/spec-kit-bootstrap` is at `b4b2a0c77a522a237a8971d149f1809a7a059943`, three commits ahead of the audited baseline. Those commits add planning/agent documentation, replace `README.md`, and remove the tracked `node_modules/` tree | `git log 701371fd..HEAD`, `git diff --name-status 701371fd..HEAD` | The audited runtime baseline is unchanged: no diff under `src/`, `scripts/`, `libs/`, `tests/`, `package.json`, or `package-lock.json`. |
| Dependency tree on branch (T001) | `node_modules/` is untracked (0 of the baseline's 4,527 tracked entries remain tracked), absent from disk, and ignored via `.gitignore` `node_modules/` and `**/node_modules/` | `git ls-files -- node_modules`, `git ls-tree -r 701371fd -- node_modules`, `git check-ignore -v node_modules/foo` | The hygiene concern in the row above is resolved on this branch and remains a `main` concern. No history rewrite is needed or authorized. |
| Baseline drift (T001) | None against the audited baseline. Live `refs/heads/main` on the remote is `701371fd42423d034fc649aeac900f13b99b183d`, identical to the recorded baseline | `git ls-remote --heads origin`, `git rev-parse origin/main` | The DEC-019 compatibility baseline and `contracts/legacy-compatibility.md` stand unchanged; the static audit does not need to be re-run. |
| Working tree (T001) | No tracked modifications; untracked only `.planning/` and `.ua/`, both local tooling output | `git diff HEAD --stat`, `git status --short` | No pre-existing user changes to preserve. Neither untracked path is covered by `.gitignore`. |
| Development toolchain (Setup) | Vitest 5.1.0, jsdom 31, `@vitest/coverage-v8` 5.1.0, `@playwright/test` 1.65.0, TypeScript 7.0.2, and `@types/node` 24 added as dev dependencies | `package.json`, `npm ls` | The **measured** toolchain floor is Node 22.22.2, set by jsdom 31 rather than by Vitest's declared `^22.12` (R-002.4). This is a contributor floor, separate from the consumer runtime floor. |
| Dependency audit (Setup) | `npm audit` reports 10 high-severity advisories, all inside the pre-existing `puppeteer@^24.40.0` chain (`ws`, `zod` via `chromium-bidi`, `js-yaml`, `extract-zip`). Vitest and Vite appear in no advisory chain | `npm audit --json` | Pre-existing exposure, not introduced by Setup. The available fix is `puppeteer@25`, a breaking change outside the Setup scope. |
| Package artifact gaps (Setup) | `npm pack --dry-run` packs 10 files, but the declared `types` path `dist/types/index.d.ts` and the `unpkg`/`jsdelivr` path `dist/toast.umd.min.js` are not produced by the current build | `npm pack --dry-run`, `package.json` | Pre-existing packaging defect. T045 must verify these paths, and T042 must correct or produce them. |
| Test runner ownership (Setup) | Vitest collects `tests/**/*.test.mjs`; Playwright collects `tests/browser/**/*.spec.mjs` | `vitest.config.mjs`, `playwright.config.mjs` | Vitest's default include matched the Playwright spec and broke `npm test`. The split is now enforced on both sides so neither runner collects the other's files. |
| Install-script policy (Setup) | npm 12 blocks dependency install scripts unless allow-listed, so `puppeteer`'s postinstall does not run and it downloads no Chrome | `npm ci` output | `scripts/record-demo.js` cannot run without a separately approved puppeteer postinstall or a manual browser install. Playwright browsers are fetched with `npx playwright install chromium`. |
| Package artifacts (Setup hardening) | The build now emits every path `package.json` declares: `dist/toast.umd.js`, `dist/toast.esm.js`, `dist/toast.umd.min.js` (esbuild), and `dist/types/Toast.d.ts` (TypeScript from JSDoc, via `tsconfig.types.json`) | `npm run build`, `npm pack --dry-run` | The tarball grew from 10 to 12 files and every declared path resolves. `types` was corrected from the never-produced `dist/types/index.d.ts` to `dist/types/Toast.d.ts`; TypeScript 7 removed `--outFile`, so the declaration cannot be emitted under another name. |
| Dependency advisories (Setup hardening) | `puppeteer` raised from `^24.40.0` to `^25.17.0`; `npm audit` now reports 0 vulnerabilities | `npm audit` | All 10 high-severity advisories were inside the old puppeteer chain. `scripts/record-demo.js` uses only `launch`, `click`, and `screenshot`, all verified working against puppeteer 25.17.0. |
| Install-script approvals (Setup hardening) | `package.json` now carries `allowScripts: { puppeteer: true, esbuild: true }` | `package.json`, `npm ci` | Dependency postinstalls run on install, so puppeteer downloads Chrome and esbuild installs its binary. The unpinned form survives dependency version bumps. |
| Package artifact test (Setup hardening) | `tests/package/artifacts.test.mjs` builds the package and asserts every declared `main`/`module`/`browser`/`unpkg`/`jsdelivr`/`types`/`exports` path exists in the `npm pack` file list, and that no declaration file ships outside `dist/types/` | `npm test` | This is the check that would have caught the missing-artifact defect. It partially covers T045's intent; T045 still owns full artifact verification once the ESM package shape lands. |
| `exports` condition ordering (Setup hardening, OPEN) | TypeScript 7 reports that the `browser` and `default` conditions in `exports["."]` are unreachable because `import` and `require` precede them | `npm run build` warning | A real defect in the audited `package.json`, but `exports` is frozen until the consumer-evidence task (T014) records a migration decision. T042 must reorder the conditions. Left unchanged and reported. |
| Legacy distribution is not the baseline (T007) | `libs/js/v2.1.0-beta/Toast.js` exposes 59 statics and 18 prototype methods; the audited baseline `src/Toast.js` exposes 61 and 21. The distribution lacks `getWebAppContext` and `getContextFor`, and its `Manager` is a function rather than an object | Runtime enumeration of both modules | The frozen distributions cannot serve as the compatibility baseline. The legacy contract adapter loads `src/Toast.js`, which is byte-identical to the audited commit and is the package's retained `./src/Toast.js` subpath. |

## 2. Research Decisions and Open Evidence

### R-001 — Rollup vs Vite Library Mode

**Status:** `POCS EXECUTED — SELECTION PENDING (T012)`  
**Decision rule:** Run two isolated PoCs on identical source modules and compare results; no preference-based selection.

Required checks:

- Native `.mjs` entry and ESM output.
- Required browser standalone/UMD output without forcing CommonJS.
- CSS extraction as a separate file.
- Opt-in injection can be represented without adding injection side effects to core ESM import.
- Source maps, minification, tree-shaking, and stable output.
- No unnecessary runtime dependency.
- Valid `package.json` exports and actual `npm pack` contents.
- Node/SSR import without `window` or `document` at module evaluation.
- Maintainable configuration and compatibility with the tested development Node version.

**Exit artifact:** add a comparison table to this file with measured build outputs, package size, warnings, configuration complexity, and final choice/rationale. If the results do not distinguish the tools, choose the simpler configuration and document why.

### R-001 measured comparison

Three candidates were compared for the decision — **Rollup**, **Vite 8** and **tsdown** — with a fourth, **raw Rolldown**, measured alongside as the baseline that explains the other two. All four were executed on **one shared fixture** (`experiments/build-poc/fixture/`) against the 12 criteria in `experiments/build-poc/ACCEPTANCE.md`, and all four were measured by the same script, `experiments/build-poc/measure.mjs`. The fixture is shared deliberately: identical inputs are what make the comparison fair. Source: `experiments/build-poc/rollup/`, `experiments/build-poc/vite/`, `experiments/build-poc/tsdown/` and `experiments/build-poc/rolldown/`, each with its own `package.json`, lockfile and `node_modules/`, so no tool enters the project's dependency graph.

**The proof-of-concepts are tracked in the repository** — inputs, configurations, lockfiles, harnesses, built outputs and the measured results are all committed under `experiments/build-poc/`, and `experiments/build-poc/README.md` documents how to reproduce any candidate and how to read the results.

- **Rollup 4.68.2** — the JavaScript bundler, the incumbent.
- **Vite 8.3.8** — the library-mode option. Its bundler is **Rolldown 1.2.19** (Rust) with `lightningcss`; its minifier is `oxc`.
- **tsdown 0.23.7** — the Rolldown-powered **library** bundler, with declaration generation and package validation built in.
- **Rolldown 1.3.2** — the Rust bundler used directly, with no library-bundler layer. Supporting baseline.

**Output sizes, bytes raw / gzip**

| Output | Rollup `dist/` | Vite `dist/` | tsdown `dist/` | Rollup `dist-min/` | Vite `dist-min/` | tsdown `dist-min/` |
|---|---|---|---|---|---|---|
| ESM `index.mjs` | 543 / 371 | 426 / 317 | 430 / 316 | 315 / 268 | 371 / 304 | 312 / 267 |
| Browser standalone | 592 / 345 | 661 / 405 | 935 / 513 | 345 / 265 | 394 / 303 | 566 / 387 |
| Injection entry | 337 / 248 | 337 / 249 | 359 / 260 | 273 / 226 | 296 / 237 | 272 / 226 |
| Consumer bundle | 247 / 197 | 264 / 209 | 264 / 209 | 181 / 168 | 223 / 196 | 178 / 165 |
| Extracted CSS | 123 / 120 | 134 / 130 | 122 / 120 | 123 / 120 | 111 / 119 | 122 / 120 |
| Declaration file | not produced | not produced | 240 / 183 | — | — | — |

The tsdown browser bundle is larger because it is **UMD** as required, where the other candidates produced IIFE or ES. Its ESM and consumer outputs are **byte-identical to the Rolldown proof-of-concept's** (sha256 `6cdc7e05…` and `e0e8ccf2…`) — for this fixture tsdown adds nothing over raw Rolldown on the JavaScript output.

A supporting fourth measurement, `experiments/build-poc/rolldown/`, runs Rolldown directly with no library-bundler layer. It is the baseline that explains tsdown's numbers: same engine, no tsdown conventions, no declaration generation.

**Criteria**

| Criterion | Rollup | Vite |
|---|---|---|
| 1. Native `.mjs` entry, ESM output, named exports preserved | PASS (3 exports) | PASS (3 exports) |
| 2. Browser standalone without forcing CommonJS | PASS (no top-level ESM) | PASS (no top-level ESM) |
| 3. CSS extracted to its own file | PASS (123 B) | PASS (134 B) |
| 4. Opt-in injection, no core ESM CSS side effect | PASS — core output has no CSS reference | PASS — core output has no CSS reference | PASS — core output has no CSS reference |
| 4. *Mechanism for the injection entry* | Kept the stylesheet as an **external import** via a custom 6-line `resolveId` plugin, so `injection.js` ships `import './style.css'` | CSS is **always** extracted; library mode cannot attach CSS per entry, so `injection.js` references no stylesheet and the CSS lands in the shared `style.css` | Kept the stylesheet as an **external import** via `css.inject: true`, so `injection.js` ships `import './style.css'` |
| 5. Source maps produced and referenced | PASS (8 produced, referenced by ESM and browser) | PASS (8 produced, referenced by ESM and browser) | PASS (8 produced, referenced by ESM and browser) |
| 6. Minification | PASS (whole-directory ratio 0.8718; JS+CSS only 0.67) | PASS (whole-directory ratio 0.9605; JS+CSS only 0.67) | PASS (whole-directory ratio 0.8859; JS+CSS only 0.687) |
| 7. Tree-shaking | PASS — `UNUSED_MARKER` dropped from the consumer bundle | PASS — `UNUSED_MARKER` and `DEFAULT_STYLE` dropped | PASS — `UNUSED_MARKER` dropped |
| 8. Byte-stable output | PASS (two consecutive builds identical) | PASS (two consecutive builds identical) | PASS (two consecutive builds identical) |
| 9. No runtime dependency | PASS (`dependencies` empty) | PASS (`dependencies` empty) | PASS (`dependencies` empty) |
| 10. Valid `exports` vs real `npm pack` contents | PASS (10 declared, 0 missing of 21 packed files) | PASS (5 declared, 0 missing of 19 packed files) | PASS (10 declared, 0 missing of 15 packed files) |
| 11. Node/SSR import safety | PASS (imports clean, no `window`/`document` leak) | PASS (imports clean, no `window`/`document` leak) | PASS (imports clean, no `window`/`document` leak) |
| 12. Development Node version | PASS (Node v26.7.0) | PASS (Node v26.7.0) | PASS (Node v26.7.0) |

**Build and maintenance cost**

| Measure | Rollup | Vite | tsdown |
|---|---|---|---|
| Configuration | `rollup.config.mjs`, **45 lines** | `vite.config.mjs`, **52 lines** | `tsdown.config.mjs`, **61 lines** plus a required `tsconfig.json`, **12 lines** |
| Direct devDependencies | **3** — `rollup`, `rollup-plugin-css-only`, `@rollup/plugin-terser` (21 packages) | **1** — `vite` (18 installed) | **5** — `tsdown`, `@tsdown/css`, `typescript`, `publint`, `@arethetypeswrong/core` (33 build-time packages, 51 with the validation tools) |
| Build invocations | 8 sub-builds in one config | 6 Vite invocations driven by env vars | 6 `tsdown` invocations driven by env vars |
| Build duration, 5 runs (median) | **962 ms** | **2306 ms** | **4023 ms** |
| Build duration, 5 runs (min / max) | 936 / 1068 ms | 2114 / 2410 ms | 3803 / 7163 ms |
| Node build requirement | Node >=18 | Node `^20.19.0 \|\| >=22.12.0` | Node `^22.18.0 \|\| ^24.11.0 \|\| >=26.0.0` |
| Build warnings | 0 | 0 | 0 |
| Install scripts triggered | none | none | none |

### R-001 findings that matter for the selection

1. **Rolldown has no CSS bundling at all.** Reproduced directly against the CLI with the proof-of-concept's CSS plugin removed:
   ```
   ERROR  Build failed with 1 error:
   [UNSUPPORTED_FEATURE] Bundling CSS is no longer supported (experimental support has been removed).
   See https://github.com/rolldown/rolldown/issues/4271 for details.
   ```
   The same failure occurs on **Rolldown 1.2.19**, the version Vite 8.3.8 bundles internally. **Vite's CSS extraction is therefore Vite's own pipeline, never Rolldown's.**
2. **tsdown's `css.inject` is not runtime DOM injection.** Measured on the same entry with the option on and off: with `css.inject: true` the output keeps `import './style.css'` and the stylesheet is **still emitted as its own file**; with it off, the output references no stylesheet at all. A getter trap on `globalThis.document` and `globalThis.window` recorded **no DOM access at module evaluation** in either mode. tsdown's own documentation states the same thing: the option exists so the consumer's bundler picks the stylesheet up, and tsdown has no built-in DOM injection because injecting styles from a library breaks SSR.
3. **Runtime DOM injection is possible, but only through `?inline`.** Importing the stylesheet with `?inline` yields the CSS as a JavaScript string, which the library can insert into a `<style>` element itself. Verified: the entry imports cleanly in Node with no DOM, throws nothing, and touches no DOM global at module evaluation. The costs are that the CSS is duplicated (once as `style.css`, once as a string in the bundle) and that the source must switch to a `?inline` import.
4. **The `css.inject: true` injection entry is not Node-importable.** Importing the built `injection.js` in Node fails with `ERR_UNKNOWN_FILE_EXTENSION` for the `.css` import. This is shared with the Rollup and Rolldown proof-of-concepts, which emit the same external import, so it is not specific to one tool — but it does mean the injection entry is bundler-only.
5. **tsdown's `.d.ts` generation works, but the fast path is unreachable for a JavaScript-only library.** Declarations come from `rolldown-plugin-dts`. They need `allowJs`, and `allowJs` cannot be combined with `isolatedDeclarations` — the compiler rejects the pair with `TS5053: Option 'allowJs' cannot be specified with option 'isolatedDeclarations'`. `isolatedDeclarations` is what switches generation to the fast `oxc-transform` path, so a library that ships JavaScript sources cannot use it. The slower TypeScript-compiler path is the only option, and without an `allowJs` tsconfig tsdown emits no declaration at all. On the fixture, whose sources carry no JSDoc, the emitted declaration is nearly useless (`target: any, text: any`); with JSDoc annotations it becomes genuinely typed.
6. **Neither Rollup nor Rolldown provides runtime CSS injection out of the box**, and neither does tsdown. All three extract CSS to a file. Rollup needs a third-party CSS plugin *and* a custom plugin to keep the injection entry's stylesheet external; Rolldown needs a hand-written CSS plugin and reaches the same external-import shape through `external`; tsdown needs the separate `@tsdown/css` package and uses `css.inject`. **The injection mechanism is design work under R-005 whichever tool is chosen.**
7. **The "minified ratio" of a whole output directory is misleading for every candidate.** Source maps grow under minification (Rollup 979 B vs 994 B; Vite 3244 B vs 3471 B, because Oxc's mangled names need a name map), so the directory ratio reads 0.8718 / 0.9605 / 0.8859 while the JavaScript-plus-CSS ratio is 0.67 / 0.67 / 0.687.
8. **Vite 8 is Rolldown/Oxc, not Rollup.** Its minifier is `oxc` and its CSS minifier is `lightningcss`. tsdown is also Rolldown-based, and its ESM and consumer outputs came out **byte-identical to the raw-Rolldown proof-of-concept** — for this fixture tsdown's library layer adds nothing to the JavaScript output, only declarations, packaging conventions and process startup.
9. **All candidates need more than one build invocation** to emit four self-contained outputs, and all need the multi-entry ESM runs split so shared modules do not leak into a shared chunk — which is what makes the tree-shaking probe meaningful. tsdown makes this worse: a multi-entry ESM build silently kept `UNUSED_MARKER` alive in the consumer bundle through a shared hashed chunk, and `output.codeSplitting: false` is rejected by Rolldown with "multiple inputs are not supported when output.codeSplitting is false".
10. **The output sizes do not distinguish the tools.** The ESM outputs fall within 426–543 B raw, the browser bundles within 592–935 B, and the extracted CSS within 122–134 B.
11. **Measured build time on this repository, 5 runs each: Rollup 962 ms median, Vite 2306 ms, tsdown 4023 ms.** The raw-Rolldown baseline measured 413 ms. tsdown is the **slowest** candidate here despite being Rolldown-powered: six `tsdown` process invocations dominate, and the declaration build alone costs 1.8–2.5 s against 0.3–0.5 s without declarations. The toolchain headlines come from 10,000-component React applications and large monorepos; for a library of this size the whole build is seconds, and **no speedup shown in that material applies here**.
12. **tsdown's CSS support is documented as experimental**, and `@tsdown/css` is an optional peer **pinned to the exact tsdown version**. Every tsdown upgrade forces a matching `@tsdown/css` upgrade, and any API change in `css.inject`, `css.fileName` or `?inline` breaks the build with no deprecation path.
13. **The declaration change surfaced package-consumer problems the other candidates could not surface.** `@arethetypeswrong/core` reports 45 problems for tsdown — `NoResolution` on node10, `UntypedResolution` on subpaths without a `types` condition, and `CJSResolvesToESM` for an ESM-only package with no `require` condition. The other three report zero problems only because they declare no types at all, so the check returns early. `publint` warns that `dist/browser.js` is written as CommonJS but interpreted as ESM under `"type": "module"` — the UMD output would need a `.cjs` extension or a sub-package, which would break file-name parity with the other proof-of-concepts.

### R-001 decision — Rolldown 1.3.2 selected

**Decision (2026-11-13, task T012): use Rolldown 1.3.2 directly as the build engine.** Rolldown handles JavaScript bundling and the ESM and browser UMD outputs. Recorded in `DECISION_REGISTER.md` as DEC-032.

**Why Rolldown.** All four candidates met the 12 acceptance criteria, so the decision was made on measured cost:

| Evidence | Rolldown | Rollup | Vite 8 | tsdown |
|---|---|---|---|---|
| Median build, 5 runs | **413 ms** | 962 ms | 2306 ms | 4023 ms |
| Direct devDependencies | **1** | 3 | 1 | 5 |
| Build-time packages | **4** | 21 | 18 | 33 (51 with validators) |
| Configuration | 56 lines | 45 lines | 52 lines | 61 lines + 12-line tsconfig |
| Declaration generation | none | none | none | 240 B, TypeScript-compiler path only |

Rolldown was the fastest by a wide margin, needed one direct dependency, and needed no declaration or validation tooling to produce the required JavaScript outputs. Its JavaScript output is byte-identical to Vite 8's, because Vite 8 already bundles with Rolldown internally — so choosing Rolldown loses nothing from the Vite option and drops Vite's conventions layer.

**Why not Rollup.** It met every criterion and has the smallest configuration file, but it is the JavaScript bundler the toolchain exists to replace: 962 ms median against Rolldown's 413 ms, and it needs a third-party CSS plugin plus a custom `resolveId` plugin to keep the injection entry's stylesheet external.

**Why not Vite 8.** Its bundler *is* Rolldown, so it adds a conventions layer without changing the JavaScript output — while costing 2306 ms median across six process invocations, 18 build-time packages, and a CSS pipeline that is Vite's own rather than Rolldown's. Its one advantage over raw Rolldown — built-in CSS extraction — is not needed, because DEC-036 keeps CSS as separately copied Plain CSS files.

**Why not tsdown.** It is the only candidate that produces declarations, but it was the **slowest** candidate here (4023 ms median, ~10× Rolldown) because six `tsdown` process invocations dominate and the declaration build alone costs 1.8–2.5 s. Its ESM and consumer outputs are byte-identical to raw Rolldown's, so its library layer added nothing to the JavaScript. Its declaration pipeline cannot use the fast `isolatedDeclarations` path, because that option cannot be combined with the `allowJs` that generating declarations from JavaScript requires — and DEC-037 keeps declarations on the TypeScript compiler pipeline instead. Its CSS support is documented as experimental and its `@tsdown/css` package is pinned to the exact tsdown version, so every upgrade forces a matching one with no deprecation path.

**Boundary decisions taken with the selection**

- **CSS stays separate Plain CSS files, copied deterministically** (DEC-036). No CSS bundler, CSS minifier, or bundler-integrated CSS plugin. This also sidesteps Rolldown's inability to bundle CSS at all, and avoids a CSS transformer rewriting the shipped stylesheet.
- **Runtime CSS injection stays an explicit, optional Toast-JS feature and stays SSR-safe.** The measured mechanism for it is the `?inline` route — the stylesheet as a JavaScript string that the library inserts into a `<style>` element itself — verified to import cleanly in Node with no DOM and no DOM access at module evaluation. The exact API remains architecture work under VAL-007.
- **Declarations stay on the TypeScript compiler pipeline** (DEC-037), separate from bundling. The proof-of-concept measurements do not satisfy the production-readiness gate: `publint` and `@arethetypeswrong/core` against the **actual generated declarations**, ESM and UMD consumer smoke tests, complete npm tarball verification, CSS output and optional injection verification, and deterministic builds with zero runtime dependencies (VAL-009).

**The measurements are preserved.** The four proof-of-concepts remain at `experiments/build-poc/{rollup,vite,rolldown,tsdown}/` with their `measurements.json`, so the decision can be re-checked against the same numbers.

### R-001 reproducibility

All four proof-of-concepts can be re-measured with one command each, from the repository root:

```bash
node experiments/build-poc/measure.mjs experiments/build-poc/rollup
node experiments/build-poc/measure.mjs experiments/build-poc/vite
node experiments/build-poc/measure.mjs experiments/build-poc/rolldown
node experiments/build-poc/measure.mjs experiments/build-poc/tsdown
```

Each script runs the proof-of-concept's `build` twice, verifies byte stability, and rewrites `measurements.json`. The repeated-run build timing for all candidates comes from one shared harness:

```bash
node experiments/build-poc/benchmark.mjs 5
```

The 12 criteria are in `experiments/build-poc/ACCEPTANCE.md`; the shared input is `experiments/build-poc/fixture/`. tsdown's CSS, declaration and package-validation experiments are reproducible from `experiments/build-poc/tsdown/probe/` (see its `README.md`).

### R-002 — Runtime Support Matrix

**Status:** `NEEDS VALIDATION`  

Separate these axes:

1. Browser runtime: the browser APIs and ECMAScript features required to display notifications.
2. Node.js module loading: the supported environment for importing the ESM package in SSR/build contexts; it does not imply a DOM renderer runs in Node.
3. Development/build runtime: Node required by Vite/Rollup, Vitest, Playwright, type tooling, and scripts.

Inspect used syntax and Web APIs, test the lowest proposed versions, and document any unsupported browser behavior. Add no polyfill unless a required supported environment demonstrably needs it.

**Setup evidence (2026-11-12):** The added development toolchain requires Node `^22.12 || ^24 || >=26` (Vitest 5) and Node >=20 (`@playwright/test`). These are contributor toolchain floors and do not establish a library runtime floor. `package.json` `engines.node: >=12.0.0` still describes the library runtime only, and remains unvalidated.

#### R-002.1 Method (validated 2026-11-13, task T013)

Every number below was measured, not recalled.

- **ECMAScript floor** — the TypeScript compiler was run against the runtime sources at each `lib` level, with `--strict false` so only lib-availability diagnostics survived. The level at which the last diagnostic disappears is the floor.
- **Browser support** — per-engine first-supported versions were read from the MDN browser-compat-data snapshot (`@mdn/browser-compat-data`, installed outside the repository), not from memory.
- **Node floors** — official Node binaries were downloaded from `nodejs.org` and executed directly. The `node` npm package was tried first and **rejected**: npm 12 blocks its `preinstall`, so `npx node@18.20.8 --version` silently reported the system `v26.7.0`. Every matrix run below asserts the running binary's own `process.version`, so a false pass is impossible.
- **Browser engines** — the required API surface was evaluated in real Chromium and Firefox.

#### R-002.2 Axis 1 — browser runtime

The runtime's language floor is **ES2017**: `Array.prototype.includes` sets ES2016 and `Object.values` sets ES2017. Nothing above ES2017 is required.

| API | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `Object.values` (ES2017) | 54 | 14 | 47 | 10.1 |
| `Array.prototype.includes` (ES2016) | 47 | 14 | 43 | 9 |
| `Symbol` (ES2015) | 38 | 12 | 36 | 9 |
| `document.querySelector` | 1 | 12 | 3.5 | 3.1 |
| `document.getElementById` | 1 | 12 | 1 | 1 |
| `document.readyState` | 1 | 12 | 3.6 | 1 |
| `document.createElement` / `createTextNode` | 1 | 12 | 1 | 1 |
| `document.head` | 4 | 12 | **61** | 5 |
| `document.body` | 1 | 12 | **60** | 1 |
| `Element.getElementsByTagName` | 1 | 12 | 1 | 1 |
| `Node.appendChild` / `removeChild` / `insertBefore` | 1 | 12 | 1 | 1.1 |
| `EventTarget.addEventListener` | 1 | 12 | 1 | 1 |
| `window.requestAnimationFrame` / `cancelAnimationFrame` | 24 | 12 | 23 | 7 |

`globalThis` (Chrome 71, Safari 12.1) is referenced by the UMD wrapper but is **guarded** — `typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : this` — so it does not raise the floor. The `webkit*` and `moz*` animation-frame names are fallbacks behind the standard names, not requirements.

**Recommended browser minimum: Chrome 54+, Edge 14+, Firefox 61+, Safari 10.1+.** Firefox is set by `document.head` (61), not by the language level.

**Verified in real engines:** the complete required surface was evaluated in Chromium 158 and Firefox 159 — all of `Object.values`, `Array.prototype.includes`, `Symbol`, `globalThis`, `requestAnimationFrame`, `document.querySelector`, `document.head`, `document.body` present. WebKit could not be launched in this environment (missing host libraries), so **the WebKit row is unverified here**.

**No polyfill is indicated.** Every DOM API used is universally available, and the language floor is native in engines from 2017 onward.

#### R-002.3 Axis 2 — Node.js module import

Measured in a bare Node process with getters installed on `window` and `document`, so DOM access at module evaluation would be recorded.

| Node | shipped ESM `dist/toast.esm.js` | legacy deep import `src/Toast.js` | package name via `exports` |
|---|---|---|---|
| 12.22.12 | FAIL `Unexpected token 'export'` | FAIL | FAIL |
| 14.21.3 | FAIL `Unexpected token 'export'` | PASS | FAIL |
| 16.20.2 | FAIL `Unexpected token 'export'` | PASS | FAIL |
| 18.20.8 | FAIL `Unexpected token 'export'` | PASS | FAIL |
| 20.19.5 | PASS | PASS | PASS |
| 22.22.2 | PASS | PASS | PASS |
| 24.10.0 | PASS | PASS | PASS |

**No `document` access at module evaluation in any Node version.** The only global read is the `typeof window` capability probe, which short-circuits before `document` is read. That is the SSR-safe pattern, and it is what makes the module importable in Node.

**Finding: the shipped ESM entry only loads on Node 20.19+.** `dist/toast.esm.js` is a `.js` file containing ESM syntax, in a package with no `"type": "module"`. Node 20.19+ and 22.7+ rescue it through module-syntax detection (with a "Reparsing as ES module" warning); on Node 14, 16 and 18 it is a hard `Unexpected token 'export'` failure. The package's `exports["."].import` condition points at that file, so **the primary ESM consumer entry is broken on Node 14–18 today**.

**The declared `engines.node: ">=12.0.0"` is therefore not accurate for the artifact as currently shipped.** The legacy deep import works from Node 14+, which is what consumers on older Node are using today. T042 must set `engines.node` to match what it actually ships, and the packaging gate (VAL-009) must verify the declared floor by importing the packed tarball, not the source tree. R-002.3a shows this floor is an artifact of the packaging, not of the runtime, and gives the corrected value.

**Recommended Node floor for the planned ESM entry: Node 12.17+**, measured — see R-002.3a. Until the build emits a real `.mjs` module with a correct `exports` map, the artifact as shipped requires Node 20.19+.

#### R-002.3a Correction — the 20.19+ floor is a packaging defect, not a runtime floor

The failure above is **not** a language or runtime boundary. `dist/toast.esm.js` is a `.js` file containing ESM syntax, in a package with no `"type": "module"`. Node 20.19+ and 22.7+ rescue such a file through module-syntax detection; Node 14–18 do not.

Measured with **only** the ESM output renamed to `.mjs` and the `exports` map repointed at it — no other change, and nothing in the repository modified:

| Node | `import` by package name | deep import `./src/Toast.js` | `require()` by package name |
|---|---|---|---|
| 12.0.0 | FAIL — "Not supported" (ESM unflagged only from 12.17) | FAIL | **OK — 61 exports** |
| 12.22.12 | **OK** | **OK** | OK |
| 14.21.3 | **OK** | **OK** | OK |
| 16.20.2 | **OK** | **OK** | OK |
| 18.20.8 | **OK** | **OK** | OK |
| 20.19.5 | **OK** | **OK** | OK |
| 22.22.2 | **OK** | **OK** | OK |

**With the packaging corrected, the ESM entry imports on Node 12.17+, and the UMD `require()` path works on Node 12.0.0.** The "Node 20.19+" row in R-002.3 is therefore a defect in the artifact, not a support boundary, and the declared `engines.node: ">=12.0.0"` is close to correct rather than wrong — it would need `>=12.17.0` for the ESM entry.

**Why the fix is not applied here:** correcting it means changing the package `exports` map and the build output name, and `AGENTS.md` freezes both until the consumer-evidence task (T014) records a migration decision. The measurement is therefore recorded as evidence for T014, not applied. The same packaging work must also fix the unreachable `browser` and `default` conditions, and must be verified against the packed tarball (VAL-009), not the source tree.

#### R-002.4 Axis 3 — development and build tooling

The real binaries were run under each Node.

| Node | `tsc` 7.0.2 | `vitest` 5.1.0 | `rolldown` 1.3.2 |
|---|---|---|---|
| 16.20.2 | FAIL — `ERR_UNKNOWN_FILE_EXTENSION`, the extensionless `bin/tsc` inside a `type: module` package | FAIL — `node:util` has no `styleText` | — |
| 18.20.8 | PASS | FAIL — transitive `undici` incompatibility | FAIL — module not found |
| 20.19.5 | PASS | FAIL — transitive `undici` incompatibility | PASS |
| 22.12.0 | PASS | FAIL — transitive `undici` incompatibility | — |
| 22.22.2 | PASS | **PASS** | **PASS** |
| 24.10.0 | PASS | PASS | PASS |
| 24.15.0 | PASS | PASS | PASS |

**Recommended development/build Node floor: 22.22.2.**

- The binding constraint is **jsdom 31**, whose floor is `^22.22.2 || ^24.15.0 || >=26.0.0` — not Vitest's declared `^22.12.0`. Node 22.12.0 satisfies Vitest's declared range but fails on a transitive `undici` incompatibility, so the declared floor is optimistic.
- **Rolldown does not raise the floor.** Its own declared `^20.19.0 || >=22.12.0` is below the toolchain floor, and it was verified working at 20.19.5 and above.
- **Type checking alone needs Node 18.20.8.** TypeScript 7.0.2 declares `engines.node: ">=16.20.0"`, but its extensionless `bin/tsc` cannot be loaded by Node 16 inside its `type: module` package, so the declared floor is not achievable.
- The toolchain floor is a **developer** requirement and is independent of the consumer requirement in R-002.3. It must not be written into `engines.node`.

#### R-002.5 Recommended minimums

| Axis | Recommended minimum | Basis |
|---|---|---|
| Browser runtime | Chrome 54+, Edge 14+, Firefox 61+, Safari 10.1+ | ES2017 floor plus `document.head` |
| Node module import, ESM entry once packaged as `.mjs` | **Node 12.17+** | ESM unflagged from 12.17; measured OK from 12.22.12 up; no DOM access at module evaluation (R-002.3a) |
| Node module import, UMD `require()` entry | **Node 12.0.0+** | measured OK on 12.0.0 (R-002.3a) |
| Node module import, artifact as shipped today | Node 20.19+ | module-syntax detection only — a defect, not a design (R-002.3a) |
| Development and build tooling | Node 22.22.2 | jsdom 31 |

The two Node rows for the **corrected** packaging are the ones worth publishing. The row for the artifact as shipped today records a defect that T014/T042 are expected to remove, not a floor the library should hold itself to.

#### R-002.6 Reproducing these results

```bash
# ECMAScript floor (per level, against the shipped runtime)
npx tsc --noEmit --allowJs --checkJs --strict false --noImplicitAny false \
  --target es2017 --lib es2017,dom --moduleResolution bundler --module esnext src/Toast.js

# Node floors — official binaries from nodejs.org, run directly,
# asserting process.version per run
npx vitest run
npx tsc -p tsconfig.check.json
npx rolldown -c rolldown.config.mjs
```

The Node binaries used were downloaded from `nodejs.org/dist` and run directly, because the `node` npm package's `preinstall` is blocked by npm 12 and would silently report the system Node.

#### R-002.7 Out of scope here

The legacy `role="alert"` / `aria-live="assertive"` announcement semantics conflict with the specification's polite-status default. It is **not** a support-boundary question and is **not** decided here. It remains recorded in `contracts/public-api.md` §11 item 8 and `research.md` §3 for owner review.

### R-003 — `./src/Toast.js` Deep Export

**Status:** `EVIDENCE GATHERED 2026-11-13` (task T014) — **RETAIN the path, MIGRATE its target, no deprecation cycle**
**Correction pass 2026-11-13 (later the same day):** the Node.js `exports` history was re-measured with a decisive discriminator, the physical-path fallback was investigated, and the proposed compatibility shim was tested end to end. Absolute claims about consumer absence were replaced with bounded statements. See R-003.3a, R-003.4a, R-003.4b and R-003.4c.
**Final Node verification 2026-11-13:** the `exports` history was resolved against the official Node changelog, with the three mapping shapes tested separately and the correct flags used; Node 12.15 was reclassified as an expected unsupported limitation; the `main` fallback role was measured; and mixed ESM/CJS duplicate module-level state was measured. See R-003.4a, R-003.4b, R-003.4e.
**Decision rule:** Search repository history, docs, issues, and available downstream consumer references. If retained, prefer a deliberate compatibility wrapper or stable path that does not make `.js` the new source of truth. Do not remove the path just because the internal source moves to `.mjs`.

#### R-003.1 Provenance

The whole npm-shaped manifest — `main`, `module`, `browser`, `unpkg`, `jsdelivr`, `types`, `exports`, `files` — was added in a **single commit**, `9e86bf7` "docs(readme): update links and fix license filename" (2026-03-20), which added 68 lines to `package.json`. The `./src/Toast.js` subpath was included from that first moment; there was no deprecation step, no migration note, and no changelog entry — `CHANGELOG.md` contains no mention of npm, module, import, require, or publish.

#### R-003.2 The manifest has never been exercised by a published package

| Check | Result |
|---|---|
| `npm view @soufianodev/toast-js` | **404** — the scoped package does not exist on npm |
| `npm view @soufianodev/toast-js versions` | **404** — no version is published under this name |
| npm downloads API for the scoped name | **404** — no download record, because no such package is published |
| Registry search `maintainer:soufianodev` | **total 0** — the registry search returns no packages for this maintainer |
| Unscoped `toast-js` on npm | An **unrelated** project (`anthony-j-labuda/toast-js`, v1.1.0, 2016) |
| GitHub releases | **none** |

**What this establishes:** there is no publicly discoverable npm distribution of this package under its own name, so the `exports` map has never been resolved by a public installation.

**What it does not establish:** it cannot prove that *no* installation ever occurred. npm publishes no download record for a package that was never published, a private or organisation-scoped installation would not appear in these queries, and a direct install from a git URL or a tarball bypasses the registry entirely. The bounded claim is **absence of publicly discoverable npm usage**, not absence of all usage.

#### R-003.3 External references (GitHub code search, all of GitHub)

| Query | Hits | Where |
|---|---|---|
| `"@soufianodev/toast-js"` | **2** | Both inside this repository (`package.json`, `package-lock.json`) |
| `"toast-js/src/Toast.js"` | **0** | No publicly indexed match for the deep path |
| `"soufianodev/toast-js"` | 8 | 7 in this repository, plus `natereprogle/chyrp` README, which merely links to the project among several alternatives in a "why another library?" comparison — not an import |
| `"soufianodev.github.io/Toast-JS"` | 12 | 4 repositories, **all** using the `libs/js/` classic-script CDN path |
| `"Toast-JS/libs/js"` | 11 | Same set |

**Every publicly discoverable external consumer uses a classic `<script src>` CDN tag.** The three are `YK911/bcon-81` (1 file), `ytsodacan/fg` (3 files), and the owner's own `SoufianoDev/Portfolio` — all referencing `.../libs/js/v2.x.y/Toast.js`. None references `src/Toast.js`, `dist/`, or the package name.

**The same holds for the repository's own documentation.** Across the entire README history, the only usage form ever documented is:

```
33×  <script src="https://soufianodev.github.io/Toast-JS/libs/js/v2.0.0/Toast.js"
10×  <script src="https://soufianodev.github.io/Toast-JS/libs/js/v1.0.0/Toast.js"
 9×  <script src="https://soufianodev.github.io/Toast-JS/libs/js/v2.1.0-beta/Toast.js"
```

No commit has ever documented `npm install`, `require(`, or an ESM `import`. `docs/v1`, `docs/v2` and `docs/v2.1.0-beta` and all five demos do the same.

**No issue in the repository was filed by anyone other than the owner.** All 62 issues, open and closed, are authored by `SoufianoDev`. None mentions the deep path, npm installation, `require()`, or CommonJS. A repository that receives no external issue reports is a repository with no publicly observable consumer base — but this is again an absence of publicly discoverable signal, not proof of absence.

**Inside the repository**, the deep path appears only as: the manifest itself; `tests/contracts/public-api-inventory.test.mjs`, which asserts the subpath set `['.', './src/Toast.js']` (a self-referential contract, not consumer evidence); `tsconfig.types.json` (an include path); `scripts/build.js` (the build input); `tests/contracts/adapters/legacy.mjs` (loads the file from the working tree); and the planning documents. **No documentation, example, or demo references it.**

The raw file *is* reachable over HTTP — `https://soufianodev.github.io/Toast-JS/src/Toast.js` returns 200, 44 174 bytes — but it is the UMD source, so it is consumable only as a classic script, and no publicly indexed repository references that URL.

#### R-003.3a What the search can and cannot show

| The evidence shows | The evidence does not show |
|---|---|
| No package is published under `@soufianodev/toast-js` | That nobody installed it from a git URL, a tarball, a fork, or a private registry |
| No publicly indexed GitHub code imports the deep path | That no private repository, vendored copy, or internal mirror does |
| No publicly indexed external code imports the package name | That no unpublished consumer exists |
| No issue was filed by anyone but the owner | That no consumer exists who never filed an issue |
| Every publicly indexed usage is the `libs/js/` CDN script | That no unpublished usage exists |

Every recommendation below is therefore justified by **the absence of publicly discoverable demand**, which is the strongest basis the available evidence supports. It is not a claim that the consumer count is exactly zero.


#### R-003.4 Measured behavior of the real packaged output

Tested against the **actual packed tarball** (`soufianodev-toast-js-2.1.0.tgz`, sha256 `86c14fc448475007c57a1db721669efe9931a773d581c74146f51c92cd3f75fd`, 12 files), installed into a consumer project with `npm install <tarball>`, then probed with **official Node binaries downloaded from `nodejs.org`** — never `npx node@X`, which silently reports the system Node.

| Node | `import` root | `import` deep | `require` root | `require` deep |
|---|---|---|---|---|
| 12.0.0 | FAIL "Not supported" | FAIL "Not supported" | **OK — 61 exports** | **OK — 61 exports** |
| 12.16.3 | FAIL (module will not parse without `--experimental-modules`) | OK only with `--experimental-modules` | OK — 61 | OK — 61 |
| 12.17.0 | FAIL "Unexpected token 'export'" | **OK — 1 binding (`default`, a function)** | OK — 61 | OK — 61 |
| 12.22.12 | FAIL "Unexpected token 'export'" | OK — 1 binding | OK — 61 | OK — 61 |
| 14.21.3 / 16.20.2 / 18.20.8 | FAIL "Unexpected token 'export'" | OK — 1 binding | OK — 61 | OK — 61 |
| 20.19.5 / 22.22.2 | **OK** | OK — 1 binding | OK — 61 | OK — 61 |

`require.resolve('@soufianodev/toast-js')` resolves to `dist/toast.umd.js` on every version.

**The deep path is the only module-shaped entry that works on the oldest Node.** The root `import` fails on Node 12.17–18 for the packaging reason recorded in R-002.3a; the deep path never did, because `src/Toast.js` is UMD and therefore loads as CJS in every version.

**Binding asymmetry worth recording:** under `import` the deep path yields **one** binding (`default`), because the UMD file is CJS and its 61 static members are assigned dynamically, so Node's CJS named-export detection cannot see them. Under `require` it yields the **full 61-member namespace**. A consumer moving from `require()` to `import()` silently loses the named constants.

**No DOM access at module evaluation** in any version: the probe's getters on `window` and `document` recorded only `window`, from the `typeof window` capability probe that short-circuits before `document` is read.

#### R-003.4a The Node.js `exports` history, resolved against the official changelog

An earlier version of this section said the `exports` map was "introduced in 12.7 but not operative". That was **incomplete**: the flag combination was wrong, and the three mapping shapes were not separated. Both are corrected here.

**The official record.** From `doc/changelogs/CHANGELOG_V12.md` at tag `v12.17.0`:

- **12.7.0** notable changes: *"Implemented experimental \"pkg-exports\" proposal. A new `\"exports\"` field can be added to a module's `package.json` file to provide custom subpath aliasing."* — **experimental**, and the proposal it implements is *subpath aliasing*, i.e. unconditional targets.
- **12.16.0** section: *"**(SEMVER-MINOR)** esm: unflag `--experimental-exports`"*, *"**(SEMVER-MINOR)** module: unflag conditional exports"*, *"module: conditional exports import condition"*, *"module: conditional exports with flagged conditions"*.
- **12.17.0** notable changes: *"As of Node.js 12.17.0, the `--experimental-modules` flag is no longer necessary to use ECMAScript modules (ESM)."*

**The flag is the missing piece.** `--experimental-exports` exists on 12.7.0 and 12.15.0 and was **removed in 12.16.0**, when it was unflagged. The earlier test used only `--experimental-modules`, which is why 12.7.0 appeared inert.

**Method.** A probe package was built outside the repository with all three mapping shapes separated, each pointing at a marker-distinguishable target (`dist/toast.mjs` → ESM, `dist/toast.umd.js` → CJS, `dist/probe-main.cjs` → the `main` fallback marker):

```
"."        -> { "import": "./dist/toast.mjs", "require": "./dist/toast.umd.js" }   conditional
"./plain"  -> "./dist/toast.umd.js"                                                 unconditional
"./cond"   -> { "import": "./dist/toast.mjs", "require": "./dist/toast.umd.js" }   conditional
```

**Measured result** (`MAIN` = fell back to `main`; `UMD`/`ESM` = the marker of the file actually loaded):

| Node | flags | root CJS | `./plain` CJS | `./cond` CJS | root ESM | `./plain` ESM | `./cond` ESM |
|---|---|---|---|---|---|---|---|
| 12.0.0 | none | MAIN | not found | not found | no ESM | — | — |
| **12.7.0** | none | MAIN | not found | not found | no ESM | — | — |
| **12.7.0** | `--experimental-exports` | MAIN | not found | not found | no ESM | — | — |
| **12.7.0** | `--experimental-modules` | MAIN | not found | not found | MAIN | not found | not found |
| **12.7.0** | **both flags** | MAIN | not found | not found | MAIN | **UMD** | not found |
| 12.15.0 | none | MAIN | not found | not found | no ESM | — | — |
| **12.15.0** | `--experimental-exports` | **not found** | **UMD** | not found | no ESM | — | — |
| **12.15.0** | `--experimental-modules` | **not found** | **UMD** | not found | not found | **UMD** | not found |
| **12.15.0** | both flags | **not found** | **UMD** | not found | not found | **UMD** | not found |
| **12.16.3** | none | MAIN | not found | not found | no ESM | — | — |
| **12.16.3** | `--experimental-modules` | **UMD** | **UMD** | **UMD** | **ESM** | UMD | **ESM** |
| **12.17.0+** | none | **UMD** | **UMD** | **UMD** | **ESM** | UMD | **ESM** |

**The corrected history:**

- **12.7.0** — the `exports` field is introduced as an **experimental** proposal for subpath aliasing. It is operative **only with both `--experimental-exports` and `--experimental-modules`**, and only for **unconditional string targets**; the conditional root entry is not supported. The 12.7.0 release notes describe exactly this scope.
- **12.15.0** — unconditional subpath targets are honoured (with the flag); **conditional mappings are not supported**, so a conditional root entry resolves to nothing.
- **12.16.0** — `--experimental-exports` is unflagged and **conditional exports are implemented and unflagged**. `--experimental-modules` is still required until 12.17.0.
- **12.17.0** — `--experimental-modules` is no longer necessary; the map and its conditions are fully unflagged.

**Node 12.15.0 is an expected unsupported limitation, not a Node defect.** Conditional exports did not exist in 12.15.0 — they landed in 12.16.0 per the changelog above. A manifest that uses conditional `import`/`require` mappings is simply outside what 12.15.0 supports, so the resolution failure is the documented consequence of an unsupported configuration, not a defect to be worked around. The supported range for a conditional-exports manifest is therefore **Node 12.16.0+** (12.17.0+ without a flag); older releases are only usable with an **unconditional** manifest, or through the `main` fallback.

**The earlier statement that "the deep path is the only module-shaped entry that works on the oldest Node"** was right about the outcome but gave the wrong reason. The deep path survives on old Node because it is also reachable as a **physical path**, not because the `exports` map helped it.

#### R-003.4b The physical-path fallback, and why it constrains the fix

On every Node version where the `exports` map is not operative — 12.0.0 through 12.16.3 unflagged, and 12.15.0 even with the flag — `import('@soufianodev/toast-js/src/Toast.js')` resolves by **physical path**, straight to `node_modules/@soufianodev/toast-js/src/Toast.js`. The `exports` map plays no part.

Measured, with the physical `src/Toast.js` removed from the installed copy:

| Node | deep `import` | deep `require` |
|---|---|---|
| 12.0.0 | FAIL "Not supported" | FAIL `MODULE_NOT_FOUND` |
| 12.7.0 / 12.15.0 / 12.16.3 | FAIL `MODULE_NOT_FOUND` (with `--experimental-modules`) | FAIL `MODULE_NOT_FOUND` |
| 12.17.0 / 14.21.3 / 22.22.2 | FAIL `ERR_MODULE_NOT_FOUND` | FAIL `MODULE_NOT_FOUND` |

**Consequence for the recommendation.** Repointing the `exports` subpath alone is **not sufficient**. The physical file `src/Toast.js` must continue to exist in the published tarball, because:

- on Node < 12.17 it is the **only** resolution route for the deep path; and
- on Node 12.17+ it is currently the `exports` target, so removing it without repointing breaks the path there too.

Both routes point at the same physical file today. A migration that repoints `exports` but deletes the file silently breaks the deep path for every Node version that does not implement the `exports` map.

**The same reasoning applies to the root entry, through `main`.** The root entry has two resolution routes: the `exports` map, and the `main` field. Measured on the candidate package with `main` repointed at a marker file:

| Node | root `require` resolves to |
|---|---|
| 12.0.0 | **MARKER — the `main` fallback** |
| 12.15.0 (no flag) | **MARKER — the `main` fallback** |
| 12.16.3 (no flag) | **MARKER — the `main` fallback** |
| 12.17.0 | the 61 real exports — the `exports` map |
| 22.22.2 | the 61 real exports — the `exports` map |

So on every Node version below 12.17, and on 12.15/12.16 without the ESM flag, the package is reached through `main`. **`main` must therefore remain a CommonJS artifact** — if it were repointed at an ESM module, the root entry would break on exactly the versions the `exports` map cannot serve. This is the same constraint R-004.3 already places on the `require` condition, extended to the `main` field.

#### R-003.4c The proposed compatibility shim, measured end to end

A candidate package was built outside the repository, from the real tarball, modelling the R-003 recommendation:

- `src/index.mjs` — the ESM entry, exposing `default` plus one named export per public static (a **stub shape for measurement**; the real export set is T015's decision)
- `src/Toast.js` — a **physical CommonJS shim**: `module.exports = require('../dist/toast.umd.js');`
- `dist/toast.mjs` — the built ESM bundle; `dist/toast.umd.js` — the unchanged UMD build
- `exports["."]` → `import: ./dist/toast.mjs`, `require: ./dist/toast.umd.js`
- `exports["./src/Toast.js"]` → `import: ./src/index.mjs`, `require: ./dist/toast.umd.js`

| Node | flags | root `import` | deep `import` | root `require` | deep `require` |
|---|---|---|---|---|---|
| 12.0.0 | none | FAIL "Not supported" | FAIL "Not supported" | OK — 61 | OK — 61 |
| 12.0.0 | `--experimental-modules` | **OK — 1 binding** | **OK — 1 binding** | OK — 61 | OK — 61 |
| 12.7.0 | `--experimental-modules` | **OK — 1 binding** | **OK — 1 binding** | OK — 61 | OK — 61 |
| 12.15.0 | `--experimental-modules` | **FAIL** `ERR_MODULE_NOT_FOUND` | **FAIL** `ERR_MODULE_NOT_FOUND` | **FAIL** | **FAIL** |
| 12.16.3 | `--experimental-modules` | **OK — 62 bindings** | **OK — 62 bindings** | OK — 61 | OK — 61 |
| 12.17.0 | none | **OK — 62 bindings** | **OK — 62 bindings** | OK — 61 | OK — 61 |
| 12.22.12 | none | **OK — 62 bindings** | **OK — 62 bindings** | OK — 61 | OK — 61 |
| 14.21.3 / 20.19.5 / 22.22.2 | none | **OK — 62 bindings** | **OK — 62 bindings** | OK — 61 | OK — 61 |

Two findings:

- **The shim restores the deep path on Node 12.0–12.7** by keeping a physical CommonJS file at `src/Toast.js`, and it **upgrades** the deep path to full named exports from 12.16.3 (flagged) / 12.17.0 (unflagged) upward. `require()` keeps returning the full 61-member namespace on every version, exactly as today.
- **Node 12.15.0 with `--experimental-modules` is the one unsupported configuration.** Conditional exports did not exist in 12.15.0 — they landed in 12.16.0 (R-003.4a) — so a manifest that uses conditional `import`/`require` mappings is outside what that release supports, and both the root and the deep entry fail with `MODULE_NOT_FOUND`. **This is an expected unsupported compatibility limitation, not a Node defect:** no manifest shape avoids it, the affected release is flag-gated and end-of-life, and the supported range for a conditional-exports manifest is Node 12.16.0+ (12.17.0+ unflagged). It is recorded as a limitation, not mitigated.

Pointing the deep subpath's `import` condition at `./dist/toast.mjs` instead of `./src/index.mjs` was measured separately and produced **identical** results on 12.0.0, 12.17.0 and 22.22.2. That variant avoids publishing the ESM source, so the deep subpath becomes a pure alias of the root entry.

#### R-003.4d Successful CJS interop loading is not named-export parity

These are two different properties and the measurements must not be conflated:

| Property | What it means | Current package | Shim candidate |
|---|---|---|---|
| **CJS interop loading** | `import()` of a CommonJS file succeeds and yields the library as the `default` binding | **Yes** — deep path on every version from 12.0.0 up | **Yes** — preserved exactly |
| **Named-export parity** | the ESM namespace exposes the public statics as *named* bindings, not only on `default` | **No** — 1 binding everywhere; the statics are reachable only through `default` | **Yes** from 12.16.3/12.17.0 up (62 bindings), **No** on 12.0–12.7 (1 binding, interop only) |

So the current package's deep path *loads* everywhere but never offers named exports through `import()`; the shim offers named exports on modern Node and falls back to interop on the oldest. The `default` binding carries the same 61 statics in both cases, so nothing is lost — but a consumer writing `import { LENGTH_SHORT } from '…'` succeeds only where named-export parity holds.

#### R-003.4e Duplicate module-level state under mixed ESM/CJS consumption

**Validation requirement (implementation owner: T044, Issue #57).** The packed-package consumer fixture must load the library through **more than one entry point in the same process** and assert that they resolve to **one** instance — no duplicated `Manager`, no duplicated queue, no duplicated module-level state.

**Why it is required.** `contracts/public-api.md` §7 states that `Toast.Manager` is *a singleton with a single global queue and a single global limit*. Two independent instances would each enforce the limit and each own a queue, so toasts could overlap and the queue would split — a direct violation of the documented contract, observable only in a process that loads the package twice.

**Measured on the current shipped tarball** (one process, `import()` the root and `require()` the root):

| Assertion | Current shipped tarball | Shim candidate |
|---|---|---|
| ESM namespace bindings | 1 (`default` only) | 62 |
| CJS exports | 61 | 61 |
| `esmDefault === cjsExport` | **false** | true |
| `esm.Manager === cjs.Manager` | **false** | true |
| `esm.Manager._queue === cjs.Manager._queue` | **false** | true |
| `esm.ICON_SIZE === cjs.ICON_SIZE` | **false** | true |
| `esm.STYLE_DEFAULT_1 === cjs.STYLE_DEFAULT_1` | **false** | true |

**The current package already has two Managers and two queues.** `dist/toast.esm.js` and `dist/toast.umd.js` are two separate module instances with independent module-level state. Any process that reaches the library through both — an application bundler resolving the ESM entry while a dependency pulls the UMD through `require()` — gets two managers.

The shim candidate avoids it only because its **stub** ESM entry imports the UMD build, so both entry points happen to share one instance. That is an artifact of the stub, not a property of the approach: the real end state builds the UMD from the ESM sources, which would reproduce two instances unless the sharing is made deliberate.

**Therefore the packaging and entry-point design must guarantee a single shared instance**, and the consumer fixture must prove it. The measurement method is already settled: load the ESM entry and the CommonJS entry in one process and compare object identity for the export object, `Manager`, `Manager._queue`, and at least one frozen constant.

#### R-003.5 Recommendation — retain, migrate the target, no deprecation cycle

**RETAIN the subpath `./src/Toast.js`.** It is part of the audited `main` public contract (two subpaths, `contracts/public-api.md`), VAL-003 and DEC-019 forbid accidental removal, and retaining it costs nothing. Removing it would be a breaking change bought with no benefit, against no publicly discoverable consumer.

**MIGRATE its target, not its existence — and keep a physical file at the path.** The modernization replaces `src/Toast.js` with `.mjs` modules (T015–T036). A published subpath pointing at a file the migration deletes would break the contract **silently**. Two things are therefore required *together*:

1. the `exports` subpath is repointed (to the ESM entry or the built ESM bundle), **and**
2. a **physical CommonJS file remains at `src/Toast.js`** in the published tarball, because on Node < 12.17 the physical path is the only route to the deep path (R-003.4b).

A one-line shim — `module.exports = require('../dist/toast.umd.js');` — is sufficient for (2) and is measured working (R-003.4c). It keeps `require()` at the full 61-member namespace and keeps `import()` interop at exactly today's shape on Node 12.0–12.7.

**The repointed subpath must carry both conditions**, exactly like the root entry: `import` → the ESM entry or bundle, `require` → the UMD build. A single unconditional ESM target would break `require('@soufianodev/toast-js/src/Toast.js')` on every Node below 22.12, where it works today — a regression this measurement shows must not be introduced.

**`main` must remain a CommonJS artifact.** On every Node version below 12.17, and on 12.15/12.16 without the ESM flag, the root entry is resolved through `main`, not through the `exports` map (R-003.4b). If `main` were repointed at an ESM module, the root entry would break on exactly the versions the `exports` map cannot serve.

**The entry-point design must yield one shared instance.** The current package already exposes two `Manager` singletons and two queues when the ESM and CommonJS entries are both loaded in one process (R-003.4e). The packaging work must make the sharing deliberate, and T044's packed-package consumer fixture must prove it.

**Do not run a deprecation cycle.** With no publicly discoverable consumers there is nobody to migrate; a deprecation notice would imply a consumer base that the evidence does not show.

**Do not keep the legacy `src/Toast.js` inside the published tarball solely to satisfy this path.** The `files` glob currently ships `src/` in full, which also ships the three disconnected `src/core/*.js` helpers that are not part of the runtime. That leakage is recorded here and belongs to the packaging task, not to this one.

**`engines.node` is deliberately left unchanged.** The consumer support policy is not settled by this task, and T014 records evidence rather than policy. The declared `>=12.0.0` is not modified here; the packaging work (T042) must set it to match what actually ships, and the packaging gate (VAL-009) must verify the declared floor by importing the packed tarball.

**Verification requirement for T044:** the packed-package consumer fixture must assert that `./src/Toast.js` still resolves **from the tarball**, under both `import` and `require`, on the oldest supported Node — and that the physical file is present, not only the `exports` entry.


### R-004 — CommonJS

**Status:** `EVIDENCE GATHERED 2026-11-13` (task T014) — **OMIT new CommonJS artifacts; KEEP the existing UMD-based `require` condition**
**Correction pass 2026-11-13:** the demand-evidence section was rewritten to state the bounded claim — *no publicly discoverable demand* — instead of an absolute claim about all consumers. See R-003.3a for what the search can and cannot show.
**Decision rule:** ESM is the primary and required format. Check consumer demand and ecosystem constraints before creating `.cjs` output. If no evidence justifies it, omit CommonJS and do not add `.d.cts`.

#### R-004.1 Demand evidence

**No publicly discoverable demand evidence exists.**

- No package is published under the scoped name, and the registry search for the maintainer returns no packages (R-003.2).
- GitHub code search finds **no publicly indexed** external reference to the package name, and **none** to the deep path (R-003.3).
- All 62 repository issues are authored by the owner; none is an external consumer report.
- Every publicly observable consumption, in this repository and in the three external repositories, is a classic `<script src>` CDN tag. No commit has ever documented `require()` or `npm install`.

DEC-033's precondition — "add a separate CommonJS output only if real consumer demand or integration evidence establishes the need" — is therefore **not met on the available evidence**. Because unpublished, private, or git-URL installations would leave no public trace (R-003.3a), this is a conclusion drawn from *absence of publicly discoverable demand*, not from a census of consumers. It is sufficient to decline speculative output; it would not be sufficient to justify removing the existing entry.

#### R-004.2 What already exists

CommonJS **already works today** and is not a hypothetical. The `require` condition and the `main` field both point at `dist/toast.umd.js`, a self-contained UMD bundle that assigns its 61 static members onto `module.exports`. Measured across the real tarball, `require('@soufianodev/toast-js')` returns **61 exports on every Node from 12.0.0 to 22.22.2** (R-003.4).

So the real question is not "add CommonJS" but "keep or drop the CommonJS entry that already exists".

#### R-004.2a CJS interop loading is not named-export parity

The `require()` path provides the **full 61-member named namespace**. The `import()` path, when it lands on a CommonJS file, provides only the `default` binding — the module *loads* successfully, but the named statics are reachable only through `default`. These are different properties, and R-003.4d measures them separately.

The practical consequence for this recommendation: the existing CommonJS entry already provides **more** than the ESM entry currently provides under `import()`, so removing it would be a parity regression for any `require()`-based consumer, not a simplification.

#### R-004.3 Recommendation

**OMIT every new CommonJS artifact.** No `.cjs` build output, no `.d.cts` declarations (DEC-008 conditions `.d.cts` on CommonJS actually being shipped), and no separate CommonJS source tree or build target. There is no publicly discoverable demand to satisfy, and each artifact would be a permanent maintenance cost against a distribution that has never been published under this name.

**KEEP the existing `require` condition and `main` field unchanged**, pointing at the UMD build. Two reasons, both free:

1. It is part of the audited `main` contract; dropping it is a gratuitous breaking change with no publicly discoverable consumer benefit, and it would remove named-export parity that the ESM path does not currently provide.
2. The UMD artifact is already built and is *also* the browser/CDN artifact (`unpkg` and `jsdelivr` both point at `dist/toast.umd.min.js`). The `require` condition therefore adds no new build output — only an extra line in the exports map.

**Constraint this places on the new ESM entry (T041/T042):** the root `require` condition must continue to resolve to a **CJS-loadable** artifact. If the UMD build is retained, that is satisfied. If it is replaced, the `require` target must be a `.js`/`.cjs` CJS file and **not** an `.mjs` ESM file, because `require(esm)` needs Node 22.12+ (20.19+ only behind a flag) — and the measurement in R-003.4 shows `require()` working on Node 12.0.0 today.

**ESM stays primary.** The root `import` condition and the root entry remain ESM; the UMD `require` path is a compatibility affordance, not a second primary format.

#### R-004.4 Recommendation summary

| Question | Recommendation | Basis |
|---|---|---|
| Add a `.cjs` output? | **No** | No publicly discoverable demand evidence; DEC-033's precondition unmet |
| Add `.d.cts` declarations? | **No** | DEC-008 conditions them on CommonJS actually shipping |
| Keep the existing `require` condition → UMD? | **Yes** | Already works on Node 12.0.0+; part of the audited contract; needs no new artifact; provides named-export parity the ESM path lacks today |
| Make ESM the primary entry? | **Yes** | Unchanged project decision; the `import` condition already points at ESM |
| Retain `./src/Toast.js`? | **Yes, repointed, with a physical shim file** | See R-003.5 and R-003.4b |
| Change `engines.node` now? | **No** | The consumer support policy is not settled by this task; T042 sets it against what actually ships |


### R-005 — CSS Injection

**Status:** `CONTRACT APPROVED; MECHANISM NEEDS DESIGN`  

Explicit CSS import remains the default. Injection is opt-in. The plan must select one clear activation mechanism, identify stylesheet ownership/cleanup, avoid double-application when consumers use more than one path, and document CSP implications. Importing the core ESM module must not inject CSS.

### R-006 — JSDoc Declaration Generation

**Status:** `APPROVED DIRECTION; TOOL CONFIGURATION TO VERIFY`  

Keep static checking and declaration emission separate:

- Check configuration: `allowJs`, `checkJs`, strict options where practical, and `noEmit: true`.
- Declaration configuration: verify declaration-only output from JavaScript/JSDoc sources without converting implementation files to TypeScript.
- Do not hand-maintain `.d.ts` that can drift from runtime exports.
- Compile a TypeScript consumer fixture against the produced declarations.

**Setup evidence (2026-11-12):** `tsconfig.check.json` checks `*.mjs`, `src/**/*.mjs`, and `tests/**/*.mjs` with `allowJs`, `checkJs`, `strict`, and `noEmit`. Extending the same check to the legacy `src/**/*.js` and `scripts/**/*.js` produced 165 errors in code the Setup phase must not change, so the legacy runtime stays outside the check until the ESM source replaces it (T015+). Declaration emission is still unconfigured and belongs to T043.

### R-007 — Existing Behavior Characterization

**Status:** `FOUNDATIONAL`  

Inspect source, changelog, README, package exports, and existing distribution. Distinguish documented/public behavior from bugs or accidental implementation details. The baseline contract must be based on the approved current `main` surface; older-version behavior is included only where evidence or explicit requirements justify it.

**Foundational evidence (2026-11-13):** The current-main API inventory is complete in `contracts/public-api.md`, produced by enumerating the runtime object rather than by reading filenames. Measured surface: 61 static members (2 duration, 6 position, 2 icon-position, 1 icon-size, 3 icon-shape, 21 animation, 21 style preset, 5 other), 21 prototype methods (13 public, 8 internal), 23 accepted style aliases including the historical misspellings `defult_1` and `defult_2`, 3 event names, and 2 package subpaths. `tests/contracts/public-api-inventory.test.mjs` fails when the contract omits any of them.

Seven gaps between the current implementation and the approved decisions are recorded in `contracts/public-api.md` §11 and are deliberately excluded from the contract: the queue is global rather than per-position (DEC-026, DEC-027); there is no per-notification timer or pause-reason state (DEC-028, DEC-029); exit is a fixed 350 ms delay rather than an animation-completion event (DEC-030); the renderer and manager are entangled (DEC-031); `hide()` is not chainable and `setIconShape()` fails silently; CSS is injected implicitly at module load (DEC-017, DEC-018); and the `exports` map has unreachable `browser` and `default` conditions.

## 3. Known Conflicts to Resolve in Design

| Conflict | Resolution rule |
|---|---|
| `package.json` declares Node `>=12`, while development tools may need newer Node | Do not make one value serve both purposes. Establish and document runtime and toolchain matrices independently. The declared `engines.node` value is **not changed by the evidence task**; the packaging task sets it against what actually ships. |
| Existing `src/Toast.js` is a package subpath while new source is `.mjs` | Preserve/migrate the subpath deliberately; do not overwrite it until usage is investigated. Usage is now investigated (R-003): the subpath is retained and **repointed**, with both `import` and `require` conditions, and no deprecation cycle — there is no publicly discoverable usage to migrate. A physical CommonJS file must also remain at `src/Toast.js`, because Node below 12.17 resolves the deep path by physical path only (R-003.4b). |
| ESM-first package vs old UMD/browser paths | Keep ESM primary and preserve historical `libs/js/` paths; decide new browser output from current consumer requirements. CommonJS adds no new artifact: the existing `require` condition already points at the UMD build (R-004). |
| `noEmit` checking vs generated declarations | Use separate compiler configurations and test both. |
| README version references vs package.json version | Do not use the README badge or manifest alone to pick the next release; verify npm Registry, Git tags, and release artifacts. |
| Legacy announcement semantics vs the US4 acceptance criterion — **OWNER REVIEW REQUIRED** | The audited baseline renders every toast with `role="alert"` and `aria-live="assertive"`. `spec.md` US4 requires routine messages to use polite status semantics by default (`role="status"`, `aria-live="polite"`), with assertive alerts reserved for urgent cases. Both cannot hold for the same node. Evidence: `contracts/public-api.md` §9 and §11.8. Resolution rule: the legacy behaviour stays the strict compatibility baseline (DEC-019) and is **not** changed here; whether the new implementation adopts the specification's default is an owner decision, because adopting it is an observable behaviour change against that baseline. |

## 4. Research Sources

- [GitHub Spec Kit — existing project adoption](https://github.github.io/spec-kit/how-to/existing-projects.html)
- [GitHub Spec Kit — Agentic SDD](https://github.github.io/spec-kit/reference/agentic-sdd.html)
- [GitHub Spec Kit — plan template](https://github.com/github/spec-kit/blob/main/templates/plan-template.md)
- [GitHub Spec Kit — tasks command template](https://github.com/github/spec-kit/blob/main/templates/commands/tasks.md)
- [Toast-JS repository](https://github.com/SoufianoDev/Toast-JS)
- [Toast-JS package.json](https://github.com/SoufianoDev/Toast-JS/blob/main/package.json)
- [Toast-JS current source](https://github.com/SoufianoDev/Toast-JS/blob/main/src/Toast.js)

## 5. Research Log

| Date | Item | Result |
|---|---|---|
| 2026-11-12 | Spec Kit workflow | Full SDD path verified: constitution, specify, clarify, plan, checklist, tasks, analyze, implement, converge. |
| 2026-11-12 | Existing repository baseline | `main` still resolves to the audited commit `701371fd42423d034fc649aeac900f13b99b183d`. |
| 2026-11-12 | T001 branch and baseline verification | Branch `chore/spec-kit-bootstrap` at `b4b2a0c`; no tracked working-tree changes; live remote `refs/heads/main` = `701371fd` — no baseline drift; `node_modules/` untracked, absent on disk, and ignored. |
| 2026-11-12 | T001 branch-vs-baseline delta | The branch is three documentation/hygiene commits ahead of the baseline. Runtime, package metadata, lockfile, and `libs/js/` content are unchanged, so the compatibility baseline is unaffected. |
| 2026-11-12 | Setup harness (T002–T005) | `npm ci`, `npm test`, `npm run typecheck`, `npm run test:browser`, `npm run build`, and `npm pack --dry-run` all execute. Vitest and Playwright each own a distinct file-naming pattern so neither collects the other's files. |
| 2026-11-12 | Type-check scope | The no-emit check covers the `.mjs` surface only; including the legacy `.js` runtime would add 165 errors that Setup is not authorized to fix. |
| 2026-11-12 | Setup hardening | All four logged packaging/hygiene defects fixed: declared artifacts are now built, `npm audit` is clean at 0 vulnerabilities, dependency postinstalls are approved, and the agent-tooling directories are ignored. A package-artifact test now enforces the packaging gate. |
| 2026-11-12 | `exports` condition ordering | TypeScript 7 surfaced that `browser` and `default` are dead conditions in `exports["."]`. Recorded as OPEN; `exports` stays frozen until T014. |
| 2026-11-13 | T006 current-main API inventory | Completed in `contracts/public-api.md` from a runtime enumeration: 61 statics, 21 prototype methods, 23 style aliases, 3 events, 2 package subpaths. Guarded by `tests/contracts/public-api-inventory.test.mjs`. Seven gaps against approved decisions recorded in §11. |
| 2026-11-13 | T006 count correction | The T006 evidence stated 20 prototype methods (12 public). The measured value is 21 (13 public, 8 internal); `addCallback` was miscounted. `contracts/public-api.md` always listed all 21 correctly — only the counts in `research.md`, the `f328930` commit message, and the Issue #19 comment were wrong. The T007 adapter test asserts the count, so it now fails if it drifts. |
| 2026-11-12 | Build-tool PoC | Not run. Must be executed during the foundational phase before locking the bundler. |
| 2026-11-12 | Runtime matrix | Not established. Existing package metadata is not treated as proof. |
