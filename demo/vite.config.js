import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const getPublicUrl = (command) => {
  return command === 'build' ? './' : '/';
};

export default defineConfig(({ command }) => {
  const publicUrl = getPublicUrl(command);

  return {
    base: publicUrl,
    plugins: [react()],
    define: {
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
    },
  };
});
