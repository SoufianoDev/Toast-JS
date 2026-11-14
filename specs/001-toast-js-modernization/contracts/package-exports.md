# Package and Distribution Contract

## 1. Primary Format

- ESM is the primary module and package format.
- Authoritative new source uses `.mjs` under `src/`.
- Every declared package export must exist in the packed tarball.
- Core import must not access DOM globals at module evaluation time.

## 2. Conditional Formats

- Browser standalone/UMD output is included only where the existing CDN/distribution contract requires it and the plan confirms the output path.
- CommonJS is not a baseline requirement, and the evidence has now been gathered: no `.cjs` output and no `.d.cts` declaration are added (DEC-033). The CommonJS consumer path stays the existing UMD-based one. Adding either would need new consumer evidence and owner approval.
- The build engine is Rolldown 1.3.2 used directly (DEC-032); it produces the ESM and browser UMD outputs and never bundles, extracts, or minifies CSS.
- Do not change package-wide `.js` interpretation without reviewing the existing `./src/Toast.js` deep export.

## 3. CSS and Types

- CSS is a separate asset; explicit import is default; injection is opt-in.
- JSDoc is the source of truth for declarations.
- The static-check configuration uses `checkJs` and `noEmit`.
- Declaration generation uses a separate verified configuration and must be tested through a TypeScript consumer fixture. It is produced by the TypeScript compiler from JSDoc, independently of the build tool (DEC-037); no bundler-integrated declaration plugin is used.

## 4. Packaging Gate

Validate the actual package created by `npm pack`, not just the source tree. Check `exports`, `types`, browser/CDN references, CSS assets, declaration files, and `files` allowlist. No published release is created during implementation without separate authorization.
