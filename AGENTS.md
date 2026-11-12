# Agent Instructions — Toast-JS

These instructions apply to every coding agent and automated contributor working in this repository.

## Read Before Making Changes

1. Read `DECISION_REGISTER.md` first. Its approved decisions are binding; do not ask the owner to choose them again.
2. Read `SPECIFICATION.md` and `ARCHITECTURE.md` for project requirements and the audited baseline.
3. For the modernization feature, read `specs/001-toast-js-modernization/spec.md`, `plan.md`, `tasks.md`, and the relevant contract before touching source files.
4. Check the actual checked-out branch and commit. The documents currently reference the audited `main` baseline `701371fd42423d034fc649aeac900f13b99b183d`; re-audit if the base has moved.

## Non-Negotiable Project Decisions

- New runtime source is JavaScript ES Modules using `.mjs`. TypeScript is not the source language.
- Use JSDoc for contracts and the TypeScript compiler with `checkJs` and `noEmit` for static checking. Declaration emission is a separate output configuration.
- Use Plain CSS for the runtime library. Explicit CSS import is the default; injection is opt-in and must be enabled explicitly.
- ESM is primary. Do not add CommonJS unless repository or consumer evidence demonstrates a real need.
- Preserve the audited current-`main` public API and observable behavior. Do not silently remove or rename exports, methods, constants, aliases, defaults, events, or package subpaths.
- Preserve every file and URL under `libs/js/` byte-for-byte. Never use those historical distributions as the new source of truth.
- Queue policy is per-position FIFO, default visible capacity is three per position, and each position can be configured independently. Do not add priority scheduling.
- Timer state is per notification. Pause reasons compose. An action pauses its timer and settlement resumes the remaining duration.
- Animation/transition completion events are primary; use a bounded fallback for cancelled or missing completion events.
- One DOM renderer owns DOM and renderer-related accessibility operations. It does not own queue or timer policy.
- Use Vitest, jsdom, selected Playwright browser tests, progressive coverage, and shared contract tests as specified.

## Scope and Repository Hygiene

- Never add `node_modules/` or nested dependency directories to Git. Use the lockfile and `npm ci` for local dependency installation.
- Do not remove `dist/`, large assets, documentation, demos, or historical files as part of unrelated changes. Scope such cleanup separately.
- Do not modify package exports or the existing deep import `./src/Toast.js` until the consumer-evidence task is complete and a migration/compatibility decision is recorded.
- Do not claim React Native support. Do not infer framework adapters from package keywords alone.
- Do not access `window`, `document`, or other browser globals at ESM module evaluation time; keep imports safe for the tested Node/SSR context.
- Do not add a class, abstraction, helper, interface, dependency, or module just to satisfy a checklist. Prefer clear responsibility boundaries and the simplest design that meets the contract.
- Keep useful comments that explain constraints, invariants, or non-obvious decisions. Remove comments that merely narrate obvious code.

## Planning and Execution

- Treat `specs/001-toast-js-modernization/tasks.md` as the canonical task list. Do not create a competing task list or mark tasks complete without evidence.
- Resolve technical unknowns through the research tasks and recorded proof-of-concepts; do not turn them into repeated preference questions.
- Keep implementation changes small, scoped, and reversible. Add regression tests with behavior changes.
- Distinguish static inspection, unit tests, browser tests, package tests, and real consumer validation. Never report a check that was not run.
- Use the review checklists as human-owned quality gates; do not self-mark them complete.

## AI-Assisted Engineering Skills

When available in the active agent environment, consult the installed skill instructions for:

- **Ponytail Ultra** — challenge unnecessary complexity, abstraction, and responsibility boundaries.
- **Hush** — remove redundant comments and noisy code while retaining meaningful rationale and invariants.
- **Deslop** — review changed code for generic AI-generated patterns and unnecessary scaffolding.

Use each skill only on the relevant scope and at the appropriate review stage. Do not copy their implementation into this repository, invent invocation syntax, install replacements, or claim they ran when unavailable. The repository-specific workflow is documented in `.agents/skills/toast-js-maintainer/SKILL.md`.

## Git and Release Safety

- Do not commit, push, open or update PRs, merge, tag, publish, or release unless the user explicitly authorizes that specific action.
- An explicit authorization for one branch or commit does not authorize a PR or changes to another branch.
- Never force-push or rewrite history without separate explicit approval.
- Do not change `main` as part of work performed on a feature/bootstrap branch.
