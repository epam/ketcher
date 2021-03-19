import path from 'path'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import json from '@rollup/plugin-json'
import svgr from '@svgr/rollup'
import del from 'rollup-plugin-delete'
import typescript from 'rollup-plugin-typescript2'
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
    'xtend'
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true
    }),
    peerDepsExternal({ includeDependencies: true }),
    resolve({ extensions, preferBuiltins: true }),
    commonjs(),
    replace(
      {
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? mode.PRODUCTION : mode.DEVELOPMENT
        ),
        'process.env.VERSION': JSON.stringify(pkg.version),
        'process.env.BUILD_DATE': JSON.stringify(
          new Date().toISOString().slice(0, 19)
        ),
        //TODO: add logic to init BUILD_NUMBER
        'process.env.BUILD_NUMBER': JSON.stringify(undefined)
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
    postcss({
      plugins: isProduction ? [autoprefixer({ grid: 'autoplace' })] : [],
      extract: path.resolve('dist/index.css'),
      minimize: isProduction,
      sourceMap: true
    }),
    svgr(),
    copy({
      targets: [{ src: 'src/style/*.svg', dest: 'dist' }]
    }),
    cleanup({
      extensions: extensions.map(ext => ext.trimStart('.')),
      comments: 'none'
    }),
    ...(isProduction ? [strip()] : [])
  ]
}

export default config
