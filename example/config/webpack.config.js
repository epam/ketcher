const {
  override,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin
} = require('customize-cra')
const config = require('../../package.json')
const webpack = require('webpack')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')

function getBuildNumber() {
  let buildNumber = 0
  try {
    const gitRevisionPlugin = new GitRevisionPlugin({
      commithashCommand: `rev-list v${config.version}..HEAD --count`
    })
    buildNumber = gitRevisionPlugin.commithash()
  } catch {}

  return buildNumber
}

const buildNumber = getBuildNumber()

module.exports = override(
  addBundleVisualizer({}, true),
  addWebpackModuleRule({
    test: /\.js$/,
    enforce: 'pre',
    loader: 'source-map-loader',
    exclude: /node_modules/
  }),
  addWebpackPlugin(
    new webpack.EnvironmentPlugin({
      MODE: process.env.MODE
    })
  ),
  addWebpackPlugin(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@version',
        replacement:
          'v' + config.version + (buildNumber > 0 ? `+${buildNumber}` : '')
      }
    ])
  )
)
