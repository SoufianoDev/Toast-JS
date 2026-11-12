# Preliminary Bootstrap Branch

**Branch:** `chore/spec-kit-bootstrap`  
**Base:** `main` at `701371fd42423d034fc649aeac900f13b99b183d`  
**Purpose:** establish a clean working snapshot containing the Spec Kit planning artifacts and temporary AI-agent support needed for the modernization work.

This branch is intentionally broader than the eventual clean PR branch. It is a staging/workflow branch, not a branch to merge wholesale into `main`.

## Required Repository Hygiene

- The root `node_modules/` tree is removed from this branch's Git tree.
- `.gitignore` prevents root or nested `node_modules/` from being added again.
- `package-lock.json` is retained. Dependencies can be restored with `npm ci` when needed.
- This is a tree cleanup only. The parent commit remains in Git history, so this does not purge the old objects from repository history or reduce historical storage by itself.
- `main` is not modified. No history rewrite, PR, merge, release, or publish is part of this bootstrap.

## Branch Content Classification

### Intended to be reviewed for the eventual clean project branch

- `AGENTS.md` — repository-wide contributor/agent rules.
- `.gitignore` and `.specify/.gitignore` — repository and Spec Kit hygiene.
- `.specify/memory/constitution.md` — project principles, pending owner ratification.
- `ARCHITECTURE.md`, `DECISION_REGISTER.md`, `SPECIFICATION.md`.
- `specs/001-toast-js-modernization/` — the feature's Spec Kit artifacts.
- `skills/toast-js/SKILL.md` — provisional consumer-facing Agent Skill; promote only after its guidance has been checked against the final released API and package.

### Bootstrap-only support — exclude from the clean PR branch unless separately approved

- `.agents/skills/toast-js-maintainer/` — repository-specific maintainer workflow.
- `.agents/skills/spec-kit-workflow/` — agent workflow for operating the current feature artifacts.
- `ai-evals/toast-js-discoverability/` — exploratory AI discoverability evaluation guidance.
- `BOOTSTRAP_BRANCH.md` — explains this temporary branch and the later cleanup procedure.

The external skills Ponytail Ultra, Hush, and Deslop are not vendored. The maintainer skill only explains when an agent should consult those separately installed skills.

## Later Clean-Branch Procedure

When the work is ready for review:

1. Create a new clean branch from the intended target base, not by merging this bootstrap branch wholesale.
2. Copy or cherry-pick only the files classified for promotion above, after reviewing each one and removing any draft-only material that is not ready.
3. Exclude the bootstrap-only support paths listed above.
4. Verify the new branch has no `node_modules/`, generated local state, secrets, or unrelated artifacts.
5. Compare the clean branch independently against each intended target branch. Do not assume one PR can be retargeted safely without reviewing the differences.
6. Open PRs only after explicit authorization.

No file in this document authorizes a PR, merge, history rewrite, or change to `main`.
