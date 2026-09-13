import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import typescript from '@rollup/plugin-typescript';
import { license } from '../../license-banner.mjs';
import { readFileSync } from 'node:fs';
import { string } from 'rollup-plugin-string';

const babelPlugin = babel.default ?? babel;

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.ts'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

const config = {
  input: pkg.source,
  output: [
    {
      dir: 'dist',
      exports: 'named',
      format: 'cjs',
      banner: license,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
    {
      dir: 'dist',
      exports: 'named',
      format: 'es',
      banner: license,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].modern.js',
    },
  ],
  plugins: [
    peerDepsExternal({ includeDependencies: true }),
    nodeResolve({ extensions }),
    commonjs({ transformMixedEsModules: true }),
    replace(
      {
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
        ),
        preventAssignment: true,
      },
      {
        include: includePattern,
      },
    ),
    json({ include: includePattern }),
    typescript({
      tsconfig: './tsconfig.json',
      rootDir: 'src',
      exclude: ['__tests__/**/*', 'dist/**/*'],
    }),
    babelPlugin({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    cleanup({
      extensions: extensions.map((ext) => ext.replace(/^\./, '')),
      comments: 'none',
      include: includePattern,
    }),
    string({
      include: '**/*.ket',
    }),
    ...(isProduction ? [strip({ include: includePattern })] : []),
  ],
};

export default config;
