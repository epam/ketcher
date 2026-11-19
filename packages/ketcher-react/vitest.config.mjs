import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

// Use core's ESM build so Vitest can apply the setup's `paper` mock.
const ketcherCoreEntry = fileURLToPath(
  new URL('../ketcher-core/dist/index.modern.js', import.meta.url),
);

export default mergeConfig(viteConfig, {
  resolve: {
    alias: [
      {
        find: /^ketcher-core$/,
        replacement: ketcherCoreEntry,
      },
    ],
  },
  test: {
    clearMocks: true,
    environment: 'happy-dom',
    globals: true,
    // Threads start faster than forks; keeps per-file isolation.
    pool: 'threads',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    setupFiles: ['../vitest.happy-dom.setup.mjs', './vitest.setup.mjs'],
    // intl-messageformat ships both a "main" (CJS) and "module" (ESM) build
    // but no "exports" map. Externalized (the default for node_modules),
    // Vitest's SSR module runner hands i18next-icu's prebuilt ESM file to
    // Node's own loader, which treats the CJS "main" file's `exports.default`
    // as a *named* export and binds the whole `module.exports` object to the
    // default import instead — `new IntlMessageFormat(...)` then throws
    // "is not a constructor" and i18next-icu's catch-all silently returns
    // the untranslated template. Inlining routes it through Vite's own
    // resolver instead, which honors the "module" field like the production
    // build does.
    server: {
      deps: {
        inline: [/i18next-icu/, /intl-messageformat/],
      },
    },
  },
});
