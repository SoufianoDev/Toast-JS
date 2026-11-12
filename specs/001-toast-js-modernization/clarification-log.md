# Clarification Log — Toast-JS Runtime Modernization

**Gate:** Spec Kit `clarify` (pre-plan ambiguity review)  
**Date:** 2026-11-12  
**Result:** No blocking product-level clarification questions remain.

## Confirmed inputs carried forward

The following are approved decisions and must not be re-asked during planning or implementation:

- JavaScript ES modules (`.mjs`) are the new source format; TypeScript is not the source language.
- The audited current `main` API and observable behavior are the strict compatibility baseline.
- Historical `libs/js/` distributions remain untouched; additional historical behavior is supported selectively when evidence justifies it.
- Queue behavior is per-position FIFO, with a default visible limit of three and independent per-position customization; no priority scheduler is included.
- Each notification owns independent timer state; multiple pause reasons compose; action execution pauses the timer and settlement resumes the remaining duration.
- Animation/transition completion events are primary, with a bounded fallback for cancellation or missing completion events.
- One DOM renderer owns DOM and accessibility operations; queue/timer policy remains outside the renderer.
- Plain CSS is used. Explicit stylesheet import is the default; CSS injection is opt-in and explicit.
- Vitest, jsdom, selected Playwright browser tests, progressive coverage, and Shared Contract Tests are approved.
- Type checking uses the TypeScript compiler with JSDoc, `checkJs`, and `noEmit`; declaration generation is a separate output concern.
- Rollup vs Vite is decided by an isolated proof of concept. CommonJS is included only if evidence demonstrates consumer need.
- At the time this planning package was first prepared, no repository write was authorized. A later explicit request authorizes only creation of the preliminary bootstrap branch and its initial commit. It does not authorize a PR, merge, tag, release, publish, or changes to `main`.

## Clarification outcome

No additional user-facing question is needed before Plan. The remaining unknowns are implementation evidence questions, not missing product intent. They are recorded in `research.md` and assigned to foundational tasks:

| Research item | Why it is not a user clarification | Planned resolution |
|---|---|---|
| Rollup vs Vite | Tool choice requires an equivalent build experiment. | R-001; T010–T012 |
| Exact Node/browser support versions | Must be measured against actual runtime and toolchain requirements. | R-002; T013 |
| Existing `./src/Toast.js` deep export | Requires consumer-use evidence before migration. | R-003; T014 |
| CommonJS demand | Should not be assumed from a legacy package format. | R-004; T014 |
| CSS injection API details | Constrained by the approved opt-in decision; API shape belongs in design. | R-005; design contract / T039 |
| JSDoc declaration emission | Requires a technical proof separate from `noEmit` checking. | R-006; T005 and T043 |
| Exact current-main API surface | Requires source characterization, not a preference question. | R-007; T006–T009 |

## Guard against repeated questions

An agent must consult `DECISION_REGISTER.md` before asking about any item above. A question may be reopened only when new repository evidence reveals a concrete contradiction or a material consumer requirement; the agent must identify that evidence and explain its effect before proposing a decision change.
