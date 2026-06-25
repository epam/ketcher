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
import strip from '@rollup/plugin-strip';
import svgr from '@svgr/rollup';
import typescript from 'rollup-plugin-typescript2';
import tsconfigPaths from 'rollup-plugin-tsconfig-paths';
import { string } from 'rollup-plugin-string';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const svgrPlugin = svgr.default ?? svgr;
const babelPlugin = babel.default ?? babel;
const nodeResolvePlugin = nodeResolve.default ?? nodeResolve;

const asPlugin = (plugin) => plugin;

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

export const valuesToReplace = {
  'process.env.NODE_ENV': JSON.stringify(
    isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
  ),
  'process.env.VERSION': JSON.stringify(pkg.version),
  'process.env.BUILD_DATE': JSON.stringify(new Date().toISOString().slice(0, 19)),
  'process.env.BUILD_NUMBER': JSON.stringify(undefined),
  'process.env.HELP_LINK': JSON.stringify(process.env.HELP_LINK || 'master'),
  'process.env.INDIGO_VERSION': JSON.stringify(process.env.INDIGO_VERSION || ''),
  'process.env.INDIGO_MACHINE': JSON.stringify(process.env.INDIGO_MACHINE || ''),
};

const config = {
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
    asPlugin(svgrPlugin({ include: includePattern })),
    peerDepsExternal({ includeDependencies: true }),
    nodeResolvePlugin({ extensions }),
    commonjs(),
    asPlugin(tsconfigPaths()),
    json(),
    typescript({
      tsconfigOverride: {
        exclude: ['*.test.ts'],
      },
    }),
    replace({
      include: includePattern,
      preventAssignment: true,
      values: valuesToReplace,
    }),
    babelPlugin({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    cleanup({
      extensions: extensions.map((extension) => extension.replace(/^\./, '')),
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
