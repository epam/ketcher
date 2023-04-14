import replace from '@rollup/plugin-replace'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import vitePluginRaw from 'vite-plugin-raw'
import ketcherReactTSConfig from '../packages/ketcher-core/tsconfig.json'
import { valuesToReplace as polymerEditorValues } from '../packages/ketcher-polymer-editor-react/rollup.config'
import polymerEditorTSConfig from '../packages/ketcher-polymer-editor-react/tsconfig.json'
import { valuesToReplace as ketcherReactValues } from '../packages/ketcher-react/rollup.config'
import { envVariables as exampleEnv } from './config/webpack.config'

const dotEnv = loadEnv('development', '.', '')
Object.assign(process.env, dotEnv, exampleEnv)

/**
 * To resolve alias in the range of the specific package,
 * see: https://github.com/rollup/plugins/blob/master/packages/alias/src/index.ts
 */
const resolver = (packageName) => {
  return function (source, importer, options) {
    if (!source.includes(packageName)) {
      return null
    }
    return this.resolve(
      source,
      importer,
      Object.assign({ skipSelf: true }, options)
    ).then((resolved) => resolved || { id: source })
  }
}

const getTSConfig = (packageName) => {
  return {
    'ketcher-core': ketcherReactTSConfig,
    'ketcher-polymer-editor-react': polymerEditorTSConfig
  }[packageName]
}

const getPackageAliases = (packageName) => {
  const aliases = getTSConfig(packageName).compilerOptions.paths
  return Object.keys(aliases).map((alias) => {
    const find = alias.replace('/*', '')
    return {
      find,
      replacement: resolve(__dirname, `../packages/${packageName}/src/${find}`),
      customResolver: resolver(packageName)
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

      /** Alias in ketcher-react */
      {
        find: 'src',
        replacement: resolve(__dirname, '../packages/ketcher-react/src'),
        customResolver: resolver('ketcher-react')
      },

      /** Aliases in packages/ketcher-core/tsconfig.json */
      ...getPackageAliases('ketcher-core'),

      /** Aliases in packages/ketcher-polymer-editor-react/tsconfig.json */
      ...getPackageAliases('ketcher-polymer-editor-react'),

      /** Web worker in ketcher-standalone */
      {
        find: 'web-worker:./indigoWorker',
        replacement: './indigoWorker?worker'
      }
    ]
  }
})
