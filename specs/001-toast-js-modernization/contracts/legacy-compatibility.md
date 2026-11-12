# Legacy and Backward Compatibility Contract

## 1. Current `main` Compatibility

The current audited `main` baseline is the strict compatibility contract for the new implementation. If `main` changes before implementation, compare the new head with the recorded baseline and update the audit/spec only after reviewing the diff and user-visible impact.

## 2. Historical Distributions

The following paths are immutable compatibility artifacts:

- `libs/js/v1.0.0/Toast.js`
- `libs/js/v2.0.0/Toast.js`
- `libs/js/v2.1.0-beta/Toast.js`

Do not edit, regenerate, reformat, rename, or move these files as part of the modernization. Their URLs must remain valid.

## 3. Selective Historical Compatibility

Historical versions are not all separate mandatory contracts for the new implementation. Add a historical behavior to the new API only when:

- there is evidence of real downstream use, or
- an explicit product requirement calls for it.

Every accepted historical exception must be recorded and tested individually.

## 4. Shared Contract Tests

- One shared test suite is authoritative.
- Adapters may normalize how the legacy and new implementations are loaded; they must not weaken assertions.
- Do not modify legacy implementation files to make tests pass.
- Current-`main` compatibility is mandatory; historical exceptions are explicit additions.

## 5. Package Deep Import

The current package export `./src/Toast.js` must not be removed accidentally. Verify consumer use and choose a deliberate retention/wrapper/deprecation strategy before changing the export map.
