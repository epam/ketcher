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
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    setupFiles: ['./vitest.setup.mjs'],
  },
});
