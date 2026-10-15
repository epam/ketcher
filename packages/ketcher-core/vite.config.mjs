import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { license } from '../../license-banner.mjs';
import { mode } from '../../build-config/replace-values.mjs';
import { BROWSER_BUILD_TARGET } from '../../build-config/browser-target.mjs';
import { createTsconfigPathResolution } from '../../build-config/tsconfig-path-resolution.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { createRawTextPlugin } from '../../build-config/raw-text-plugin.mjs';
import { createConsoleStripPlugin } from '../../build-config/console-strip-plugin.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = fileURLToPath(new URL('.', import.meta.url));

const { external } = createExternalPredicate({ pkg });

const ketRawTextPlugin = createRawTextPlugin({
  name: 'ketcher-core-ket-raw-text',
  extension: '.ket',
});

// Rolldown rewrites the bare `require('raphael')` in raphael-ext.ts into a
// `__require('raphael')` helper call in ESM output. Consumer bundlers (Vite,
// webpack) do not recognise that form, so Raphael is dropped and the call throws
// at load time. The Rollup baseline emitted the plain `require`, so restore it
// here. The call stays behind the `typeof window` guard in raphael-ext.ts, which
// keeps SSR safe (a top-level import would throw under Node).
const RAPHAEL_REQUIRE_HELPER_CALL = '__require("raphael")';
const RAPHAEL_REQUIRE_HELPER_IMPORT =
  /^import \{ __require \} from "[^"\n]*runtime[^"\n]*";\n/m;

const plainRaphaelRequireInEsmPlugin = {
  name: 'ketcher-core-plain-raphael-require-in-esm',
  renderChunk(code, _chunk, outputOptions) {
    if (
      outputOptions.format !== 'es' ||
      !code.includes(RAPHAEL_REQUIRE_HELPER_CALL)
    ) {
      return null;
    }

    let restored = code.replaceAll(
      RAPHAEL_REQUIRE_HELPER_CALL,
      'require("raphael")',
    );
    if (!restored.includes('__require(')) {
      restored = restored.replace(RAPHAEL_REQUIRE_HELPER_IMPORT, '');
    }

    // The rewrite shortens one line by two columns; the chunk map is not
    // adjusted for that, which only matters for this single call.
    return { code: restored, map: null };
  },
};

// Rolldown emits `__require(` in ESM output for any other bare require() call of
// an external module. Consumer bundlers cannot resolve that helper, so fail the
// build if it reaches ESM output.
const forbidRequireHelperInEsmPlugin = {
  name: 'ketcher-core-forbid-require-helper-in-esm',
  generateBundle(outputOptions, bundle) {
    if (outputOptions.format !== 'es') {
      return;
    }

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk' && chunk.code.includes('__require(')) {
        this.error(
          `ESM output ${fileName} contains __require(; consumer bundlers cannot resolve it. ` +
            'Keep bare require() calls out of the ESM build (see vite.config.mjs).',
        );
      }
    }
  },
};

const output = (format, entryFileNames) => ({
  dir: 'dist',
  format,
  exports: 'named',
  banner: license,
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames,
  // Rollup 2 emitted the `__esModule` marker on CJS output; Rolldown does not
  // by default. Without it, TypeScript's and Babel's interop treat this as a
  // non-ES module and build a namespace of NON-CONFIGURABLE getters, so
  // `import * as ketcherCore` yields an object that cannot be spied on or
  // otherwise redefined. That silently changes behaviour for every CJS
  // consumer using interop, so the marker is restored explicitly.
  // (Ignored for the `es` output, where it has no meaning.)
  esModule: true,
});

export default defineConfig({
  ...createTsconfigPathResolution(),
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
    ),
  },
  plugins: [
    ketRawTextPlugin,
    plainRaphaelRequireInEsmPlugin,
    forbidRequireHelperInEsmPlugin,
    ...(isProduction ? [createConsoleStripPlugin()] : []),
  ],
  build: {
    target: BROWSER_BUILD_TARGET,
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    minify: false,
    sourcemap: !isProduction,
    emptyOutDir: false,
    // Vite only skips wrapping dynamic import() in its browser-only preload
    // helper (window.dispatchEvent) when build.lib is set - modulePreload:
    // false alone does not suppress it. This is a library consumed from Node
    // (example-ssr) as well as the browser, and Rollup never injected this
    // wrapper, so `await import('./data/monomers.ket')` must stay a plain
    // dynamic import. The actual output shape (per-file preserveModules,
    // dual cjs/es, entryFileNames) is still fully specified below via
    // rolldownOptions.output, which takes precedence over anything build.lib
    // would otherwise derive.
    lib: {
      entry: resolve(rootDir, pkg.source),
      formats: ['cjs', 'es'],
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(rootDir, pkg.source),
      external,
      // Rolldown's default (`smart`) inlines module-level constants and drops
      // the module that declared them, but the .d.ts still ships. A published
      // .d.ts with no .js is a type for a value that is not there, so keep the
      // constant modules as emitted files. The package-metadata check fails if
      // this regresses.
      optimization: { inlineConst: false },
      // Tree-shaking is left at Rolldown's default. It was briefly disabled
      // here on the theory that preserveModules needs every preserved module
      // treated as a root, but measurement says otherwise: comparing the
      // export surface of all 489 baseline modules, disabling it drops exactly
      // the same exports as leaving it on, and the Rollup baseline emits fewer
      // files (489) than either Rolldown setting (525 on, 537 off) - so Rollup
      // itself tree-shook at least as aggressively as this does.
      output: [output('cjs', '[name].js'), output('es', '[name].modern.js')],
    },
  },
});
