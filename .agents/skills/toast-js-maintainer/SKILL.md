---
name: toast-js-maintainer
description: Use when planning, reviewing, testing, or changing the Toast-JS repository. Enforces its approved decisions, compatibility constraints, Spec Kit workflow, and scoped AI-assisted code review.
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
4. Make the smallest coherent change. New runtime source uses `.mjs`; new styles use Plain CSS.
5. Add or update tests at the appropriate level. Run only checks that are relevant and report exact commands and outcomes.
6. Inspect the diff for scope creep, duplicate logic, unused abstractions, generated noise, accidental binary assets, and dependency directories.
7. Update the owning planning artifact only when evidence or an approved decision changes. Do not duplicate canonical plan/tasks elsewhere.

## Locked Constraints

- Current `main` public API is the strict compatibility baseline.
- `libs/js/` historical release files are immutable.
- ESM `.mjs`, JSDoc, `checkJs`, and `noEmit` are approved.
- Vitest + jsdom and selected Playwright tests are approved.
- Queue/timer/animation/renderer/CSS decisions are recorded in `DECISION_REGISTER.md` and must not be reopened without new evidence.
- No CommonJS unless consumer evidence supports it.
- No React Native support claims.
- Never commit `node_modules/`.

## Use of External Review Skills

When the corresponding skills are installed and available, use their own instructions rather than recreating them:

- **Ponytail Ultra:** architecture and complexity review after a meaningful design or structural change.
- **Hush:** remove redundant commentary and noisy code after implementation, preserving comments that explain why, constraints, or invariants.
- **Deslop:** inspect changed code for unnecessary AI-generated scaffolding, generic wrappers, redundant validation, over-commenting, and needless dependencies.

Do not run all three mechanically on every tiny edit. Restrict them to changed files and the review question they are meant to answer. If a skill is absent, state that it was not run; do not invent commands or substitute another tool silently.

## Boundaries

- Do not rewrite `libs/js/` or rewrite Git history.
- Do not update `package.json` exports until the relevant consumer-evidence task is complete.
- Do not publish, tag, merge, or open PRs without explicit authorization.
- Do not mark tasks or reviewer checklists complete without recorded evidence.
