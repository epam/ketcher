const {
  override,
  addBundleVisualizer,
  addWebpackPlugin
} = require('customize-cra')
const config = require('../../package.json')
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin({
  commithashCommand: 'rev-list ' + config.version + '..HEAD --count'
})

module.exports = override(
  addBundleVisualizer({}, true),
  addWebpackPlugin(gitRevisionPlugin),
  addWebpackPlugin(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@version',
        replacement: gitRevisionPlugin.commithash()
      }
    ])
  )
)
