# Toast-JS Constitution (Draft)

**Version:** 0.1.0  
**Status:** Draft for owner review; not formally ratified  
**Prepared:** 2026-11-12  
**Authority:** `DECISION_REGISTER.md`, `SPECIFICATION.md`, and the approved target architecture in `ARCHITECTURE.md`.

This draft consolidates principles already established through explicit project decisions. It is prepared as the Spec Kit governance artifact, but remains a draft until the project owner explicitly ratifies it. It is not permission to change the repository, publish releases, or reopen an approved decision.

## Principle I — Public Contract and Compatibility

- The public API and supported observable behavior of the audited `main` baseline are the mandatory compatibility contract.
- The current audited baseline is commit `701371fd42423d034fc649aeac900f13b99b183d`; re-audit `main` before implementation if it has moved.
- Preserve historical `libs/js/` distributions and their CDN paths without editing their contents.
- Compatibility with version-specific historical behavior beyond the current `main` contract is selective and evidence-based.
- Never silently remove or alter a public export, alias, default, event, or observable lifecycle behavior.

**Rationale:** Toast-JS already has consumers and published historical paths. A modernization must not become an accidental breaking release.

## Principle II — JavaScript-First ESM Source

- The authoritative new source is JavaScript ES Modules using `.mjs`.
- TypeScript is not the implementation source language.
- JSDoc is the source of truth for type contracts and public API documentation.
- Use TypeScript tooling for JavaScript static checking with `checkJs` and `noEmit`.
- Generate consumer declarations from JSDoc for formats actually shipped; `.d.cts` is conditional on CommonJS distribution.

**Rationale:** Keep the implementation native to JavaScript while giving consumers reliable editor and type information.

## Principle III — Responsibility-Driven Design

- Stateful responsibilities may use native classes and private fields where encapsulation provides a real benefit.
- Prefer composition over artificial inheritance.
- Keep pure/stateless operations as focused functions.
- Create a class, module, abstraction, strategy, or dependency only when it owns a meaningful responsibility and can be tested at a useful boundary.
- Do not add architecture merely to satisfy a checklist or imitate a framework.

**Rationale:** The architecture must remain understandable and proportional to the actual lifecycle and rendering problems.

## Principle IV — Browser Runtime with Safe Module Evaluation

- The core runtime is browser/DOM-oriented and framework-agnostic.
- Importing the ESM package in Node.js/SSR must not access `window` or `document` at module evaluation time.
- Framework adapters are optional additions and must be justified by actual consumer value and tested independently.
- Do not claim React Native support without a separate platform design.
- Runtime support and development/build-tool support are separate compatibility questions.

**Rationale:** Consumers should be able to load the package in tooling and SSR contexts without accidentally running browser-only behavior.

## Principle V — Deterministic Lifecycle and Resource Ownership

- Queue, timer, animation, renderer, and manager responsibilities must have explicit ownership and testable boundaries.
- Every timer, event listener, animation wait, DOM node, and runtime stylesheet resource must have deterministic cleanup.
- Per-position queues are FIFO, default to three visible notifications per position, allow per-position limits, and do not introduce priority scheduling in the initial scope.
- Action execution pauses the timer; after the action settles, the remaining duration resumes.
- Persistent notifications do not auto-dismiss.

**Rationale:** Lifecycle races and resource leaks undermine reliability more than adding new visual features improves it.

## Principle VI — Accessibility Is Part of the Contract

- Routine feedback uses non-interruptive status semantics by default.
- Assertive alert semantics are reserved for genuinely urgent messages.
- Do not move focus unexpectedly when notifications appear.
- Interactive actions and dismissal controls must be keyboard accessible and have accessible names.
- Respect reduced-motion preferences, RTL, zoom, responsive layouts, and predictable focus behavior.

**Rationale:** A notification is part of the user interface contract, including for keyboard and assistive-technology users.

## Principle VII — Plain CSS and Explicit Styling Behavior

- The runtime library uses plain CSS; Tailwind is not a runtime dependency.
- Preserve the current public style preset objects, values, shape, and accepted aliases.
- Static layout and animation rules belong in CSS assets; runtime-dependent values remain under JavaScript control.
- Explicit stylesheet import is the default.
- CSS injection is supported only through an explicit opt-in path. Core ESM import must not inject CSS implicitly.

**Rationale:** Styling must be predictable for bundlers, CDN consumers, SSR, and restrictive Content Security Policies.

## Principle VIII — Evidence-Based Engineering Quality

- Add tests alongside refactoring; do not defer all tests until the end.
- Use Vitest, jsdom, selected Playwright real-browser tests, progressive behavior-oriented coverage, and Shared Contract Tests.
- Test the packed package and declared exports, not only source imports.
- Compare Rollup and Vite Library Mode through the approved proof of concept; Vitest does not imply Vite as the bundler.
- Do not invent support versions, performance thresholds, or release numbers without evidence.

**Rationale:** Claims about compatibility and correctness must be backed by repeatable checks.

## Principle IX — Controlled Changes and Review

- Keep decisions, specifications, architecture, plans, tasks, and implementation traceable to one another.
- An approved decision is not reopened merely because an agent starts a new context or renumbers a question.
- A genuine conflict must cite the affected decision, evidence, and impact before proposing a change.
- Do not commit, push, create a pull request, merge, or publish without explicit user authorization.
- Planning artifacts do not themselves authorize source-code changes.

**Rationale:** The process must prevent context drift, duplicate questions, and unintended repository operations.

## Governance

1. This constitution is versioned independently from the library package.
2. Clarifications that do not change a principle are PATCH-level amendments; new principles or materially expanded obligations are MINOR; removal or redefinition of a principle is MAJOR.
3. Amendments require an explicit decision and must update the decision register and affected planning artifacts.
4. Every plan and analysis must check compliance with all MUST-level principles.
5. If a principle conflicts with a proposed change, adjust the proposal or seek an explicit constitution amendment; do not silently waive the principle.
