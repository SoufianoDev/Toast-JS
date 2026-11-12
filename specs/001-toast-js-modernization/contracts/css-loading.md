# CSS Loading Contract

## 1. Default Path

Explicit stylesheet import is the default for bundler/npm consumers. CDN consumers may load JavaScript and CSS as separate assets. The core ESM entry must not import CSS in a way that breaks direct Node/SSR module loading.

## 2. Optional Injection

CSS injection is supported only through an explicit consumer action/API or explicitly selected entry point. Importing the core ESM module alone must not inject styles.

The implementation must define:

- the exact opt-in API/entry point;
- how the injected style resource is identified and deduplicated;
- who owns and cleans up the injected resource;
- what happens when multiple Toast-JS managers use the same document;
- CSP behavior and the explicit external stylesheet fallback;
- how consumers avoid applying both explicit import and injected styles twice.

## 3. CSS Ownership

- Static structure/layout and built-in keyframes live in `.css` assets.
- Public style preset objects and aliases remain JavaScript data.
- Runtime-dependent position/stack offsets and consumer-provided inline values remain runtime-controlled.
- Tailwind is not a runtime dependency.

## 4. Verification

Playwright tests must cover explicit import, injection opt-in, duplicate prevention, manager teardown/cleanup, and the documented CSP-safe path.
