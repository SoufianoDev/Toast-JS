// @ts-check
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT_DIR = process.cwd();

/**
 * The compiler's own resolved view of `tsconfig.check.json` — the files it
 * checks and the settings it applies. Reading the file list from the compiler
 * keeps this guard in step with the configuration instead of duplicating its
 * include globs.
 *
 * @returns {{ files: string[], options: Record<string, unknown> }}
 */
function resolvedConfig() {
  const output = execFileSync(
    process.execPath,
    [join(ROOT_DIR, 'node_modules/typescript/lib/tsc.js'), '-p', 'tsconfig.check.json', '--showConfig'],
    { cwd: ROOT_DIR, encoding: 'utf8' },
  );
  const parsed = JSON.parse(output);
  return { files: parsed.files ?? [], options: parsed.compilerOptions ?? {} };
}

describe('type-check coverage', () => {
  const config = resolvedConfig();

  it('resolves the checked sources from the configuration', () => {
    expect(config.files.length).toBeGreaterThan(0);
    expect(config.files.some((file) => file.endsWith('src/index.mjs'))).toBe(true);
  });

  it('marks every checked source for type checking', () => {
    const unmarked = config.files
      .map((file) => file.replace(/^\.\//, ''))
      .filter((file) => !readFileSync(join(ROOT_DIR, file), 'utf8').startsWith('// @ts-check'));

    expect(unmarked).toEqual([]);
  });
});
