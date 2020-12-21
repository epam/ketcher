import path from 'path'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import json from '@rollup/plugin-json'
import del from 'rollup-plugin-delete'
import cleanup from 'rollup-plugin-cleanup'
import strip from '@rollup/plugin-strip'
import pkg from './package.json'

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const isProduction = process.env.NODE_ENV === mode.PRODUCTION

const config = {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs'
    },
    {
      file: pkg.module,
      exports: 'named',
      format: 'es'
    }
  ],
  external: [
    'url',
    /@babel\/runtime/,
    'remark-parse',
    'unified',
    'asap',
    'object-assign',
    'unist-util-visit',
    'unist-util-visit-parents',
    'xtend',
    'fs',
    'path'
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    peerDepsExternal({ includeDependencies: true }),
    commonjs(),
    resolve({ extensions, preferBuiltins: true }),

    typescript(),
    replace(
      {
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? mode.PRODUCTION : mode.DEVELOPMENT
        )
      },
      {
        include: 'src/**/*.{js,jsx,ts,tsx}'
      }
    ),

    json(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: ['src/**/*']
    }),
    postcss({
      extract: path.resolve('dist/index.css'),
      minimize: isProduction,
      sourceMap: true
    }),
    cleanup({ extensions, comments: 'none' }),
    ...(isProduction ? [strip()] : [])
  ]
}

export default config
