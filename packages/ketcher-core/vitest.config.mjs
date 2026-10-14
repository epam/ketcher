import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

export default mergeConfig(viteConfig, {
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/__tests__/**/*.{spec,test}.{ts,js}'],
    setupFiles: ['./vitest.setup.mjs'],
  },
});
