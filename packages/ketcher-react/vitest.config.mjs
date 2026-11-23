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
    // i18next-icu and intl-messageformat ship ESM builds without an
    // "exports" map. Left externalized (Vitest's default for node_modules),
    // they're handed to Node's own loader, which treats intl-messageformat's
    // CJS `exports.default` as a *named* export and binds the whole
    // `module.exports` object to the default import instead —
    // `new IntlMessageFormat(...)` then throws "is not a constructor" and
    // i18next-icu's catch-all silently returns the untranslated template
    // (breaks e.g. InfoModal.test.tsx's `{command}` interpolation). An
    // alias to their "module" entry doesn't help: Vitest still externalizes
    // by resolved path, not by how the specifier was reached. Inlining is
    // the only thing that routes them through Vite's own resolver, which —
    // like the production build — honors the "module" field correctly.
    server: {
      deps: {
        inline: [/i18next-icu/, /intl-messageformat/],
      },
    },
  },
});
