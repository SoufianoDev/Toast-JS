---
name: toast-js-spec-kit-workflow
description: Use when advancing the Toast-JS modernization through GitHub Spec Kit's Spec-Driven Development workflow. Prevents duplicated questions and keeps artifact ownership and quality gates clear.
---

# Toast-JS Spec Kit Workflow

## Canonical Feature

The active feature is `specs/001-toast-js-modernization/`. Canonical artifacts are:

- `spec.md` — what and why, user stories, requirements, success criteria.
- `plan.md` — technical approach, architecture and implementation phases.
- `research.md` — evidence and decisions for unresolved technical choices.
- `data-model.md`, `contracts/`, `quickstart.md` — design outputs.
- `checklists/` — reviewer-owned requirements/design quality gates.
- `tasks.md` — dependency-ordered actionable implementation tasks.
- `analysis-report.md` — a manual read-only consistency analysis until the official command is run.

Project-level source documents remain `DECISION_REGISTER.md`, `SPECIFICATION.md`, and `ARCHITECTURE.md`.

## Full Workflow

Follow the official full Spec Kit sequence, reviewing each output before proceeding:

1. Constitution (once per project; currently a draft pending owner ratification).
2. Specify.
3. Clarify.
4. Plan.
5. Checklist.
6. Tasks.
7. Analyze.
8. Implement.
9. Converge.

Use the installed agent integration's invocation syntax. Skills are run by the coding agent in chat; the `specify` CLI is for installation/project setup, not a substitute for invoking each skill.

## Guard Against Repeated Questions

Before asking the project owner anything:

1. Search `DECISION_REGISTER.md`.
2. Search `clarification-log.md` and `research.md`.
3. Determine whether the item is already approved, delegated to evidence-based research, or genuinely unresolved.
4. Never re-ask an approved item. Reopen it only when new repository or consumer evidence demonstrates a material contradiction; state the evidence and impact first.

The exact runtime version matrix, deep-import migration, CommonJS demand, CSS injection API shape, and declaration emission details are technical evidence tasks. They are not invitations to ask the owner to pick arbitrary values.

## Artifact Ownership

- Requirement ambiguity belongs in Specify/Clarify.
- Technical design decisions belong in Plan and `research.md`.
- Requirement/design quality belongs in Checklists; only the reviewer marks them complete.
- Work breakdown belongs only in canonical `tasks.md`.
- Analyze is read-only. Fix findings in the artifact that owns the issue, then run Analyze again.
- Implement follows task dependencies and acceptance criteria.
- Converge runs only after implementation and compares actual code with spec, plan, and tasks. Repeat implement/converge until complete.

Do not label a manual review as an official Spec Kit command result. Do not create duplicate root plans or task lists with independent content.
