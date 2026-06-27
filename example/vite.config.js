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
import commonjs from 'vite-plugin-commonjs';

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

const manualChunks = (id) => {
  const normalizedId = normalizePathForRollup(id);

  if (normalizedId.endsWith('/application/editor/data/monomers.ket')) {
    return 'data-monomers';
  }

  if (!normalizedId.includes('/node_modules/')) {
    if (normalizedId.includes('/packages/ketcher-core/')) {
      return 'ketcher-core';
    }

    if (normalizedId.includes('/packages/ketcher-react/')) {
      return 'ketcher-react';
    }

    if (normalizedId.includes('/packages/ketcher-macromolecules/')) {
      return 'ketcher-macromolecules';
    }

    if (normalizedId.includes('/packages/ketcher-standalone/')) {
      return 'ketcher-standalone';
    }

    return undefined;
  }

  if (
    normalizedId.includes('/node_modules/react/') ||
    normalizedId.includes('/node_modules/react-dom/') ||
    normalizedId.includes('/node_modules/react-router/') ||
    normalizedId.includes('/node_modules/react-router-dom/')
  ) {
    return 'vendor-react';
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

  if (
    normalizedId.includes('/node_modules/d3') ||
    normalizedId.includes('/node_modules/paper/') ||
    normalizedId.includes('/node_modules/raphael/') ||
    normalizedId.includes('/node_modules/svgpath/')
  ) {
    return 'vendor-chemistry';
  }

  return 'vendor';
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
    open: true,
  },
  optimizeDeps: {
    // Vite 8 pre-bundler (rolldown) creates shared chunks between deps which causes
    // cross-chunk free-variable references for init_xxx() functions (rolldown bug).
    // Group all @emotion/* and @mui/* into one shared chunk so their init functions
    // are co-located in the same file scope.
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('/node_modules/@emotion/') ||
            id.includes('/node_modules/@mui/')
          ) {
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
      match: /\.sdf|\.ket/,
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
    commonjs(),
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
    commonjsOptions: {
      include: [/node_modules/, /packages[\\/]ketcher-core[\\/]src/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'static/css/[name]-[hash][extname]';
          }

          return 'static/media/[name]-[hash][extname]';
        },
        manualChunks,
      },
    },
  },
  customLogger: logger,
  tsconfig: './tsconfig.json',
});
