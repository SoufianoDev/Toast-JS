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

The architecture is constrained by approved decisions. This plan does not choose Rollup or Vite prematurely, does not assume CommonJS is required, does not set unverified runtime minimums, and does not select a release version.

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
| Runtime support | Balanced, modern-browser target; exact versions evidence-based | Policy approved; exact matrix pending research |
| Build tool | Rollup vs Vite Library Mode proof of concept | Pending research; no selection yet |
| CommonJS | ESM-first; add only when consumer need is demonstrated | Conditional |
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

The current branch still points to the audited commit. Re-check this baseline at the start of implementation before changing any source.

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
| Evidence-based tooling | RESEARCH GATE | Rollup/Vite, support matrix, CJS need, and declaration generation are validated before final packaging. |
| Controlled changes | PASS | Only the explicitly requested bootstrap branch and its initial documentation commit are in scope; no PR, merge, release, or publish is included. |

**Gate:** No implementation starts until the review checklists are evaluated, foundational characterization is complete, and the build/runtime research required by the affected implementation phase is resolved.

## 5. Design Overview

### 5.1 Responsibility Boundaries

- **Public entry:** exports the documented consumer API and stable package symbols.
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
- `.cjs` is conditional on evidence.
- The old `./src/Toast.js` package subpath is not removed until consumer use and a compatibility shim/migration path are reviewed.
- CSS is a separate explicit asset by default; opt-in injection has a distinct entry point/API and duplicate protection.
- Checking with `noEmit` and generating declaration files are separate compiler configurations so the selected check does not accidentally suppress declaration output.

## 6. Phase 0 — Research and Validation

The plan command's research phase resolves implementation unknowns before detailed design is locked. Findings and decisions belong in [`research.md`](research.md).

| ID | Research item | Required evidence / exit condition |
|---|---|---|
| R-001 | Rollup vs Vite Library Mode | Two isolated PoCs evaluated against identical inputs and outputs: `.mjs` ESM, required browser output, CSS extraction, minification/source maps, output determinism, package exports, and SSR import. Decision recorded with rationale and rejected alternative. |
| R-002 | Runtime support matrix | Inspect actual syntax and Web APIs used; separate runtime browser support from development/build Node requirements; test declared lower bounds; no speculative polyfills. |
| R-003 | Existing `./src/Toast.js` deep export | Search project history/docs and consumer evidence; decide whether to retain a compatibility wrapper, deprecate with a transition, or preserve unchanged. No silent removal. |
| R-004 | CommonJS demand | Inspect consumer requests, package usage evidence, and integration needs; ship `.cjs` only if supported by evidence. |
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
| Current `src/Toast.js` is also a package subpath | Downstream deep-import breakage | Consumer evidence and deliberate compatibility wrapper/migration decision. |
| Build tool selected by preference instead of output evidence | Incompatible or excessive build pipeline | Isolated Rollup/Vite PoCs with identical acceptance criteria. |
| Browser globals touched at import time | SSR/Node import failure | Import-safety tests and lazy DOM access. |
| Timer/animation races | Stuck or early-dismissed notifications | State-machine tests and Playwright verification. |
| CSS injection conflicts with CSP or explicit import | Styling failure or duplicate CSS | Opt-in API, duplicate protection, explicit stylesheet fallback. |
| Type generation is conflated with no-emit checking | Missing or inaccurate declarations | Separate checker and declaration-generation configurations. |
| Repository hygiene expands scope | Risky unrelated churn | The bootstrap branch performs only the requested root `node_modules/` tree cleanup and adds `.gitignore`; large asset cleanup and history rewriting remain out of scope. |

## 10. Validation Gates

- **Before Phase 0:** constitution check passes; baseline and current branch are known.
- **Before detailed design approval:** research unknowns are resolved or explicitly bounded.
- **Before task execution:** specification and design checklists are reviewed; task/spec/plan analysis has no critical or high unresolved issue.
- **Before release candidate:** all required story acceptance criteria pass, shared contracts pass, package fixture passes, and no legacy files changed.
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
