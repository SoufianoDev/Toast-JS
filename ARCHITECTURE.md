# Toast-JS — Architecture Audit & Target Design

> **Document status:** Draft — updated after approved decision consolidation  
> **Audit date:** 2026-11-12  
> **Repository:** [SoufianoDev/Toast-JS](https://github.com/SoufianoDev/Toast-JS)  
> **Audited branch:** `main`  
> **Audited commit:** `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17)  
> **Implementation status:** No repository files were modified during this audit.

---

## 1. Purpose and Scope

This document records the current implementation found in `main`, identifies code-backed issues, and proposes a JavaScript-first architecture for the next stable generation of Toast-JS.

It is a design document, not an implementation specification for every future feature. Proposed classes and modules must still pass the project's design rules: each must have a real responsibility, a clear boundary, and a testable reason to exist.

### 1.1 Product Direction

Toast-JS remains a single notification library named **Toast-JS**. It retains its Android-inspired Toast identity while gaining selected Snackbar-style capabilities inside the same Toast API.

The product should support four behavioral modes:

1. **Transient:** a short-lived informational or confirmation message.
2. **Persistent:** remains visible until dismissed or resolved.
3. **Actionable:** includes actions such as Undo, Retry, Restore, or View.
4. **Async:** updates as an operation moves through loading, success, or error states.

Toast-JS must also explain when a toast is not the right feedback pattern. Inline errors, banners, dialogs, and persistent status areas remain valid alternatives.

### 1.2 Fixed Project Decisions

The canonical record is `DECISION_REGISTER.md`. The table below is a summary; stable decision IDs in that file are authoritative.

| Decision | Approved requirement |
|---|---|
| Product | One Toast-JS library with transient, persistent, actionable, and asynchronous notification capabilities |
| Source language | JavaScript only; TypeScript is not the source language |
| Source module format | Native ES Modules using `.mjs`; new source of truth under `src/` |
| Type documentation | JSDoc is the source-level type/API contract |
| Static type checking | TypeScript compiler with `checkJs`, JSDoc, and `noEmit` |
| Consumer declarations | Generate `.d.ts` from JSDoc for ESM; `.d.cts` only if CommonJS is shipped |
| OOP | Classes/encapsulation where useful; composition preferred; no artificial abstractions |
| CSS | Plain CSS for runtime; Tailwind is not a runtime dependency |
| Style presets | Preserve the current 21 frozen presets, public shape/values, and aliases accepted by `main` |
| CSS consumption | Explicit stylesheet import is the default; CSS injection is optional and requires explicit opt-in |
| Legacy `libs/js` | Preserve historical files and URLs unchanged; never use them as new source |
| Compatibility | Strict compatibility with current `main`; selective additional compatibility for historical versions when evidence justifies it |
| Queue | Independent FIFO queue per position; default maximum 3 visible per position, configurable independently; no priority scheduler |
| Timer | Independent timer controller per notification; multiple pause reasons; resume remaining duration after action |
| Animation completion | Browser events first, bounded fallback; handle cancellation and reduced motion |
| Renderer | One DOM renderer with a clear internal contract; queue/timer policy remains outside it |
| Testing | Add tests alongside refactoring; Vitest, jsdom + selected Playwright tests, progressive coverage, Shared Contract Tests |
| Build tool | Rolldown 1.3.2 — selected in DEC-032 after the four-way proof of concept. CSS assets are copied separately; Rolldown does not bundle CSS. |
| CommonJS | ESM first; add `.cjs` only if real consumer need is demonstrated |
| Runtime support | Balanced policy; separate runtime support from development/build requirements; no speculative polyfills | Consumer floor Node.js 22.0.0 and development/build floor Node.js 22.22.2, measured separately (DEC-038) |
| AI-assisted workflow | Ponytail Ultra, Hush, and Deslop used within their defined review/cleanup scopes |
| Repository writes / publishing | Not authorized by the static audit or this document update |

### 1.3 Engineering Principles

- Prefer clear classes for stateful concepts and focused functions for stateless work.
- Use encapsulation for internal state; do not expose implementation fields as mutable public state without a reason.
- Prefer composition over artificial inheritance trees.
- Use inheritance only when substitutability is real and useful.
- Use polymorphism through replaceable strategies when there are genuine alternative behaviors.
- Express JavaScript contracts through JSDoc and runtime validation at trust boundaries.
- Do not create a class, interface, abstraction, dependency, or helper merely to satisfy a checklist.
- Keep comments that explain constraints, invariants, or non-obvious decisions; remove comments that simply narrate the next line.
- Keep public API documentation even when explanatory inline comments are minimized.

---

## 2. Repository Snapshot — What Exists Today

### 2.1 Root Structure

The audited tree contains the following main areas:

| Path | Current role |
|---|---|
| `src/Toast.js` | Actual self-contained runtime source used by the build script |
| `src/core/env.js` | Separate environment utility module; not imported by `src/Toast.js` |
| `src/core/dom.js` | Separate DOM utility module; not imported by `src/Toast.js` |
| `src/core/context.js` | Separate context module; not imported by `src/Toast.js` |
| `dist/toast.umd.js` | Generated/copy UMD distribution |
| `dist/toast.esm.js` | ESM output generated by text extraction from the UMD source |
| `libs/js/*` | Historical standalone browser distributions |
| `scripts/build.js` | Current UMD copy and ESM extraction script |
| `scripts/publish.js` | Direct npm publishing helper |
| `scripts/record-demo.js` | Puppeteer-based demo recorder |
| `tests/` | `unit`, `integration`, and `regression` directories currently contain only `.gitkeep` files |
| `.github/workflows/` | GitHub Pages deployment workflow only |
| `docs/` and `demos/` | Versioned documentation and examples |

### 2.2 Repository Hygiene Snapshot

The Git tree at the audited commit contains **4,573 tracked files**, of which **4,527 are under `node_modules/`**. There is no root `.gitignore` in the audited tree.

Large tracked assets include:

- `assets/v2_demo._review.gif` — 95,563,592 bytes.
- `assets/Real_Use_By_Dev.gif` — 20,272,625 bytes.
- `assets/Welcome_to_React+Toast-Js.gif` — 4,437,832 bytes.

GitHub reports a repository size of 146,275 KB. This is a repository-maintenance concern, not a reason to remove historical CDN distributions. Legacy library files under `libs/js` and unrelated large media are separate concerns and must be handled independently.

### 2.3 Current Runtime Structure

`src/Toast.js` is approximately 926 lines and 44 KB according to the Git tree. It is a UMD-wrapped factory/IIFE, not a native ESM source module.

The runtime currently uses:

- A function constructor: `var Toast = function (...) { ... }`.
- Prototype methods assigned through `Toast.prototype.*`.
- Static properties attached directly to `Toast`.
- Plain object literals for `Env`, `Dom`, and `ToastManager`.
- Ordinary instance properties such as `this._timeoutId` and `this._events`.

There are **no native ES `class` declarations and no ECMAScript `#private` fields** in the active source. Underscore-prefixed names are conventions only; they do not provide encapsulation.

The constructor stores mutable public fields including context, text, duration, style, position, icon configuration, animation names, dismissibility, element references, timer IDs, and manager state.

### 2.4 Current Inline Module Duplication

The active source defines its own copies of environment, DOM, and context functionality inside the UMD factory.

Separate files also exist:

- `src/core/env.js` — 117 lines; exports through CommonJS/AMD conditionals.
- `src/core/dom.js` — 367 lines; exports through CommonJS/AMD conditionals.
- `src/core/context.js` — 299 lines; exports through CommonJS/AMD conditionals.

These modules have no ESM `import`/`export` syntax and are not connected to the active `src/Toast.js` build path. This creates two implementations of related responsibilities and a risk of behavioral drift.

**Architecture conclusion:** establish one source of truth. The new `.mjs` modules must be the actual inputs to the build; do not retain parallel, unused implementations.

---

## 3. Current Public API and Compatibility Surface

The existing public surface must be inventoried and tested before refactoring. The following is based on the audited source and README.

### 3.1 Factory and Context API

- `Toast.makeText(context, text, duration)`
- `Toast.getWebAppContext()`
- `Toast.getContextFor(container)`

### 3.2 Instance Methods

- `setDuration()`
- `setStyle()` — accepts a style name or object
- `setPosition()`
- `setAnimation()`
- `setIcon()`
- `setIconShape()`
- `setDismissible()`
- `setTextOverflow()`
- `on()` / `off()`
- `addCallback()`
- `show()` / `hide()`

### 3.3 Static Constants and Values

- `LENGTH_SHORT`, `LENGTH_LONG`
- Six position constants
- Icon position, size, and shape constants
- Fade, slide, light-speed, wave, and wobble animation constants
- `TextOverflow`
- 21 predefined `STYLE_*` objects
- `Toast.Manager`

The 21 style objects are frozen objects built from `_BASE_STYLE`. `setStyle(string)` also accepts a set of aliases, including the historical misspellings `defult_1` and `defult_2`.

### 3.4 Legacy Distribution Contract

The following historical paths must remain available and their published contents must not be rewritten:

- `libs/js/v1.0.0/Toast.js`
- `libs/js/v2.0.0/Toast.js`
- `libs/js/v2.1.0-beta/Toast.js`

New distributions must use new versioned paths. The old files are compatibility artifacts, not source files for the new architecture.

The package also currently explicitly exports `./src/Toast.js`. This path may already be consumed by users, so it must be investigated and either preserved as a compatibility entry or deprecated through a deliberate versioned migration. It must not disappear accidentally when the `exports` map is redesigned.

---

## 4. Confirmed Problems and Behavioral Risks

The following findings come from source/configuration inspection. They are not claims that a full browser test suite has already reproduced them; they should become characterization tests before fixes are applied.

### P0 — Source and Build Architecture

**A. The current build is text-position dependent.**

`scripts/build.js` copies `src/Toast.js` as UMD and generates ESM by searching for the exact lines `"use strict";` and `return Toast;`, then slicing text between them. It does not resolve module imports or build a real dependency graph.

This approach cannot support a properly modular `.mjs` source without being replaced. Small source formatting changes can also break the string-boundary extraction.

**B. The core modules are disconnected from the active source.**

The three `src/core/*.js` files duplicate responsibilities implemented again inside `src/Toast.js`; the build ignores the separate modules.

**C. Test command points to a missing file.**

`package.json` declares:

```json
"test": "node tests/regression/issue4/verify-issue4.js"
```

The audited Git tree does not contain `tests/regression/issue4/verify-issue4.js`. The current `tests/unit`, `tests/integration`, and `tests/regression` directories contain only `.gitkeep` files.

**D. Package metadata references files that are not in `dist`.**

Current metadata points `unpkg` and `jsdelivr` to `dist/toast.umd.min.js`, which is absent. `types` points to `dist/types/index.d.ts`, which is also absent. The current `dist` tree contains only `toast.esm.js` and `toast.umd.js`.

### P1 — Runtime and Lifecycle

**A. Dismissible does not mean persistent in the current implementation.**

`setDismissible()` only changes the `dismissible` flag and close-button color. `_doShow()` still schedules `hide()` after `this.duration` for every toast. This contradicts the v2.1.0 changelog statement that dismissible toasts stay until manually closed.

**B. Exit animations can be cut off.**

The stylesheet declares several animations with 500 ms duration and wobble animations with 600 ms duration. `hide()` removes the element after a fixed 350 ms timeout. Therefore, some exit animations cannot complete before removal. The manager may also release a visible slot before the animation has finished.

**C. Manager queue and stacking are global across positions.**

`ToastManager` has one `_active` array and one `_queue`. `_applyStackOffset()` and `_onHide()` use the array index without grouping by toast position. A toast at the top-left can therefore affect the stack offset or visible limit of a toast at the bottom-right.

**D. Manager can retain an entry when display fails.**

`_display()` adds an instance to `_active` before calling `toast.show()`. If `show()` returns without creating an element because no usable context is available, no normal hide lifecycle is guaranteed to release that manager entry.

**E. Lazy context detection is too permissive.**

`isLazyContext(obj)` checks `obj._marker === LAZY_CONTEXT_MARKER || obj.isLazy`. Any truthy `isLazy` property can be treated as a lazy context, even if `resolve` is not callable. The caller later invokes `context.resolve()`.

**F. Video icon detection disagrees with URL validation.**

The icon validator accepts `.mp4` and `.webm` URLs with query parameters, but `_createIconElement()` detects video using `endsWith('.mp4')` and `endsWith('.webm')`. A URL such as `icon.mp4?token=...` may be accepted as an icon but rendered as an image.

**G. Every notification is announced assertively.**

`_doShow()` sets `role="alert"` and `aria-live="assertive"` for every toast. Routine success and informational messages should not all interrupt assistive-technology output. The future model needs notification politeness/urgency policies and accessible interactive actions.

### P1 — Packaging and Development Environment

**A. ESM file extension and package metadata are inconsistent.**

The package has no `type` field, while `exports.import` points to `dist/toast.esm.js`. The project also declares Node `>=12`. A `.js` file containing ESM syntax is not a reliable Node ESM entry across that declared range without explicit package/module configuration. The agreed source and output conventions should use `.mjs` for ESM and `.cjs` for CommonJS where required.

**Status — decided, not yet implemented.** The conventions are fixed in section 7.1 and 7.2, and the consumer engine floor is now decided: **Node.js 22.0.0**, the oldest currently supported LTS release line (DEC-038; supported lines 22.x, 24.x and 26.x, EOL releases excluded). The floor does **not** by itself repair this finding: Node.js only treats an ambiguous `.js` file as ESM through module-syntax detection, which became the default in 22.7, so `dist/toast.esm.js` still fails to load on Node.js 22.0.0–22.6.x. The `.mjs` ESM output is therefore required regardless, and the packaging task (T041/T042) must ship it and verify it from the packed tarball before `engines.node` is set to `>=22.0.0`.

**B. Development-tool Node requirements do not match the declared engine.**

The package declares Node `>=12`, while the locked Playwright and Puppeteer versions and `@puppeteer/browsers` require Node `>=18`. Runtime support and development-tool support must be documented separately and tested against an explicit version matrix.

**Status — resolved.** The two requirements are now measured and documented separately. The **consumer** floor is Node.js 22.0.0 (DEC-038), and the **development/build** floor is Node.js 22.22.2, set by jsdom 31 rather than by any consumer-facing requirement. The toolchain floor does not become the consumer minimum, and the two must never be written into a single field. The measured matrix — browser floor, consumer Node floor and toolchain Node floor, each verified against official Node.js binaries — is recorded in `research.md` R-002; the CI matrix that tests them is part of T047.

**C. Publishing script is not a safe release gate.**

`scripts/publish.js` runs `npm publish --access public` after `npm whoami` and a build. It does not perform a package-content audit, a dry-run, compatibility tests, or a version/registry preflight. It should not be the release workflow in its current form.

**D. `sideEffects: false` will need reconsideration when CSS files are introduced.**

If consumers import a standalone CSS file, the package metadata must not allow bundlers to tree-shake that CSS as if it were a side-effect-free JavaScript module.

### P2 — Documentation Drift

- README describes adding a `#toast-notification` container, but the audited runtime does not query that ID or class; it appends to the provided context.
- README links exclusively to the `v2.1.0-beta` CDN path in its main installation examples, while `package.json` says `2.1.0` and the changelog describes `2.1.0-beta`.
- The package description and README mention React, Next.js, and Vue compatibility, but the repository demonstrates React through the global CDN pattern; native framework adapters are not present in the audited tree.
- A README custom-style example includes a nested `@media` key in a JavaScript style object. `setStyle(object)` applies the object through `Object.assign(element.style, ...)`; nested media-query objects are not interpreted as CSS rules.
- README has no npm installation section even though the package manifest is prepared for npm.

### P2 — Repository Hygiene

- No root `.gitignore` was found.
- `node_modules/` is tracked in Git.
- Large demonstration GIFs inflate repository size and clone cost.
- Current GitHub Actions workflow deploys GitHub Pages; it does not run build, tests, package validation, or compatibility checks.

The repository history shows commit `06e9e836bfdbf8681bec0c1cc3776a6834ed4f6f` (2026-07-10) titled `chore: remove CI/CD test workflow and regression tests for issue #10`. The current tree has no replacement test workflow. This is recorded as history; the reason beyond the commit message is not inferred.

---

## 5. Target Architecture — JavaScript-First ESM

The following is a proposed architecture. It deliberately avoids creating every possible class before its responsibilities are proven.

### 5.1 Proposed Source Layout

```text
src/
├── index.mjs
│
├── core/
│   ├── Toast.mjs
│   ├── ToastManager.mjs
│   ├── ToastQueue.mjs
│   └── ToastTimer.mjs
│
├── context/
│   └── LazyContext.mjs
│
├── events/
│   └── EventEmitter.mjs
│
├── rendering/
│   └── DOMRenderer.mjs
│
├── animation/
│   └── AnimationController.mjs
│
├── styles/
│   ├── presets.mjs
│   ├── resolveStyle.mjs
│   ├── base.css
│   └── animations.css
│
└── utils/
    ├── environment.mjs
    └── validation.mjs
```

This is a candidate layout, not an instruction to create every file. During detailed design, any class/module that does not have an independently meaningful responsibility should be folded into its owner.

### 5.2 Responsibility Boundaries

| Component | Responsibility | Candidate form |
|---|---|---|
| `Toast` | Public instance API, configuration, lifecycle state | Class with private fields |
| `ToastManager` | Coordinate managed toasts, active instances, lifecycle and queue | Class |
| `ToastQueue` | Per-position FIFO policy and dequeue rules; no priority scheduler in the initial scope | Class only if independently useful and testable |
| `ToastTimer` | Duration state, start/clear/pause/resume and remaining time | Stateful class if the product requires these behaviors |
| `LazyContext` | Hold pending resolution and readiness callbacks | Class because it owns mutable async state |
| `EventEmitter` | Manage event subscriptions and dispatch | Reusable class only if more than one owner needs it; otherwise keep it inside `Toast` |
| `DOMRenderer` | Create/update/remove toast DOM and accessibility structure | Class if it owns renderer configuration/resources; otherwise focused module functions |
| `AnimationController` | Coordinate animation lifecycle and completion | Class only if it owns asynchronous animation state and cleanup |
| `presets.mjs` | Export immutable public preset data and aliases | Data module; not a class |
| `resolveStyle.mjs` | Resolve/normalize style inputs | Pure functions |
| `environment.mjs` | Browser/DOM/runtime capability checks | Pure functions |
| `validation.mjs` | Input validation and normalization | Pure functions |

### 5.3 Dependency Direction

The dependency graph should point inward and avoid lifecycle cycles:

```text
Public API (index.mjs)
        |
        v
      Toast ---------------------> Style Resolver / Presets
        |  \
        |   +--------------------> Event handling
        |   +--------------------> Timer
        |   +--------------------> Renderer
        |                            |
        |                            +--> DOM utilities
        |                            +--> Animation lifecycle
        |                            +--> CSS loading
        |
        +---- lifecycle events ----> ToastManager
                                       |
                                       +--> ToastQueue
                                       +--> active-instance registry
```

Important boundary rule: `Toast` should not import or mutate `ToastManager` directly. The manager should coordinate instances through a defined lifecycle contract/events. This removes the current back-reference where `Toast.hide()` calls `ToastManager._onHide()`.

### 5.4 OOP Rules for the Implementation

- Use native `class` syntax for stateful objects such as `Toast` and `ToastManager`.
- Use `#private` fields for implementation state that is not part of the public API.
- Keep public methods small and responsible for one operation; move meaningful internal operations into named methods/functions.
- Use composition for renderer, timer, queue, and event responsibilities.
- Use strategy objects/interfaces through JSDoc contracts where there are real interchangeable implementations.
- Do not create `SuccessToast`, `ErrorToast`, and similar subclasses merely for visual variants; those are data/configuration.
- Do not invent an abstract base class unless at least two real implementations need the contract.
- Use JSDoc `@typedef`, `@callback`, `@implements`, and parameter/return annotations for source contracts.
- Use TypeScript tooling for static checking of JavaScript if useful; this does not make TypeScript the source language.
- Ship type declarations only after they accurately describe the actual public API.

---

## 6. Styles Architecture

### 6.1 Ownership

| Concern | Source of truth |
|---|---|
| Public style preset objects | `presets.mjs` |
| Historical style names/aliases | `presets.mjs` or a single exported alias map |
| Static structure and layout | `base.css` |
| Built-in animation classes and keyframes | `animations.css` |
| Runtime position/stack offsets | JavaScript runtime |
| User-provided inline style properties | JavaScript runtime |
| User custom keyframes | Runtime-managed stylesheet with explicit lifecycle and validation |

The current 21 frozen style objects should be moved without changing their object shape or values initially. The aliases `default_1`, `defult_1`, `default_2`, `defult_2`, and the remaining accepted names must remain covered by compatibility tests.

### 6.2 Distribution Options

The approved CSS consumption contract is:

- Explicit stylesheet import is the default integration path for npm/bundler consumers.
- CDN consumers may load JavaScript and CSS as separate assets.
- Optional CSS injection is supported only through an explicit consumer action/API or an explicitly selected entry point; importing the core ESM module must not inject CSS automatically.
- The core ESM entry must not force a CSS import that breaks direct Node.js/SSR module loading.
- Prevent duplicate stylesheet application when supported loading paths are combined.
- Document CSP constraints and provide a clear external stylesheet path for restrictive CSP environments.

The precise injection API, cleanup behavior, and CSP details belong in the architecture/PoC work. They do not change the approved default: explicit import, with injection opt-in.

### 6.3 CSS Rules

- Keep Tailwind out of the runtime package.
- Preserve public style objects as JavaScript data for compatibility.
- Move structural selectors, responsive rules, and built-in keyframes to CSS.
- Keep values that depend on runtime state in JavaScript.
- Do not create a large token system until the shared tokens and theming requirements are demonstrated by actual use cases.

---

## 7. Build and Package Architecture

### 7.1 Source and Output Conventions

| Extension | Role |
|---|---|
| `.mjs` | Authoritative JavaScript source, build scripts, tests |
| `.cjs` | Generated CommonJS artifacts only when required |
| `.css` | Styles and animations |
| `.d.ts` / possibly `.d.cts` | Consumer-facing TypeScript declarations, according to the final export map |
| `.md` | Architecture, API, contributor and migration documentation |

Historical `libs/js` files keep their original `.js` names and contents.

### 7.2 Proposed Distribution

```text
dist/
├── toast.mjs
├── toast.umd.js          # if retained/required by the distribution plan
├── toast.umd.min.js      # if retained/required by the distribution plan
├── toast.css
├── toast.cjs             # only if CommonJS demand is demonstrated
└── types/
    ├── index.d.ts
    └── index.d.cts       # only if CommonJS is shipped
```

The exact outputs depend on the chosen build tool and TypeScript declaration strategy. Do not create declaration files manually that drift from the real API.

### 7.3 Build Tool

Replace the current source-text extraction script with a real module-aware build pipeline. No tool has been selected yet. The approved selection method is a focused proof of concept comparing Rollup and Vite Library Mode against the actual package requirements.

The comparison must validate:

- Native `.mjs` input and ESM output.
- Browser UMD/standalone output where required by the distribution strategy.
- CommonJS output only as a conditional case, if consumer evidence justifies it.
- CSS extraction and the approved opt-in injection path.
- Source maps and minification.
- No unintended runtime dependencies.
- Reproducible output and package verification.
- Compatibility with the evidence-based Node.js/browser support matrix.

The build tool must consume the actual `src/**/*.mjs` dependency graph. It must not maintain a second hand-copied implementation. The proof of concept is deferred until the specification and architecture stages are approved; it must not modify the project during comparison unless separately authorized.

### 7.4 Package Exports

The new `package.json` must define accurate entry points for ESM, CommonJS where supported, Browser UMD, CSS, and declarations. Every declared path must exist in the package archive.

Preserve or deliberately migrate the existing `./src/Toast.js` export; do not silently close it.

Do not set package-wide module semantics without evaluating the legacy `.js` deep export. Explicit `.mjs` and `.cjs` files can avoid changing the interpretation of historical `.js` files.

The package's declared Node engine must reflect the actual tested runtime. The existing package says Node `>=12`, but its current Playwright and Puppeteer development toolchain declares Node `>=18`. The two requirements are now separated: the **consumer** floor is Node.js 22.0.0 and the **development/build** floor is Node.js 22.22.2 (DEC-038, `research.md` R-002). `engines.node` is set by the packaging task once the shipped artifact has been verified against that floor.

---

### 7.5 JavaScript Static Type Checking

The source remains JavaScript. Use JSDoc as the type-contract source and the TypeScript compiler for static checking with `checkJs` and `noEmit`. The check must run in automated verification. Consumer declarations are generated from JSDoc according to the formats actually distributed; `.d.cts` is conditional on shipping CommonJS.

## 8. Testing and Verification Strategy

Testing policy is approved and must not be re-opened: tests are added alongside refactoring, using Vitest, jsdom plus selected Playwright tests, progressive coverage, and Shared Contract Tests against legacy and new implementations.

### 8.1 Unit and Integration Tests

- Current public API names, argument forms, defaults, constants, and return behavior.
- Style preset object shape, values, immutability, and all aliases accepted by `main`.
- Style input normalization and invalid values.
- Position normalization and independent per-position queue behavior.
- Queue FIFO ordering, default visible limit of 3 per position, per-position configuration, cancellation, and slot release.
- Timer duration, queue-wait separation, pause/resume with multiple reasons, action pause, remaining-time resume, persistent semantics, and cleanup.
- Animation completion events, fallback, cancellation, reduced motion, and removal order.
- Event subscription/removal, context resolution, and failed-render cleanup.
- Icon URL parsing and media type detection, including query strings.
- ID-based updates and asynchronous notification state changes.

### 8.2 Real-Browser Tests

Use Playwright selectively for behavior jsdom cannot prove reliably:

- Show/hide lifecycle and actual CSS rendering.
- Every supported position and independent stacks.
- Entry/exit animation completion and interruption.
- Pointer/keyboard interaction and action controls.
- CSS explicit-import and opt-in injection paths, including duplicate prevention.
- Responsive layout, RTL, zoom, and reduced motion.
- DOM readiness and delayed context/container resolution.

### 8.3 Accessibility Tests

- Status vs alert announcement policy.
- Live region timing and update behavior.
- No unexpected focus movement.
- Keyboard access and accessible names for all interactive controls.
- Predictable focus behavior after closing actionable notifications.
- Reduced motion, long text, zoom, responsive layout, and RTL.

### 8.4 Shared Contract Tests

Create one shared contract suite and run it against both the current legacy implementation and the new implementation through appropriate adapters. Do not duplicate test logic for each historical release without a demonstrated need. Do not modify legacy files to make tests pass. The mandatory compatibility baseline is current `main`; older-version differences are tested only when explicitly retained as selective historical compatibility.

### 8.5 Coverage Policy

Use progressive, behavior-oriented coverage. Do not enforce an arbitrary global percentage at the beginning. Establish realistic thresholds after a measurable baseline exists and the architecture stabilizes. Public API compatibility and high-risk lifecycle behavior take priority over vanity coverage numbers.

### 8.6 Package Tests

Run tests against a packed artifact, not only source files:

- ESM import from `.mjs`.
- CommonJS `require()` only if `.cjs` is shipped.
- Browser UMD/standalone path where retained.
- Explicit CSS import and opt-in injection.
- TypeScript consumer fixture using generated declarations.
- SSR import without browser-global access during module evaluation.
- Supported bundler consumer fixtures selected by the final package design.
- `npm pack --dry-run` and inspection of actual tarball contents.

### 8.7 CI

Run build, unit/integration tests, static type checking, selected browser tests, compatibility tests, and package-consumer checks as appropriate. Keep GitHub Pages deployment separate from verification; deployment is not a quality gate.

## 9. Migration and Backward Compatibility

1. Treat the audited `main` snapshot (`701371fd42423d034fc649aeac900f13b99b183d`) public APIs and supported observable behavior as the mandatory strict compatibility baseline. Re-audit `main` if it has advanced before implementation.
2. Treat `libs/js/` historical directories as immutable artifacts. Preserve their contents and CDN paths; do not use them as source for the new implementation.
3. Add support for older-version behaviors to the new implementation only when actual usage or an explicit requirement justifies it. Document and test every such exception.
4. Add Shared Contract Tests for the current `main` contract and run them against the legacy and new implementations without editing legacy files.
5. Characterize current defaults, aliases, style preset values, events, lifecycle, and return behavior before changing them.
6. Do not silently redefine an existing option to introduce new behavior. The audit found a potential mismatch around `dismissible` and automatic dismissal; resolve it through code/documentation/history characterization before changing the contract.
7. Investigate actual consumer use of the existing `./src/Toast.js` package export. Preserve it or migrate/deprecate deliberately; do not remove it accidentally.
8. Build new artifacts under new output paths. Do not overwrite historical `libs/js/` distributions.
9. Check npm Registry state, tags, package metadata, and compatibility impact before selecting a release version.

## 10. Priority Order

| Priority | Work item | Reason |
|---|---|---|
| P0 | Freeze and test public API/legacy compatibility | Prevent accidental breaking changes |
| P0 | Define source-of-truth modules and dependencies | Remove duplicated inactive core implementations |
| P0 | Replace text-slicing build architecture | Required for real `.mjs` modules and CSS assets |
| P0 | Restore working test suite and CI | Current `npm test` target is absent |
| P0 | Correct package metadata and export map | Current declared artifacts are missing/inconsistent |
| P1 | Refactor Toast lifecycle and manager boundaries | Fix ownership, timer, animation and queue risks |
| P1 | Separate preset data from structural CSS | Preserve style API while improving maintainability |
| P1 | Accessibility behavior model | Current assertive semantics are too broad |
| P1 | Package artifact integration tests | Validate the actual user installation path |
| P2 | Repository hygiene (`.gitignore`, dependency removal, large assets) | Reduce clone and maintenance cost |
| P2 | Documentation and migration guide | Align claims and examples with actual behavior |
| P2 | Context7/Agent Skill/AI evaluation | Improve agent discoverability after API stabilizes |

---

## 11. Decision Status and Deferred Work

The approved decisions are consolidated in `DECISION_REGISTER.md`. They include the product direction, `.mjs` source, JSDoc, OOP principles, plain CSS, legacy isolation, strict compatibility with current `main`, selective historical compatibility, testing policy, Vitest, jsdom + Playwright, progressive coverage, Shared Contract Tests, per-position FIFO queue, default visible limit of 3 per position, action-aware timers, animation completion, one DOM renderer, explicit CSS import by default with opt-in injection, ESM-first distribution, conditional CommonJS, balanced runtime support, and `checkJs`/`noEmit` static checking.

The following are not unanswered user decisions. They are evidence-driven validation or architecture tasks:

1. **Build tool:** compare Rollup and Vite Library Mode through the approved proof of concept; select only after evaluating actual outputs and package behavior.
2. **Exact Node.js/browser versions:** determine from runtime APIs, development tooling, and tested support boundaries. **Resolved** — the browser floor and both Node.js floors are measured and recorded in `research.md` R-002 and fixed by DEC-038 (consumer Node.js 22.0.0; development/build Node.js 22.22.2).
3. **CommonJS output:** evaluate actual consumer need; ESM remains primary and `.cjs` is conditional.
4. **Release version:** verify npm Registry, tags, and artifact scope before choosing.
5. **`./src/Toast.js` package export:** investigate consumer usage and preserve or migrate deliberately.
6. **New API signatures:** define public API details for IDs, updates, actions, persistent notifications, and async states while preserving the existing `main` contract.
7. **Internal module/class boundaries and event system:** determine from real responsibilities, invariants, dependency direction, and tests; avoid artificial abstractions.
8. **CSS injection API details:** define explicit opt-in, duplicate prevention, cleanup, and CSP behavior without changing the approved default.

Do not turn these items into repeated broad questionnaires. Resolve them through repository evidence, technical prototypes, and documented design proposals. Ask the user only when a genuine product trade-off cannot be decided from the approved requirements and evidence.

## 12. Audit Limitations

This audit used the GitHub repository tree, source files, package metadata, build/publish scripts, changelog, README, current test paths, workflow, and selected commit history at the recorded `main` commit.

It is a static repository audit. The following have **not** been performed:

- Running `npm install`, `npm test`, or the current build locally.
- Running the library in real browsers.
- Testing the published npm package or confirming npm Registry publication status.
- Testing Vite/Webpack/Next.js integration fixtures.
- Running accessibility tooling or assistive technology.
- Confirming actual usage of the exported `./src/Toast.js` deep path by downstream consumers.

These are validation tasks for the next phase, not assumptions to silently treat as completed.

---

## 13. Sources

- [Repository](https://github.com/SoufianoDev/Toast-JS)
- [Audited `src/Toast.js`](https://github.com/SoufianoDev/Toast-JS/blob/main/src/Toast.js)
- [Current `src/core`](https://github.com/SoufianoDev/Toast-JS/tree/main/src/core)
- [Current build script](https://github.com/SoufianoDev/Toast-JS/blob/main/scripts/build.js)
- [Current package metadata](https://github.com/SoufianoDev/Toast-JS/blob/main/package.json)
- [Tests directory](https://github.com/SoufianoDev/Toast-JS/tree/main/tests)
- [GitHub Pages workflow](https://github.com/SoufianoDev/Toast-JS/blob/main/.github/workflows/jekyll-gh-pages.yml)
- [Commit that removed the Issue #10 test workflow](https://github.com/SoufianoDev/Toast-JS/commit/06e9e836bfdbf8681bec0c1cc3776a6834ed4f6f)
- [Node.js package documentation](https://nodejs.org/api/packages.html)
- [TypeScript JSDoc support](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

---

**End of draft.** No repository files have been changed and no release or pull request has been created.
