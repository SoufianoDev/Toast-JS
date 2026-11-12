# Package and Distribution Contract

## 1. Primary Format

- ESM is the primary module and package format.
- Authoritative new source uses `.mjs` under `src/`.
- Every declared package export must exist in the packed tarball.
- Core import must not access DOM globals at module evaluation time.

## 2. Conditional Formats

- Browser standalone/UMD output is included only where the existing CDN/distribution contract requires it and the plan confirms the output path.
- CommonJS is not a baseline requirement. Add `.cjs` and `.d.cts` only if consumer evidence justifies them.
- Do not change package-wide `.js` interpretation without reviewing the existing `./src/Toast.js` deep export.

## 3. CSS and Types

- CSS is a separate asset; explicit import is default; injection is opt-in.
- JSDoc is the source of truth for declarations.
- The static-check configuration uses `checkJs` and `noEmit`.
- Declaration generation uses a separate verified configuration and must be tested through a TypeScript consumer fixture.

## 4. Packaging Gate

Validate the actual package created by `npm pack`, not just the source tree. Check `exports`, `types`, browser/CDN references, CSS assets, declaration files, and `files` allowlist. No published release is created during implementation without separate authorization.
