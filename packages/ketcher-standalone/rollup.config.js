import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import typescript from 'rollup-plugin-typescript2';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import copy from 'rollup-plugin-copy';
import alias from '@rollup/plugin-alias';
import { license } from '../../license.ts';
import replace from '@rollup/plugin-replace';

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.ts'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';

const baseConfig = {
  input: pkg.source,
  external: ['ketcher-core', /@babel\/runtime/],
  plugins: [
    nodePolyfills(),
    resolve({ extensions }),
    commonjs(),
    webWorkerLoader({
      extensions,
      sourcemap: false,
      targetPlatform: 'browser',
      external: ['@babel/runtime'],
    }),
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
  ],
};

const configWithWasmBase64 = {
  ...baseConfig,
  output: [
    {
      file: pkg.exports['.'].require,
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      file: pkg.exports['.'].import,
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
      file: pkg.exports['./dist/binaryWasm'].require,
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      file: pkg.exports['./dist/binaryWasm'].import,
      exports: 'named',
      format: 'es',
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
    copy({
      targets: [
        {
          src: '../../node_modules/indigo-ketcher/*.wasm',
          dest: 'dist/binaryWasm',
        },
      ],
    }),
  ],
};

const configBase64WithoutRender = {
  ...baseConfig,
  output: [
    {
      file: pkg.exports['./dist/jsNoRender'].require,
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      file: pkg.exports['./dist/jsNoRender'].import,
      exports: 'named',
      format: 'es',
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
      file: pkg.exports['./dist/binaryWasmNoRender'].require,
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
    {
      file: pkg.exports['./dist/binaryWasmNoRender'].import,
      exports: 'named',
      format: 'es',
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
    copy({
      targets: [
        {
          src: '../../node_modules/indigo-ketcher/*.wasm',
          dest: 'dist/binaryWasmNoRender',
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
