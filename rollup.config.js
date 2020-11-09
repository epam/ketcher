import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { string } from 'rollup-plugin-string'
import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import less from 'rollup-plugin-less'
import json from '@rollup/plugin-json'
import svgr from '@svgr/rollup'
import cleanup from 'rollup-plugin-cleanup'
import pkg from './package.json'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const config = {
  input: pkg.source,
  output: [
    {
      file: pkg.main,
      sourcemap: true,
      exports: 'auto',
      format: 'cjs'
    },
    {
      file: pkg.module,
      sourcemap: true,
      exports: 'auto',
      format: 'es'
    }
  ],
  plugins: [
    peerDepsExternal(),
    typescript(),
    string({
      // Required to be specified
      include: 'src/**/*.{sdf,md}'
    }),
    commonjs(),
    replace(
      {
        'process.env.VERSION': JSON.stringify(pkg.version),
        'process.env.BUILD_DATE': JSON.stringify(
          new Date().toISOString().slice(0, 19)
        ),
        'process.env.BUILD_NUMBER': JSON.stringify(undefined)
      },
      {
        include: 'src/**/*.{js,jsx,ts,tsx}',
        verbose: true
      }
    ),
    resolve({ extensions, preferBuiltins: true }),

    json(),
    babel({
      extensions,
      babelHelpers: 'bundled',
      include: ['src/**/*']
    }),
    less({ output: 'dist/index.css' }),

    svgr(),
    copy({
      targets: [{ src: 'src/style/*.svg', dest: 'dist' }]
    }),
    cleanup({ extensions })
  ]
}

export default config
