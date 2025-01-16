import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import alias from '@rollup/plugin-alias';
import { license } from '../../license.ts';
import replace from '@rollup/plugin-replace';
import wasm from '@rollup/plugin-wasm';
import url from '@rollup/plugin-url';

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.ts'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

const baseConfig = {
  input: {
    index: 'src/index.ts',
    indigoWorker: 'src/infrastructure/services/struct/indigoWorker.ts',
  },
  external: ['ketcher-core', /@babel\/runtime/],
  plugins: [
    nodePolyfills(),
    resolve({ extensions }),
    commonjs(),
    typescript(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: includePattern,
    }),
    cleanup({
      extensions: extensions.map((ext) => ext.trimStart('.')),
      include: includePattern,
      comments: 'none',
    }),
    replace({
      'process.env.SEPARATE_INDIGO_RENDER': process.env.SEPARATE_INDIGO_RENDER,
    }),
    ...(isProduction ? [strip({ include: includePattern })] : []),
    wasm(),
  ],
};

const configWithWasmBase64 = {
  ...baseConfig,
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
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    del({
      targets: 'dist/*',
      runOnce: true,
    }),
    ...baseConfig.plugins,
    alias({
      entries: [
        {
          find: '_indigo-ketcher-import-alias_',
          replacement: 'indigo-ketcher',
        },
      ],
    }),
  ],
};

const configWithWasmFetch = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/cjs/binaryWasm',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      dir: 'dist/binaryWasm',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    alias({
      entries: [
        {
          find: '_indigo-ketcher-import-alias_',
          replacement: 'indigo-ketcher/binaryWasm',
        },
      ],
    }),
  ],
};

const configBase64WithoutRender = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/cjs/jsNoRender',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      dir: 'dist/jsNoRender',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    alias({
      entries: [
        {
          find: '_indigo-ketcher-import-alias_',
          replacement: 'indigo-ketcher/jsNoRender',
        },
      ],
    }),
  ],
};

const configWithWasmWithoutRender = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/cjs/binaryWasmNoRender',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      dir: 'dist/binaryWasmNoRender',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    alias({
      entries: [
        {
          find: '_indigo-ketcher-import-alias_',
          replacement: 'indigo-ketcher/binaryWasmNoRender',
        },
      ],
    }),
  ],
};

const modulesMap = {
  base64: configWithWasmBase64,
  wasm: configWithWasmFetch,
  base64WithoutRender: configBase64WithoutRender,
  wasmWithoutRender: configWithWasmWithoutRender,
};

export default modulesMap[process.env.INDIGO_MODULE_NAME] || modulesMap.base64;
