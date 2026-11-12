# Feature Specification: Toast-JS Runtime Modernization

**Feature:** `001-toast-js-modernization`  
**Status:** Draft for review  
**Source specification:** [`../../SPECIFICATION.md`](../../SPECIFICATION.md)  
**Architecture baseline:** [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md)  
**Decision authority:** [`../../DECISION_REGISTER.md`](../../DECISION_REGISTER.md)

## 1. Problem Statement

Toast-JS has an established public API and historical CDN distributions, but the audited current implementation is still centered on a UMD-style source file and a build script that derives ESM output through source-text extraction. Related core helpers exist as disconnected files, the current test directories are effectively empty, and the package test script points to a missing regression file.

The project needs a maintainable modernization that delivers predictable notification behavior and a reliable consumer experience, while preserving the public contract of the audited `main` baseline and immutable historical distributions.

This feature describes the modernization and required product capabilities. It does not authorize implementation or publication.

## 2. Goals

- Deliver a maintainable implementation and distribution that can be consumed consistently across the supported browser and tooling environments.
- Preserve the audited `main` public API and supported observable behavior.
- Keep historical `libs/js/` files and CDN paths unchanged.
- Provide transient, persistent, actionable, and asynchronous notification behavior.
- Make queue, timer, animation, rendering, accessibility, and cleanup behavior deterministic.
- Provide explicit CSS import by default and separately opt-in CSS injection.
- Establish automated verification, accurate consumer-facing type information, package-consumer verification, and accurate documentation.

## 3. Non-Goals

- Rewriting the contents of historical `libs/js/` files.
- Adding a priority scheduler to the initial queue model.
- Adding a mandatory framework runtime or framework-specific core implementation.
- Claiming React Native support.
- Selecting a library package version before package and registry verification.
- Performing unrelated repository cleanup or publishing as part of this feature.

## 4. User Stories and Priorities

### US1 — Preserve the Existing Consumer Contract (P1)

As an existing Toast-JS consumer, I want the public API and supported behavior from the current `main` baseline to continue working, so that the modernization does not break existing applications.

**Independent acceptance:** The complete API inventory is captured; Shared Contract Tests run against the current implementation and the new implementation; the supported methods, constants, defaults, aliases, styles, events, and observable lifecycle behavior match the baseline; historical `libs/js/` files remain byte-for-byte unchanged.

**Requirement traceability:** Current API compatibility, FR-LIFE-001–007, FR-STYLE-001–003, Specification §6, DEC-019–DEC-025.

### US2 — Display and Manage Notifications Reliably (P1)

As an application developer, I want notifications to display, queue, animate, pause, resume, and dismiss predictably, so that multiple notifications do not overlap or become stuck.

**Independent acceptance:** Each display position has an independent FIFO queue; the default visible limit is three per position and can be configured per position; queue wait does not consume visible duration; timers support multiple pause reasons; removal waits for animation completion or a bounded fallback; all resources are cleaned up.

**Requirement traceability:** FR-QUEUE-001–008, FR-TIMER-001–011, FR-ANIM-001–006, FR-RENDER-001–007, DEC-026–DEC-031.

### US3 — Support Persistent, Actionable, and Async Notifications (P1)

As an application developer, I want to keep important notifications visible, attach actions, and reflect asynchronous operation states in the same notification, so that feedback remains connected to the operation it describes.

**Independent acceptance:** Persistent notifications do not auto-dismiss; actions are keyboard-accessible and execute through a documented contract; action execution pauses the timer and completion resumes the remaining duration; an existing notification can be updated by ID; Promise/async settlement produces documented pending, success, and failure behavior without leaving stale notifications.

**Requirement traceability:** FR-MODE-001–008, FR-LIFE-003–007, FR-TIMER-006–007, Specification §5.2 and §6.

### US4 — Provide Accessible and Customizable Presentation (P1)

As an end user, including a keyboard or assistive-technology user, I want notifications to be announced appropriately, remain operable, and respect layout and motion preferences, so that feedback is usable without disrupting my current task.

**Independent acceptance:** Routine messages use polite status semantics by default; assertive alerts are reserved for urgent cases; appearance does not steal focus; action and dismissal controls have accessible names; reduced motion, RTL, responsive layout, zoom, long content, and focus behavior are tested; the existing style presets and aliases remain compatible.

**Requirement traceability:** FR-A11Y-001–011, FR-STYLE-001–007, Specification §7.

### US5 — Consume and Package the Library Predictably (P1)

As a library consumer, I want stable ESM entry points, reliable CSS loading, accurate type declarations, and verifiable package contents, so that Toast-JS integrates cleanly into supported browser, bundler, and SSR workflows.

**Independent acceptance:** ESM is the primary format; core import is safe without browser globals at module evaluation; explicit CSS import is the default; CSS injection requires explicit opt-in and does not duplicate styles; generated declarations describe actual exports; every package export exists in the packed artifact; the tested runtime matrix is documented.

**Requirement traceability:** FR-CSS-001–008, Specification §8.4–8.5, §9.5, DEC-005–DEC-008, DEC-017–DEC-018, DEC-032–DEC-035.

## 5. Cross-Cutting Success Criteria

- **SC-001 — Compatibility:** Every public API item discovered in the complete `main` inventory has a corresponding contract test. The shared contract suite passes for both implementations on the agreed current-main contract.
- **SC-002 — Historical isolation:** No file under `libs/js/` changes during implementation; historical URLs remain available.
- **SC-003 — Queue correctness:** FIFO ordering and independent per-position limits are deterministic under enqueue, dismissal, cancellation, and update sequences.
- **SC-004 — Timer correctness:** Queued time does not decrement the visible duration; hover, focus, and action pause reasons compose; action completion resumes remaining time.
- **SC-005 — Lifecycle cleanup:** Tests detect no retained timer, listener, animation wait, DOM node, or injected stylesheet after permanent removal.
- **SC-006 — Module safety:** Importing the core ESM entry in the supported Node/SSR test environment does not require or access browser globals during module evaluation.
- **SC-007 — Accessibility:** Automated checks and documented manual checks cover semantics, keyboard operation, focus, reduced motion, RTL, zoom, and responsive behavior.
- **SC-008 — Packaging:** `npm pack` contains all files declared by the final export map and consumer fixtures can import the packed package.
- **SC-009 — Types:** Type checking succeeds using `checkJs`/JSDoc/`noEmit`; generated declaration artifacts compile in a TypeScript consumer fixture.
- **SC-010 — Evidence:** Runtime support limits, bundler selection, CommonJS decision, performance thresholds, and release version are backed by recorded evidence rather than assumption.

No arbitrary numeric performance threshold is introduced before a representative baseline is measured.

## 6. Constraints and References

- The audited `main` baseline is `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17). Re-audit before implementation if `main` has advanced.
- The public package subpath `./src/Toast.js` is part of the compatibility surface and must be handled deliberately.
- `libs/js/v1.0.0`, `libs/js/v2.0.0`, and `libs/js/v2.1.0-beta` are historical artifacts whose contents and URLs must remain unchanged.
- Existing product and architecture decisions in `DECISION_REGISTER.md` are authoritative and must not be re-opened merely because the workflow has moved to another phase.
- Technical implementation choices are specified in `plan.md`; unresolved evidence questions are listed in `research.md` and assigned to Plan/Foundational tasks. They are not requests for user product decisions.

## 7. Out-of-Scope Follow-Up

Repository hygiene work (including the tracked `node_modules/` tree and large assets) is recorded in the architecture audit but is kept separate from the runtime modernization tasks. It requires its own scoped review so it cannot expand this feature silently.
