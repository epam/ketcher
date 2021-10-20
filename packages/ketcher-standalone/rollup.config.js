import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from '@rollup/plugin-commonjs'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import pkg from './package.json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import strip from '@rollup/plugin-strip'
import typescript from 'rollup-plugin-typescript2'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'

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
    'remark-parse',
    'unified',
    'asap',
    'object-assign',
    'unist-util-visit',
    'unist-util-visit-parents',
    'xtend',
    'ketcher-core',
    /@babel\/runtime/
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    nodePolyfills(),
    resolve({ extensions, preferBuiltins: false }),
    commonjs(),
    webWorkerLoader({
      extensions,
      sourcemap: false,
      targetPlatform: 'browser',
      external: ['@babel/runtime']
    }),
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
    typescript(),
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
