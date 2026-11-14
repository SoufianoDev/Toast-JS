# Toast-JS — Product and Technical Specification

> **Document status:** Draft for review  
> **Created:** 2026-11-12  
> **Project:** [SoufianoDev/Toast-JS](https://github.com/SoufianoDev/Toast-JS)  
> **Decision authority:** `DECISION_REGISTER.md`  
> **Implementation status:** Planning only. This specification does not authorize repository changes, releases, commits, pushes, or pull requests.

## 1. Purpose

This document defines what Toast-JS must provide, how it must behave from a consumer's perspective, the compatibility obligations it must satisfy, and the conditions required to consider the work complete.

It is the requirements-level source of truth. It does not prescribe every class, module, file, or internal algorithm. Those belong in `ARCHITECTURE.md` and must implement this specification without introducing unnecessary abstractions.

The stable decisions referenced here are recorded in `DECISION_REGISTER.md`. Approved decisions must not be reopened as questions during implementation planning.

## 2. Product vision

Toast-JS is one JavaScript notification library inspired by Android Toast behavior, extended with selected Snackbar-style capabilities. It should provide a coherent way to communicate short-lived feedback, persistent status, user actions, and asynchronous operation outcomes without forcing every type of interface feedback into a toast.

Toast-JS must remain easy to adopt in a browser application, independent of the consumer's backend technology and framework. The core must remain framework-agnostic.

### 2.1 Core notification modes

The library must support these behavioral modes:

1. **Transient:** a short-lived informational, progress-complete, or confirmation message that dismisses automatically according to its configured duration.
2. **Persistent:** remains visible until explicitly dismissed, resolved, or otherwise completed. It must not receive an automatic dismissal timer.
3. **Actionable:** offers one or more keyboard-accessible user actions, such as Undo, Retry, Restore, or View. The notification must remain stable while an action is executing.
4. **Asynchronous:** represents an operation whose state may change, including pending/loading, success, and failure. The same notification may be updated as the operation progresses.

The API must allow an existing notification to be identified and updated by a stable ID. The exact public method and option names are to be defined in the API design; this capability is required, but a proposed method name is not an approved API decision.

### 2.2 Appropriate use

Toast-JS documentation must make clear that a toast is not suitable for every message. The library must not encourage replacing:

- Inline validation or field-level errors with transient toasts.
- Complex, blocking, or decision-critical interactions with toasts instead of dialogs.
- Long-lived page status with a transient notification.
- Contextual content that belongs next to the affected control with a detached notification.

## 3. Scope

### 3.1 In scope

- Browser/DOM notification rendering.
- Transient, persistent, actionable, and asynchronous notifications.
- Queueing and independent display positions.
- IDs and updates to an existing notification.
- Duration management, pause/resume, and action-aware timing.
- Enter/exit animations with reliable completion handling.
- Built-in style presets, positions, icons, and customization supported by the current public API.
- Accessibility, keyboard operation, reduced motion, localization, and RTL behavior.
- Plain CSS distribution with explicit import by default and optional explicit injection.
- ESM-first package distribution, with CommonJS only if demonstrated necessary.
- JSDoc contracts, static type checking of JavaScript, and generated TypeScript declarations.
- Unit, integration, browser, accessibility, compatibility, and package verification.
- Documentation and developer experience for human developers and coding assistants.

### 3.2 Out of scope for the core

- A separate Snackbar product or package identity.
- A framework-specific core implementation.
- React Native support without a separate DOM-independent design and implementation.
- A public multi-renderer/headless abstraction without a demonstrated consumer requirement.
- A built-in priority scheduler in the initial queue policy.
- Automatic CommonJS output without evidence of demand.
- A runtime Tailwind dependency.
- Polyfills added only for hypothetical legacy environments.
- Rewriting or regenerating historical files under `libs/js/`.

Framework adapters (for example React, Vue, Svelte, or Angular) are optional extensions. Each adapter must be independently scoped, documented, and tested before support is claimed. Electron and Tauri may be evaluated as browser/WebView environments; they are not automatically guaranteed targets.

## 4. Supported environments and compatibility policy

### 4.1 Environment policy

The library is browser/DOM-oriented. The official support policy must:

- Separate browser/runtime requirements from Node.js development, build, and test requirements.
- Target modern browsers with meaningful use, not an unlimited range of historical engines.
- Derive the minimum runtime versions from the actual JavaScript and DOM APIs used.
- Derive the development/build Node.js minimum from the selected toolchain.
- Test both the declared minimum and a current supported environment.
- Avoid adding polyfills unless a required feature and real target environment justify them.
- Permit importing package modules in Node.js/SSR without touching unavailable browser globals during module evaluation. DOM work must occur only when a browser context is actually used.

Exact version numbers are a validation output, not an assumed value. The support matrix must be published before release.

### 4.2 Strict compatibility with current `main`

The public API and supported observable behavior of the audited `main` snapshot (`701371fd42423d034fc649aeac900f13b99b183d`) are the mandatory compatibility baseline for the new implementation. Before implementation, re-audit `main` if it has advanced beyond that snapshot and record any new public contract surface; do not silently replace the approved baseline.

The following must be inventoried and characterized before they are changed:

- `Toast.makeText(context, text, duration)`.
- `Toast.getWebAppContext()` and `Toast.getContextFor(container)`.
- Instance methods: `setDuration`, `setStyle`, `setPosition`, `setAnimation`, `setIcon`, `setIconShape`, `setDismissible`, `setTextOverflow`, `on`, `off`, `addCallback`, `show`, and `hide`.
- Public constants, including `LENGTH_SHORT`, `LENGTH_LONG`, position constants, icon constants, animation constants, and `TextOverflow`.
- The 21 predefined `STYLE_*` objects, their object shape, values, immutability, and accepted aliases.
- `Toast.Manager` and other public behavior discovered during the complete API inventory.
- Defaults, events, lifecycle behavior, return values, and accepted input forms observable by consumers.

The current implementation and its changelog contain at least one potential mismatch around `dismissible` and automatic dismissal. That ambiguity must be resolved through source/history characterization before behavior is changed. The new specification requires a distinct persistent-notification capability; it does not authorize silently redefining an existing option.

The package's existing `./src/Toast.js` export must not disappear accidentally. Its real consumer usage must be investigated, then it must either remain supported or be migrated/deprecated deliberately with a documented compatibility path.

### 4.3 Selective historical compatibility

The new implementation is not required to emulate every behavioral difference across all historical releases. The policy is:

1. Keep the existing historical distributions and URLs under `libs/js/` unchanged.
2. Treat current `main` as the mandatory compatibility baseline.
3. Add support for older-version behavior to the new implementation only when actual usage, a concrete migration requirement, or an explicit product requirement justifies it.
4. Document and test every historical exception that is carried forward.
5. Do not edit historical distribution files to make compatibility tests pass.

### 4.4 Versioning and release

The release number is not approved by this specification. Before release, verify the npm Registry, existing tags, current package metadata, published artifacts, and the compatibility impact of the changes. Do not treat previous assistant suggestions such as `2.0.1` as a user-approved release decision.

The historical `2.1.0-beta` distribution remains separate and must not be conflated with the new stable release decision.

## 5. Functional requirements

Requirements use stable IDs for traceability. `MUST` denotes a release requirement. `SHOULD` denotes a strong requirement that may be deferred only with a documented reason. `MAY` denotes optional capability.

### 5.1 Notification lifecycle

| ID | Requirement | Priority |
|---|---|---|
| FR-LIFE-001 | Consumers must be able to create and display a notification through the public Toast-JS API. | MUST |
| FR-LIFE-002 | Consumers must be able to dismiss a notification programmatically. | MUST |
| FR-LIFE-003 | Consumers must be able to identify a notification by a stable ID and update its content/state without creating an unrelated duplicate. | MUST |
| FR-LIFE-004 | The API must expose the notification's meaningful lifecycle outcomes to consumers through documented callbacks/events or an equivalent stable mechanism. | MUST |
| FR-LIFE-005 | Closing, replacing, or removing a notification must release associated timers, event listeners, animation waits, and renderer resources. | MUST |
| FR-LIFE-006 | Failed rendering or unavailable context must not leave an orphaned manager/queue entry. | MUST |
| FR-LIFE-007 | The API must distinguish user dismissal, programmatic dismissal, automatic timeout, and action-related completion where those outcomes are observable. | SHOULD |

### 5.2 Notification content and modes

| ID | Requirement | Priority |
|---|---|---|
| FR-MODE-001 | Transient notifications must support a configurable display duration and automatic dismissal. | MUST |
| FR-MODE-002 | Persistent notifications must remain until explicitly dismissed or resolved and must not have an automatic dismissal timer. | MUST |
| FR-MODE-003 | Actionable notifications must support one or more accessible actions with documented labels and execution behavior. | MUST |
| FR-MODE-004 | Async notifications must support representing pending/loading, success, and error/failure states. | MUST |
| FR-MODE-005 | An async operation must be able to update the existing notification rather than requiring a new notification for each state. | MUST |
| FR-MODE-006 | Promise/async integration must expose documented success and failure behavior and must not leave a notification stuck after settlement. | MUST |
| FR-MODE-007 | The API should allow the consumer to control whether an async notification is dismissed, retained, or updated after completion. | SHOULD |
| FR-MODE-008 | Notification content should support the text and customization forms already accepted by the current `main` API. | MUST |

The exact option names, method names, callback signatures, and return types for new APIs must be designed in the API specification/architecture stage. Requirements above define behavior, not unapproved signatures.

### 5.3 Queue and display positions

| ID | Requirement | Priority |
|---|---|---|
| FR-QUEUE-001 | Each display position must have an independent FIFO queue. | MUST |
| FR-QUEUE-002 | A notification waiting in one position must not consume the visible capacity of another position. | MUST |
| FR-QUEUE-003 | The default maximum number of simultaneously visible notifications is 3 per position. | MUST |
| FR-QUEUE-004 | Consumers must be able to configure a different visible maximum for each position. | MUST |
| FR-QUEUE-005 | When a visible notification leaves its position, the next queued item for that position may be displayed in FIFO order. | MUST |
| FR-QUEUE-006 | Queue wait time must be distinct from visible duration. A notification's auto-dismiss timer must not run while it is only waiting in the queue. | MUST |
| FR-QUEUE-007 | The initial queue policy must not include priority scheduling. | MUST |
| FR-QUEUE-008 | Queue cancellation/removal must not corrupt the order or retain stale entries. | MUST |

No global priority system is part of the initial release. Deduplication policy must not be invented unless a real product requirement is identified.

### 5.4 Timer lifecycle

| ID | Requirement | Priority |
|---|---|---|
| FR-TIMER-001 | Each notification must have an independently managed timer. | MUST |
| FR-TIMER-002 | The timer must begin when the notification becomes visible, not when it is enqueued. | MUST |
| FR-TIMER-003 | The timer controller must support pause/resume with multiple simultaneous pause reasons. | MUST |
| FR-TIMER-004 | Hovering the notification must pause its auto-dismiss timer. | MUST |
| FR-TIMER-005 | Keyboard focus within the notification must pause its auto-dismiss timer. | MUST |
| FR-TIMER-006 | Executing an actionable control must pause the notification's auto-dismiss timer. | MUST |
| FR-TIMER-007 | When an action completes, the timer must resume with the remaining duration, not restart with the full original duration. | MUST |
| FR-TIMER-008 | Persistent notifications must not start an automatic dismissal timer. | MUST |
| FR-TIMER-009 | Updating a notification's duration must have documented, deterministic timer behavior. | MUST |
| FR-TIMER-010 | Timer resources must be canceled and released when a notification is permanently removed. | MUST |
| FR-TIMER-011 | Multiple simultaneous pause reasons must be independently tracked so clearing one reason does not resume a timer while another pause reason remains active. | MUST |

The exact policy for explicit duration changes during an in-flight action must be specified in the API/architecture design and covered by tests. It is not a reason to reopen the approved action-completion rule.

### 5.5 Animation lifecycle

| ID | Requirement | Priority |
|---|---|---|
| FR-ANIM-001 | Animation/transition completion events must be the primary signal for the end of a CSS-driven animation. | MUST |
| FR-ANIM-002 | A bounded fallback must prevent lifecycle completion from hanging if the expected event does not arrive. | MUST |
| FR-ANIM-003 | Canceled animations and transitions must be handled without leaving the notification stuck. | MUST |
| FR-ANIM-004 | Reduced-motion preferences must be respected. | MUST |
| FR-ANIM-005 | A notification's DOM element must not be removed before its exit animation completes, except when the animation is canceled/reduced to no motion or the safety fallback expires. | MUST |
| FR-ANIM-006 | Queue capacity must be released at the correct lifecycle point so that exit animation and visible-slot accounting do not conflict. | MUST |

### 5.6 Rendering and positions

| ID | Requirement | Priority |
|---|---|---|
| FR-RENDER-001 | The initial official rendering implementation must target the browser DOM. | MUST |
| FR-RENDER-002 | A single DOM renderer must own DOM creation, update, attachment, removal, and rendering-related accessibility attributes. | MUST |
| FR-RENDER-003 | Queue and timer policy must remain outside the renderer. | MUST |
| FR-RENDER-004 | The renderer must not become the owner of global notification events or manager lifecycle. | MUST |
| FR-RENDER-005 | The renderer/manager boundary must be explicit and testable without introducing a public plugin renderer contract. | MUST |
| FR-RENDER-006 | Notifications in separate positions must stack and calculate offsets independently. | MUST |
| FR-RENDER-007 | Runtime-dependent layout values, including stack offsets, may be calculated in JavaScript. | MUST |

### 5.7 Style and customization

| ID | Requirement | Priority |
|---|---|---|
| FR-STYLE-001 | The current 21 public style preset objects must retain their compatible shape, values, and immutability. | MUST |
| FR-STYLE-002 | All style names and aliases accepted by the current `main` implementation must remain accepted. | MUST |
| FR-STYLE-003 | Existing style-setting methods and input forms must remain compatible with `main`. | MUST |
| FR-STYLE-004 | Static structure and layout must be provided through plain CSS assets. | MUST |
| FR-STYLE-005 | Runtime-dependent style values must remain controllable by the JavaScript runtime. | MUST |
| FR-STYLE-006 | Custom styles must not break cleanup or leak per-notification stylesheet rules. | MUST |
| FR-STYLE-007 | Tailwind must not be a runtime dependency of the core library. | MUST |

### 5.8 CSS loading and distribution

| ID | Requirement | Priority |
|---|---|---|
| FR-CSS-001 | Consumers must be able to import the published CSS explicitly. | MUST |
| FR-CSS-002 | Explicit CSS import is the default integration path. | MUST |
| FR-CSS-003 | Optional CSS injection must require an explicit consumer action/API/entry point. | MUST |
| FR-CSS-004 | Importing the core ESM entry must not implicitly inject CSS or require a CSS loader. | MUST |
| FR-CSS-005 | The library must prevent duplicate stylesheet application when the consumer combines supported loading paths. | MUST |
| FR-CSS-006 | CDN consumers must be able to load JavaScript and CSS as separate assets. | MUST |
| FR-CSS-007 | A standalone browser distribution may offer an explicitly selected embedded/injected-style path, provided it follows the opt-in contract and CSP constraints. | SHOULD |
| FR-CSS-008 | CSS loading behavior and CSP requirements must be documented. | MUST |

## 6. Public API compatibility requirements

### 6.1 Existing API surface

The following surface is the initial inventory from the static audit. The complete inventory must be verified against the actual source and package metadata before refactoring:

**Factory and context methods**

- `Toast.makeText(context, text, duration)`
- `Toast.getWebAppContext()`
- `Toast.getContextFor(container)`

**Instance methods**

- `setDuration()`
- `setStyle()`
- `setPosition()`
- `setAnimation()`
- `setIcon()`
- `setIconShape()`
- `setDismissible()`
- `setTextOverflow()`
- `on()` / `off()`
- `addCallback()`
- `show()` / `hide()`

**Static values and related API**

- `LENGTH_SHORT`, `LENGTH_LONG`
- Position constants
- Icon position, size, and shape constants
- Built-in animation constants
- `TextOverflow`
- 21 predefined `STYLE_*` objects
- `Toast.Manager`
- Every additional public property, method, alias, or behavior found by the complete API inventory

### 6.2 Compatibility evidence

Before altering public behavior, tests must capture:

- Export names and package subpaths.
- Function/method names and accepted argument forms.
- Defaults and constants.
- Style object shape, values, freezing, and aliases.
- Event names, callback order, and lifecycle timing.
- Observable queue/timer/rendering behavior relied on by the current contract.
- Return values, errors, and invalid-input behavior where they are part of the observable contract.

The implementation audit identified suspected defects and mismatches. A defect must not be silently promoted to a compatibility requirement merely because it exists in code; compare implementation, documentation, changelog, and observable usage, then classify it before changing it.

## 7. Accessibility and internationalization

Accessibility is a core requirement, not a later enhancement.

| ID | Requirement | Priority |
|---|---|---|
| FR-A11Y-001 | Choose `role="status"` / polite live announcements for routine non-urgent feedback by default. | MUST |
| FR-A11Y-002 | Use assertive alert semantics only for messages whose urgency justifies interrupting assistive-technology output. | MUST |
| FR-A11Y-003 | Live regions must be created/available at the appropriate time so updates are announced reliably. | MUST |
| FR-A11Y-004 | Do not move focus unexpectedly when a notification appears. | MUST |
| FR-A11Y-005 | All action and dismissal controls must be keyboard accessible and have accessible names. | MUST |
| FR-A11Y-006 | Closing an actionable notification must leave focus in a predictable, usable location. | MUST |
| FR-A11Y-007 | Respect `prefers-reduced-motion`. | MUST |
| FR-A11Y-008 | Provide appropriate labels for close/action controls and support localized content. | MUST |
| FR-A11Y-009 | Support RTL layout and text direction without breaking positions, icons, or action ordering. | MUST |
| FR-A11Y-010 | Notifications must remain usable at zoomed text sizes, narrow viewports, and responsive layouts. | MUST |
| FR-A11Y-011 | Avoid repeated or unnecessarily assertive announcements when a notification updates. | MUST |

The accessibility design must account for live-region semantics, action focus, dismissal, long content, RTL, zoom, and reduced motion. Automated checks are necessary but do not replace manual browser/assistive-technology evaluation for important flows.

## 8. Non-functional requirements

### 8.1 Maintainability

- The new source must have one authoritative implementation; do not keep parallel unused copies of core logic.
- Modules and classes must have meaningful responsibilities and clear dependency direction.
- Internal state must be encapsulated where it prevents invalid external mutation.
- Composition is preferred over artificial inheritance.
- Pure/stateless operations should remain focused functions.
- Avoid unnecessary runtime dependencies.
- Comments must explain non-obvious intent or constraints, not restate code.

### 8.2 Performance and resource management

- Multiple notifications must not create avoidable cross-position layout work.
- Timers, event listeners, animation waits, and custom style resources must be cleaned up deterministically.
- Queue operations must remain stable under simultaneous enqueue, dismiss, update, and action completion.
- CSS must not be applied more than once per supported loading path.
- The library must not perform DOM work during a Node.js/SSR module import.
- Performance changes must be measured against representative notification workloads rather than supported by vague claims.

### 8.3 Security and browser policy

- CSS injection must be opt-in and documented.
- Injection must not attempt to bypass Content Security Policy. Under restrictive CSP, consumers must have a documented explicit stylesheet path or supported nonce mechanism if one is provided.
- Treat consumer-provided HTML, URLs, icons, and style values as trust boundaries. Do not introduce unsafe HTML insertion without explicit sanitization/escaping rules.
- Do not add remote runtime dependencies or network calls to the core notification lifecycle.

### 8.4 Packaging and module formats

- ESM using `.mjs` is the primary source and distribution format.
- CommonJS output is conditional on demonstrated need; it is not a baseline deliverable.
- Browser UMD/standalone output may be retained or generated where required by the package's distribution strategy and CDN consumers.
- Package exports must point only to files that actually exist in the packed artifact.
- CSS exports and `sideEffects` metadata must be accurate.
- The package must be importable in an SSR/Node context without referencing `window`/`document` at module evaluation time.
- The historical `libs/js/` files and paths remain outside the new build's overwrite targets.

### 8.5 Type checking

- JavaScript source must contain JSDoc contracts for public and non-obvious internal interfaces.
- TypeScript compiler checking must use `checkJs` and `noEmit` for the static-check pass.
- Static checking must run in automated verification.
- Consumer declaration files must be generated from JSDoc and tested from a TypeScript consumer fixture.
- Type declarations must accurately match the package export conditions actually shipped.

## 9. Testing and verification requirements

### 9.1 Test strategy

- Add tests alongside the implementation/refactor of each unit or behavior.
- Use Vitest for unit and integration testing.
- Use jsdom for fast DOM tests.
- Use Playwright selectively for real-browser behavior, including actual CSS, animations, layout, and interaction.
- Use progressive, behavior-oriented coverage instead of an arbitrary initial global percentage.
- Use Shared Contract Tests against both the current legacy implementation and the new implementation.
- Do not change `libs/js/` files to support tests.

### 9.2 Required unit and integration coverage

At minimum, test:

- Existing public API names, defaults, constants, style presets, aliases, and supported inputs.
- Style preset immutability and object shape.
- Queue FIFO ordering independently for every position.
- Default visible limit of 3 and per-position custom limits.
- Queue cancellation and release of capacity after dismissal.
- Timer start only after display; pause/resume with multiple reasons; remaining-time restoration after actions; persistent behavior; duration updates; cleanup.
- Action execution success/failure and notification state consistency.
- Animation events, fallback, cancellation, reduced motion, and removal ordering.
- Renderer failure paths and manager/queue cleanup.
- Context resolution, event subscription, and listener cleanup.
- ID-based updates and asynchronous state changes.
- CSS import, opt-in injection, duplicate prevention, and CSP-relevant paths.
- URL/icon validation and URLs with query strings.

### 9.3 Required real-browser coverage

Use Playwright for selected cases that jsdom cannot prove reliably:

- Every supported position and independent position stacks.
- Actual entry/exit animations and animation interruption.
- Real computed styles and responsive behavior.
- Keyboard focus, pointer interaction, and action controls.
- CSS explicit-import and injection paths.
- RTL, zoom/responsive layout, and reduced-motion behavior.
- DOM readiness and delayed context/container resolution.

### 9.4 Accessibility verification

Combine automated checks with manual review of:

- Live-region announcement behavior and urgency.
- Keyboard-only operation.
- Focus stability and restoration after dismissal.
- Accessible names and action labels.
- Reduced-motion behavior.
- RTL and translated labels.

### 9.5 Package-consumer verification

Tests must cover the actual packed package, not only source imports:

- `npm pack --dry-run` and inspection of the resulting package contents.
- ESM import using the declared `.mjs` entry.
- CommonJS `require()` only if `.cjs` is shipped.
- Browser distribution/UMD path where retained.
- CSS explicit import and opt-in injection.
- TypeScript consumer fixture using generated declarations.
- Node.js/SSR import without browser globals at module evaluation.
- Consumer fixtures for supported bundler environments selected by the final build/package design.
- All package export-map paths must exist in the tarball.

### 9.6 Continuous integration

CI must run the build, unit/integration tests, type check, selected browser tests, compatibility suite, and package-consumer checks appropriate to each change. Documentation/Pages deployment must not be treated as a substitute for quality verification.

## 10. Developer experience, documentation, and AI discoverability

### 10.1 Developer documentation

The project must provide:

- A concise README with installation, first use, and key limitations.
- Accurate API reference generated/maintained from the public contract.
- Practical examples for transient, persistent, actionable, and async notifications.
- Examples of updating an existing notification by ID.
- Styling and CSS-loading instructions for explicit import and opt-in injection.
- Accessibility guidance and guidance on when not to use a toast.
- Migration documentation from the current API and historical distributions.
- Framework adapter examples only for adapters that are actually supported and tested.

### 10.2 AI coding-assistant discoverability

The library should be understandable and usable by coding assistants without encouraging inappropriate use. After the API stabilizes, evaluate:

- Clear machine-readable and human-readable API documentation.
- `AGENTS.md` guidance for contributors/agents in the repository.
- A focused Agent Skill with correct installation and usage patterns.
- Context7/library documentation availability when eligibility and source requirements are met.
- Examples that let agents distinguish appropriate toast use from inline errors, dialogs, and banners.
- Small, meaningful tests/examples that reveal the actual API instead of marketing claims.

AI tooling integration is a discoverability feature, not a reason to add runtime complexity or to recommend Toast-JS in irrelevant contexts.

### 10.3 SEO and public content

Documentation and discoverability should target real developer needs, such as JavaScript toast notifications, actionable notifications, Undo/Retry, accessible notifications, Promise-based notifications, and verified framework integrations. Do not create thin keyword-stuffed pages or claim that a particular AI-indexing file guarantees search ranking.

## 11. Acceptance criteria

The new implementation is not ready for release until all applicable criteria below pass.

### 11.1 Product and API

- [ ] The library retains the Toast-JS product identity and documented use boundaries.
- [ ] Every current `main` public API item is inventoried and covered by compatibility tests.
- [ ] The required transient, persistent, actionable, and async capabilities work through a documented API.
- [ ] Existing notifications can be updated by ID.
- [ ] The current 21 style presets and all supported aliases retain their required compatibility.
- [ ] No breaking behavior is introduced silently.

### 11.2 Queue, timer, and animation

- [ ] Each position has an independent FIFO queue.
- [ ] The default visible limit is 3 per position and limits can be configured per position.
- [ ] Queued time does not consume visible duration.
- [ ] Hover, focus, and action execution pause the timer independently.
- [ ] After action completion, the remaining duration resumes.
- [ ] Persistent notifications do not auto-dismiss.
- [ ] Animation completion uses browser events with a bounded fallback.
- [ ] Canceled/reduced-motion animations cannot leave notifications stuck.
- [ ] Cleanup is deterministic and no queue/timer/renderer resources leak.

### 11.3 CSS, accessibility, and environments

- [ ] Explicit stylesheet import is the default path.
- [ ] CSS injection requires explicit opt-in.
- [ ] Duplicate styling is prevented.
- [ ] Core ESM import does not force CSS loading or DOM access.
- [ ] Routine messages do not all use assertive alert semantics.
- [ ] Action controls are keyboard accessible and notifications respect reduced motion.
- [ ] RTL, responsive, zoom, and long-content cases are covered.
- [ ] The published support matrix is evidence-based and tested at its declared boundaries.

### 11.4 Build, types, and package

- [x] The build tool has been selected on measured evidence: Rolldown 1.3.2, used directly.
- [ ] ESM is the primary package format.
- [x] CommonJS need was demonstrated and documented: no `.cjs` output is added and the existing UMD-based consumer path is retained (DEC-033).
- [ ] JSDoc is the type-contract source of truth.
- [ ] `checkJs` and `noEmit` static checks pass.
- [ ] Generated declarations match actual exports and pass a TypeScript consumer fixture.
- [ ] The package tarball contains every file declared in `exports`, `types`, browser/CDN, and CSS metadata.
- [ ] Node/SSR import works without browser globals at module evaluation.
- [ ] The existing `./src/Toast.js` export has been deliberately preserved or migrated based on evidence.

### 11.5 Compatibility and release

- [ ] Shared Contract Tests pass against the legacy and new implementations for the required current contract.
- [ ] Historical exceptions are documented and individually tested.
- [ ] `libs/js/` historical files and paths remain unchanged.
- [ ] npm Registry, tags, package metadata, and release version have been verified before publishing.
- [ ] Release notes and migration guidance accurately describe the changes.

## 12. Deferred evidence and design outputs

The following are intentionally not selected by preference and must be resolved in later design/validation work. They do not require reopening approved decisions. Items 1, 2, 3 and 5 are now resolved; the rest are still open:

1. **Build tool:** **resolved** — Rolldown 1.3.2 used directly, selected on the measured proof of concept recorded in `research.md` R-001 (DEC-032). The production build and package integration remain to be implemented.
2. **Exact Node.js/browser minimums:** **resolved** — the support commitment is fixed by DEC-038: a consumer floor of Node.js 22.0.0 (the oldest currently supported LTS line) and a development/build floor of Node.js 22.22.2, the latter measured in `research.md` R-002.4. The measured *capability* of the corrected packaging is lower — Node 12.17+ for the ESM entry and 12.0.0+ for the UMD `require()` entry (R-002.5); the commitment is what the project promises, not the lowest version that happens to work.
3. **CommonJS:** **resolved** — no `.cjs` output is added; the existing UMD-based CommonJS consumer path is retained (DEC-033). The declaration pipeline stays separate from the bundler (DEC-037).
4. **Release number:** verify npm Registry and release history only after the final compatibility and artifact scope is known.
5. **Existing deep package export:** **resolved** — the `./src/Toast.js` subpath is retained and repointed at the ESM entry (VAL-003, `research.md` R-003).
6. **API signatures for new capabilities:** specify IDs, updates, actions, persistent options, and async integration while maintaining the required current API.
7. **Internal class/module boundaries:** derive them from real responsibilities and dependencies in `ARCHITECTURE.md`.
8. **CSS injection API details:** define the explicit opt-in path, duplicate prevention, cleanup, and CSP behavior without changing the approved default.

## 13. Traceability to approved decisions

| Specification area | Decision IDs |
|---|---|
| Product identity, modes, and usage boundaries | DEC-001–DEC-004 |
| JavaScript, `.mjs`, JSDoc, declarations, OOP | DEC-005–DEC-009, DEC-035 |
| Comments and AI-assisted quality workflow | DEC-010–DEC-011 |
| Legacy isolation and source location | DEC-012–DEC-013 |
| CSS technology, presets, and loading | DEC-014–DEC-018 |
| Compatibility and test strategy | DEC-019–DEC-025 |
| Queue, timers, animation, and renderer | DEC-026–DEC-031 |
| Build tool, CommonJS, and support matrix | DEC-032–DEC-034 |

## 14. Audit baseline and known limitations

The current architecture audit was based on the repository's `main` branch at `701371fd42423d034fc649aeac900f13b99b183d` (2026-09-17), as recorded in `ARCHITECTURE.md`. It was a static audit, not a completed execution/verification run.

No claim is made here that npm install, build, tests, browser behavior, assistive technology, package publishing, or npm Registry state has been revalidated. Those are explicit validation tasks.

---

**End of specification draft.** No repository files have been changed and no release, commit, push, or pull request has been created.
