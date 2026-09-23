#!/usr/bin/env node

/**
 * Guards review blocker B2: the `binaryWasm`/`binaryWasmNoRender` build
 * variants of `ketcher-standalone` must be usable by a real external
 * consumer's bundler, not just by this monorepo's own `example` (which
 * aliases the package to source and never exercises the published `dist/`
 * output - see .memory-bank/architecture.md, "Verification").
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
 * and fails if either consumer's build output is missing the worker chunk
 * or the .wasm file.
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

// Pin the consumers' bundler versions to what this repo already builds
// with (or a webpack 5 baseline, since nothing in the repo uses webpack) -
// not "latest", so this check doesn't start failing from an unrelated
// bundler release.
const VITE_VERSION = readJson(join(standalonePkgDir, 'package.json'))
  .devDependencies.vite;
const WEBPACK_VERSION = '^5.99.0';
const WEBPACK_CLI_VERSION = '^5.1.4';

const CONSUMER_ENTRY = `import { StandaloneStructService } from 'ketcher-standalone/dist/binaryWasm';

// Instantiate at module scope, not behind an unused export - the
// constructor is what calls getIndigoWorker()/new Worker(). An export
// nobody imports can be tree-shaken away by a production build before it
// ever reaches the worker/.wasm reference this check is looking for.
const service = new StandaloneStructService();
globalThis.__ketcherStandaloneService = service;
`;

function main() {
  ensureBuilt(corePkgDir, 'ketcher-core');
  ensureBuilt(standalonePkgDir, 'ketcher-standalone');

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
      '\n✅ ketcher-standalone binaryWasm build works in both a Vite and a webpack 5 consumer\n',
    );
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

function ensureBuilt(pkgDir, workspaceName) {
  if (existsSync(join(pkgDir, 'dist', 'binaryWasm', 'main.js'))) return;
  log(`${workspaceName}/dist is missing - building it first...`);
  run('npm', ['run', 'build', `--workspace=${workspaceName}`], repoRoot);
}

function npmPack(pkgDir, destDir) {
  const output = execFileSync(
    'npm',
    ['pack', '--silent', '--pack-destination', destDir],
    { cwd: pkgDir, encoding: 'utf8' },
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

  writeFileSync(join(dir, 'src/main.js'), CONSUMER_ENTRY);

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

  writeFileSync(join(dir, 'src/main.js'), CONSUMER_ENTRY);

  // `type: 'asset/resource'` is required for the .wasm reference webpack
  // finds via `new URL('./x.wasm', import.meta.url)` - without it, webpack
  // has no default rule for .wasm and the reference is left unresolved.
  // `asyncWebAssembly` stays off: this .wasm is fetched as a plain binary
  // asset (Indigo's own emscripten glue instantiates it), not imported as
  // a WebAssembly module.
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
  module: {
    rules: [{ test: /\\.wasm$/, type: 'asset/resource' }],
  },
  experiments: { asyncWebAssembly: false },
};
`,
  );
}

function verifyConsumerOutput(bundlerName, distDir) {
  const files = listFilesRecursive(distDir);
  const wasmFiles = files.filter((f) => f.endsWith('.wasm'));

  if (wasmFiles.length === 0) {
    fail(
      `${bundlerName} consumer build is missing the Indigo .wasm file in its output ` +
        `(${distDir}). This is review blocker B2: the bundler didn't recognise the ` +
        `worker/.wasm URL as a static asset reference.`,
    );
  }

  const workerChunkPresent = files.some((f) => {
    if (f.endsWith('.wasm') || f === join(distDir, 'main.js')) return false;
    try {
      return readTextIfPossible(f)?.includes('onmessage');
    } catch {
      return false;
    }
  });

  if (!workerChunkPresent) {
    fail(
      `${bundlerName} consumer build has a .wasm file but no separate worker chunk ` +
        `in its output (${distDir}) - the Indigo worker was not split out as its own file.`,
    );
  }

  log(
    `${bundlerName}: OK (${wasmFiles.length} .wasm file(s), worker chunk present)`,
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
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function log(message) {
  console.log(`[check-standalone-consumer] ${message}`);
}

function fail(message) {
  console.error(`\n❌ [check-standalone-consumer] ${message}\n`);
  process.exit(1);
}

main();
