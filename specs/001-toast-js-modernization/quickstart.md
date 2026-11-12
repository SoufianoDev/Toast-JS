# Validation Quickstart — Toast-JS Modernization

This guide describes the intended verification workflow after the Setup tasks have established the corresponding scripts. It does not claim that every command works in the current repository baseline.

## 1. Preconditions

- Work from a reviewable feature branch based on the approved current `main` baseline.
- Confirm the branch still starts at the expected audited commit or record the new baseline and re-run the compatibility audit.
- Do not edit `libs/js/`.
- Ensure the test harness, build configuration, and type-check configurations have been added by the corresponding tasks.

## 2. Expected Verification Commands

The following command names are the planned developer interface. The exact scripts are added and verified in Setup tasks; they are not assumed to exist today.

```bash
npm ci
npm test
npm run typecheck
npm run test:browser
npm run build
npm pack --dry-run
```

## 3. Expected Outcomes

| Command | Expected outcome |
|---|---|
| `npm ci` | Reproducible installation from the lockfile. |
| `npm test` | Vitest unit, integration, and Shared Contract Tests pass. |
| `npm run typecheck` | TypeScript compiler validates JavaScript/JSDoc with `checkJs` and `noEmit`. |
| `npm run test:browser` | Selected Playwright tests pass in the declared browser matrix. |
| `npm run build` | Build produces the exact ESM/browser/CSS/type outputs selected in the plan. |
| `npm pack --dry-run` | Every declared export and required asset is present in the package tarball; historical `libs/js/` files are not overwritten. |

## 4. Package Consumer Scenarios

The final consumer fixture must verify:

1. ESM import from the package's primary `.mjs` entry.
2. Import under Node/SSR without `window` or `document` access during module evaluation.
3. Explicit CSS asset import.
4. Explicitly activated CSS injection, including duplicate prevention and documented CSP behavior.
5. TypeScript compilation against generated declarations.
6. CommonJS `require()` only if CommonJS is ultimately selected and shipped.
7. Existing `./src/Toast.js` deep export behavior according to the final compatibility decision.

## 5. Release Candidate Gate

Before a release candidate is proposed:

- All P1 user-story acceptance criteria pass.
- Shared Contract Tests pass against current `main` and the new implementation.
- Browser, accessibility, package-consumer, and type checks pass.
- npm registry state, Git tags, release history, README version references, and package metadata are reconciled.
- No publish command is run without explicit user authorization.
