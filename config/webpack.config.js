const {
  override,
  addLessLoader,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin
} = require('customize-cra')

const path = require('path')
const webpack = require('webpack')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin({
  commithashCommand:
    'rev-list ' + require('./../package.json').version + '..HEAD --count'
})

module.exports = override(
  addLessLoader(),
  addBundleVisualizer({}, true),
  addWebpackModuleRule({
    test: /\.svg$/,
    loader: 'svg-sprite-loader',
    options: {
      symbolId: filePath =>
        `icon-${path.basename(filePath).replace(/\.[^/.]+$/, '')}`,
      extract: true,
      publicPath: '/static/',
      spriteFilename: 'icons.svg'
    }
  }),
  addWebpackPlugin(new SpriteLoaderPlugin()),
  addWebpackPlugin(gitRevisionPlugin),
  addWebpackPlugin(
    new webpack.EnvironmentPlugin({
      BUILD_DATE: new Date().toISOString().slice(0, 19),
      BUILD_NUMBER: gitRevisionPlugin.commithash()
    })
  )
)
