import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

// Bound packaging, validation, and consumer install/build subprocesses.
export const EXEC_TIMEOUT_MS = 5 * 60 * 1000;

export function npmPack(pkgDir, destDir) {
  const output = execFileSync(
    'npm',
    ['pack', '--silent', '--pack-destination', destDir],
    { cwd: pkgDir, encoding: 'utf8', timeout: EXEC_TIMEOUT_MS },
  ).trim();
  const fileName = output.split(/\r?\n/).at(-1)?.trim();

  if (!fileName) {
    throw new Error(`npm pack did not produce a tarball for ${pkgDir}`);
  }

  return join(destDir, fileName);
}
