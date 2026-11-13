#!/usr/bin/env node
/**
 * Repeated-run build benchmark. Every proof-of-concept is measured the same way:
 * the same number of runs, the same process, the same wall-clock measurement.
 *
 * Usage: node experiments/build-poc/benchmark.mjs [runs]
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const RUNS = Number(process.argv[2] ?? 5);
const POC_ROOT = new URL('.', import.meta.url).pathname;

const CANDIDATES = ['rollup', 'vite', 'rolldown', 'tsdown'];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

const results = {};

for (const candidate of CANDIDATES) {
  const pocDir = join(POC_ROOT, candidate);
  if (!existsSync(join(pocDir, 'package.json'))) continue;

  const durations = [];

  for (let run = 0; run < RUNS; run += 1) {
    const started = process.hrtime.bigint();
    try {
      execFileSync('npm', ['run', 'build'], { cwd: pocDir, stdio: 'ignore' });
    } catch {
      // A failing build is recorded as a failed run, not silently skipped.
    }
    durations.push(Number(process.hrtime.bigint() - started) / 1e6);
  }

  results[candidate] = {
    runs: RUNS,
    minMs: Math.round(Math.min(...durations)),
    medianMs: Math.round(median(durations)),
    maxMs: Math.round(Math.max(...durations)),
    allMs: durations.map((value) => Math.round(value)),
  };

  console.log(
    `${candidate.padEnd(10)} min ${String(results[candidate].minMs).padStart(5)} ms   ` +
      `median ${String(results[candidate].medianMs).padStart(5)} ms   ` +
      `max ${String(results[candidate].maxMs).padStart(5)} ms`,
  );
}

console.log(`\nNode ${process.version}, ${RUNS} runs each.`);
console.log(JSON.stringify(results, null, 2));
