# Toast-JS — Spec Kit Planning Bundle

This bundle extends the approved Toast-JS specification and architecture into a Spec Kit-aligned planning package for the `001-toast-js-modernization` feature.

## Canonical Documents

| Document | Role |
|---|---|
| `DECISION_REGISTER.md` | Authoritative approved decisions and deferred evidence work. |
| `SPECIFICATION.md` | Project-level product and technical requirements. |
| `ARCHITECTURE.md` | Existing implementation audit and target architecture. |
| `.specify/memory/constitution.md` | Project principles governing later plans and implementation. |
| `specs/001-toast-js-modernization/spec.md` | Feature specification with prioritized user stories and success criteria. |
| `specs/001-toast-js-modernization/clarification-log.md` | Records the Clarify gate: no blocking product questions remain; technical unknowns are assigned to research. |
| `specs/001-toast-js-modernization/plan.md` | Detailed technical plan, research gates, design outputs, and implementation strategy. |
| `specs/001-toast-js-modernization/research.md` | Repository facts and technical decisions requiring evidence. |
| `specs/001-toast-js-modernization/data-model.md` | In-memory runtime concepts and lifecycle invariants. |
| `specs/001-toast-js-modernization/contracts/` | Public API, compatibility, lifecycle, CSS, and packaging contracts. |
| `specs/001-toast-js-modernization/quickstart.md` | Target verification commands and expected outcomes. |
| `specs/001-toast-js-modernization/checklists/` | Reviewer-owned requirements and design quality gates. |
| `specs/001-toast-js-modernization/tasks.md` | Canonical actionable task list. |
| `specs/001-toast-js-modernization/analysis-report.md` | Manual, read-only pre-implementation consistency analysis. |

`IMPLEMENTATION_PLAN.md` and `TASKS.md` are root navigation files. The nested `plan.md` and `tasks.md` are the canonical Spec Kit feature artifacts; this avoids maintaining two conflicting copies.

## Workflow Applied

The current GitHub Spec Kit full SDD workflow is:

`Constitution -> Specify -> Clarify -> Plan -> Checklist -> Tasks -> Analyze -> Implement -> Converge`

- Constitution is a draft consolidated from approved decisions; formal ratification remains a project-owner review. Once ratified, it is maintained once per project.
- Specify creates a what/why feature spec with prioritized user stories.
- Clarify recorded that no blocking product decisions remain; unresolved technical matters are research tasks, not repeated questions.
- Plan creates research/design outputs (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`).
- Checklist is a reviewer-owned quality gate.
- Tasks creates dependency-ordered tasks grouped by user story.
- Analyze checks consistency across artifacts and is read-only.
- Implement executes tasks in dependency order.
- Converge checks the implementation against the artifacts and appends missing tasks until complete.

For Toast-JS, the Clarify gate found no new user product decisions that need to be asked. Open technical matters are evidence-driven research tasks, not questions to repeat to the user.

## Important Status Notes

- The planning artifacts were prepared by applying the current Spec Kit methodology and template structure. The official `specify-cli` has **not** been installed or run in the repository, and no `.specify/feature.json` or agent integration files have been initialized.
- This bundle is a reviewable artifact set, not a commit to the repository.
- The checklists are intentionally unchecked. A generated checklist is not self-approved.
- The analysis report is a manual read-only analysis modeled on `/speckit.analyze`; it is not falsely represented as output from the official command.
- The Rollup/Vite PoCs, runtime support matrix, package-consumer tests, and implementation tasks have not been executed.
- No GitHub files, branches, commits, pull requests, tags, releases, or npm packages were changed or created.
- No file under `libs/js/` may be modified by tasks in this feature.

## Official References

- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Specify CLI installation](https://github.github.io/spec-kit/installation.html)
- [Spec-Driven Development Quickstart](https://github.github.io/spec-kit/quickstart.html)
- [Agentic SDD command reference](https://github.github.io/spec-kit/reference/agentic-sdd.html)
- [Adopting Spec Kit in an existing project](https://github.github.io/spec-kit/how-to/existing-projects.html)
- [Plan template](https://github.com/github/spec-kit/blob/main/templates/plan-template.md)
- [Tasks command template](https://github.com/github/spec-kit/blob/main/templates/commands/tasks.md)


## Preliminary GitHub Branch

The first repository snapshot is intended for `chore/spec-kit-bootstrap`. It includes the planning package plus temporary maintainer/spec-workflow skills and an AI discoverability evaluation draft. It deliberately removes the tracked root `node_modules/` tree and adds `.gitignore`.

Read `BOOTSTRAP_BRANCH.md` before promoting files. The `.agents/skills/` and `ai-evals/` paths are bootstrap-only and must not be copied wholesale into the eventual clean PR branch. `skills/toast-js/SKILL.md` is a provisional consumer-facing candidate and must be validated against the actual modernized release before promotion. No PR is part of this bootstrap step.
