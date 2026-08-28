import autoprefixer from 'autoprefixer';
import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'node:fs';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import strip from '@rollup/plugin-strip';
import svgr from '@svgr/rollup';
import typescript from 'rollup-plugin-typescript2';
import { license } from '../../license-banner.mjs';
import {
  createReplaceValues,
  getTagName,
  mode,
} from '../../build-config/replace-values.mjs';
import { string } from 'rollup-plugin-string';

const svgrPlugin = svgr.default ?? svgr;
const babelPlugin = babel.default ?? babel;
const nodeResolvePlugin = nodeResolve.default ?? nodeResolve;

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const valuesToReplace = createReplaceValues({
  version: pkg.version,
  isProduction,
  helpLink: getTagName(),
});

const config = {
  input: pkg.source,
  output: [
    {
      dir: 'dist/cjs',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      dir: 'dist',
      exports: 'named',
      format: 'es',
      banner: license,
    },
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true,
    }),
    postcss({
      plugins: [autoprefixer({ grid: 'autoplace' })],
      extract: 'index.css',
      minimize: isProduction,
      sourceMap: true,
      include: [includePattern, '../ketcher-macromolecules/dist/index.css'],
    }),
    svgrPlugin({ include: includePattern }),
    peerDepsExternal({ includeDependencies: true }),
    nodeResolvePlugin({ extensions }),
    commonjs(),
    replace({
      include: includePattern,
      preventAssignment: true,
      values: valuesToReplace,
    }),
    json(),
    typescript({
      tsconfig: './tsconfig.build.json',
    }),
    babelPlugin({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    copy({
      targets: [{ src: 'src/style/*.svg', dest: 'dist' }],
    }),
    cleanup({
      extensions: extensions.map((ext) => ext.replace(/^\./, '')),
      comments: 'none',
      include: includePattern,
    }),
    ...(isProduction ? [strip({ include: includePattern })] : []),
    string({
      include: '**/*.sdf',
    }),
  ],
};

export default config;
