import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'path';
import { createLogger, defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginRaw from 'vite-plugin-raw';
import svgr from 'vite-plugin-svgr';
import ketcherCoreTSConfig from '../packages/ketcher-core/tsconfig.json';
import { valuesToReplace as polymerEditorValues } from '../packages/ketcher-macromolecules/rollup.config.mjs';
import polymerEditorTSConfig from '../packages/ketcher-macromolecules/tsconfig.json';
import { valuesToReplace as ketcherReactValues } from '../packages/ketcher-react/rollup.config.mjs';
import ketcherReactTSConfig from '../packages/ketcher-react/tsconfig.json';
import ketcherStandaloneTSConfig from '../packages/ketcher-standalone/tsconfig.json';
import { envVariables as exampleEnv } from './config/webpack.config';
import { INDIGO_WORKER_IMPORTS } from '../packages/ketcher-standalone/rollup.config.mjs';

const dotEnv = loadEnv(process.env.NODE_ENV || 'development', __dirname, '');
Object.assign(process.env, dotEnv, exampleEnv, {
  MODE: process.env.MODE || exampleEnv.MODE || 'standalone',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PUBLIC_URL: process.env.PUBLIC_URL || '',
  REACT_APP_API_PATH:
    process.env.REACT_APP_API_PATH || exampleEnv.API_PATH || '',
});

const PACKAGE_DIRECTORIES = {
  'ketcher-core': resolve(__dirname, '../packages/ketcher-core'),
  'ketcher-macromolecules': resolve(
    __dirname,
    '../packages/ketcher-macromolecules',
  ),
  'ketcher-react': resolve(__dirname, '../packages/ketcher-react'),
  'ketcher-standalone': resolve(__dirname, '../packages/ketcher-standalone'),
};

const PACKAGE_TS_CONFIGS = {
  'ketcher-core': ketcherCoreTSConfig,
  'ketcher-macromolecules': polymerEditorTSConfig,
  'ketcher-react': ketcherReactTSConfig,
  'ketcher-standalone': ketcherStandaloneTSConfig,
};

const PACKAGE_TS_PATHS = Object.fromEntries(
  Object.entries(PACKAGE_TS_CONFIGS).map(([packageName, tsConfig]) => {
    const paths = Object.entries(tsConfig.compilerOptions.paths || {}).map(
      ([pattern, replacements]) => ({
        find: pattern.replace(/\/\*$/, ''),
        hasWildcard: pattern.endsWith('/*'),
        replacements: replacements.map((replacement) => ({
          value: replacement.replace(/\/\*$/, ''),
          hasWildcard: replacement.endsWith('/*'),
        })),
      }),
    );

    return [packageName, paths];
  }),
);

const getImporterPackageName = (importer) => {
  return importer?.match(/packages[\\/](.*?)(?:[\\/]|$)/)?.[1];
};

const resolvePackageAlias = (source, importer) => {
  if (!importer || source.startsWith('.') || source.startsWith('\0')) {
    return null;
  }

  const packageName = getImporterPackageName(importer);

  if (!packageName) {
    return null;
  }

  const packageDirectory = PACKAGE_DIRECTORIES[packageName];

  if (source === 'src' || source.startsWith('src/')) {
    return resolve(packageDirectory, source);
  }

  const aliases = PACKAGE_TS_PATHS[packageName] || [];

  for (const alias of aliases) {
    const matches = alias.hasWildcard
      ? source.startsWith(`${alias.find}/`)
      : source === alias.find;

    if (!matches) {
      continue;
    }

    const suffix = alias.hasWildcard ? source.slice(alias.find.length + 1) : '';
    const replacement = alias.replacements[0];

    if (!replacement) {
      return null;
    }

    const replacementPath =
      replacement.hasWildcard && suffix
        ? `${replacement.value}/${suffix}`
        : replacement.value;

    return resolve(packageDirectory, replacementPath);
  }

  return null;
};

const PackageScopedAliasesPlugin = () => {
  return {
    name: 'ketcher-package-scoped-aliases',
    async resolveId(source, importer, options) {
      const updatedId = resolvePackageAlias(source, importer);

      if (!updatedId) {
        return null;
      }

      const resolved = await this.resolve(updatedId, importer, {
        skipSelf: true,
        ...options,
      });

      return resolved || { id: updatedId };
    },
  };
};

const getDefineValue = (value) => {
  return value === undefined ? 'undefined' : JSON.stringify(value);
};

const PROCESS_ENV_DEFINE_KEYS = [
  'API_PATH',
  'KETCHER_ENABLE_REDUX_LOGGER',
  'MODE',
  'NODE_ENV',
  'PUBLIC_URL',
  'REACT_APP_API_PATH',
  'SEPARATE_INDIGO_RENDER',
];

const normalizePathForRollup = (id) => id.replaceAll('\\', '/');

const MAX_JS_CHUNK_SIZE_BYTES = 450 * 1024;

const isReactVendorModule = (normalizedId) => {
  if (normalizedId.includes('/packages/ketcher-react/')) {
    return false;
  }

  return [
    '/node_modules/react/',
    '/node_modules/react-dom/',
    '/node_modules/react-router/',
    '/node_modules/react-router-dom/',
    '/node_modules/scheduler/',
    '/node_modules/react-contexify/',
    '/node_modules/react-dropzone/',
    'react-dom/',
    'react-dom/client',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'scheduler/',
  ].some((reactModuleIdPart) => normalizedId.includes(reactModuleIdPart));
};

const getChunkName = (id) => {
  const normalizedId = normalizePathForRollup(id);

  if (normalizedId.endsWith('/application/editor/data/monomers.ket')) {
    return 'data-monomers';
  }

  if (isReactVendorModule(normalizedId)) {
    return 'vendor-react';
  }

  if (!normalizedId.includes('/node_modules/')) {
    if (normalizedId.includes('/packages/ketcher-core/')) {
      if (
        normalizedId.includes('/application/formatters/') ||
        normalizedId.includes('/domain/services/struct/structService.types')
      ) {
        return 'ketcher-core-formatters';
      }

      if (normalizedId.includes('/domain/serializers/')) {
        return 'ketcher-core-serializers';
      }

      if (normalizedId.includes('/application/render/')) {
        return 'ketcher-core-render';
      }

      if (normalizedId.includes('/application/editor/')) {
        return 'ketcher-core-editor';
      }

      if (normalizedId.includes('/domain/entities/')) {
        return 'ketcher-core-entities';
      }

      if (normalizedId.includes('/domain/')) {
        return 'ketcher-core-domain';
      }

      if (normalizedId.includes('/utilities/')) {
        return 'ketcher-core-utilities';
      }

      return 'ketcher-core';
    }

    if (normalizedId.includes('/packages/ketcher-react/')) {
      if (normalizedId.endsWith('/src/templates/library.sdf')) {
        return 'ketcher-react-templates';
      }

      if (normalizedId.includes('/src/assets/icons/')) {
        return 'ketcher-react-icons';
      }

      if (normalizedId.includes('/src/script/ui/views/modal/')) {
        return 'ketcher-react-modals';
      }

      if (normalizedId.includes('/src/script/ui/views/toolbars/')) {
        return 'ketcher-react-toolbars';
      }

      if (normalizedId.includes('/src/script/editor/tool/')) {
        return 'ketcher-react-tools';
      }

      if (normalizedId.includes('/src/script/ui/state/')) {
        return 'ketcher-react-state';
      }

      return 'ketcher-react';
    }

    if (normalizedId.includes('/packages/ketcher-macromolecules/')) {
      if (normalizedId.includes('/src/components/preview/')) {
        return 'ketcher-macromolecules-preview';
      }

      if (normalizedId.includes('/src/components/')) {
        return 'ketcher-macromolecules-components';
      }

      if (normalizedId.includes('/src/utils/')) {
        return 'ketcher-macromolecules-utils';
      }

      return 'ketcher-macromolecules';
    }

    if (normalizedId.includes('/packages/ketcher-standalone/')) {
      return 'ketcher-standalone';
    }

    return undefined;
  }

  if (normalizedId.includes('/node_modules/three/')) {
    return 'vendor-three';
  }

  if (normalizedId.includes('/node_modules/miew')) {
    return 'vendor-miew';
  }

  if (
    normalizedId.includes('/node_modules/core-js/') ||
    normalizedId.includes('/node_modules/react-app-polyfill/') ||
    normalizedId.includes('/node_modules/regenerator-runtime/')
  ) {
    return 'vendor-polyfills';
  }

  if (normalizedId.includes('/node_modules/lodash/')) {
    return 'vendor-lodash';
  }

  if (
    normalizedId.includes('/node_modules/@mui/') ||
    normalizedId.includes('/node_modules/@emotion/')
  ) {
    return 'vendor-mui';
  }

  if (normalizedId.includes('/node_modules/indigo-ketcher/')) {
    return 'vendor-indigo';
  }

  if (normalizedId.includes('/node_modules/paper/')) {
    return 'vendor-paper';
  }

  if (
    normalizedId.includes('/node_modules/raphael/') ||
    normalizedId.includes('/node_modules/svgpath/')
  ) {
    return 'vendor-svg-rendering';
  }

  if (
    normalizedId.includes('/node_modules/acorn/') ||
    normalizedId.includes('/node_modules/ajv/') ||
    normalizedId.includes('/node_modules/jsonschema/')
  ) {
    return 'vendor-parsers';
  }

  if (normalizedId.includes('/node_modules/cfb/')) {
    return 'vendor-file-formats';
  }

  if (normalizedId.includes('/node_modules/d3')) {
    return 'vendor-d3';
  }

  return 'vendor';
};

const codeSplitting = {
  minSize: 16 * 1024,
  maxSize: MAX_JS_CHUNK_SIZE_BYTES,
  groups: [
    {
      name: 'vendor-react',
      test: (id) => isReactVendorModule(normalizePathForRollup(id)),
      priority: 100,
      minSize: MAX_JS_CHUNK_SIZE_BYTES,
      maxSize: MAX_JS_CHUNK_SIZE_BYTES,
      minShareCount: 1,
      entriesAware: false,
      entriesAwareMergeThreshold: MAX_JS_CHUNK_SIZE_BYTES,
    },
    {
      name: getChunkName,
    },
  ],
};

const processEnvDefines = Object.fromEntries(
  PROCESS_ENV_DEFINE_KEYS.map((key) => [
    `process.env.${key}`,
    getDefineValue(process.env[key]),
  ]),
);

const HtmlReplaceVitePlugin = () => {
  return {
    name: 'ketcher-html-transform',
    transformIndexHtml(html) {
      const publicUrl = process.env.PUBLIC_URL || '';
      const publicUrlWithTrailingSlash = publicUrl
        ? `${publicUrl.replace(/\/$/, '')}/`
        : '';

      return html
        .replaceAll('%PUBLIC_URL%/', publicUrlWithTrailingSlash)
        .replaceAll('%PUBLIC_URL%', publicUrl)
        .replaceAll(
          '@@version',
          JSON.parse(ketcherReactValues['process.env.HELP_LINK']).split(
            '-',
          )[0] + ' (Vite)',
        );
    },
  };
};

const normalizeHtmlTransformHook = (plugin) => {
  if (!plugin || typeof plugin === 'function') {
    return plugin;
  }

  if (Array.isArray(plugin)) {
    return plugin.map(normalizeHtmlTransformHook);
  }

  const { transformIndexHtml } = plugin;

  if (
    transformIndexHtml &&
    typeof transformIndexHtml !== 'function' &&
    !transformIndexHtml.handler &&
    transformIndexHtml.transform
  ) {
    const order =
      transformIndexHtml.enforce === 'pre' ||
      transformIndexHtml.enforce === 'post'
        ? transformIndexHtml.enforce
        : undefined;

    return {
      ...plugin,
      transformIndexHtml: {
        ...(order ? { order } : {}),
        handler: transformIndexHtml.transform,
      },
    };
  }

  return plugin;
};

const globalHtmlTags = [
  {
    /**
     * HACK: https://github.com/bevacqua/dragula/issues/602#issuecomment-1109840139
     * Fix: global is not defined
     */
    injectTo: 'body',
    tag: 'script',
    children: 'var global = global || window',
  },
];

const htmlPages = [
  {
    filename: 'index.html',
    template: 'public/index.html',
    entry: '/src/index.tsx',
  },
  {
    filename: 'popup.html',
    template: 'public/popup.html',
    entry: '/src/popupIndex.tsx',
  },
  {
    filename: 'duo.html',
    template: 'public/duo.html',
    entry: '/src/duoIndex.tsx',
  },
  {
    filename: 'closable.html',
    template: 'public/closable.html',
    entry: '/src/closableIndex.tsx',
  },
].map((page) => ({
  ...page,
  injectOptions: {
    tags: globalHtmlTags,
  },
}));

const CopyServeConfigPlugin = () => {
  let outDir;

  return {
    name: 'ketcher-copy-serve-config',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(
        resolve(__dirname, 'serve.json'),
        resolve(outDir, 'serve.json'),
      );
    },
  };
};

const logger = createLogger();
const loggerWarn = logger.warn;
logger.warn = (msg, options) => {
  if (
    // This warning occurs when entry html is not at the root path
    msg
      .toLowerCase()
      .includes('files in the public directory are served at the root path.')
  ) {
    return;
  }
  loggerWarn(msg, options);
};

export default defineConfig({
  server: {
    host: '127.0.0.1',
    open: true,
  },
  assetsInclude: ['**/*.ket'],
  optimizeDeps: {
    // Vite 8 pre-bundler (rolldown) creates shared chunks between deps which causes
    // cross-chunk free-variable references for init_xxx() functions (rolldown bug).
    // Group all @emotion/* and @mui/* into one shared chunk so their init functions
    // are co-located in the same file scope.
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@emotion') || id.includes('@mui')) {
            return 'vendor-emotion-mui';
          }
        },
      },
    },
    exclude: ['@mui/material', '@mui/material/Autocomplete'],
    include: [
      '@emotion/react',
      '@emotion/react/jsx-runtime',
      '@emotion/react/jsx-dev-runtime',
      '@emotion/styled',
      '@emotion/cache',
      '@emotion/serialize',
      '@emotion/sheet',
      '@emotion/utils',
      '@emotion/weak-memoize',
      '@mui/material',
      '@mui/system',
      '@mui/system/Box',
      '@mui/system/colorManipulator',
      '@mui/system/createTheme',
      '@mui/system/createStyled',
      '@mui/system/RtlProvider',
      '@mui/system/styled',
      '@mui/system/styleFunctionSx',
      '@mui/system/useTheme',
      '@mui/system/useThemeProps',
      '@mui/system/useThemeWithoutDefault',
      '@mui/utils',
      'prop-types',
      'react-is',
    ],
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      less: {
        paths: Object.values(PACKAGE_DIRECTORIES),
      },
    },
  },
  plugins: [
    PackageScopedAliasesPlugin(),
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
      },
    }),
    vitePluginRaw({
      match: /\.sdf/,
    }),
    replace({
      include: '**/ketcher-react/src/**',
      preventAssignment: true,
      values: ketcherReactValues,
    }),
    replace({
      include: '**/ketcher-macromolecules/src/**',
      preventAssignment: true,
      values: polymerEditorValues,
    }),
    normalizeHtmlTransformHook(
      createHtmlPlugin({
        pages: htmlPages,
      }),
    ),
    HtmlReplaceVitePlugin(),
    CopyServeConfigPlugin(),
  ],
  define: {
    ...processEnvDefines,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-is'],
    alias: [
      {
        // HACK: to ignore dist/index.css, you can set any file as replacement
        find: 'ketcher-react/dist/index.css',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-react/src/index.less',
        ),
      },
      {
        find: 'ketcher-react',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-react/src/index.tsx',
        ),
      },
      {
        find: 'ketcher-core',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-core/src/index.ts',
        ),
      },
      {
        find: 'ketcher-standalone',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-standalone/src/index.ts',
        ),
      },
      {
        find: 'ketcher-macromolecules',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-macromolecules/src/index.tsx',
        ),
      },
      {
        find: 'miew-react',
        replacement: resolve(__dirname, 'src/vite/MiewReactRuntime.jsx'),
      },

      /** Web worker in ketcher-standalone */
      {
        find: 'web-worker:./../indigoWorker',
        replacement: './../indigoWorker?worker',
      },
      {
        find: '_indigo-ketcher-import-alias_',
        replacement: 'indigo-ketcher',
      },
      {
        find: '_indigo-worker-import-alias_',
        replacement: INDIGO_WORKER_IMPORTS.WASM_LOADER,
      },
    ],
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rolldownOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        strictExecutionOrder: true,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'static/css/[name]-[hash][extname]';
          }

          return 'static/media/[name]-[hash][extname]';
        },
        codeSplitting,
      },
    },
  },
  customLogger: logger,
  tsconfig: './tsconfig.json',
});
