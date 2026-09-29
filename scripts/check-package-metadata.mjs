#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
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
// ATW's Node 16 profile reports these exact ESM import targets as ambiguous
// .js files; the packages' Node 24.20+ floor enables syntax detection. The
// validator permits only these entrypoint/resolution/file combinations.
const ATW_NODE_24_ESM_IMPORTS = {
  'ketcher-standalone': {
    '.': 'dist/main.js',
    './dist/binaryWasm': 'dist/binaryWasm/main.js',
    './dist/jsNoRender': 'dist/jsNoRender/main.js',
    './dist/binaryWasmNoRender': 'dist/binaryWasmNoRender/main.js',
  },
  'ketcher-macromolecules': {
    '.': 'dist/index.modern.js',
  },
  'ketcher-react': {
    '.': 'dist/index.js',
  },
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
      const excludedEntrypoints = ATW_EXCLUDED_ENTRYPOINTS[packageName];
      const entrypoints = getAtwEntrypoints(pkgDir, excludedEntrypoints);
      checkAreTheTypesWrong(tarball, packageName, entrypoints);
    }

    log('All packed package metadata checks passed.');
  } finally {
    rmSync(packageDir, { recursive: true, force: true });
  }
}

function getAtwEntrypoints(pkgDir, excludedEntrypoints = []) {
  const { exports } = readJson(join(pkgDir, 'package.json'));
  const entrypoints =
    exports && typeof exports === 'object' && !Array.isArray(exports)
      ? Object.keys(exports)
      : ['.'];

  return entrypoints.filter(
    (entrypoint) => !excludedEntrypoints.includes(entrypoint),
  );
}

function checkAreTheTypesWrong(tarball, packageName, entrypoints) {
  const command = join(repoRoot, 'node_modules', '.bin', 'attw');
  const allowedFindings = [];

  for (const entrypoint of entrypoints) {
    const result = spawnSync(
      command,
      [
        tarball,
        '--profile',
        'strict',
        '--format',
        'json',
        '--entrypoints',
        entrypoint,
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: EXEC_TIMEOUT_MS,
      },
    );

    if (result.error) throw result.error;

    let report;
    try {
      report = JSON.parse(result.stdout);
    } catch {
      throw new Error(
        `Are The Types Wrong did not return JSON for ${packageName} ` +
          `${entrypoint}.\n${result.stderr || result.stdout}`,
      );
    }

    const entrypointFindings = validateAtwReport(report, packageName);
    if (result.status !== 0 && entrypointFindings.length === 0) {
      throw new Error(
        `Are The Types Wrong exited with status ${result.status} for ` +
          `${packageName} ${entrypoint}.`,
      );
    }
    if (result.status !== 0 && result.status !== 1) {
      throw new Error(
        `Are The Types Wrong exited with status ${result.status} for ` +
          `${packageName} ${entrypoint}.`,
      );
    }

    allowedFindings.push(...entrypointFindings);
  }

  if (allowedFindings.length) {
    log(
      `${packageName}: allowed ${allowedFindings.length} Node 24 ESM import ` +
        `syntax finding(s) in the exact declared resolutions (${allowedFindings.join(', ')}).`,
    );
  } else {
    log(`${packageName}: no problems found.`);
  }
}

function validateAtwReport(report, packageName) {
  const expectedEsmImports = ATW_NODE_24_ESM_IMPORTS[packageName] ?? {};
  const problems = Object.entries(report.problems ?? {}).flatMap(
    ([rule, findings]) => findings.map((finding) => ({ rule, finding })),
  );
  const visibleProblemIds = new Set();
  const allowedFindings = [];
  const rejectedFindings = [];

  for (const [entrypoint, data] of Object.entries(
    report.analysis?.entrypoints ?? {},
  )) {
    for (const [resolutionName, resolution] of Object.entries(
      data.resolutions ?? {},
    )) {
      for (const problemId of resolution.visibleProblems ?? []) {
        visibleProblemIds.add(problemId);
        const problem = problems[problemId];
        if (!problem) {
          rejectedFindings.push(
            `${entrypoint} (${resolutionName}): unknown ATW problem ${problemId}`,
          );
          continue;
        }

        const expectedFile = expectedEsmImports[entrypoint];
        const expectedFileSuffix = expectedFile
          ? `/${packageName}/${expectedFile}`
          : undefined;
        const reportedFile = problem.finding.fileName?.replaceAll('\\', '/');
        const implementationFile =
          resolution.implementationResolution?.fileName?.replaceAll('\\', '/');
        const isExpectedNode24Import =
          problem.rule === 'UnexpectedModuleSyntax' &&
          resolutionName === 'node16-esm' &&
          expectedFileSuffix &&
          reportedFile?.endsWith(expectedFileSuffix) &&
          implementationFile === reportedFile;

        if (isExpectedNode24Import) {
          allowedFindings.push(`${entrypoint} (${resolutionName})`);
        } else {
          rejectedFindings.push(
            `${problem.rule} at ${entrypoint} (${resolutionName}): ` +
              `${problem.finding.fileName ?? 'unknown file'}`,
          );
        }
      }
    }
  }

  for (const [problemId, problem] of problems.entries()) {
    if (!visibleProblemIds.has(problemId)) {
      rejectedFindings.push(
        `${problem.rule}: unscoped finding at ${problem.finding.fileName ?? 'unknown file'}`,
      );
    }
  }

  if (rejectedFindings.length > 0) {
    throw new Error(
      `Are The Types Wrong found unsupported metadata problems for ${packageName}:\n` +
        rejectedFindings.map((finding) => `- ${finding}`).join('\n'),
    );
  }

  return allowedFindings;
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

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

try {
  main();
} catch (err) {
  console.error(`\n❌ [check-package-metadata] ${err.message}\n`);
  process.exitCode = 1;
}
