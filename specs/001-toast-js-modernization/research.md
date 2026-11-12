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

## 2. Research Decisions and Open Evidence

### R-001 — Rollup vs Vite Library Mode

**Status:** `NEEDS EXPERIMENT`  
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

### R-002 — Runtime Support Matrix

**Status:** `NEEDS VALIDATION`  

Separate these axes:

1. Browser runtime: the browser APIs and ECMAScript features required to display notifications.
2. Node.js module loading: the supported environment for importing the ESM package in SSR/build contexts; it does not imply a DOM renderer runs in Node.
3. Development/build runtime: Node required by Vite/Rollup, Vitest, Playwright, type tooling, and scripts.

Inspect used syntax and Web APIs, test the lowest proposed versions, and document any unsupported browser behavior. Add no polyfill unless a required supported environment demonstrably needs it.

### R-003 — `./src/Toast.js` Deep Export

**Status:** `NEEDS USAGE EVIDENCE`  

The package currently exports `./src/Toast.js`. Search repository history, docs, issues, and available downstream consumer references. If retained, prefer a deliberate compatibility wrapper or stable path that does not make `.js` the new source of truth. Do not remove the path just because the internal source moves to `.mjs`.

### R-004 — CommonJS

**Status:** `CONDITIONAL`  

ESM is the primary and required format. Check consumer demand and ecosystem constraints before creating `.cjs` output. If no evidence justifies it, omit CommonJS and do not add `.d.cts`.

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

### R-007 — Existing Behavior Characterization

**Status:** `FOUNDATIONAL`  

Inspect source, changelog, README, package exports, and existing distribution. Distinguish documented/public behavior from bugs or accidental implementation details. The baseline contract must be based on the approved current `main` surface; older-version behavior is included only where evidence or explicit requirements justify it.

## 3. Known Conflicts to Resolve in Design

| Conflict | Resolution rule |
|---|---|
| `package.json` declares Node `>=12`, while development tools may need newer Node | Do not make one value serve both purposes. Establish and document runtime and toolchain matrices independently. |
| Existing `src/Toast.js` is a package subpath while new source is `.mjs` | Preserve/migrate the subpath deliberately; do not overwrite it until usage is investigated. |
| ESM-first package vs old UMD/browser paths | Keep ESM primary and preserve historical `libs/js/` paths; decide new browser output from current consumer requirements. |
| `noEmit` checking vs generated declarations | Use separate compiler configurations and test both. |
| README version references vs package.json version | Do not use the README badge or manifest alone to pick the next release; verify npm Registry, Git tags, and release artifacts. |

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
| 2026-11-12 | Build-tool PoC | Not run. Must be executed during the foundational phase before locking the bundler. |
| 2026-11-12 | Runtime matrix | Not established. Existing package metadata is not treated as proof. |
