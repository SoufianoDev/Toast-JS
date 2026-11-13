#!/usr/bin/env node
/**
 * Shared measurement script. Both proof-of-concepts are measured the same way
 * so the comparison is like-for-like.
 *
 * Usage: node experiments/build-poc/measure.mjs <poc-directory>
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const pocDir = resolve(process.argv[2]);
const outputs = JSON.parse(readFileSync(join(pocDir, 'outputs.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(pocDir, 'package.json'), 'utf8'));

function fileInfo(relativePath) {
  const absolute = join(pocDir, relativePath);
  if (!existsSync(absolute)) return { exists: false };

  const content = readFileSync(absolute);
  return {
    exists: true,
    bytes: content.length,
    gzipBytes: gzipSync(content).length,
    sha256: createHash('sha256').update(content).digest('hex'),
    text: content.toString('utf8'),
  };
}

function directoryInfo(relativePath) {
  const absolute = join(pocDir, relativePath);
  if (!existsSync(absolute)) return { exists: false, files: [], bytes: 0 };

  const files = [];
  let bytes = 0;

  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const filePath = join(absolute, entry.name);
    const size = statSync(filePath).size;
    bytes += size;
    files.push({
      name: entry.name,
      bytes: size,
      sha256: createHash('sha256').update(readFileSync(filePath)).digest('hex'),
    });
  }

  return { exists: true, files, bytes };
}

/** A top-level ESM import/export statement. */
const TOP_LEVEL_ESM = /^\s*(import|export)\s/m;

function buildDirectory(relativePath) {
  const absolute = join(pocDir, relativePath);
  if (!existsSync(absolute)) return { exists: false, files: [], bytes: 0 };
  return directoryInfo(relativePath);
}

function runBuild() {
  const started = Date.now();
  let stdout = '';
  let stderr = '';
  let exitCode = 0;

  try {
    stdout = execFileSync('npm', ['run', 'build'], { cwd: pocDir, encoding: 'utf8' });
  } catch (error) {
    exitCode = error.status ?? 1;
    stdout = error.stdout ?? '';
    stderr = error.stderr ?? '';
  }

  return { exitCode, stdout, stderr, durationMs: Date.now() - started };
}

function packFileList() {
  try {
    const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: pocDir,
      encoding: 'utf8',
    });
    const parsed = JSON.parse(output);
    const entry = Array.isArray(parsed) ? parsed[0] : parsed[manifest.name];
    return entry.files.map((file) => file.path);
  } catch (error) {
    return null;
  }
}

function checkSsrImport(relativePath) {
  const absolute = join(pocDir, relativePath);
  const script = `import(${JSON.stringify(absolute)}).then((m) => {
    const leaked = typeof globalThis.document !== 'undefined' || typeof globalThis.window !== 'undefined';
    console.log(JSON.stringify({ exports: Object.keys(m), leaked }));
  })`;

  try {
    const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8',
    });
    return { imported: true, ...JSON.parse(stdout.trim()) };
  } catch (error) {
    return { imported: false, error: String(error.stderr ?? error.message).slice(0, 500) };
  }
}

// First build establishes the baseline; the second must be byte-identical.
const first = runBuild();
const firstTree = buildDirectory('dist');
const firstMinTree = buildDirectory('dist-min');
const second = runBuild();
const secondTree = buildDirectory('dist');
const secondMinTree = buildDirectory('dist-min');

const stable =
  firstTree.files.length === secondTree.files.length &&
  firstTree.files.every(
    (file, index) => file.sha256 === secondTree.files[index]?.sha256,
  ) &&
  firstMinTree.files.every(
    (file, index) => file.sha256 === secondMinTree.files[index]?.sha256,
  );

const esm = fileInfo(outputs.esm);
const browser = fileInfo(outputs.browser);
const injection = fileInfo(outputs.injection);
const consumer = fileInfo(outputs.consumer);
const css = fileInfo(outputs.css);
const dts = outputs.dts ? fileInfo(outputs.dts) : { exists: false };
const minEsm = fileInfo(`${outputs.minDir}/${outputs.esm.replace(/^dist\//, '')}`);
const minBrowser = fileInfo(`${outputs.minDir}/${outputs.browser.replace(/^dist\//, '')}`);

const packFiles = packFileList();

const declaredExports = [];
for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
  if (typeof target === 'string') {
    declaredExports.push(target);
    continue;
  }
  for (const condition of Object.values(target)) {
    if (typeof condition === 'string') declaredExports.push(condition);
  }
}

const configFiles = readdirSync(pocDir).filter((name) => name.endsWith('.config.mjs'));

const measurements = {
  tool: manifest.buildTool ?? manifest.name,
  nodeVersion: process.version,
  exitCode: first.exitCode,
  buildDurationMs: first.durationMs,
  buildStderr: first.stderr.trim(),
  buildWarnings: first.stderr
    .split('\n')
    .filter((line) => /warn|deprecat/i.test(line))
    .map((line) => line.trim()),
  stableOutput: stable,
  outputs: {
    esm: {
      ...withoutText(esm),
      isEsm: /\bexport\s*[{*]/.test(esm.text ?? ''),
      referencesCss: /style\.css|\.css['"]/.test(esm.text ?? ''),
    },
    browser: {
      ...withoutText(browser),
      hasTopLevelEsm: TOP_LEVEL_ESM.test(browser.text ?? ''),
      referencesCss: /\.css['"]/.test(browser.text ?? ''),
    },
    injection: {
      ...withoutText(injection),
      referencesCss: /\.css['"]/.test(injection.text ?? ''),
    },
    consumer: {
      ...withoutText(consumer),
      containsUnusedMarker: (consumer.text ?? '').includes('toast-poc-unused-marker'),
    },
    css: withoutText(css),
    dts: outputs.dts ? withoutText(dts) : null,
  },
  minified: {
    esmBytes: minEsm.bytes ?? null,
    browserBytes: minBrowser.bytes ?? null,
    unminifiedDistBytes: firstTree.bytes,
    minifiedDistBytes: firstMinTree.bytes,
    minifiedRatio:
      firstTree.bytes > 0 ? Number((firstMinTree.bytes / firstTree.bytes).toFixed(4)) : null,
  },
  sourceMaps: {
    produced: [...firstTree.files, ...firstMinTree.files]
      .filter((file) => file.name.endsWith('.map'))
      .map((file) => file.name),
    referencedByEsm: /sourceMappingURL/.test(esm.text ?? ''),
    referencedByBrowser: /sourceMappingURL/.test(browser.text ?? ''),
  },
  ssr: checkSsrImport(outputs.esm),
  package: {
    declaredExports,
    exportsMissingFromPack: packFiles
      ? declaredExports
          .map((path) => path.replace(/^\.\//, ''))
          .filter((path) => !packFiles.includes(path))
      : null,
    packFiles,
    runtimeDependencies: manifest.dependencies ?? {},
  },
  config: {
    files: configFiles,
    lines: configFiles.reduce(
      (total, name) => total + readFileSync(join(pocDir, name), 'utf8').split('\n').length,
      0,
    ),
  },
  devDependencies: Object.keys(manifest.devDependencies ?? {}),
};

function withoutText(info) {
  const { text, ...rest } = info;
  return rest;
}

writeFileSync(join(pocDir, 'measurements.json'), `${JSON.stringify(measurements, null, 2)}\n`);
console.log(`measured ${relative(process.cwd(), pocDir)} -> measurements.json`);
console.log(`  stable output : ${stable}`);
console.log(`  esm bytes     : ${esm.bytes} (min ${minEsm.bytes})`);
console.log(`  css file      : ${css.exists ? `${css.bytes} bytes` : 'MISSING'}`);
console.log(`  tree-shaking  : ${consumer.containsUnusedMarker ? 'MARKER PRESENT (not shaken)' : 'marker dropped'}`);
console.log(`  ssr import    : ${measurements.ssr.imported ? 'ok' : 'FAILED'}`);
