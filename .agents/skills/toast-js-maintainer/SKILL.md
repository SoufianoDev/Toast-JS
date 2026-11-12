---
name: toast-js-maintainer
description: Use when planning, reviewing, testing, or changing the Toast-JS repository. Enforces its approved decisions, compatibility constraints, Spec Kit workflow, and mandatory AI-assisted engineering skills.
---

# Toast-JS Maintainer Skill

## Activation

Use this skill for repository maintenance, modernization, architecture, test, packaging, or documentation work. It is not a consumer usage guide.

## Required Context

Read these files before proposing or changing implementation:

1. `AGENTS.md`
2. `DECISION_REGISTER.md`
3. `SPECIFICATION.md`
4. `ARCHITECTURE.md`
5. `specs/001-toast-js-modernization/spec.md`
6. `specs/001-toast-js-modernization/plan.md`
7. The relevant task and contract under `specs/001-toast-js-modernization/`

Do not infer that a draft is ratified. Record the exact file/section that supports any architectural or product decision.

## Workflow

1. Inspect the actual Git branch, working tree, and current `main` head. The audit baseline is historical and must be revalidated if `main` has moved.
2. Identify the exact task ID and its acceptance criteria before editing.
3. Read the affected source and existing tests. Preserve behavior unless the task explicitly changes it and the specification permits it.
4. Activate Ponytail in Ultra mode before coding. Keep its smallest-complete-change and requirement-challenge rules active throughout the task.
5. Load the owner's Hush skill and apply it while writing every code change. Do not defer its no-noise comment rules until the final cleanup pass.
6. Make the smallest coherent change. New runtime source uses `.mjs`; new styles use Plain CSS.
7. Add or update tests at the appropriate level. Run only checks that are relevant and report exact commands and outcomes.
8. Run Deslop on the current task diff, then run Hush's scoped comment review/formatting and the relevant final checks.
9. Inspect the diff for scope creep, duplicate logic, unused abstractions, generated noise, accidental binary assets, and dependency directories.
10. Update the owning planning artifact only when evidence or an approved decision changes. Do not duplicate canonical plan/tasks elsewhere.

## Locked Constraints

- Current `main` public API is the strict compatibility baseline.
- `libs/js/` historical release files are immutable.
- ESM `.mjs`, JSDoc, `checkJs`, and `noEmit` are approved.
- Vitest + jsdom and selected Playwright tests are approved.
- Queue/timer/animation/renderer/CSS decisions are recorded in `DECISION_REGISTER.md` and must not be reopened without new evidence.
- No CommonJS unless consumer evidence supports it.
- No React Native support claims.
- Never commit `node_modules/`.

## AI-Assisted Engineering Skills

Follow the detailed mandatory rules in `AGENTS.md`:

- **Ponytail Ultra** is active before and throughout every coding task. It challenges unjustified scope and selects the smallest complete solution without cutting required correctness, safety, accessibility, compatibility, or tests.
- **Hush** is applied during each code write/edit/refactor/review, not only afterward. It prevents redundant comments while preserving useful rationale, invariants, JSDoc/type information, and tool directives. Its final cleanup is limited to comments in code changed during this task.
- **Deslop** performs the final behavior-preserving review of the current task diff for AI-generated boilerplate, unjustified defensive code, unsafe type escapes, nested logic, and style drift.

Use the installed skill instructions and the host's native invocation syntax. If a skill is unavailable, follow the relevant fallback rules in `AGENTS.md` and report that it could not be invoked; never claim it ran. Do not send skill ratings, telemetry, or external feedback without explicit owner authorization.

## Boundaries

- Do not rewrite `libs/js/` or rewrite Git history.
- Do not update `package.json` exports until the relevant consumer-evidence task is complete.
- Do not publish, tag, merge, or open PRs without explicit authorization.
- Do not mark tasks or reviewer checklists complete without recorded evidence.
