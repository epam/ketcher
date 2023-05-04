import replace from '@rollup/plugin-replace'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { createLogger, defineConfig, loadEnv } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import vitePluginRaw from 'vite-plugin-raw'
import svgr from 'vite-plugin-svgr'
import ketcherCoreTSConfig from '../packages/ketcher-core/tsconfig.json'
import { valuesToReplace as polymerEditorValues } from '../packages/ketcher-polymer-editor-react/rollup.config'
import polymerEditorTSConfig from '../packages/ketcher-polymer-editor-react/tsconfig.json'
import { valuesToReplace as ketcherReactValues } from '../packages/ketcher-react/rollup.config'
import ketcherReactTSConfig from '../packages/ketcher-react/tsconfig.json'
import ketcherStandaloneTSConfig from '../packages/ketcher-standalone/tsconfig.json'
import { envVariables as exampleEnv } from './config/webpack.config'

const dotEnv = loadEnv('development', '.', '')
Object.assign(process.env, dotEnv, exampleEnv)

/**
 * To resolve alias in the range of the specific package,
 * notice that it can't be an arrow function,
 * see: https://github.com/rollup/plugins/blob/master/packages/alias/src/index.ts
 */
function resolver(source, importer, options) {
  const packageName = importer.match(/packages\/(.*?)\//)[1]
  const updatedId = source.replace('%packageName%', packageName)

  return this.resolve(
    updatedId,
    importer,
    Object.assign({ skipSelf: true }, options)
  ).then((resolved) => resolved || { id: updatedId })
}

const getTSConfigByPackage = (packageName) => {
  return {
    'ketcher-core': ketcherCoreTSConfig,
    'ketcher-polymer-editor-react': polymerEditorTSConfig,
    'ketcher-react': ketcherReactTSConfig,
    'ketcher-standalone': ketcherStandaloneTSConfig
  }[packageName]
}

const getAliasesByPackage = (packageName) => {
  const aliases = getTSConfigByPackage(packageName).compilerOptions.paths || []
  return Object.keys(aliases).map((alias) => {
    const find = alias.replace('/*', '')
    return {
      find,
      replacement: resolve(__dirname, `../packages/%packageName%/src/${find}`),
      customResolver: resolver
    }
  })
}

const HtmlReplaceVitePlugin = () => {
  return {
    name: 'ketcher-html-transform',
    transformIndexHtml(html) {
      return html
        .replaceAll('%PUBLIC_URL%/', process.env.PUBLIC_URL)
        .replaceAll(
          '@@version',
          JSON.parse(ketcherReactValues['process.env.HELP_LINK']).split(
            '-'
          )[0] + ' (Vite)'
        )
    }
  }
}

const logger = createLogger()
const loggerWarn = logger.warn
logger.warn = (msg, options) => {
  if (
    // This warning occurs when entry html is not at the root path
    msg.includes('files in the public directory are served at the root path.')
  ) {
    return
  }
  loggerWarn(msg, options)
}

export default defineConfig({
  server: {
    open: true
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        // doc: https://vitejs.dev/guide/features.html#usedefineforclassfields
        useDefineForClassFields: false
      }
    }
  },
  css: {
    devSourcemap: true
  },
  plugins: [
    react(),
    svgr({
      exportAsDefault: true
    }),
    vitePluginRaw({
      match: /\.sdf/
    }),
    replace({
      include: '**/ketcher-react/src/**',
      preventAssignment: true,
      values: ketcherReactValues
    }),
    replace({
      include: '**/ketcher-polymer-editor-react/src/**',
      preventAssignment: true,
      values: polymerEditorValues
    }),
    replace({
      include: '**/example/src/**',
      preventAssignment: true,
      values: {
        require: 'await import'
      }
    }),
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
            children: 'var global = global || window'
          }
        ]
      }
    }),
    HtmlReplaceVitePlugin()
  ],
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: [
      {
        // HACK: to ignore dist/index.css, you can set any file as replacement
        find: 'ketcher-react/dist/index.css',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-react/src/index.less'
        )
      },
      {
        find: 'ketcher-react',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-react/src/index.tsx'
        )
      },
      {
        find: 'ketcher-core',
        replacement: resolve(__dirname, '../packages/ketcher-core/src/index.ts')
      },
      {
        find: 'ketcher-standalone',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-standalone/src/index.ts'
        )
      },
      {
        find: 'ketcher-polymer-editor-react',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/index.tsx'
        )
      },

      /** Get aliases from packages' tsconfig.json */
      ...getAliasesByPackage('ketcher-core'),
      ...getAliasesByPackage('ketcher-react'),
      ...getAliasesByPackage('ketcher-polymer-editor-react'),
      ...getAliasesByPackage('ketcher-standalone'),
      {
        find: 'src', // every package has this implicit alias
        replacement: resolve(__dirname, `../packages/%packageName%/src`),
        customResolver: resolver
      },

      /** Web worker in ketcher-standalone */
      {
        find: 'web-worker:./indigoWorker',
        replacement: './indigoWorker?worker'
      }
    ]
  },
  customLogger: logger
})
