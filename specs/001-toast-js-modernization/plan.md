> Clarification gate: see `clarification-log.md`. Approved decisions remain authoritative in `DECISION_REGISTER.md`; research unknowns are evidence tasks, not user questions.

# Implementation Plan: Toast-JS Runtime Modernization

**Feature:** `001-toast-js-modernization`  
**Date:** 2026-11-12  
**Specification:** [`spec.md`](spec.md)  
**Project specification:** [`../../SPECIFICATION.md`](../../SPECIFICATION.md)  
**Architecture baseline:** [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)  
**Decision register:** [`../../DECISION_REGISTER.md`](../../DECISION_REGISTER.md)

## 1. Summary

Modernize Toast-JS from the audited UMD-centered implementation into a single-source JavaScript ESM implementation, retaining the current `main` public contract and immutable historical distributions. The work is phased: characterize the existing contract and establish verification first; perform focused technical research; implement the core lifecycle and queue; add persistent/actionable/async behavior; complete accessibility and CSS separation; then finalize packaging, types, documentation, and CI.

The architecture is constrained by approved decisions. The build tool was selected from measured proof-of-concept evidence rather than preference (Rolldown 1.3.2, DEC-032). This plan does not assume CommonJS is required, does not set unverified runtime minimums, and does not select a release version.

## 2. Technical Context

This section carries the approved implementation constraints out of `DECISION_REGISTER.md`. The feature specification describes desired outcomes and observable compatibility; this plan owns the technical how, in keeping with Spec Kit's separation between Specify and Plan.

| Area | Planned direction | Status |
|---|---|---|
| Source language | JavaScript | Approved |
| Source module format | Native ESM `.mjs` | Approved |
| Authoritative source | `src/**/*.mjs` | Approved; current `.js` path needs migration review |
| Type contract | JSDoc | Approved |
| Static type checking | TypeScript compiler, `checkJs`, `noEmit` | Approved |
| Type declaration generation | Generate from JSDoc; separate generation configuration from no-emit checking | Approved direction; validate exact compiler setup |
| Test framework | Vitest | Approved |
| DOM unit/integration environment | jsdom | Approved |
| Real-browser verification | Playwright | Approved |
| Coverage | Progressive, behavior-oriented | Approved |
| Compatibility | Shared Contract Tests against current `main` | Approved |
| Runtime support | Balanced, modern-browser target; exact versions evidence-based | Browser matrix measured 2026-11-13 (`research.md` R-002): Chrome 54+, Edge 14+, Firefox 61+, Safari 10.1+ (DEC-034) |
| Consumer Node.js support | Oldest currently supported LTS release line | **Node.js 22.0.0** as of 2026-11-13 — the target for the final packaged artifact, pending T041/T042 verification before `engines.node` is set; supported lines 22.x / 24.x / 26.x, EOL releases excluded (DEC-038) |
| Development toolchain Node.js | Independent of the consumer minimum | Node.js 22.22.2, set by jsdom 31 (R-002.4); not the consumer minimum (DEC-038) |
| Build tool | **Rolldown 1.3.2, used directly** | Approved on 2026-11-13 on four-way measured evidence (`research.md` R-001, DEC-032) |
| CommonJS | ESM-first; add only when consumer need is demonstrated | No publicly discoverable demand evidence found 2026-11-13 (`research.md` R-004) — so no `.cjs` output; the existing UMD-based `require` condition is kept because it is the only path that provides named-export parity today |
| CSS | Plain CSS; explicit import default; injection opt-in | Approved |
| Persistence | None; notification state is in-memory runtime state | N/A |
| Project type | Browser notification library with Node/SSR-safe module evaluation | Approved direction |

## 3. Repository Baseline

Verified against `SoufianoDev/Toast-JS` `main` at `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17):

- `src/Toast.js` is the current active source and is UMD/IIFE-oriented.
- `src/core/` contains `context.js`, `dom.js`, and `env.js`; the audit found these disconnected from the active build source.
- `scripts/build.js` currently copies/extracts output rather than bundling an authoritative `.mjs` module graph.
- `dist/` currently contains `toast.esm.js` and `toast.umd.js`.
- `libs/js/` contains `v1.0.0`, `v2.0.0`, and `v2.1.0-beta` historical directories.
- `tests/unit`, `tests/integration`, and `tests/regression` contain `.gitkeep` placeholders only.
- `package.json` declares version `2.1.0`, an existing `./src/Toast.js` export, and `engines.node >=12.0.0`; the README still presents `2.1.0-beta` as its visible documentation version.
- The current `npm test` script targets `tests/regression/issue4/verify-issue4.js`, which is absent from the audited tree.
- The audited `main` snapshot contains a large tracked root `node_modules/` tree and has no root `.gitignore`. The separate bootstrap branch removes that tree from its snapshot and adds ignore rules; this does not rewrite history or modify `main`. Ongoing runtime modernization tasks do not include a Git-history rewrite or unrelated asset cleanup.

The implementation branch `chore/spec-kit-bootstrap` sits three commits ahead of that audited commit (`b4b2a0c77a522a237a8971d149f1809a7a059943`). Those commits add planning and agent documentation, replace `README.md`, and remove the tracked `node_modules/` tree; they change nothing under `src/`, `scripts/`, `libs/`, `tests/`, `package.json`, or `package-lock.json`. The audited baseline itself has not moved — the live remote `refs/heads/main` still resolves to `701371fd42423d034fc649aeac900f13b99b183d` — so the compatibility baseline stands and the static audit does not need to be re-run. Re-check this baseline at the start of implementation before changing any source.

## 4. Constitution Check

| Principle | Check | Plan response |
|---|---|---|
| Public contract compatibility | PASS | Characterize `main` first; shared contracts gate the migration. |
| Historical distributions immutable | PASS | No task writes beneath `libs/js/`. |
| JavaScript `.mjs` source | PASS | All new runtime modules use `.mjs`; `.js` deep export handled separately. |
| Responsibility-driven OOP | PASS | Candidate modules are not mandatory; split only when independently useful. |
| Browser runtime / SSR-safe import | PASS | DOM access is deferred until runtime operations. |
| Deterministic lifecycle | PASS | Manager owns coordination; queue/timer/renderer own distinct behaviors. |
| Accessibility | PASS | A11y work is a release story, not polish-only. |
| CSS loading | PASS | Import default; injection explicit opt-in; no implicit core-side effect. |
| Evidence-based tooling | PASS | Build tool selected on measured proof-of-concept evidence (DEC-032, Rolldown 1.3.2). Support matrix, CJS need, and declaration generation remain validated before final packaging. |
| Controlled changes | PASS | Only the explicitly requested bootstrap branch and its initial documentation commit are in scope; no PR, merge, release, or publish is included. |

**Gate:** No implementation starts until the review checklists are evaluated, foundational characterization is complete, and the build/runtime research required by the affected implementation phase is resolved.

## 5. Design Overview

### 5.1 Responsibility Boundaries

- **Public entry:** exports the documented consumer API and stable package symbols. There is **one canonical runtime implementation**; the ESM and CommonJS entry points are thin, format-specific wrappers over it, so a process that loads both observes a single instance (DEC-040).
- **Public ESM entry export shape:** the default export, the constructor by name, and the 61 public statics as named exports, bound to the runtime's own values (DEC-041). The additive named exports are required in the **final packaged ESM artifact**; the legacy CommonJS/UMD formats keep their current shape. T041 must emit this shape and T044/T045 must verify it from the packed tarball.
- **Toast instance:** owns the public instance contract and its lifecycle state.
- **ToastManager:** coordinates managed notifications and per-position queues; it must not create a circular back-reference from `Toast` to manager internals.
- **Queue:** owns FIFO ordering and visible-capacity accounting per position.
- **Timer:** owns duration, remaining time, and independent pause reasons for a notification.
- **DOMRenderer:** owns DOM creation, update, attachment/removal, and renderer-related accessibility attributes. It does not own queue policy or timers.
- **Animation lifecycle:** waits for browser completion events with a bounded fallback and cleanup.
- **Style data/resolution:** immutable presets and pure style normalization; CSS owns static structure and keyframes.
- **Context/environment helpers:** focused utilities; no module touches browser globals at import time.

A proposed directory layout is recorded in `ARCHITECTURE.md`. It is a guide, not a mandate to create an unused class or file. Event handling may remain private inside `Toast` unless more than one real owner needs it.

### 5.2 Runtime State Model

See [`data-model.md`](data-model.md). Core lifecycle is modeled as `created -> queued -> entering -> visible -> exiting -> removed`, with timer pause reasons and action/async operation states tracked separately. Queue capacity is released only after the renderer reports completed removal (or bounded fallback), avoiding overlap between exit animation and slot reuse.

### 5.3 Package and CSS Boundary

- `.mjs` is the primary source and ESM output.
- Browser standalone/UMD output is retained only where the package/CDN distribution requires it.
- `.cjs` is conditional on evidence — the evidence is now gathered and shows no publicly discoverable demand, so `.cjs` is omitted (`research.md` R-004, DEC-033).
- The old `./src/Toast.js` package subpath is retained and repointed, not removed; consumer use has been reviewed (`research.md` R-003) and shows no publicly discoverable usage, so no deprecation cycle is run. The repointed subpath keeps both `import` and `require` conditions. The **physical** CommonJS file that served Node.js below 12.17 is **superseded** by DEC-038 and DEC-039 — the subpath is retained because the public API compatibility decision requires it, not because of obsolete Node.js releases.
- `main` and the `require` condition stay CommonJS artifacts. Their role as the resolution fallback for Node.js below 12.17 is **superseded** by DEC-038, but the CommonJS consumer path itself is **in force** (DEC-033), so `main` remains the conventional CommonJS entry.
- The ESM and CommonJS entry points resolve to **one** shared instance — no duplicated `Manager`, queue, or module-level state — through one canonical runtime with thin format-specific entry points (DEC-040), verified by reference identity from the packed tarball by T044 (`research.md` R-003.4e).
- `engines.node` is not changed by the evidence task; the consumer support policy is settled separately, and the packaging task sets the value against what actually ships.
- CSS is a separate explicit asset by default; opt-in injection has a distinct entry point/API and duplicate protection.
- Checking with `noEmit` and generating declaration files are separate compiler configurations so the selected check does not accidentally suppress declaration output.

## 6. Phase 0 — Research and Validation

The plan command's research phase resolves implementation unknowns before detailed design is locked. Findings and decisions belong in [`research.md`](research.md).

| ID | Research item | Required evidence / exit condition |
|---|---|---|
| R-001 | Build-tool selection | Four isolated proof-of-concepts (Rollup, Vite 8, tsdown, raw Rolldown) evaluated against identical inputs and outputs: `.mjs` ESM, required browser output, CSS handling, minification/source maps, output determinism, package exports, SSR import, and declaration generation. **Completed 2026-11-13: Rolldown 1.3.2 selected** on measured evidence, with the rejected alternatives and their numbers recorded in `research.md` R-001. |
| R-002 | Runtime support matrix | Inspect actual syntax and Web APIs used; separate runtime browser support from development/build Node requirements; test declared lower bounds; no speculative polyfills. |
| R-003 | Existing `./src/Toast.js` deep export | Search project history/docs and consumer evidence; decide whether to retain a compatibility wrapper, deprecate with a transition, or preserve unchanged. No silent removal. **Completed 2026-11-13: retain the path and migrate its target** — no publicly discoverable external reference to the deep path or the package, and no package published under this name, so no deprecation cycle is warranted; the repointed subpath must carry both `import` and `require` conditions, **and a physical CommonJS file must remain at `src/Toast.js`** because Node below 12.17 resolves the deep path by physical path only (`research.md` R-003, R-003.4b, R-003.4c). |
| R-004 | CommonJS demand | Inspect consumer requests, package usage evidence, and integration needs; ship `.cjs` only if supported by evidence. **Completed 2026-11-13: no publicly discoverable demand evidence, so no `.cjs` and no `.d.cts`**; the existing `require` condition keeps pointing at the already-built UMD artifact, which is also the only path providing named-export parity today (`research.md` R-004, DEC-033). |
| R-005 | CSS injection contract | Choose a concrete opt-in mechanism, cleanup ownership, duplicate detection, and CSP behavior; keep explicit stylesheet import as default. |
| R-006 | JSDoc declaration generation | Verify a separate declaration-emission configuration for `.mjs` JavaScript sources and TypeScript consumer fixture; preserve `noEmit` for the static-check configuration. |
| R-007 | Existing behavior characterization | Inspect active source, README/changelog, package map, and tests; classify documented contract vs implementation defect before encoding behavior. |

No user product question is pending in this phase. If evidence reveals a true user-facing trade-off not covered by approved decisions, stop at that narrow point and explain the evidence and impact rather than inventing an answer.

## 7. Phase 1 — Design and Contracts

Produce and review the design artifacts before task execution:

1. `data-model.md` — in-memory runtime concepts, lifecycle states, invariants, and transitions; no database model is implied.
2. `contracts/public-api.md` — existing API surface and rules for new API additions without guessing signatures.
3. `contracts/legacy-compatibility.md` — mandatory `main` baseline and immutable historical artifacts.
4. `contracts/runtime-lifecycle.md` — queue, timer, action, animation, renderer, and cleanup contract.
5. `contracts/css-loading.md` — explicit import default and opt-in injection boundary.
6. `contracts/package-exports.md` — ESM-first exports, conditional formats, type declarations, packed artifact checks.
7. `quickstart.md` — reproducible validation commands and expected results; current commands are clearly distinguished from scripts to be added.

The design review checklist is in `checklists/design.md`.

## 8. Implementation Strategy

Tasks are generated separately in [`tasks.md`](tasks.md), following Spec Kit's Setup -> Foundational -> user-story phases -> Polish organization.

1. **Setup:** establish test, browser, and type-check command infrastructure without changing runtime behavior.
2. **Foundational:** characterize the current public API, build Shared Contract Tests, establish the build-tool PoC and compatibility research, and close export/runtime evidence gaps.
3. **US1:** implement the JavaScript ESM entry and current public API/style contract.
4. **US2:** implement deterministic manager, per-position FIFO queues, timers, DOM renderer, and animation completion.
5. **US3:** implement persistent, actionable, and async notification behavior.
6. **US4:** complete accessibility, RTL/responsive behavior, CSS separation, and opt-in injection.
7. **US5:** finalize build/distribution, types, Node/SSR safety, consumer fixtures, and documentation.
8. **Polish:** CI, package verification, compatibility review, changelog, and release-readiness evidence. Publishing remains a separate explicitly authorized action.

Tests are included in each story phase because the specification explicitly requires them; they are not placed into one detached testing phase.

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Existing source behavior is incompletely inventoried | Silent API breakage | Complete API inventory and Shared Contract Tests before refactoring. |
| Current `src/Toast.js` is also a package subpath | Downstream deep-import breakage | Consumer evidence gathered and the subpath retained with a migrated target (`research.md` R-003); the subpath is retained by the public API compatibility decision, not by obsolete-Node.js resolution, which is superseded (DEC-039); T044 verifies it resolves from the packed tarball under both `import` and `require`. |
| The same package is loaded through both the ESM and the CommonJS entry | Two `Manager` singletons, two queues, split state — a direct violation of the documented singleton contract | Measured on the current tarball (`research.md` R-003.4e). The entry-point design must yield one shared instance, and **T044** must prove it from the packed tarball by comparing object identity across both entry points in one process. |
| `main` or the `require` target is repointed at an ESM module | Root entry breaks on every Node.js release below 12.17, where the `exports` map is not operative | Those releases are outside the support commitment (DEC-038), so the constraint is superseded; `main` and the `require` condition stay CommonJS artifacts regardless, because the CommonJS consumer path is in force (DEC-033, DEC-039). |
| The declared consumer Node.js minimum drifts from what actually ships | Consumers install on a release the package does not support | The consumer minimum is the oldest supported LTS line (DEC-038); `engines.node` is set by the packaging task against the shipped artifact and verified from the packed tarball (VAL-009), and the target is not declared as supported until T041/T042 have fixed and verified the artifact. |
| Build tool selected by preference instead of output evidence | Incompatible or excessive build pipeline | Four isolated proof-of-concepts with identical acceptance criteria; selection recorded from measured results (`research.md` R-001, DEC-032). |
| Browser globals touched at import time | SSR/Node import failure | Import-safety tests and lazy DOM access. |
| Timer/animation races | Stuck or early-dismissed notifications | State-machine tests and Playwright verification. |
| CSS injection conflicts with CSP or explicit import | Styling failure or duplicate CSS | Opt-in API, duplicate protection, explicit stylesheet fallback. |
| Type generation is conflated with no-emit checking | Missing or inaccurate declarations | Separate checker and declaration-generation configurations. |
| Repository hygiene expands scope | Risky unrelated churn | The bootstrap branch performs only the requested root `node_modules/` tree cleanup and adds `.gitignore`; large asset cleanup and history rewriting remain out of scope. |

## 10. Validation Gates

- **Before Phase 0:** constitution check passes; baseline and current branch are known.
- **Before detailed design approval:** research unknowns are resolved or explicitly bounded.
- **Before task execution:** specification and design checklists are reviewed; task/spec/plan analysis has no critical or high unresolved issue.
- **Before release candidate:** all required story acceptance criteria pass, shared contracts pass, package fixture passes — including the mixed ESM/CJS single-instance assertion (`research.md` R-003.4e) — and no legacy files changed.
- **Before publish:** registry/version/tag verification and explicit user authorization are required.

## 11. Spec Kit Mapping

This package uses the current Spec Kit artifact conventions for one bounded modernization feature:

- Project principles: `.specify/memory/constitution.md`
- Feature specification: `specs/001-toast-js-modernization/spec.md`
- Implementation plan: `specs/001-toast-js-modernization/plan.md`
- Plan research: `research.md`
- Design outputs: `data-model.md`, `contracts/`, `quickstart.md`
- Quality gates: `checklists/requirements.md`, `checklists/design.md`
- Task breakdown: `tasks.md`
- Read-only consistency report: `analysis-report.md`

The root `SPECIFICATION.md`, `ARCHITECTURE.md`, and `DECISION_REGISTER.md` remain the project-level source documents. The feature `spec.md` translates the relevant requirements into prioritized user stories for task planning; it does not replace or silently rewrite those source documents.
