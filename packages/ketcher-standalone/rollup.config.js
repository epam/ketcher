import babel from '@rollup/plugin-babel';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import typescript from 'rollup-plugin-typescript2';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import copy from 'rollup-plugin-copy';
import alias from '@rollup/plugin-alias';
import { license } from '../../license.ts';
import replace from '@rollup/plugin-replace';
import OMT from '@surma/rollup-plugin-off-main-thread';

const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

const extensions = ['.js', '.ts'];
const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const includePattern = 'src/**/*';
export const INDIGO_WORKER_IMPORTS = {
  WASM_LOADER: './indigoWorkerImports/useWasmLoader',
  OFF_MAIN_THREAD_PLUGIN: './indigoWorkerImports/useOffMainThreadPlugin',
};
const configureWebWorkerLoader = () => {
  return webWorkerLoader({
    extensions,
    sourcemap: false,
    targetPlatform: 'browser',
    external: ['@babel/runtime'],
  });
};
const replaceIndigoAlias = (replacement) => {
  return alias({
    entries: [
      {
        find: '_indigo-ketcher-import-alias_',
        replacement,
      },
    ],
  });
};
const useIndigoWorkerImport = (importToUse) => {
  return alias({
    entries: [
      {
        find: '_indigo-worker-import-alias_',
        replacement: importToUse,
      },
    ],
  });
};

const baseConfig = {
  input: {
    index: 'src/index.ts',
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
  ],
};

const configWithWasmBase64 = {
  ...baseConfig,
  output: [
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
    replaceIndigoAlias('indigo-ketcher'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.WASM_LOADER),
    OMT(),
  ],
};

const configWithWasmBase64Cjs = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/cjs',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    replaceIndigoAlias('indigo-ketcher'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.WASM_LOADER),
    configureWebWorkerLoader(),
  ],
};

const configWithWasmFetch = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/binaryWasm',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    replaceIndigoAlias('indigo-ketcher/binaryWasm'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.OFF_MAIN_THREAD_PLUGIN),
    copy({
      targets: [
        {
          src: '../../node_modules/indigo-ketcher/*.wasm',
          dest: 'dist/binaryWasm',
        },
      ],
    }),
    OMT(),
  ],
};

const configBase64WithoutRender = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/jsNoRender',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    replaceIndigoAlias('indigo-ketcher/jsNoRender'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.WASM_LOADER),
    OMT(),
  ],
};

const configBase64WithoutRenderCjs = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/cjs/jsNoRender',
      exports: 'named',
      format: 'cjs',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    replaceIndigoAlias('indigo-ketcher/jsNoRender'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.WASM_LOADER),
    configureWebWorkerLoader(),
  ],
};

const configWithWasmWithoutRender = {
  ...baseConfig,
  output: [
    {
      dir: 'dist/binaryWasmNoRender',
      exports: 'named',
      format: 'esm',
      banner: license,
    },
  ],
  plugins: [
    ...baseConfig.plugins,
    replaceIndigoAlias('indigo-ketcher/binaryWasmNoRender'),
    useIndigoWorkerImport(INDIGO_WORKER_IMPORTS.OFF_MAIN_THREAD_PLUGIN),
    copy({
      targets: [
        {
          src: '../../node_modules/indigo-ketcher/*.wasm',
          dest: 'dist/binaryWasmNoRender',
        },
      ],
    }),
    OMT(),
  ],
};

const modulesMap = {
  base64: configWithWasmBase64,
  base64Cjs: configWithWasmBase64Cjs,
  wasm: configWithWasmFetch,
  base64WithoutRender: configBase64WithoutRender,
  base64WithoutRenderCjs: configBase64WithoutRenderCjs,
  wasmWithoutRender: configWithWasmWithoutRender,
};

export default modulesMap[process.env.INDIGO_MODULE_NAME] || modulesMap.base64;
