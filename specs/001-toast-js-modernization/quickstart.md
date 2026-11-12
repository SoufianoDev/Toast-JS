# Validation Quickstart — Toast-JS Modernization

This guide describes the intended verification workflow after the Setup tasks have established the corresponding scripts. It does not claim that every command works in the current repository baseline.

## 1. Preconditions

- Work from a reviewable feature branch based on the approved current `main` baseline.
- Confirm the branch still starts at the expected audited commit or record the new baseline and re-run the compatibility audit.
- Do not edit `libs/js/`.
- Ensure the test harness, build configuration, and type-check configurations have been added by the corresponding tasks.
- `package.json` carries `allowScripts` for `puppeteer` and `esbuild`, so their install scripts run and the needed binaries are downloaded during `npm ci`.
- Playwright's browser binary is fetched separately with `npx playwright install chromium`.

## 2. Expected Verification Commands

The Setup tasks (T002–T005) added these scripts. The status of each at Setup is recorded in section 3.

```bash
npm ci
npm test
npm run typecheck
npm run test:browser
npm run build
npm pack --dry-run
```

## 3. Expected Outcomes

| Command | Expected outcome | Status at Setup (2026-11-12) |
|---------|-----------------|-------------------------------|
| `npm ci` | Reproducible installation from the lockfile. | **Verified.** Exit 0 from the updated lockfile, with dependency postinstalls running. |
| `npm test` | Vitest unit, integration, and Shared Contract Tests pass. | **Harness verified.** `vitest run` collects `tests/**/*.test.mjs` and passes 3 tests across 2 files: the harness smoke test and the package-artifact test. The unit, integration, and contract suites arrive with T007–T009 and T028. |
| `npm run typecheck` | TypeScript compiler validates JavaScript/JSDoc with `checkJs` and `noEmit`. | **Verified.** `tsc -p tsconfig.check.json` exits 0 over `*.mjs`, `src/**/*.mjs`, and `tests/**/*.mjs`. |
| `npm run test:browser` | Selected Playwright tests pass in the declared browser matrix. | **Chromium verified.** `playwright test` passes the Setup smoke test. The browser matrix is still undeclared (VAL-002). |
| `npm run build` | Build produces the exact ESM/browser/CSS/type outputs selected in the plan. | **Partially met.** The build produces `dist/toast.umd.js`, `dist/toast.esm.js`, `dist/toast.umd.min.js`, and `dist/types/Toast.d.ts`, and every path `package.json` declares now exists in the tarball. It is still the copy/extract build, not the module-aware build — that is T041. |
| `npm pack --dry-run` | Every declared export and required asset is present in the package tarball; historical `libs/js/` files are not overwritten. | **Verified.** 12 files, 44.2 kB. `tests/package/artifacts.test.mjs` asserts every declared `main`/`module`/`browser`/`unpkg`/`jsdelivr`/`types`/`exports` path exists in the packed file list, so this gate now runs in `npm test`. Full artifact verification is still T045's scope. |

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
- The `exports` condition ordering defect recorded in `research.md` is resolved.
- No publish command is run without explicit user authorization.
