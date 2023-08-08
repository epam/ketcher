import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json';
import replace from '@rollup/plugin-replace';
// import strip from '@rollup/plugin-strip';
import ttypescript from 'ttypescript';
import typescript from 'rollup-plugin-typescript2';
import { license } from '../../license.ts';

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
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      file: pkg.module,
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
    peerDepsExternal({ includeDependencies: true }),
    nodeResolve({ extensions }),
    commonjs(),
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
      typescript: ttypescript,
      tsconfigOverride: {
        exclude: ['__tests__/**/*'],
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
    // ...(isProduction ? [strip({ include: includePattern })] : []),
  ],
};

export default config;
