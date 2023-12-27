import path from 'path';
import { defineConfig } from 'vite';
import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json';
import strip from '@rollup/plugin-strip';
import dts from 'vite-plugin-dts';
import banner from 'vite-plugin-banner';
import { license } from '../../license.ts';

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.ts'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, pkg.source),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'cjs') return 'index.js';
        else return 'index.modern.js';
      },
    },
    manifest: true,
    rollupOptions: {
      external: ['ketcher-core', /@babel\/runtime/],
    },
  },
  plugins: [
    banner(license),
    dts(),
    nodePolyfills(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    cleanup({
      extensions: extensions.map((ext) => ext.trimStart('.')),
      include: includePattern,
      comments: 'none',
    }),
    ...(isProduction ? [strip({ include: includePattern })] : []),
  ],
});
