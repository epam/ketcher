const {
  override: overideFn,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin
} = require('customize-cra')
const webpack = require('webpack')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");


const gitRevisionPlugin = new GitRevisionPlugin({ lightweightTags: true })

const configFn = overideFn(
    addBundleVisualizer({}, true),
    addWebpackModuleRule({
        test: /\.wasm$/,
        type: "javascript/auto",
        loader: "file-loader",
        options: {
            publicPath: "dist/"
        }
    }),
    addWebpackModuleRule({
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: /node_modules/
    }),
    addWebpackPlugin(
        new webpack.EnvironmentPlugin({
            MODE: process.env.MODE,
            API_PATH: process.env.REACT_APP_API_PATH,
            ENABLE_POLYMER_EDITOR: !!process.env.ENABLE_POLYMER_EDITOR
        })
    ),
    addWebpackPlugin(
        new CopyPlugin({
            patterns: [
                {from: '../node_modules/indigo-ketcher/indigo-ketcher.wasm', to: 'static/js'}
            ]
        })
    ),

    addWebpackPlugin(
        new HtmlReplaceWebpackPlugin([
            {
                pattern: '@@version',
                replacement: gitRevisionPlugin.version()
            }
        ])
    )
)

module.exports = function override(config) {
    config = configFn(config)

    return {
        ...config,
        experiments: {
            asyncWebAssembly: true,
            syncWebAssembly: true,
            topLevelAwait: true,
        },
    }
}
