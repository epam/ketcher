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
 * each importing and instantiating the default entry plus BOTH fetch-based
 * variants (`binaryWasm`, `binaryWasmNoRender`), and fails if either
 * consumer's build output is missing a worker chunk or a .wasm file for
 * either fetch-based variant.
 */

import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXEC_TIMEOUT_MS, npmPack } from './npm-pack.mjs';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const corePkgDir = join(repoRoot, 'packages/ketcher-core');
const standalonePkgDir = join(repoRoot, 'packages/ketcher-standalone');
const INDIGO_VERSION = readJson(
  join(repoRoot, 'node_modules/indigo-ketcher/package.json'),
).version;

// Both fetch-based (`copyWasm`) variants share the same worker/.wasm
// consumer-detectability fix (see literalWorkerUrlPlugin in
// packages/ketcher-standalone/vite.config.mjs) but are built from separate
// entries, so a fix to one can regress the other silently. They and the
// default entry are imported into the same consumer entry below rather than
// run as separate installs/builds, since the whole cost of this check is the
// install + build, not the import count.
const STANDALONE_VARIANTS = ['binaryWasm', 'binaryWasmNoRender'];
const WORKER_FILE_NAME = 'indigoWorker.js';
const WORKER_NAME_RE = /indigoWorker\.js/;
const WASM_FILE_NAMES = {
  binaryWasm: `indigo-ketcher-${INDIGO_VERSION}.wasm`,
  binaryWasmNoRender: `indigo-ketcher-norender-${INDIGO_VERSION}.wasm`,
};

// Vite and jsdom are the exact versions the root lockfile resolves, so the
// consumer installs match what this repo builds and tests with. The
// standalone package declares `^8.3.1`, which would let the consumer float.
const ROOT_LOCKFILE_PACKAGES = readJson(
  join(repoRoot, 'package-lock.json'),
).packages;

// Top-level entry first. A workspace that does not hoist a package gets its
// own copy (jsdom is nested under each workspace), which is accepted only if
// every copy agrees on one version.
function lockedVersion(name) {
  const hoisted = ROOT_LOCKFILE_PACKAGES[`node_modules/${name}`]?.version;
  if (hoisted) return hoisted;
  const nested = [
    ...new Set(
      Object.entries(ROOT_LOCKFILE_PACKAGES)
        .filter(([key]) => key.endsWith(`/node_modules/${name}`))
        .map(([, entry]) => entry.version),
    ),
  ];
  if (nested.length !== 1) {
    throw new Error(
      `root package-lock.json has no single resolved version for "${name}" ` +
        `(top-level entry missing, nested versions: [${nested.join(', ')}]). ` +
        'Install dependencies so the lockfile resolves it.',
    );
  }
  return nested[0];
}

const VITE_VERSION = lockedVersion('vite');
const JSDOM_VERSION = lockedVersion('jsdom');
// Webpack is not a dependency of anything in this repo, so the lockfile has
// no version to read. It stays an exact literal, not a range, so this check
// does not start failing from an unrelated bundler release.
const WEBPACK_VERSION = '5.99.0';
const WEBPACK_CLI_VERSION = '5.1.4';

// Instantiate at module scope, not behind an unused export - the
// constructor is what calls getIndigoWorker()/new Worker(). An export
// nobody imports can be tree-shaken away by a production build before it
// ever reaches the worker/.wasm reference this check is looking for.
function buildConsumerEntry() {
  const imports = [
    "import { StandaloneStructService as DefaultService } from 'ketcher-standalone';",
    ...STANDALONE_VARIANTS.map(
      (variant, index) =>
        `import { StandaloneStructService as Service${index} } from 'ketcher-standalone/dist/${variant}';`,
    ),
  ].join('\n');
  const instantiations = [
    'globalThis.__ketcherStandaloneDefaultService = new DefaultService();',
    ...STANDALONE_VARIANTS.map(
      (_variant, index) =>
        `globalThis.__ketcherStandaloneService${index} = new Service${index}();`,
    ),
  ].join('\n');

  return `${imports}\n\n${instantiations}\n`;
}

function main() {
  ensureBuilt(corePkgDir, 'ketcher-core', join('dist', 'index.js'));
  ensureBuilt(standalonePkgDir, 'ketcher-standalone', join('dist', 'main.js'));
  ensureBuilt(
    standalonePkgDir,
    'ketcher-standalone',
    join('dist', 'binaryWasm', 'main.js'),
  );
  verifyStandaloneAssetNames();

  // Keep consumers outside the repository so resolution cannot fall back to
  // workspace packages and mask undeclared dependencies.
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
    runConsumerBundle('Vite', viteDir, 'module');

    log('Installing and building the webpack 5 consumer...');
    npmInstall(webpackDir);
    run(
      join(webpackDir, 'node_modules/.bin/webpack'),
      ['--config', 'webpack.config.cjs'],
      webpackDir,
    );
    verifyConsumerOutput('webpack 5', join(webpackDir, 'dist'));
    runConsumerBundle('webpack 5', webpackDir, 'script');

    console.log(
      '\n✅ ketcher-standalone default/binaryWasm/binaryWasmNoRender builds in a Vite and a webpack 5 consumer, and their bundles load and instantiate the services\n',
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

function verifyStandaloneAssetNames() {
  for (const variant of STANDALONE_VARIANTS) {
    const assetsDir = join(standalonePkgDir, 'dist', variant, 'assets');
    const assetNames = readdirSync(assetsDir);
    const workerFileNames = assetNames.filter((name) =>
      /^indigoWorker.*\.js$/.test(name),
    );
    const wasmFileNames = assetNames.filter((name) => name.endsWith('.wasm'));
    const expectedWasmFileName = WASM_FILE_NAMES[variant];

    if (
      workerFileNames.length !== 1 ||
      workerFileNames[0] !== WORKER_FILE_NAME ||
      wasmFileNames.length !== 1 ||
      wasmFileNames[0] !== expectedWasmFileName
    ) {
      fail(
        `ketcher-standalone ${variant} must emit ${WORKER_FILE_NAME} and ` +
          `${expectedWasmFileName} in ${assetsDir}; found worker file(s) ` +
          `[${workerFileNames.join(', ')}] and .wasm file(s) ` +
          `[${wasmFileNames.join(', ')}].`,
      );
    }

    const mainCode = readFileSync(
      join(standalonePkgDir, 'dist', variant, 'main.js'),
      'utf8',
    );
    if (!WORKER_NAME_RE.test(mainCode)) {
      fail(
        `ketcher-standalone ${variant} main.js must reference the fixed ` +
          `${WORKER_FILE_NAME} URL literally.`,
      );
    }

    const workerCode = readFileSync(join(assetsDir, WORKER_FILE_NAME), 'utf8');
    if (!workerCode.includes(expectedWasmFileName)) {
      fail(
        `ketcher-standalone ${variant} ${WORKER_FILE_NAME} must reference ` +
          `${expectedWasmFileName} literally.`,
      );
    }
  }
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
      jsdom: JSDOM_VERSION,
    },
  });

  writeFileSync(join(dir, 'src/main.js'), buildConsumerEntry());

  writeFileSync(
    join(dir, 'vite.config.mjs'),
    `import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.js',
      output: { entryFileNames: 'main.js' },
    },
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
      jsdom: JSDOM_VERSION,
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

  // Consumer bundlers rename emitted assets, so match each output WASM to its
  // package variant by content and find the worker that references that name.
  const javascriptFiles = files
    .filter((file) => /\.(js|mjs|cjs)$/.test(file))
    .filter((file) => file !== join(distDir, 'main.js'))
    .map((file) => ({ file, code: readTextIfPossible(file) }));
  const workerFilesByVariant = new Map();
  for (const variant of STANDALONE_VARIANTS) {
    const packageWasmFile = join(
      standalonePkgDir,
      'dist',
      variant,
      'assets',
      WASM_FILE_NAMES[variant],
    );
    const packageWasmContents = readFileSync(packageWasmFile);
    const emittedWasmFile = wasmFiles.find((file) =>
      readFileSync(file).equals(packageWasmContents),
    );

    if (!emittedWasmFile) {
      fail(
        `${bundlerName} consumer build does not emit the .wasm file for ` +
          `${variant} (${distDir}).`,
      );
    }

    const workerFiles = new Set(
      javascriptFiles
        .filter(({ code }) => code?.includes(basename(emittedWasmFile)))
        .map(({ file }) => file),
    );

    if (workerFiles.size === 0) {
      fail(
        `${bundlerName} consumer build does not emit a distinct Indigo worker file for ` +
          `${variant} that references ${basename(emittedWasmFile)} (${distDir}).`,
      );
    }

    workerFilesByVariant.set(variant, workerFiles);
  }

  const workerFiles = new Set(
    [...workerFilesByVariant.values()].flatMap((variantFiles) => [
      ...variantFiles,
    ]),
  );
  if (workerFiles.size < expectedCount) {
    fail(
      `${bundlerName} consumer build emits ${workerFiles.size} distinct Indigo worker file(s) ` +
        `in its output (${distDir}), expected at least ${expectedCount} - one per checked ` +
        'variant.',
    );
  }
  log(
    `${bundlerName}: OK (${wasmFiles.length} .wasm file(s), ${workerFiles.size} distinct ` +
      'worker file(s), with a matching worker/.wasm pair for each checked variant)',
  );
}

// Builds are not enough: a bundler can emit every file and still ship a module
// graph that throws on load (for example a bare `require('raphael')` that the
// bundle cannot resolve). Load the built bundle in jsdom and instantiate the
// services, the way a browser page would. `kind` is 'module' for ESM output and
// 'script' for a classic script.
function runConsumerBundle(bundlerName, consumerDir, kind) {
  const runnerPath = join(consumerDir, 'run-bundle.mjs');
  const bundlePath = join(consumerDir, 'dist', 'main.js');
  writeFileSync(runnerPath, buildBundleRunner());

  log(`Loading the ${bundlerName} consumer bundle in jsdom...`);
  run(process.execPath, [runnerPath, kind, bundlePath], consumerDir);
  log(`${bundlerName}: bundle loaded and services instantiated`);
}

function buildBundleRunner() {
  return `import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const [kind, bundlePath] = process.argv.slice(2);
const SERVICE_GLOBALS = [
  '__ketcherStandaloneDefaultService',
  '__ketcherStandaloneService0',
  '__ketcherStandaloneService1',
];

// A classic script is loaded the way a page loads it: a <script src> on a file:
// page, so jsdom fetches its async chunks too. An ESM bundle is imported by
// Node, below, with the same globals.
const isScript = kind === 'script';
const dom = new JSDOM(
  isScript
    ? '<!doctype html><script src="main.js"></script>'
    : '<!doctype html><html><body></body></html>',
  {
    pretendToBeVisual: true,
    url: isScript
      ? pathToFileURL(join(dirname(bundlePath), 'index.html')).href
      : 'http://localhost/',
    runScripts: isScript ? 'dangerously' : undefined,
    resources: isScript ? 'usable' : undefined,
  },
);
// jsdom's own user agent contains "jsdom", which Paper.js reads as a Node
// runtime and then takes its Node-only code path. Report a browser instead.
Object.defineProperty(dom.window.navigator, 'userAgent', {
  value:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
});

// The Indigo worker is constructed but never run: the check is about the
// bundle's module graph and load-time behaviour, not the wasm itself.
class StubWorker {
  constructor(url) {
    this.url = String(url);
  }
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}
dom.window.Worker = StubWorker;

// Paper.js probes a 2D canvas context while loading. jsdom has none without
// the optional canvas package, so hand out a context whose methods do nothing.
const noop = () => undefined;
const canvasContextStub = new Proxy(
  {},
  {
    get: (target, property) =>
      property in target ? target[property] : noop,
    set: (target, property, value) => {
      target[property] = value;
      return true;
    },
  },
);
dom.window.HTMLCanvasElement.prototype.getContext = () => canvasContextStub;

// The bundle expects a browser global scope. Copy jsdom's DOM interfaces that
// Node lacks (for example HTMLAnchorElement, used at module load) onto the
// global object, and point window, self, document and navigator at jsdom.
const browserGlobals = {};
for (const name of Object.getOwnPropertyNames(dom.window)) {
  if (name in globalThis) {
    continue;
  }
  try {
    browserGlobals[name] = dom.window[name];
  } catch {
    // jsdom refuses some accessors on an opaque origin (localStorage).
  }
}
Object.assign(browserGlobals, {
  window: dom.window,
  self: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  Worker: StubWorker,
});
for (const [name, value] of Object.entries(browserGlobals)) {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
}

// Errors thrown by page scripts are reported to the window, not to this
// process, so collect them and fail on the first one.
const pageErrors = [];
const scope = isScript ? dom.window : globalThis;
if (isScript) {
  dom.window.addEventListener('error', (event) =>
    pageErrors.push(event.error ?? new Error(event.message)),
  );
  await new Promise((resolve) => dom.window.addEventListener('load', resolve));
  if (pageErrors.length > 0) {
    throw pageErrors[0];
  }
} else {
  await import(pathToFileURL(bundlePath).href);
}

const missing = SERVICE_GLOBALS.filter((name) => !scope[name]);
if (missing.length > 0) {
  throw new Error('bundle did not instantiate: ' + missing.join(', '));
}
dom.window.close();
`;
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
