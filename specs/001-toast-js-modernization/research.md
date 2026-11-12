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
| Development toolchain (Setup) | Vitest 5.1.0, jsdom 31, `@vitest/coverage-v8` 5.1.0, `@playwright/test` 1.65.0, TypeScript 7.0.2, and `@types/node` 24 added as dev dependencies | `package.json`, `npm ls` | Vitest 5 requires Node `^22.12 \|\| ^24 \|\| >=26`; `@playwright/test` requires Node >=20. These are toolchain floors for contributors, not the library runtime floor, which stays unvalidated (R-002). |
| Dependency audit (Setup) | `npm audit` reports 10 high-severity advisories, all inside the pre-existing `puppeteer@^24.40.0` chain (`ws`, `zod` via `chromium-bidi`, `js-yaml`, `extract-zip`). Vitest and Vite appear in no advisory chain | `npm audit --json` | Pre-existing exposure, not introduced by Setup. The available fix is `puppeteer@25`, a breaking change outside the Setup scope. |
| Package artifact gaps (Setup) | `npm pack --dry-run` packs 10 files, but the declared `types` path `dist/types/index.d.ts` and the `unpkg`/`jsdelivr` path `dist/toast.umd.min.js` are not produced by the current build | `npm pack --dry-run`, `package.json` | Pre-existing packaging defect. T045 must verify these paths, and T042 must correct or produce them. |
| Test runner ownership (Setup) | Vitest collects `tests/**/*.test.mjs`; Playwright collects `tests/browser/**/*.spec.mjs` | `vitest.config.mjs`, `playwright.config.mjs` | Vitest's default include matched the Playwright spec and broke `npm test`. The split is now enforced on both sides so neither runner collects the other's files. |
| Install-script policy (Setup) | npm 12 blocks dependency install scripts unless allow-listed, so `puppeteer`'s postinstall does not run and it downloads no Chrome | `npm ci` output | `scripts/record-demo.js` cannot run without a separately approved puppeteer postinstall or a manual browser install. Playwright browsers are fetched with `npx playwright install chromium`. |
| Package artifacts (Setup hardening) | The build now emits every path `package.json` declares: `dist/toast.umd.js`, `dist/toast.esm.js`, `dist/toast.umd.min.js` (esbuild), and `dist/types/Toast.d.ts` (TypeScript from JSDoc, via `tsconfig.types.json`) | `npm run build`, `npm pack --dry-run` | The tarball grew from 10 to 12 files and every declared path resolves. `types` was corrected from the never-produced `dist/types/index.d.ts` to `dist/types/Toast.d.ts`; TypeScript 7 removed `--outFile`, so the declaration cannot be emitted under another name. |
| Dependency advisories (Setup hardening) | `puppeteer` raised from `^24.40.0` to `^25.17.0`; `npm audit` now reports 0 vulnerabilities | `npm audit` | All 10 high-severity advisories were inside the old puppeteer chain. `scripts/record-demo.js` uses only `launch`, `click`, and `screenshot`, all verified working against puppeteer 25.17.0. |
| Install-script approvals (Setup hardening) | `package.json` now carries `allowScripts: { puppeteer: true, esbuild: true }` | `package.json`, `npm ci` | Dependency postinstalls run on install, so puppeteer downloads Chrome and esbuild installs its binary. The unpinned form survives dependency version bumps. |
| Package artifact test (Setup hardening) | `tests/package/artifacts.test.mjs` builds the package and asserts every declared `main`/`module`/`browser`/`unpkg`/`jsdelivr`/`types`/`exports` path exists in the `npm pack` file list, and that no declaration file ships outside `dist/types/` | `npm test` | This is the check that would have caught the missing-artifact defect. It partially covers T045's intent; T045 still owns full artifact verification once the ESM package shape lands. |
| `exports` condition ordering (Setup hardening, OPEN) | TypeScript 7 reports that the `browser` and `default` conditions in `exports["."]` are unreachable because `import` and `require` precede them | `npm run build` warning | A real defect in the audited `package.json`, but `exports` is frozen until the consumer-evidence task (T014) records a migration decision. T042 must reorder the conditions. Left unchanged and reported. |

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

**Setup evidence (2026-11-12):** The added development toolchain requires Node `^22.12 || ^24 || >=26` (Vitest 5) and Node >=20 (`@playwright/test`). These are contributor toolchain floors and do not establish a library runtime floor. `package.json` `engines.node: >=12.0.0` still describes the library runtime only, and remains unvalidated.

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

**Setup evidence (2026-11-12):** `tsconfig.check.json` checks `*.mjs`, `src/**/*.mjs`, and `tests/**/*.mjs` with `allowJs`, `checkJs`, `strict`, and `noEmit`. Extending the same check to the legacy `src/**/*.js` and `scripts/**/*.js` produced 165 errors in code the Setup phase must not change, so the legacy runtime stays outside the check until the ESM source replaces it (T015+). Declaration emission is still unconfigured and belongs to T043.

### R-007 — Existing Behavior Characterization

**Status:** `FOUNDATIONAL`  

Inspect source, changelog, README, package exports, and existing distribution. Distinguish documented/public behavior from bugs or accidental implementation details. The baseline contract must be based on the approved current `main` surface; older-version behavior is included only where evidence or explicit requirements justify it.

**Foundational evidence (2026-11-13):** The current-main API inventory is complete in `contracts/public-api.md`, produced by enumerating the runtime object rather than by reading filenames. Measured surface: 61 static members (2 duration, 6 position, 2 icon-position, 1 icon-size, 3 icon-shape, 21 animation, 21 style preset, 5 other), 21 prototype methods (13 public, 8 internal), 23 accepted style aliases including the historical misspellings `defult_1` and `defult_2`, 3 event names, and 2 package subpaths. `tests/contracts/public-api-inventory.test.mjs` fails when the contract omits any of them.

Seven gaps between the current implementation and the approved decisions are recorded in `contracts/public-api.md` §11 and are deliberately excluded from the contract: the queue is global rather than per-position (DEC-026, DEC-027); there is no per-notification timer or pause-reason state (DEC-028, DEC-029); exit is a fixed 350 ms delay rather than an animation-completion event (DEC-030); the renderer and manager are entangled (DEC-031); `hide()` is not chainable and `setIconShape()` fails silently; CSS is injected implicitly at module load (DEC-017, DEC-018); and the `exports` map has unreachable `browser` and `default` conditions.

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
