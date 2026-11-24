import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';

const PORT = 3000;

// Office only loads add-ins over trusted HTTPS. `npm run certs` installs the
// same localhost certificate the Yeoman Office templates use.
function devCertificate() {
  const dir = join(homedir(), '.office-addin-dev-certs');
  const key = join(dir, 'localhost.key');
  const cert = join(dir, 'localhost.crt');
  if (!existsSync(key) || !existsSync(cert)) {
    console.warn(
      '[office-addin] No dev certificate found, serving over HTTP. ' +
        'Run `npm run certs` before loading the add-in in PowerPoint.',
    );
    return undefined;
  }
  return { key: readFileSync(key), cert: readFileSync(cert) };
}

export default defineConfig(({ command }) => {
  const https = command === 'build' ? undefined : devCertificate();
  const server = { port: PORT, strictPort: true, https };

  return {
    plugins: [react()],
    resolve: { dedupe: ['react', 'react-dom'] },
    server,
    preview: server,
    build: {
      rolldownOptions: {
        input: {
          taskpane: resolve(import.meta.dirname, 'taskpane.html'),
          editor: resolve(import.meta.dirname, 'editor.html'),
          commands: resolve(import.meta.dirname, 'commands.html'),
        },
      },
    },
  };
});
