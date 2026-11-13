# Toast-JS — Decision Register

> **Status:** Consolidated decision record  
> **Last updated:** 2026-11-12  
> **Repository:** [SoufianoDev/Toast-JS](https://github.com/SoufianoDev/Toast-JS)  
> **Evidence baseline:** `main` at `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17), as recorded in the static architecture audit, plus explicit decisions in the supplied conversation history and the user's approval dated 2026-11-12.

This file is the canonical record of decisions. Conversation numbering is not authoritative. Stable IDs below must be used when referring to decisions. A decision marked **Approved** must not be asked again. Reopening one requires a concrete conflict, new evidence, and an explicit explanation of the impact.

## 1. Product and project direction

| ID | Area | Approved decision | Status |
|---|---|---|---|
| DEC-001 | Product identity | Keep one library named **Toast-JS**. Do not split Snackbar into a separate product. Retain the Android-inspired Toast identity while adding selected Snackbar-style capabilities. | Approved |
| DEC-002 | Product behavior | Support transient, persistent, actionable, and asynchronous notifications. Support updating an existing notification by ID and representing Promise/operation states. | Approved direction; exact public API remains specification work |
| DEC-003 | Product boundaries | Toast is not the answer to every feedback event. Inline errors, banners, dialogs, and persistent status areas remain appropriate alternatives. | Approved |
| DEC-004 | Platform scope | The core is browser/DOM-oriented and framework-agnostic. Optional framework adapters may be added only when justified and tested. Do not claim React Native support without a separate design and implementation. | Approved |
| DEC-005 | Source language | JavaScript only. TypeScript is not the implementation source language. | Approved |
| DEC-006 | Source module format | Native JavaScript ES Modules using `.mjs`; the new implementation's source of truth lives under `src/`. | Approved |
| DEC-007 | Type documentation | JSDoc is the source-level contract for types, callbacks, parameters, return values, and public API documentation. | Approved |
| DEC-008 | Type declarations | Generate consumer-facing TypeScript declarations from JSDoc according to the formats actually distributed. Produce `.d.ts` for ESM; produce `.d.cts` only if CommonJS is actually shipped. Do not maintain duplicated hand-written declarations. | Approved |
| DEC-009 | OOP and design | Use native classes and encapsulation for stateful responsibilities where they improve the design. Prefer composition. Use inheritance/polymorphism only for real substitutable behaviors. Keep pure/stateless work as functions. No artificial classes, interfaces, abstractions, or dependencies. | Approved |
| DEC-010 | Comments and code quality | Remove comments that merely narrate code. Preserve comments that explain intent, constraints, invariants, or non-obvious decisions. Keep public API documentation. | Approved |
| DEC-011 | Engineering review skills | Use Ponytail Ultra for design/complexity review, Hush for focused cleanup, and Deslop for identifying redundant or low-quality generated code, each within the relevant task scope. | Approved workflow |

## 2. Source, styles, and legacy boundaries

| ID | Area | Approved decision | Status |
|---|---|---|---|
| DEC-012 | Legacy isolation | Keep historical distributions under `libs/js/`. Do not use them as the source for new development. Keep their historical contents and public CDN paths unchanged. | Approved |
| DEC-013 | New implementation | The new source of truth is under `src/`, using `.mjs` modules. Do not mix legacy implementation files into the new source architecture. | Approved |
| DEC-014 | CSS technology | Use plain CSS for the runtime library. Do not add Tailwind as a runtime dependency. Tailwind may be used by documentation or a playground. | Approved |
| DEC-015 | Style presets | Preserve the current 21 frozen style preset objects, their public shape and values, and all aliases accepted by the current `main` contract, including historical misspellings. Characterization tests must record the complete actual alias set. | Approved |
| DEC-016 | CSS ownership | Move static layout, structural selectors, and built-in keyframes into separate CSS assets. Keep runtime-dependent values such as dynamic positions, stack offsets, and custom inline styles under JavaScript control. | Approved |
| DEC-017 | CSS consumption | Support explicit stylesheet import and optional CSS injection. Explicit CSS import is the default. Injection must be opt-in through an explicit API or entry point; it must not happen implicitly merely because the core ESM module is imported. | Approved |
| DEC-018 | CSS loading safety | Do not force a CSS import from the core ESM entry if that would break direct Node.js/SSR module loading. Prevent duplicate stylesheet application. Respect/document CSP constraints. | Approved |

## 3. Compatibility and testing

| ID | Area | Approved decision | Status |
|---|---|---|---|
| DEC-019 | Compatibility baseline | Treat the public API and supported observable behavior of the audited `main` snapshot (`701371fd42423d034fc649aeac900f13b99b183d`) as the strict compatibility baseline for the new implementation. Re-audit the branch if `main` has advanced before implementation; internal refactoring must not silently break the approved baseline. | Approved |
| DEC-020 | Historical compatibility scope | Compatibility with older version-specific behaviors is selective. Preserve historical files and paths unmodified; add compatibility behavior to the new implementation only when supported by evidence of real use or an explicit requirement, and document/test each exception. | Approved |
| DEC-021 | Test introduction policy | Add tests alongside each refactored unit or behavior. Do not require a complete test suite before any refactor starts, but do not consider the migration complete until the current public API and required compatibility behavior are covered. | Approved |
| DEC-022 | Test framework | Use Vitest. This does not imply that Vite must be the library bundler. | Approved |
| DEC-023 | DOM and browser test environments | Use jsdom for fast unit/integration tests and Playwright for selected real-browser tests where CSS, animation, rendering, or actual browser behavior matters. | Approved |
| DEC-024 | Coverage policy | Use progressive, behavior-oriented coverage. Do not impose an arbitrary global percentage at the start. Establish realistic numerical thresholds after a baseline exists and the architecture stabilizes. | Approved |
| DEC-025 | Compatibility test method | Use Shared Contract Tests: the same contract suite runs against the legacy implementation and the new implementation through appropriate adapters. Do not modify legacy files to make tests easier. | Approved |

## 4. Runtime architecture decisions

The historical conversation labels these as decisions 14–18. The stable IDs below supersede the inconsistent numbering across conversation branches.

| ID | Legacy number | Area | Approved decision | Status |
|---|---:|---|---|---|
| DEC-026 | 14 | Queue policy | Use independent FIFO queues per display position. Enforce a visible-item limit per position. When a visible item leaves, the next queued item for that position may appear. No priority system is included now. | Approved |
| DEC-027 | 14 detail | Queue capacity | Default to 3 visible notifications per position. Allow the consumer to configure the limit independently for each position. | Approved on 2026-11-12 |
| DEC-028 | 15 | Timer lifecycle | Use a dedicated timer controller with an independent timer per notification. Support pause/resume with multiple simultaneous pause reasons; distinguish visible duration from queue wait time; persistent notifications have no automatic timer; clean up timer resources on removal. | Approved |
| DEC-029 | 15 detail | Timer pause/resume | Pause while the notification is hovered, keyboard-focused, or executing an action. After an action completes, resume the remaining duration rather than restarting the full duration. | Approved on 2026-11-12 for action completion behavior |
| DEC-030 | 16 | Animation completion | Browser animation/transition events are the primary completion signal (`animationend` / `transitionend`); use a bounded fallback duration when expected events do not arrive. Handle canceled animations and `prefers-reduced-motion`. Do not remove the element before completion or the safety fallback. | Approved |
| DEC-031 | 17 | Renderer responsibility | Use one official DOM renderer with a clear internal contract. The manager owns notification lifecycle and state; the renderer owns DOM creation, updates, removal, and rendering-related accessibility attributes. The renderer does not own queue/timer policy or global event management. Do not build a public pluggable renderer system without a demonstrated need. | Approved |

## 5. Build, module formats, and support

| ID | Area | Approved decision | Status |
|---|---|---|---|
| DEC-032 | Build-tool selection | Use **Rolldown 1.3.2 directly** as the build engine, without a library-bundler layer. Rolldown handles JavaScript bundling and the ESM and browser UMD outputs. Selected on measured evidence, not preference: four isolated proof-of-concepts were built from one shared fixture and measured by one script (`research.md` R-001). All four met the 12 acceptance criteria, but Rolldown was the fastest by median build time (413 ms against Rollup 962 ms, Vite 8 at 2306 ms and tsdown at 4023 ms), needed one direct dependency against Rollup's three, and its output is byte-identical to Vite 8's because Vite 8 already bundles with Rolldown internally. | Approved on 2026-11-13 |
| DEC-033 | CommonJS | ESM using `.mjs` is the primary and default distribution. Do not produce `.cjs` merely as a precaution. Add a separate CommonJS output only if real consumer demand or integration evidence establishes the need. | Approved; demand evidence gathered 2026-11-13 in `research.md` R-004 — **no publicly discoverable demand evidence**, so **no `.cjs` output and no `.d.cts`**; the existing `require` condition and `main` field keep pointing at the UMD build, which already loads on Node 12.0.0+ and is the only path that provides named-export parity today |
| DEC-034 | Node.js/browser support policy | Use a balanced support policy. Separate library runtime requirements from development/build/test tool requirements. Target modern browsers with meaningful usage; choose the minimum Node.js/runtime versions based on actual APIs and toolchain constraints. Do not add polyfills without a demonstrated need. Test the declared support boundaries. | Approved policy; version matrix measured 2026-11-13 in `research.md` R-002 — browser Chrome 54+/Edge 14+/Firefox 61+/Safari 10.1+, Node 14+ for the planned ESM entry, Node 22.22.2 for the toolchain |
| DEC-035 | Static type checking | Use the TypeScript compiler to check JavaScript with JSDoc, with `noEmit` for the checking pass. Include the check in automated verification. Do not convert source files to TypeScript. **Amended 2026-11-13 (T015):** the check now runs with `checkJs` off and each checked file opting in with `// @ts-check`, because `src/index.mjs` imports the legacy `src/Toast.js` runtime, which TypeScript would otherwise pull into the program and report 118 pre-existing errors in. `exclude` does not stop an imported file from being checked, and a `src/Toast.d.ts` shadow would ship a second declaration, which the packaging artifacts forbid. The per-file opt-in keeps the legacy runtime out of the check and the `.mjs` sources fully checked; `tests/unit/type-check-coverage.test.mjs` fails if a checked file loses its marker. | Approved on 2026-11-12; amended 2026-11-13 |
| DEC-036 | CSS asset pipeline | Keep stylesheets as separate Plain CSS files, copied deterministically into the distribution output. Do not add a CSS bundler, CSS minifier, or bundler-integrated CSS plugin. The runtime source does not import CSS from JavaScript; consumers import the stylesheet explicitly. Rolldown does not bundle CSS at all, so this keeps the build free of the CSS plugins the proof-of-concepts needed, and avoids a CSS transformer rewriting the shipped stylesheet. | Approved on 2026-11-13 |
| DEC-037 | Declaration generation pipeline | Generate the shipped `.d.ts` from JSDoc with the TypeScript compiler through a dedicated declaration configuration, as a step separate from bundling. Do not adopt a bundler-integrated declaration plugin. The fast `isolatedDeclarations` path is structurally unreachable for a JavaScript-only library, because it cannot be combined with the `allowJs` that declaration generation from JavaScript requires. | Approved on 2026-11-13 |
| DEC-038 | Consumer Node.js support policy | Consumers must use a **supported** Node.js release. The consumer minimum is the **oldest currently supported Node.js LTS release line**, and support runs from that minimum onward. As of 2026-11-13 the supported lines are Node 22.x (Maintenance LTS, EOL 2027-04-30), 24.x (Maintenance LTS, EOL 2028-04-30) and 26.x (Active LTS, EOL 2029-04-30) per the official release schedule, so the **selected consumer-support target is Node.js 22.0.0**. This is a target for the **final packaged artifact**, not a claim that the currently shipped tarball already works on 22.0.0: the shipped `dist/toast.esm.js` is a `.js` file carrying ESM syntax in a package with no `"type": "module"`, so it fails to load on Node 22.0.0–22.6.x (R-002.3a). **T041/T042 must fix and verify the packaged artifact before `engines.node` is set to `>=22.0.0`.** EOL releases are outside the support commitment and their users must upgrade. Consumer runtime requirements stay separate from development/build requirements: the toolchain floor remains Node 22.22.2 (jsdom 31) and does **not** become the consumer minimum. No legacy compatibility shim, experimental flag, or resolution workaround is added solely to support an obsolete Node.js release. `engines.node` is not changed by this decision. | Approved on 2026-11-13; target confirmed 2026-11-13 |
| DEC-039 | Superseded historical Node.js compatibility requirements | The following T014 requirements exist only to serve Node.js releases that DEC-038 places outside the support commitment, and are **superseded**: (a) the physical CommonJS file at `src/Toast.js` required because Node below 12.17 resolves the deep path by physical path; (b) the role of `main` as the resolution fallback for Node below 12.17; (c) the Node 12.x-era support matrix as a commitment — it remains **evidence**, not a promise. **Still in force:** the `./src/Toast.js` public subpath itself (VAL-003, DEC-019) — it is retained because the approved public API compatibility decision requires it, not because of old Node.js; the CommonJS consumer path (DEC-033) — the `require` condition and `main` stay CommonJS artifacts; the browser support floor (DEC-034); the ESM-primary decision; the historical `libs/js/` distributions, which remain byte-for-byte unchanged; and the single-shared-instance requirement (DEC-040). Supported consumers are routed through explicit `import` and `require` conditions once package integration is implemented. **`src/Toast.js` is the canonical runtime and the CommonJS entry, not a compatibility shim:** it is superseded only as a *fallback for obsolete Node.js resolution*, and it remains the single runtime implementation that the ESM entry imports (DEC-040). | Approved on 2026-11-13 |
| DEC-040 | One canonical runtime behind every entry point | The ESM and CommonJS entry points must not create independent instances of the exported API object, `Manager`, `Manager._queue`, or any module-level shared constant or state. There is **one canonical runtime implementation**; each entry point is a thin, format-specific wrapper over it. The ESM entry reaches the canonical runtime through the platform's own module system rather than through a second copy of the code, so a process that loads both entry points observes one instance. Equal values are never treated as shared identity — the packaging tests compare **reference identity**. | Approved on 2026-11-13 |
| DEC-041 | Public ESM entry export shape | The primary ESM entry `src/index.mjs` exposes the `Toast` constructor as its **default export**, the same constructor as a named `Toast` export, and the **61 public statics as named exports** bound to the runtime's own values. These named exports are part of the new public ESM entry API and **must be exposed by the final packaged ESM artifact**; T041 must emit this export shape and T044/T045 must verify it from the packed tarball. The change is **additive** and is **not required** in the legacy CommonJS/UMD formats, which keep their current shape. The named exports are initialized once when the entry module is evaluated — primitives are value snapshots, objects are references to the runtime's own objects — and no synchronization machinery is introduced, because no static is reassigned after initialization and every mutable static is exported as the object itself. | Approved by the owner 2026-11-13 |

## 6. Agreed workflow and authorization boundaries

1. Work through these artifacts in order:
   1. `SPECIFICATION.md` — product requirements and acceptance criteria.
   2. `ARCHITECTURE.md` — implementation structure and technical boundaries.
   3. `IMPLEMENTATION_PLAN.md` — phases, dependencies, risks, and verification.
   4. `TASKS.md` — independently actionable work items with acceptance criteria.
   5. Implementation and verification.
2. Review and approve each stage before treating the next stage as authorized.
3. Requirements must be traceable to architectural decisions, tasks, and tests.
4. Do not start implementation merely because the audit or specification exists.
5. Do not commit, push, publish, create a PR, merge, or modify the repository unless separately and explicitly authorized.
6. Recommendations are not decisions. Only an explicit user approval changes a decision to **Approved**.
7. Never ask again about an approved decision. If new evidence appears to conflict with one, explain the evidence and its consequences before proposing a narrowly scoped revision.

## 7. Deferred validation and design work — not questions for the user

These items remain work to perform with evidence. Their existence does not reopen the approved policies above.

| ID | Item | What must happen | Current status |
|---|---|---|---|
| VAL-001 | Rollup vs Vite | Build an isolated proof of concept. Compare native `.mjs` input, required ESM/browser outputs, CSS extraction and optional injection, source maps, minification, runtime dependencies, reproducibility, and package tests. Do not alter the project during the comparison unless separately authorized. | Deferred until specification/architecture approval |
| VAL-002 | Exact runtime support versions | Inspect actual runtime APIs and browser usage, then test the proposed minimum and current versions. Keep the development toolchain matrix separate. | Deferred validation |
| VAL-003 | Legacy package subpath | Investigate consumer use of the existing `./src/Toast.js` package export. Preserve it or migrate/deprecate deliberately; never remove it accidentally. | Resolved 2026-11-13 in `research.md` R-003 — **retain the path, migrate its target, no deprecation cycle**: no publicly discoverable external reference to the deep path or the package, and no package published under this name, so the subpath is repointed at the ESM entry with both `import` and `require` conditions, **and a physical CommonJS file must remain at `src/Toast.js`** because Node below 12.17 resolves the deep path by physical path only (R-003.4b). `main` must stay a CommonJS artifact for the same reason (R-003.4b), and the ESM and CommonJS entries must resolve to one shared instance — no duplicated `Manager`, queue, or module-level state (R-003.4e, verified by T044). **The physical-file requirement itself is superseded by DEC-039**: the `./src/Toast.js` subpath is retained because the approved public API compatibility decision requires it, and no supported Node.js release needs the physical path. |
| VAL-004 | Release version | Check npm Registry state, tags, current package metadata, published artifacts, and compatibility impact before selecting a version. Earlier assistant suggestions are not user approval. | Deferred release gate |
| VAL-005 | Exact internal class/module boundaries | Determine from real responsibilities, invariants, dependencies, and testability. Avoid inventing one class per concept where a focused function or composition is sufficient. | Architecture work |
| VAL-006 | Event system design | Choose the smallest design that supports the required public and internal lifecycle events without creating an unnecessary general-purpose event framework. | Architecture work |
| VAL-007 | CSS injection mechanism | Define the explicit opt-in API/entry point, duplicate prevention, lifecycle, and CSP handling in the architecture/PoC. The default remains explicit CSS import. | Architecture work within DEC-017/018 |
| VAL-008 | New public API shape | Specify the API for IDs, updates, actions, persistent notifications, and Promise/async states while preserving the current `main` API. Naming and signatures are not approved merely because the capabilities are approved. | Specification work |
| VAL-009 | Build toolchain production readiness | Before the toolchain is considered production-ready, all of: run `publint` and `@arethetypeswrong/core` against the **actual generated declarations**; pass ESM and UMD consumer smoke tests; verify the complete npm tarball contents; verify the CSS output and the optional injection entry; confirm deterministic builds and zero runtime dependencies. The proof-of-concept measurements do not satisfy this gate — they ran on a fixture, not on the shipped package. | Deferred until the production build integration (T041) exists |

## 8. Known audit baseline and limitations

The architecture audit records `main` at `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17). That audit was static. It did not run install/build/tests, real browsers, assistive technology, package-consumer fixtures, or npm Registry checks. The approved requirements in this register do not imply that those validations have already passed.

---

**End of decision register.**
