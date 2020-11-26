const {
  override,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin
} = require('customize-cra')
const config = require('../../package.json')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin({
  commithashCommand: 'rev-list ' + config.version + '..HEAD --count'
})

const buildNumber = gitRevisionPlugin.commithash()
module.exports = override(
  addBundleVisualizer({}, true),
  addWebpackModuleRule({
    test: /\.js$/,
    enforce: 'pre',
    loader: 'source-map-loader',
    exclude: /node_modules/
  }),
  addWebpackPlugin(gitRevisionPlugin),
  addWebpackPlugin(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@version',
        replacement: config.version + (buildNumber > 0 ? `+${buildNumber}` : '')
      }
    ])
  )
)
