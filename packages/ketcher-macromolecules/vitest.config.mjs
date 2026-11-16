import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

const testMockPath = (filename) =>
  fileURLToPath(new URL(`./src/testMocks/${filename}`, import.meta.url));

export default mergeConfig(viteConfig, {
  resolve: {
    alias: [
      {
        // Use the ESM build so Vitest can mock core's Paper.js import.
        find: /^ketcher-core$/,
        replacement: fileURLToPath(
          new URL('../ketcher-core/dist/index.modern.js', import.meta.url),
        ),
      },
      {
        find: /^ketcher-react(?:\/.*)?$/,
        replacement: testMockPath('ketcher-react.tsx'),
      },
      {
        find: /^react-contexify$/,
        replacement: testMockPath('react-contexify.tsx'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Threads start faster than forks; keeps per-file isolation.
    pool: 'threads',
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.mjs'],
  },
});
