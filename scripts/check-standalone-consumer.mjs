#!/usr/bin/env node

/**
 * Guards the #10326 regression (see the ADR:
 * .memory-bank/adr/2026-08-28-vite-for-library-builds.md): the
 * `binaryWasm`/`binaryWasmNoRender` build variants of `ketcher-standalone`
 * must be usable by a real external consumer's bundler, not just by this
 * monorepo's own `example` (which aliases the package to source and never
 * exercises the published `dist/` output - see .memory-bank/architecture.md,
 * "Verification").
 *
 * Those two variants load Indigo's worker + .wasm at runtime via
 * `new Worker(new URL('./file.js', import.meta.url), { type: 'module' })`
 * and `new URL('./file.wasm', import.meta.url)`. A bundler only emits the
 * worker/.wasm as real output files if it can statically recognise that
 * literal pattern; if the build regresses to a computed expression (e.g.
 * `new URL("" + new URL(...).href, ...)`), consumer bundlers copy the call
 * through unchanged and silently drop the worker or the .wasm, which then
 * 404s at runtime. `npm run build` never catches this - it only rebuilds
 * this repo's own copy of the package.
 *
 * This script packs `ketcher-standalone` (and `ketcher-core`, its only
 * workspace dependency) with `npm pack`, installs the tarballs into two
 * throwaway consumer projects - one built with Vite, one with webpack 5 -
 * each importing and instantiating BOTH fetch-based variants
 * (`binaryWasm`, `binaryWasmNoRender`), and fails if either consumer's
 * build output is missing a worker chunk or a .wasm file for either
 * variant.
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

// Both fetch-based (`copyWasm`) variants share the same worker/.wasm
// consumer-detectability fix (see literalWorkerUrlPlugin in
// packages/ketcher-standalone/vite.config.mjs) but are built from separate
// entries, so a fix to one can regress the other silently. Both are
// imported into the same consumer entry below rather than run as four
// separate installs/builds, since the whole cost of this check is the
// install + build, not the import count.
const STANDALONE_VARIANTS = ['binaryWasm', 'binaryWasmNoRender'];

// A generous ceiling for each install/build step, so a network stall or a
// bundler hang fails this check instead of hanging a CI job indefinitely.
const EXEC_TIMEOUT_MS = 5 * 60 * 1000;

// Pin the consumers' bundler versions to what this repo already builds
// with (or a webpack 5 baseline, since nothing in the repo uses webpack) -
// exact versions, not ranges or "latest", so this check doesn't start
// failing from an unrelated bundler release (mirrors the exact `"vite":
// "8.0.16"` pin ketcher-standalone's own package.json already uses).
const VITE_VERSION = readJson(join(standalonePkgDir, 'package.json'))
  .devDependencies.vite;
const WEBPACK_VERSION = '5.99.0';
const WEBPACK_CLI_VERSION = '5.1.4';

// Instantiate at module scope, not behind an unused export - the
// constructor is what calls getIndigoWorker()/new Worker(). An export
// nobody imports can be tree-shaken away by a production build before it
// ever reaches the worker/.wasm reference this check is looking for.
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
      '\n✅ ketcher-standalone binaryWasm/binaryWasmNoRender builds work in both a Vite and a webpack 5 consumer\n',
    );
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

// `requiredFile` is a path (relative to `pkgDir`) that the package's build
// actually emits - core and standalone have different dist layouts, so a
// single hard-coded path checked for both silently always finds it missing
// for one of them and unconditionally rebuilds it every run.
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

function npmInstall(consumerDir) {
  run('npm', ['install', '--no-audit', '--no-fund', '--no-save'], consumerDir);
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

  // No `.wasm` module rule here on purpose: verified empirically that
  // webpack 5's default asset handling already emits the
  // `new URL('./x.wasm', import.meta.url)` reference Indigo's emscripten
  // glue uses as a real output file with no extra config - so a consumer
  // needs no special webpack setup for this to work, and this check must
  // not paper over a regression by configuring around it.
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

// Every fetch-based variant's worker chunk is emitted from the literal
// `new URL('./indigoWorker-<hash>.js', import.meta.url)` reference
// literalWorkerUrlPlugin produces (see vite.config.mjs), so this name
// survives into a consumer's build even when the bundler renames the
// chunk file itself: Vite keeps the original file name (a static asset
// copy), and webpack keeps the resolved path as a literal string inside
// its `import.meta.url` polyfill even though the emitted chunk file gets a
// numeric id. Matching on this known name - not by grepping for the
// generic `onmessage` string every worker-ish file tends to contain - is
// what actually identifies *this* worker instead of any other.
const WORKER_NAME_RE = /indigoWorker-[\w.-]+\.js/g;

function verifyConsumerOutput(bundlerName, distDir) {
  const files = listFilesRecursive(distDir);
  const wasmFiles = files.filter((f) => f.endsWith('.wasm'));
  const expectedCount = STANDALONE_VARIANTS.length;

  if (wasmFiles.length < expectedCount) {
    fail(
      `${bundlerName} consumer build has ${wasmFiles.length} Indigo .wasm file(s) in its ` +
        `output (${distDir}), expected at least ${expectedCount} - one per checked ` +
        `ketcher-standalone variant (${STANDALONE_VARIANTS.join(', ')}). This is the #10326 ` +
        `regression: the bundler didn't recognise the worker/.wasm URL as a static asset ` +
        'reference for at least one variant.',
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
        'one per checked variant. The Indigo worker was not split out as its own file for ' +
        'every variant.',
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

// Throws instead of calling `process.exit()` directly, so a failure inside
// `main()`'s `try` still runs its `finally` (cleaning up the temp working
// directory) before the process exits - see the top-level catch below for
// where the non-zero exit actually happens.
function fail(message) {
  throw new Error(message);
}

try {
  main();
} catch (err) {
  console.error(`\n❌ [check-standalone-consumer] ${err.message}\n`);
  process.exitCode = 1;
}
