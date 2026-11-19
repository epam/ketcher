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
  },
});
