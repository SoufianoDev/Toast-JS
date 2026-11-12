import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const ROOT_DIR = process.cwd();
const manifest = JSON.parse(readFileSync(`${ROOT_DIR}/package.json`, 'utf8'));

/**
 * @typedef {{ path: string }} PackFile
 * @typedef {{ files: PackFile[] }} PackResult
 */

/** Every path package.json points a consumer at. */
function declaredPaths() {
  const paths = [manifest.main, manifest.module, manifest.browser, manifest.unpkg, manifest.jsdelivr, manifest.types];

  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (typeof target === 'string') {
      paths.push(target);
      continue;
    }
    for (const condition of Object.values(target)) {
      if (typeof condition === 'string') paths.push(condition);
    }
  }

  return paths.map((p) => p.replace(/^\.\//, ''));
}

/** @type {Set<string>} */
let packedFiles;

beforeAll(() => {
  execFileSync('npm', ['run', 'build'], { cwd: ROOT_DIR, stdio: 'ignore' });

  const output = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT_DIR, encoding: 'utf8' });
  /** @type {Record<string, PackResult>} */
  const parsed = JSON.parse(output);
  packedFiles = new Set(parsed[manifest.name].files.map((f) => f.path));
});

describe('package artifacts', () => {
  it('ships every path declared in package.json', () => {
    const missing = declaredPaths().filter((p) => !packedFiles.has(p));
    expect(missing).toEqual([]);
  });

  it('ships no declaration file outside dist/types', () => {
    const stray = [...packedFiles].filter((p) => p.endsWith('.d.ts') && !p.startsWith('dist/types/'));
    expect(stray).toEqual([]);
  });
});
