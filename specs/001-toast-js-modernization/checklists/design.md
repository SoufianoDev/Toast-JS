# Design and Implementation Readiness Checklist

> Reviewer-owned quality gate. All items remain unchecked pending review. Do not mark items complete because an AI generated the corresponding document.

## Architecture

- [ ] Every runtime component has one clear owner and no circular lifecycle dependency.
- [ ] Classes/modules are justified by state ownership or independently testable behavior.
- [ ] The renderer does not own queue/timer policy.
- [ ] Timer pause reasons compose and action completion resumes remaining time.
- [ ] Queue capacity is released only after deterministic removal.
- [ ] Browser globals are not accessed at ESM module evaluation time.

## Research

- [ ] Rollup and Vite PoCs use identical inputs and acceptance criteria.
- [ ] Runtime/browser and development-tool Node support are evaluated independently.
- [ ] The `./src/Toast.js` export has consumer evidence and a documented migration decision.
- [ ] CommonJS is included only with evidence of demand.
- [ ] Declaration generation from JSDoc is proven with a TypeScript consumer fixture.
- [ ] CSS injection has explicit opt-in, deduplication, cleanup, and CSP behavior.

## Implementation Plan

- [ ] Every major plan phase has entry criteria, output artifacts, and exit criteria.
- [ ] Test tasks are included within the user-story phases they validate.
- [ ] Tasks use exact repository paths and respect the immutable legacy boundary.
- [ ] No task depends on a build/package decision that has not yet been researched.
- [ ] Risks and rollback/compatibility mitigations are clear.

## Release Readiness

- [ ] Shared Contract Tests pass against the agreed current-main baseline.
- [ ] Browser and accessibility verification pass.
- [ ] Package tarball and type declarations pass consumer fixtures.
- [ ] Runtime support matrix is documented from actual tests.
- [ ] Registry, tags, package metadata, and release number have been verified.
- [ ] Publishing remains gated by explicit user authorization.
