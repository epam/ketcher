#!/usr/bin/env node

/**
 * Checks that the `binaryWasm`, `binaryWasmNoRender` and `jsNoRender` variants
 * of `ketcher-standalone` build in real Vite and webpack 5 consumers (#12018).
 * Neither `example` nor the autotests import these variants.
 *
 * Packs `ketcher-core` and `ketcher-standalone`, builds a throwaway consumer
 * with each bundler and fails if a build fails or its output lacks the Indigo
 * worker or .wasm of a fetch-based variant.
 */

import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const corePkgDir = join(repoRoot, 'packages/ketcher-core');
const standalonePkgDir = join(repoRoot, 'packages/ketcher-standalone');

// Load the worker and .wasm as separate files, which must appear in the output.
const FETCH_VARIANTS = ['binaryWasm', 'binaryWasmNoRender'];
// Inline the worker and .wasm as base64: only the build has to succeed.
const INLINE_VARIANTS = ['jsNoRender'];
const STANDALONE_VARIANTS = [...FETCH_VARIANTS, ...INLINE_VARIANTS];

// Per-command limit, so a hung install or build fails instead of stalling CI.
const EXEC_TIMEOUT_MS = 5 * 60 * 1000;

// Exact bundler versions, so a new bundler release cannot break this check.
const VITE_VERSION = readJson(join(repoRoot, 'example/package.json'))
  .devDependencies.vite;
const WEBPACK_VERSION = '5.99.0';
const WEBPACK_CLI_VERSION = '5.1.4';

// Instantiate the services, or tree-shaking drops the worker and .wasm.
function buildConsumerEntry() {
  const imports = STANDALONE_VARIANTS.map(
    (variant, index) =>
      `import { StandaloneStructService as Service${index} } from 'ketcher-standalone/dist/${variant}';`,
  ).join('\n');
  const instantiations = STANDALONE_VARIANTS.map(
    (_variant, index) =>
      `globalThis.__ketcherStandaloneService${index} = new Service${index}();`,
  ).join('\n');

  return `${imports}\n\n${instantiations}\n`;
}

function main() {
  ensureBuilt(corePkgDir, 'ketcher-core', join('dist', 'index.js'));
  ensureBuilt(
    standalonePkgDir,
    'ketcher-standalone',
    join('dist', 'binaryWasm', 'main.js'),
  );

  const workDir = mkdtempSync(join(tmpdir(), 'ketcher-standalone-consumer-'));
  log(`Working directory: ${workDir}`);

  try {
    log('Packing ketcher-core and ketcher-standalone...');
    const coreTarball = npmPack(corePkgDir, workDir);
    const standaloneTarball = npmPack(standalonePkgDir, workDir);

    const viteDir = join(workDir, 'vite-consumer');
    const webpackDir = join(workDir, 'webpack-consumer');

    setUpViteConsumer(viteDir, coreTarball, standaloneTarball);
    setUpWebpackConsumer(webpackDir, coreTarball, standaloneTarball);

    log('Installing and building the Vite consumer...');
    npmInstall(viteDir);
    run(join(viteDir, 'node_modules/.bin/vite'), ['build'], viteDir);
    verifyConsumerOutput('Vite', join(viteDir, 'dist'));

    log('Installing and building the webpack 5 consumer...');
    npmInstall(webpackDir);
    run(
      join(webpackDir, 'node_modules/.bin/webpack'),
      ['--config', 'webpack.config.cjs'],
      webpackDir,
    );
    verifyConsumerOutput('webpack 5', join(webpackDir, 'dist'));

    console.log(
      `\n✅ ketcher-standalone ${STANDALONE_VARIANTS.join('/')} builds work in both a Vite and a webpack 5 consumer\n`,
    );
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

// Builds the package if `requiredFile` (relative to `pkgDir`) is missing.
function ensureBuilt(pkgDir, workspaceName, requiredFile) {
  if (existsSync(join(pkgDir, requiredFile))) return;
  log(
    `${workspaceName}'s ${requiredFile} is missing - building ${workspaceName} first...`,
  );
  run('npm', ['run', 'build', `--workspace=${workspaceName}`], repoRoot);
}

function npmPack(pkgDir, destDir) {
  const output = execFileSync(
    'npm',
    ['pack', '--silent', '--pack-destination', destDir],
    { cwd: pkgDir, encoding: 'utf8', timeout: EXEC_TIMEOUT_MS },
  ).trim();
  const fileName = output.split('\n').pop().trim();
  return join(destDir, fileName);
}

// The consumers have no lockfile, so skip install scripts of registry packages.
function npmInstall(consumerDir) {
  run(
    'npm',
    ['install', '--no-audit', '--no-fund', '--no-save', '--ignore-scripts'],
    consumerDir,
  );
}

function setUpViteConsumer(dir, coreTarball, standaloneTarball) {
  mkdirSync(join(dir, 'src'), { recursive: true });

  writeJson(join(dir, 'package.json'), {
    name: 'check-standalone-consumer-vite',
    private: true,
    version: '0.0.0',
    type: 'module',
    dependencies: {
      'ketcher-core': `file:${coreTarball}`,
      'ketcher-standalone': `file:${standaloneTarball}`,
    },
    devDependencies: {
      vite: VITE_VERSION,
    },
  });

  writeFileSync(join(dir, 'src/main.js'), buildConsumerEntry());

  writeFileSync(
    join(dir, 'vite.config.mjs'),
    `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: { input: 'src/main.js' },
  },
});
`,
  );
}

function setUpWebpackConsumer(dir, coreTarball, standaloneTarball) {
  mkdirSync(join(dir, 'src'), { recursive: true });

  writeJson(join(dir, 'package.json'), {
    name: 'check-standalone-consumer-webpack',
    private: true,
    version: '0.0.0',
    dependencies: {
      'ketcher-core': `file:${coreTarball}`,
      'ketcher-standalone': `file:${standaloneTarball}`,
    },
    devDependencies: {
      webpack: WEBPACK_VERSION,
      'webpack-cli': WEBPACK_CLI_VERSION,
    },
  });

  writeFileSync(join(dir, 'src/main.js'), buildConsumerEntry());

  // No `.wasm` rule on purpose: webpack 5 emits `new URL('./x.wasm',
  // import.meta.url)` assets by default, and consumers should need no setup.
  writeFileSync(
    join(dir, 'webpack.config.cjs'),
    `const path = require('node:path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: 'auto',
  },
};
`,
  );
}

// The worker's file name survives in the consumer output: Vite keeps the
// file, webpack keeps the name as a string even when it renames the chunk.
const WORKER_NAME_RE = /indigoWorker-[\w.-]+\.js/g;

function verifyConsumerOutput(bundlerName, distDir) {
  const files = listFilesRecursive(distDir);
  const wasmFiles = files.filter((f) => f.endsWith('.wasm'));
  const expectedCount = FETCH_VARIANTS.length;

  if (wasmFiles.length < expectedCount) {
    fail(
      `${bundlerName} consumer build has ${wasmFiles.length} Indigo .wasm file(s) in its ` +
        `output (${distDir}), expected at least ${expectedCount} - one per fetch-based ` +
        `ketcher-standalone variant (${FETCH_VARIANTS.join(', ')}). The bundler didn't ` +
        'recognise the worker/.wasm URL as a static asset reference for at least one variant.',
    );
  }

  const workerFileNames = new Set();
  for (const file of files) {
    if (file.endsWith('.wasm') || file === join(distDir, 'main.js')) continue;
    const text = readTextIfPossible(file);
    if (!text) continue;
    for (const match of text.matchAll(WORKER_NAME_RE)) {
      workerFileNames.add(match[0]);
    }
  }

  if (workerFileNames.size < expectedCount) {
    fail(
      `${bundlerName} consumer build references ${workerFileNames.size} distinct Indigo ` +
        `worker file(s) in its output (${distDir}), expected at least ${expectedCount} - ` +
        'one per fetch-based variant. The Indigo worker was not split out as its own file ' +
        'for every fetch-based variant.',
    );
  }

  log(
    `${bundlerName}: OK (${wasmFiles.length} .wasm file(s), ${workerFileNames.size} worker ` +
      'chunk(s) present)',
  );
}

function listFilesRecursive(dir) {
  const result = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFilesRecursive(full));
    } else {
      result.push(full);
    }
  }
  return result;
}

function readTextIfPossible(file) {
  if (!/\.(js|mjs|cjs)$/.test(file)) return null;
  return readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    timeout: EXEC_TIMEOUT_MS,
  });
}

function log(message) {
  console.log(`[check-standalone-consumer] ${message}`);
}

// Throws rather than exits, so `main()` still removes the temp directory.
function fail(message) {
  throw new Error(message);
}

try {
  main();
} catch (err) {
  console.error(`\n❌ [check-standalone-consumer] ${err.message}\n`);
  process.exitCode = 1;
}
