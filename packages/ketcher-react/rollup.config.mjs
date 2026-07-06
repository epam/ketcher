import autoprefixer from 'autoprefixer';
import babel from '@rollup/plugin-babel';
import { execSync } from 'child_process';
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
import { string } from 'rollup-plugin-string';

const svgrPlugin = svgr.default ?? svgr;
const babelPlugin = babel.default ?? babel;
const nodeResolvePlugin = nodeResolve.default ?? nodeResolve;

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const getTagName = () => {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' });
  } catch (error) {
    console.error(error);
    return 'master';
  }
};

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
  'process.env.HELP_LINK': JSON.stringify(getTagName()),
  'process.env.INDIGO_VERSION': JSON.stringify(process.env.INDIGO_VERSION || ''),
  'process.env.INDIGO_MACHINE': JSON.stringify(process.env.INDIGO_MACHINE || ''),
};

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
