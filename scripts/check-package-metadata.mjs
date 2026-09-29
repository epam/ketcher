#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXEC_TIMEOUT_MS, npmPack } from './npm-pack.mjs';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const PACKAGE_NAMES = [
  'ketcher-core',
  'ketcher-standalone',
  'ketcher-macromolecules',
  'ketcher-react',
];
const ATW_IGNORED_RULES = {
  'ketcher-standalone': [
    // Node 24.20+ (the declared engine floor) detects these ESM .js entries;
    // ATW's Node 16 profile does not. Vite/webpack consumers test the tarballs.
    'unexpected-module-syntax',
  ],
  'ketcher-macromolecules': [
    // Node 24.20+ detects the ESM .js entry despite its ambiguous extension.
    'unexpected-module-syntax',
  ],
  'ketcher-react': [
    // Node 24.20+ detects the ESM .js entry despite its ambiguous extension.
    'unexpected-module-syntax',
  ],
};
const ATW_EXCLUDED_ENTRYPOINTS = {
  // ATW analyzes JS/types, not CSS export subpaths; publint still checks the tarball.
  'ketcher-macromolecules': ['./dist/index.css'],
  'ketcher-react': ['./dist/index.css'],
};
const packageDir = join(
  repoRoot,
  'node_modules',
  '.cache',
  'ketcher-package-metadata',
);

function main() {
  rmSync(packageDir, { recursive: true, force: true });
  mkdirSync(packageDir, { recursive: true });

  try {
    for (const packageName of PACKAGE_NAMES) {
      const pkgDir = join(repoRoot, 'packages', packageName);
      log(`Packing ${packageName}...`);
      const tarball = npmPack(pkgDir, packageDir);

      log(`Running publint on ${packageName}...`);
      run(join(repoRoot, 'node_modules', '.bin', 'publint'), [
        'run',
        tarball,
        '--level',
        'error',
        '--pack=false',
      ]);

      log(`Running Are The Types Wrong on ${packageName}...`);
      const ignoredRules = ATW_IGNORED_RULES[packageName];
      const excludedEntrypoints = ATW_EXCLUDED_ENTRYPOINTS[packageName];
      run(join(repoRoot, 'node_modules', '.bin', 'attw'), [
        tarball,
        '--profile',
        'strict',
        ...(ignoredRules ? ['--ignore-rules', ...ignoredRules] : []),
        ...(excludedEntrypoints
          ? ['--exclude-entrypoints', ...excludedEntrypoints]
          : []),
      ]);
    }

    log('All packed package metadata checks passed.');
  } finally {
    rmSync(packageDir, { recursive: true, force: true });
  }
}

function run(command, args) {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    timeout: EXEC_TIMEOUT_MS,
  });
}

function log(message) {
  console.log(`[check-package-metadata] ${message}`);
}

try {
  main();
} catch (err) {
  console.error(`\n❌ [check-package-metadata] ${err.message}\n`);
  process.exitCode = 1;
}
