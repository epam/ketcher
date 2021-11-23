import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from '@rollup/plugin-commonjs'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import pkg from './package.json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import strip from '@rollup/plugin-strip'
import ttypescript from 'ttypescript'
import typescript from 'rollup-plugin-typescript2'

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
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    peerDepsExternal({ includeDependencies: true }),
    resolve({ extensions, preferBuiltins: false }),
    commonjs({ sourceMap: false }),
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
    typescript({
      typescript: ttypescript,
      tsconfigOverride: {
        exclude: ['__tests__/**/*']
      }
    }),
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
