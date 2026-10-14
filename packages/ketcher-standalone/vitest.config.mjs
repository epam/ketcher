import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

// Use core's ESM entry so the standalone test can mock core's Paper import.
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
    environment: 'node',
    globals: true,
    clearMocks: true,
  },
});
