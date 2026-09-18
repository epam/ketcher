import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Minimal-change migration off react-scripts (CRA/webpack) onto Vite.
// `demo` consumes the published packages (ketcher-core/react/standalone) as
// regular dependencies, so - unlike `example` - it needs no source aliasing,
// package-scoped alias resolution, or bundle chunking: keep this boring.

const publicUrl = process.env.PUBLIC_URL || '';

const HtmlPublicUrlPlugin = () => {
  return {
    name: 'ketcher-demo-html-public-url',
    transformIndexHtml(html: string) {
      const publicUrlWithTrailingSlash = publicUrl
        ? `${publicUrl.replace(/\/$/, '')}/`
        : '';

      return html
        .replaceAll('%PUBLIC_URL%/', publicUrlWithTrailingSlash)
        .replaceAll('%PUBLIC_URL%', publicUrl);
    },
  };
};

export default defineConfig({
  envPrefix: 'REACT_APP_',
  plugins: [react(), HtmlPublicUrlPlugin()],
  define: {
    'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
  },
  build: {
    outDir: 'build',
  },
});
