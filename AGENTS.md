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

## Required AI-Assisted Engineering Workflow

These skills have separate jobs. They are not interchangeable and must be applied at the stage described below. Do not treat them as optional decoration or invoke them only to claim compliance.

### 1. Ponytail — Ultra mode before and throughout coding

Ponytail must be active in **Ultra** mode for every coding task, including implementation, bug fixes, refactors, dependency choices, and code review.

- Activate it at the start of the task using the installed host's native invocation. Common forms are `/ponytail ultra` in OpenCode/Claude Code and the Ponytail skill with Ultra mode selected in Codex. Follow the installed integration's actual instructions; do not invent a command if the host differs.
- Keep Ultra active for the task/session. Do not silently fall back to Lite or Full. Only the user may change or stop the mode.
- Ultra means questioning requirements before building: push back on requested parts whose need is not justified, and identify the smallest complete solution before writing code.
- Read the affected code and trace the real flow first. Check callers, tests, fixtures, configuration, exports, and compatibility impact.
- Use the smallest-complete-change ladder: does this need to exist; is it already implemented here; can the standard library or platform do it; can an installed dependency do it; can a clear one-liner solve it; otherwise write the minimum code that fully works.
- Prefer reuse and deletion over new code. Do not add speculative abstractions, wrappers, generic frameworks, options, configuration, dependencies, boilerplate, or "for later" flexibility without evidence.
- Ultra is not code golf and is not permission to under-deliver. Never cut explicit user/specification requirements, trust-boundary validation, error handling that prevents data loss, security, accessibility, compatibility, or the tests needed to prove non-trivial logic.
- If a requested part appears unnecessary but is explicitly required by an approved specification or decision, preserve it. Explain any genuine contradiction with evidence instead of silently dropping the requirement.
- For substantial changes, use Ponytail's review skill when available to inspect correctness, safety, expected load, tests, performance, and unnecessary code. Do not report a review that was not actually run.

Canonical reference: [Ponytail](https://github.com/DietrichGebert/ponytail), [Ultra skill at v5.3.3](https://github.com/DietrichGebert/ponytail/blob/v5.3.3/skills/ponytail/SKILL.md).

### 2. Hush — mandatory while writing, not just after

Use the owner's Hush skill on **every code write, edit, refactor, and review**. Hush must shape code as it is being written; a cleanup pass at the end does not excuse generating comment noise in the first place.

- Load the installed Hush skill before editing. The canonical source is [SoufianoDev/hush](https://github.com/SoufianoDev/hush), specifically [skills/hush/SKILL.md](https://github.com/SoufianoDev/hush/blob/dev/skills/hush/SKILL.md). Use the user's installed copy when available; do not vendor or create a competing copy inside Toast-JS.
- Default to **no comment**. Add a comment only when the code cannot express the information: why an approach is necessary, a hidden constraint, workaround, unit, invariant, or surprising edge case. Keep it to one useful line.
- Never comment merely to narrate the next line, explain an obvious variable or assignment, repeat a function's signature, announce an edit, add a banner, preserve commented-out code, or guess at intent.
- Do not stack several comments above a short variable declaration or a tiny function. Do not add one comment per statement or turn a three-line function into a block of commentary. The example of five comments above a variable or seven comments inside a three-line function is exactly the noise this rule forbids; it is not a target count or a numeric quota.
- If a comment exists only because a local/private name is unclear, improve that name instead. Never rename a public API only to avoid writing a comment.
- Preserve comments that carry real information or are consumed by tools: JSDoc/type annotations, lint/type-check directives, formatter and coverage markers, shebangs, license headers, required documentation comments, and TODOs tied to an owner or issue. Preserve comments explaining why, constraints, workarounds, and invariants.
- At the end of every change, review only comments in code you added or changed during this task. Do not clean up pre-existing comments, generated/vendor/lock files, or unrelated files. A repository-wide cleanup requires a separately scoped request.
- After comment cleanup, format only touched files using the repository's configured formatter. Discover it from the project configuration/scripts; do not invent a formatter or run formatting twice when the host already formatted the files.
- If Hush is unavailable in the active agent, follow these rules directly, disclose that the skill itself could not be invoked, and do not claim it ran.

Hush's required end-of-change report is one line stating comments removed, meaningful comments kept and why, and which formatter ran (or that none was configured).

### 3. Deslop — required final pass on the task diff

Run the installed `deslop` skill after implementation to inspect the current task's changed diff for AI-generated noise. Deslop complements Hush; it does not replace Hush's live writing-time rules.

- Limit the review and edits to files/hunks introduced or changed by the current task. Never use a feature-level cleanup request as permission for a repository-wide rewrite.
- Look for unnecessary comments, defensive checks or `try/catch` blocks that are abnormal for trusted code paths, `any` casts used only to silence type errors, deeply nested logic that can be simplified safely, boilerplate, and style that conflicts with nearby code.
- Preserve behavior, public APIs, timing, error semantics, side effects, validation, security, accessibility, and useful abstractions. Do not label justified defensive code or required tests as slop.
- Prefer deletion or the smallest direct correction. Do not replace one form of AI noise with a new abstraction or broad refactor.
- If a proposed cleanup changes executable logic, types, control flow, validation, or error handling, run the narrowest relevant tests/type checks afterward. If behavior would change and the task does not authorize that change, leave it untouched and report it.
- If the skill is unavailable, disclose that it was not run; do not pretend that a manual glance was a Deslop run.
- Do not submit skill ratings, telemetry, or feedback to an external service unless the owner explicitly authorizes that network action.

Reference: [Deslop skill](https://agentskill.sh/cursor/deslop).

### Required order for a code task

1. Load the repository context and identify the task/scope.
2. Activate Ponytail Ultra.
3. Load Hush and apply its no-noise comment rules during every code edit.
4. Implement the smallest complete solution and add the required tests.
5. Run Deslop on this task's diff.
6. Re-run Hush's scoped comment review and format the touched files if needed.
7. Run relevant tests/type checks after the final edits and report exact commands/results, plus any skill that could not be loaded.

Do not claim any skill was used unless its instructions were actually loaded and followed.

## Planning and Execution

- Treat `specs/001-toast-js-modernization/tasks.md` as the canonical task list. Do not create a competing task list or mark tasks complete without evidence.
- Resolve technical unknowns through the research tasks and recorded proof-of-concepts; do not turn them into repeated preference questions.
- Keep implementation changes small, scoped, and reversible. Add regression tests with behavior changes.
- Distinguish static inspection, unit tests, browser tests, package tests, and real consumer validation. Never report a check that was not run.
- Use the review checklists as human-owned quality gates; do not self-mark them complete.

## Git and Release Safety

- Do not commit, push, open or update PRs, merge, tag, publish, or release unless the user explicitly authorizes that specific action.
- An explicit authorization for one branch or commit does not authorize a PR or changes to another branch.
- Never force-push or rewrite history without separate explicit approval.
- Do not change `main` as part of work performed on a feature/bootstrap branch.
