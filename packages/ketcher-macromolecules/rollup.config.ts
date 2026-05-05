import autoprefixer from 'autoprefixer';
import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import { createRequire } from 'node:module';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'node:path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import type { Plugin, RollupOptions } from 'rollup';
import strip from '@rollup/plugin-strip';
import svgr from '@svgr/rollup';
import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import { string } from 'rollup-plugin-string';

type PackageJson = {
  main: string;
  module: string;
  source: string;
  version: string;
};

const require = createRequire(import.meta.url);
const pkg = require('./package.json') as PackageJson;

const asPlugin = (plugin: unknown): Plugin => plugin as Plugin;

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
} as const;

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

export const valuesToReplace: Record<string, string> = {
  'process.env.NODE_ENV': JSON.stringify(
    isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
  ),
  'process.env.VERSION': JSON.stringify(pkg.version),
  'process.env.BUILD_DATE': JSON.stringify(
    new Date().toISOString().slice(0, 19),
  ),
  // TODO: add logic to init BUILD_NUMBER
  'process.env.BUILD_NUMBER': JSON.stringify(undefined),
  'process.env.HELP_LINK': JSON.stringify(process.env.HELP_LINK || 'master'),
  'process.env.INDIGO_VERSION': JSON.stringify(
    process.env.INDIGO_VERSION || '',
  ),
  'process.env.INDIGO_MACHINE': JSON.stringify(
    process.env.INDIGO_MACHINE || '',
  ),
};

const config: RollupOptions = {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      banner: `require('./index.css');`,
    },
    {
      file: pkg.module,
      exports: 'named',
      format: 'es',
      banner: `import './index.css';`,
    },
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true,
    }),
    postcss({
      plugins: [autoprefixer({ grid: 'autoplace' })],
      extract: path.resolve('dist/index.css'),
      minimize: isProduction,
      sourceMap: true,
      include: includePattern,
    }),
    asPlugin(svgr({ include: includePattern })),
    peerDepsExternal({ includeDependencies: true }),
    nodeResolve({ extensions }),
    commonjs(),
    replace({
      include: includePattern,
      preventAssignment: true,
      values: valuesToReplace,
    }),
    json(),
    typescript({
      typescript: ttypescript,
      tsconfigOverride: {
        exclude: ['*.test.ts'],
      },
    }),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    cleanup({
      extensions: extensions.map((extension) => extension.replace(/^\./, '')),
      comments: 'none',
      include: includePattern,
    }),
    asPlugin(
      string({
        include: '**/*.ket',
      }),
    ),
    ...(isProduction ? [strip({ include: includePattern })] : []),
  ],
};

export default config;
