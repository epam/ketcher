import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createLogger, defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import vitePluginRaw from 'vite-plugin-raw';
import svgr from 'vite-plugin-svgr';
import ketcherCoreTSConfig from '../packages/ketcher-core/tsconfig.json';
import { valuesToReplace as polymerEditorValues } from '../packages/ketcher-macromolecules/rollup.config';
import polymerEditorTSConfig from '../packages/ketcher-macromolecules/tsconfig.json';
import { valuesToReplace as ketcherReactValues } from '../packages/ketcher-react/rollup.config';
import ketcherReactTSConfig from '../packages/ketcher-react/tsconfig.json';
import ketcherStandaloneTSConfig from '../packages/ketcher-standalone/tsconfig.json';
import { envVariables as exampleEnv } from './config/webpack.config';
import { INDIGO_WORKER_IMPORTS } from '../packages/ketcher-standalone/rollup.config';
import commonjs from 'vite-plugin-commonjs';

const dotEnv = loadEnv('development', '.', '');
Object.assign(process.env, dotEnv, exampleEnv);

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
      return html
        .replaceAll('%PUBLIC_URL%/', process.env.PUBLIC_URL)
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
    replace({
      include: '**/example/src/**',
      preventAssignment: true,
      values: {
        require: 'await import',
      },
    }),
    replace({
      include: '**/ketcher-core/src/**',
      preventAssignment: true,
      values: {
        require: 'await import',
      },
    }),
    normalizeHtmlTransformHook(
      createHtmlPlugin({
        entry: '/src/index.tsx',
        template: 'public/index.html',
        inject: {
          tags: [
            {
              /**
               * HACK: https://github.com/bevacqua/dragula/issues/602#issuecomment-1109840139
               * Fix: global is not defined
               */
              injectTo: 'body',
              tag: 'script',
              children: 'var global = global || window',
            },
          ],
        },
      }),
    ),
    HtmlReplaceVitePlugin(),
    commonjs(),
  ],
  define: {
    ...processEnvDefines,
  },
  resolve: {
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
  customLogger: logger,
  tsconfig: './tsconfig.json',
});
