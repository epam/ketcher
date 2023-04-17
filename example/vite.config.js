import replace from '@rollup/plugin-replace'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
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
    })
  ],
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: [
      {
        find: 'ketcher-react/dist/index.css',
        customResolver: () => null
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
  }
})
