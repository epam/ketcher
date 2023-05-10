const {
  override,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin
} = require('customize-cra')
const path = require('path')
const webpack = require('webpack')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()
const applicationVersion = gitRevisionPlugin.version().split('-')[0]
const envVariables = {
  MODE: process.env.MODE,
  API_PATH: process.env.REACT_APP_API_PATH,
  ENABLE_POLYMER_EDITOR: !!process.env.ENABLE_POLYMER_EDITOR,
  KETCHER_ENABLE_REDUX_LOGGER: JSON.stringify(false)
}

const wasmExtensionRegExp = /\.wasm$/

console.log(
  path.resolve(
    path.join(__dirname, '../..'),
    'node_modules/indigo-ketcher/indigo-ketcher.wasm'
  )
)

function addWasmSupport(config) {
  console.log('executed!', config)
  const wasmExtensionRegExp = /\.wasm$/

  config.resolve.extensions.push('.wasm')

  config.module.rules.forEach((rule) => {
    ;(rule.oneOf || []).forEach((oneOf) => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp)
      }
    })
  })

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    type: 'javascript/auto',
    include: path.resolve(
      path.join(__dirname, '../..'),
      'node_modules/indigo-ketcher/indigo-ketcher.wasm'
    ),
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {}
      }
    ]
  })

  return config
}

module.exports = override(
  addBundleVisualizer({}, true),
  addWebpackModuleRule({
    test: /\.js$/,
    enforce: 'pre',
    loader: 'source-map-loader',
    exclude: /node_modules/
  }),
  // addWebpackModuleRule({
  //   test: wasmExtensionRegExp,
  //   include: path.resolve(path.join(__dirname, '../..'), 'node_modules'),
  //   type: 'webassembly/experimental',
  // }),
  addWebpackPlugin(new webpack.EnvironmentPlugin(envVariables)),
  addWebpackPlugin(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@version',
        replacement: applicationVersion
      }
    ])
  )
  // addWasmSupport,
  // addWebpackPlugin(
  //   new CopyWebpackPlugin({
  //     patterns: [
  //       {
  //         from: path.resolve(
  //           path.join(__dirname, '../..'),
  //           'node_modules/indigo-ketcher/indigo-ketcher.wasm'
  //         ),
  //         to: 'static/js'
  //       }
  //     ]
  //   })
  // )
)

module.exports.envVariables = envVariables
