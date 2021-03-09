import ttypescript from 'ttypescript'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import del from 'rollup-plugin-delete'
import typescript from 'rollup-plugin-typescript2'
import cleanup from 'rollup-plugin-cleanup'
import strip from '@rollup/plugin-strip'
import pkg from './package.json'

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

const extensions = ['.js', '.ts']
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
    'remark-parse',
    'unified',
    'asap',
    'object-assign',
    'unist-util-visit',
    'unist-util-visit-parents',
    'xtend'
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    peerDepsExternal({ includeDependencies: true }),
    resolve({ extensions, preferBuiltins: false }),
    commonjs(),
    replace(
      {
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? mode.PRODUCTION : mode.DEVELOPMENT
        )
      },
      {
        include: 'src/**/*.{js,ts}'
      }
    ),
    json(),
    typescript({ typescript: ttypescript }),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: ['src/**/*']
    }),
    cleanup({
      extensions: extensions.map(ext => ext.trimStart('.')),
      comments: 'none'
    }),
    ...(isProduction ? [strip()] : [])
  ]
}

export default config
