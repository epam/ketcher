import babel from '@rollup/plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import commonjs from '@rollup/plugin-commonjs'
import del from 'rollup-plugin-delete'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import pkg from './package.json'
import resolve from '@rollup/plugin-node-resolve'
import strip from '@rollup/plugin-strip'
import typescript from 'rollup-plugin-typescript2'
import webWorkerLoader from 'rollup-plugin-web-worker-loader'
import { license } from '../../license.ts'

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

const extensions = ['.js', '.ts']
const isProduction = process.env.NODE_ENV === mode.PRODUCTION
const includePattern = 'src/**/*'

const config = {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      exports: 'named',
      format: 'cjs',
      banner: license
    },
    {
      file: pkg.module,
      exports: 'named',
      format: 'es',
      banner: license
    }
  ],
  external: ['ketcher-core', /@babel\/runtime/],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    nodePolyfills(),
    resolve({ extensions }),
    commonjs(),
    webWorkerLoader({
      extensions,
      sourcemap: false,
      targetPlatform: 'browser',
      external: ['@babel/runtime']
    }),
    typescript(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern
    }),
    cleanup({
      extensions: extensions.map((ext) => ext.trimStart('.')),
      include: includePattern,
      comments: 'none'
    }),
    ...(isProduction ? [strip({ include: includePattern })] : [])
  ]
}

export default config
