import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

export default mergeConfig(viteConfig, {
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
  },
});
