// Runs the @arethetypeswrong/core API against the packed tarball of a proof of
// concept and prints the problems it reports, verbatim.
//
//   node probe/attw.mjs                 # this proof of concept
//   node probe/attw.mjs ../rolldown     # another proof of concept
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createPackageFromTarballData, checkPackage } from '@arethetypeswrong/core';

const pocDir = resolve(process.argv[2] ?? '.');
const name = execFileSync('npm', ['pack', '--pack-destination', pocDir, '--silent'], {
  cwd: pocDir,
  encoding: 'utf8',
}).trim();

const pkg = createPackageFromTarballData(readFileSync(resolve(pocDir, name)));
const result = await checkPackage(pkg);

console.log(JSON.stringify({ problems: result.problems }, null, 2));
