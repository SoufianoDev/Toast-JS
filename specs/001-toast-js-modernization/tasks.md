# Tasks: Toast-JS Runtime Modernization

**Feature:** `001-toast-js-modernization`  
**Inputs:** `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, and root `SPECIFICATION.md` / `ARCHITECTURE.md`.  
**Status:** Generated; no task has been executed. All boxes remain unchecked.

## Task Format

Every task follows the Spec Kit checklist shape: `- [ ] [TaskID] [P?] [Story?] Description with file path`. `[P]` is used only when the task can run independently. Story labels are present only in user-story phases. Tasks in `libs/js/` are prohibited.

## Dependencies

```text
Setup (T001-T005)
   |
   v
Foundational (T006-T014)
   |
   +--> US1 (T015-T021) --+
   |                      |
   +--> US2 (T022-T028) --+--> US3 (T029-T034)
   |                      |
   +--> US4 (T035-T040) --+
   |
   +--> US5 (T041-T046) -- depends on R-001/R-002/R-003/R-004/R-006 outcomes
   |
   v
Polish (T047-T049)
```

US2 may proceed after US1's public contracts and foundational adapters exist. US3 depends on the US2 timer/manager contracts. US4 depends on renderer ownership from US2. US5 package configuration depends on the build/support/deep-export/declaration research results.

## Phase 1: Setup

**Goal:** Establish verification infrastructure without changing runtime behavior.

**Independent validation:** The project can run a basic Vitest test, type-check a small `.mjs` fixture, and launch a Playwright browser smoke test. The final commands are recorded in `quickstart.md`.

- [x] T001 Verify the implementation branch, clean working tree, current `main` head against the audited baseline, and that `node_modules/` remains absent and ignored; record any baseline drift in `research.md` before source work.
- [x] T002 Add Vitest configuration in `vitest.config.mjs` and replace the stale `npm test` target in `package.json` with the verified unit/integration test command.
- [x] T003 Configure jsdom and progressive coverage settings in `vitest.config.mjs`; keep thresholds behavior-oriented and avoid an arbitrary initial global percentage.
- [x] T004 Add Playwright configuration in `playwright.config.mjs` and a minimal browser smoke-test entry under `tests/browser/`.
- [x] T005 Add a no-emit JavaScript type-check configuration in `tsconfig.check.json` and a `typecheck` script in `package.json` using `allowJs`, `checkJs`, JSDoc, and `noEmit`.

## Phase 2: Foundational

**Goal:** Capture the existing contract and settle technical choices that would otherwise invalidate implementation work.

**Independent validation:** The current implementation passes the shared contract baseline; the Rollup/Vite comparison and runtime/export/type research are recorded with evidence; no historical file is modified.

- [x] T006 Complete the current-main API inventory in `specs/001-toast-js-modernization/contracts/public-api.md`, including every export, property, method, alias, default, event, callback, and package subpath.
- [x] T007 Create legacy/new loading adapters under `tests/contracts/adapters/` without changing files under `libs/js/`.
- [x] T008 Create the Shared Contract Test suite in `tests/contracts/public-api.contract.test.mjs` and run it against the current implementation through the legacy adapter.
- [x] T009 Add characterization tests for preset shape, immutability, values, aliases, and defaults under `tests/contracts/styles.contract.test.mjs`.
- [x] T010 [P] Build an isolated Rollup proof of concept under `experiments/build-poc/rollup/` using a minimal `.mjs` entry and the approved output acceptance criteria.
- [x] T011 [P] Build an isolated Vite Library Mode proof of concept under `experiments/build-poc/vite/` using the same entry and acceptance criteria as the Rollup experiment.
- [x] T012 Compare both proof-of-concept outputs and record build behavior, output formats, CSS handling, tree-shaking, source maps, minification, package validity, and maintenance cost in `specs/001-toast-js-modernization/research.md`; select the simpler passing tool with a recorded rationale.
- [x] T013 Determine and test separate browser-runtime, Node/SSR-import, and development/build Node support boundaries; record the tested matrix in `specs/001-toast-js-modernization/research.md` without adding speculative polyfills.
- [x] T014 Investigate downstream use of `./src/Toast.js` and evidence for CommonJS in repository history, documentation, issues, and available consumer data; record retain/migrate and include/omit recommendations in `research.md` before changing package exports.
## Phase 3: US1 — Preserve the Existing Consumer Contract (P1)

**Goal:** Deliver the verified current-main API through the new ESM source without breaking the compatibility suite.

**Independent test:** The Shared Contract Tests and preset contract tests pass against the new implementation and the current baseline.

- [x] T015 [US1] Create the primary ESM entry at `src/index.mjs` and export the verified current-main public API without importing DOM globals during module evaluation.
- [x] T016 [US1] Implement the public Toast instance contract in `src/core/Toast.mjs`, preserving verified current-main methods, defaults, chaining behavior, and observable lifecycle semantics.
- [x] T017 [P] [US1] Move the 21 frozen public style preset objects and the complete accepted alias map into `src/styles/presets.mjs` without changing shape or values.
- [x] T018 [US1] Implement pure style normalization and validation in `src/styles/resolveStyle.mjs`, retaining all aliases characterized by the compatibility suite.
- [x] T019 [P] [US1] Implement lazy context resolution using `src/context/LazyContext.mjs` only for behavior verified in the current API contract; defer DOM access until a runtime operation requires it.
- [x] T020 [US1] Implement and test the existing event and callback API within the owning Toast lifecycle in `src/core/Toast.mjs`; keep it internal unless a second real owner justifies a separate module.
- [ ] T021 [US1] Complete US1 compatibility tests in `tests/contracts/public-api.contract.test.mjs` and `tests/contracts/styles.contract.test.mjs` against both the current and new implementations.

## Phase 4: US2 — Display and Manage Notifications Reliably (P1)

**Goal:** Deliver per-position FIFO management, deterministic timers, DOM rendering, animation completion, and cleanup.

**Independent test:** Queue/timer/lifecycle integration tests and Playwright rendering/animation tests pass.

- [x] T022 [US2] Implement per-position FIFO queue behavior and visible-slot accounting in `src/core/ToastQueue.mjs`, with no priority scheduler.
- [ ] T023 [US2] Implement manager coordination in `src/core/ToastManager.mjs`, including independent per-position limits defaulting to three and a consumer configuration path.
- [ ] T024 [P] [US2] Implement independent timer state, remaining-duration calculation, and multiple pause reasons in `src/core/ToastTimer.mjs`.
- [ ] T025 [US2] Implement DOM creation, update, attachment, removal, and renderer-owned accessibility attributes in `src/rendering/DOMRenderer.mjs`; keep queue and timer policy outside the renderer.
- [ ] T026 [P] [US2] Implement animation/transition completion handling with bounded fallback, cancellation handling, and reduced-motion completion in `src/animation/AnimationController.mjs`.
- [ ] T027 [US2] Integrate manager, queue, timer, renderer, and animation through explicit lifecycle callbacks without a Toast-to-manager internal back-reference in `src/core/ToastManager.mjs` and `src/core/Toast.mjs`.
- [ ] T028 [US2] Add queue, timer, animation, failure-path, and cleanup tests under `tests/unit/core/` and `tests/integration/lifecycle.test.mjs`, including independent positions and simultaneous pause reasons.

## Phase 5: US3 — Persistent, Actionable, and Async Notifications (P1)

**Goal:** Add persistent lifetime, actions, stable-ID updates, and asynchronous state changes on the same notification.

**Independent test:** Persistent/action/Promise tests pass, including rejection and remaining-time restoration.

- [ ] T029 [US3] Implement persistent notification semantics in `src/core/Toast.mjs` so persistent instances never start an automatic dismissal timer.
- [ ] T030 [US3] Implement the documented action contract and accessible action rendering in `src/core/Toast.mjs` and `src/rendering/DOMRenderer.mjs` without inventing new public option names outside the reviewed API design.
- [ ] T031 [US3] Pause the timer while an action is executing and resume the remaining duration after either fulfillment or rejection in `src/core/ToastTimer.mjs` and `src/core/Toast.mjs`.
- [ ] T032 [US3] Implement stable-ID update and lookup behavior through `src/core/ToastManager.mjs` and `src/core/Toast.mjs` so async state changes update the same logical notification.
- [ ] T033 [US3] Implement Promise/async pending, success, and failure transitions with documented settlement behavior in `src/core/Toast.mjs`; do not leave rejected or settled operations stuck.
- [ ] T034 [US3] Add tests for persistent behavior, action success/failure, remaining-time restoration, update-by-ID, and async settlement under `tests/integration/notification-modes.test.mjs`.

## Phase 6: US4 — Accessible and Customizable Presentation (P1)

**Goal:** Make announcement semantics, keyboard controls, focus behavior, motion, RTL, CSS separation, and opt-in injection reliable.

**Independent test:** Automated accessibility tests and selected Playwright checks pass; explicit CSS import and injection do not duplicate styles.

- [ ] T035 [US4] Implement status/alert urgency mapping, live-region lifecycle, and announcement behavior in `src/rendering/DOMRenderer.mjs` using non-interruptive status semantics by default.
- [ ] T036 [US4] Implement keyboard-accessible action and dismissal controls, stable focus behavior, and no unexpected focus transfer in `src/rendering/DOMRenderer.mjs`.
- [ ] T037 [US4] Move static structure/layout rules into `src/styles/base.css` and built-in keyframes into `src/styles/animations.css` while keeping runtime-dependent offsets under JavaScript control.
- [ ] T038 [US4] Implement RTL, responsive, zoom, long-content, and reduced-motion presentation rules in `src/styles/base.css` and `src/styles/animations.css` without changing the public preset data.
- [ ] T039 [US4] Add the explicit opt-in CSS injection mechanism in `src/styles/injectStyles.mjs` (or the reviewed equivalent), with deduplication, cleanup ownership, and documented CSP behavior; keep core ESM import side-effect-free.
- [ ] T040 [US4] Add Playwright coverage for live-region semantics, keyboard/focus behavior, RTL, reduced motion, explicit CSS import, opt-in injection, and duplicate prevention under `tests/browser/`.

## Phase 7: US5 — Consume and Package the Library Predictably (P1)

**Goal:** Produce verifiable ESM/browser/CSS/type artifacts from the real source graph and update consumer documentation.

**Independent test:** Packed-package and TypeScript fixtures pass; all declared export paths exist; SSR import is safe.

- [ ] T041 [US5] Implement the selected module-aware build configuration in the chosen root config file (`rollup.config.mjs` or `vite.config.mjs`) and build from the actual `src/**/*.mjs` graph.
- [ ] T042 [US5] Update `package.json` entry points and exports for the selected ESM/browser/CSS artifacts; retain or deliberately migrate `./src/Toast.js` only according to the completed consumer-evidence decision.
- [ ] T043 [P] [US5] Add a declaration-generation configuration in `tsconfig.types.json` and generate `.d.ts` from JSDoc; generate `.d.cts` only if the reviewed package plan includes CommonJS.
- [ ] T044 [US5] Create a packed-package consumer fixture under `tests/consumer/` that verifies ESM import, Node/SSR import safety, CSS loading, the selected deep import contract, and TypeScript declaration compatibility.
- [ ] T045 [US5] Add package artifact verification in `tests/package/` and confirm every `exports`, `types`, browser/CDN, and CSS path exists in the actual `npm pack` tarball.
- [ ] T046 [P] [US5] Update `README.md`, API documentation under `docs/`, and a migration guide under `docs/migration/` to match the verified public API, CSS loading, accessibility, async examples, and actual supported framework adapters.

## Phase 8: Polish and Cross-Cutting Concerns

**Goal:** Verify the full feature, automate repeatable checks, and prepare release evidence without publishing.

**Independent validation:** CI runs required checks; final diff preserves historical files; package/version readiness is recorded.

- [ ] T047 Configure GitHub Actions in `.github/workflows/` to run build, Vitest, typecheck, selected Playwright tests, Shared Contract Tests, and package verification; keep Pages deployment separate.
- [ ] T048 Run the full compatibility and acceptance suite, inspect the final diff, and verify that no path under `libs/js/` changed.
- [ ] T049 Reconcile package version, npm Registry state, Git tags, release history, README references, and changelog only after all package artifacts pass; record a release recommendation without publishing.

## Parallel Execution Opportunities

- After Setup: T010 and T011 are independent because their PoCs live in separate directories and use identical acceptance criteria.
- During US1: T017 and T019 can be developed in parallel after API characterization because they own separate modules; T021 waits for both.
- During US2: T024 and T026 can proceed in parallel after the lifecycle contract is agreed; renderer and manager integration wait for their contracts.
- During US4: T037 and T038 should be coordinated because they edit the same CSS files; do not run them in parallel. T039 can proceed after the loading contract is reviewed.
- During US5: T043 can proceed alongside documentation preparation, but package export work waits for the build and deep-export decisions.

## MVP / Incremental Delivery

1. **Foundation:** Setup and Foundational must pass before runtime refactoring.
2. **First usable slice:** US1 plus the minimal US2 lifecycle; this provides a compatible, testable ESM implementation.
3. **Product behavior:** US3 and US4 add the advanced notification modes and accessible presentation.
4. **Consumer-ready package:** US5 completes the build/package/types/docs contract.
5. **Release readiness:** Polish runs the full matrix and records version evidence. Publishing remains outside this task list unless separately authorized.

## Deferred Separate Scope

- The bootstrap branch separately removes the tracked root `node_modules/` directory from its branch tree and adds `.gitignore`. Do not rewrite repository history or remove unrelated large assets as part of this feature.
- No task authorizes commit, push, PR, merge, tag, or npm publish. Those operations require explicit approval.
