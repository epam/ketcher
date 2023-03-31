import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import { svgPlugin } from 'vite-plugin-fast-react-svg'
import vitePluginRaw from 'vite-plugin-raw'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ketcherReactPackageJSON from '../packages/ketcher-react/package.json'

const env = loadEnv('development', '.', '')

const getTagName = () => {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' })
  } catch (error) {
    console.error(error)
    return 'master'
  }
}

export default defineConfig({
  resolve: {
    alias: [
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
        replacement: resolve(__dirname, '../packages/ketcher-react/src')
      },

      /** Alias in ketcher-core */
      {
        find: 'domain',
        replacement: resolve(__dirname, '../packages/ketcher-core/src/domain')
      },
      {
        find: 'application',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-core/src/application'
        )
      },
      {
        find: 'infrastructure',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-core/src/infrastructure'
        )
      },
      {
        find: 'utilities',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-core/src/utilities'
        )
      },

      /** Alias in ketcher-polymer-editor-react */
      {
        find: 'components',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/components'
        )
      },
      {
        find: 'state',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/state'
        )
      },
      {
        find: 'hooks',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/hooks'
        )
      },
      {
        find: 'assets',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/assets'
        )
      },
      {
        find: 'theming',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/theming'
        )
      },
      {
        find: 'helpers',
        replacement: resolve(
          __dirname,
          '../packages/ketcher-polymer-editor-react/src/helpers'
        )
      },

      /** Web worker in ketcher-standalone */
      {
        find: 'web-worker:./indigoWorker',
        replacement: './indigoWorker?worker'
      }
    ]
  },
  server: {
    open: true
  },
  plugins: [
    react(),
    svgPlugin(),
    vitePluginRaw({
      match: /\.sdf/
    })

    // FIXME: https://github.com/vitejs/vite/issues/3033#issuecomment-1360691044
  ],
  define: {
    'process.env': process.env,
    global: {},

    /** The same as in example/.env */
    'process.env.SKIP_PREFLIGHT_CHECK': env.SKIP_PREFLIGHT_CHECK,
    'process.env.API_PATH': JSON.stringify(env.REACT_APP_API_PATH),
    'process.env.PUBLIC_URL': JSON.stringify(env.PUBLIC_URL),
    'process.env.GENERATE_SOURCEMAP': env.GENERATE_SOURCEMAP,
    'process.env.ENABLE_POLYMER_EDITOR': env.ENABLE_POLYMER_EDITOR,
    'process.env.KETCHER_ENABLE_REDUX_LOGGER': env.KETCHER_ENABLE_REDUX_LOGGER,

    /** The same as in ketcher-react/rollup.config.js */
    'process.env.VERSION': JSON.stringify(ketcherReactPackageJSON.version),
    'process.env.BUILD_DATE': JSON.stringify(
      new Date().toISOString().slice(0, 19)
    ),
    'process.env.BUILD_NUMBER': JSON.stringify(undefined),
    'process.env.HELP_LINK': JSON.stringify(getTagName())
  }
})
