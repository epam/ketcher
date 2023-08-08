import autoprefixer from 'autoprefixer';
import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'path';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
// import strip from '@rollup/plugin-strip';
import svgr from '@svgr/rollup';
import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import { string } from 'rollup-plugin-string';

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
  'process.env.BUILD_DATE': JSON.stringify(
    new Date().toISOString().slice(0, 19),
  ),
  // TODO: add logic to init BUILD_NUMBER
  'process.env.BUILD_NUMBER': JSON.stringify(undefined),
};

const config = {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
    },
    {
      file: pkg.module,
      exports: 'named',
      format: 'es',
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
    svgr({ include: includePattern }),
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
      extensions: extensions.map((ext) => ext.trimStart('.')),
      comments: 'none',
      include: includePattern,
    }),
    string({
      include: '**/*.sdf',
    }),
    // ...(isProduction ? [strip({ include: includePattern })] : []),
  ],
};

export default config;
