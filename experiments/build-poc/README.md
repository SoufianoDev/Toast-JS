# Build Proof of Concepts — Reproducible Evidence

This directory holds the isolated proof-of-concepts that decided the build
tool (DEC-032). The comparison itself is recorded in
[`research.md`](../../specs/001-toast-js-modernization/research.md) §R-001; this
directory holds the inputs, the harnesses and the measured results behind it.

Nothing here is production code. No proof-of-concept touches `src/`, `libs/js/`,
the project's `package.json`, or any shipped artifact.

## Which task owns which directory

| Directory | Task | Tool |
|---|---|---|
| `rollup/` | **T010** | Rollup 4.68.2 — the JavaScript bundler, the incumbent |
| `vite/` | **T011** | Vite 8.3.8 in library mode — bundler Rolldown 1.2.19, minifier `oxc` |
| `rolldown/` | T012 | Rolldown 1.3.2 used directly — the baseline that explains the other two |
| `tsdown/` | T012 | tsdown 0.23.7 — the Rolldown-powered library bundler |

T010 and T011 are the two required experiments; T012 extended the comparison to
Rolldown and tsdown and selected the tool.

## Layout

```
experiments/build-poc/
  ACCEPTANCE.md     the 12 acceptance criteria every candidate must meet
  fixture/          the shared input — one fixture, all candidates
  measure.mjs       the shared measurement script; writes measurements.json
  benchmark.mjs     repeated build timing, used for the median build times
  <tool>/           one directory per candidate: config, lockfile, outputs
```

The fixture is shared deliberately: identical inputs are what make the
comparison fair. Each candidate has its own `package.json`, lockfile and
`node_modules/`, so no build tool enters the project's dependency graph.

## Reproducing a candidate

```bash
cd experiments/build-poc/rollup
npm ci                 # install that candidate's tools only
npm run build          # produces dist/ and dist-min/
cd ../..
node experiments/build-poc/measure.mjs experiments/build-poc/rollup
```

`measure.mjs` takes the candidate directory relative to the repository root and
writes `measurements.json` next to its `outputs.json`. **Measurements are never
hand-written** — the script produces them, and it runs the build twice to prove
the output is byte-stable.

To reproduce the build-time comparison in `research.md` §R-001:

```bash
node experiments/build-poc/benchmark.mjs [runs]   # runs defaults to 5
```

## Reading the results

`measurements.json` records, per candidate:

- `buildDurationMs`, `nodeVersion` and `buildWarnings` from the build itself
- `stableOutput` — whether two consecutive builds are byte-identical
- per output: existence, raw and gzip size, `sha256`, and the criterion-specific
  checks (`isEsm`, `hasTopLevelEsm`, `referencesCss`, `containsUnusedMarker`)
- `dts` — the declaration output, or `null` when the candidate produced none

`outputs.json` names which files of `dist/` and `dist-min/` each measurement
covers, so every candidate is measured identically.

## Verifying the recorded numbers

The results in `research.md` §R-001 match these files. Re-running the builds
reproduces every recorded byte count and hash exactly; only the build
duration varies between runs, which is why §R-001 quotes medians from
`benchmark.mjs` rather than a single run.

The one deliberate difference between a first run and the committed file is the
`dts` field: it was added to `measure.mjs` for the tsdown declaration probe
after the first three candidates had been measured, so their committed files
carry `"dts": null` — the correct value for a candidate that produces no
declarations.

## What is not committed

Each candidate's `node_modules/` is ignored. Everything needed to reproduce a
candidate — its configuration, its lockfile, the shared fixture, the harnesses,
the built outputs and the measurements — is committed.
