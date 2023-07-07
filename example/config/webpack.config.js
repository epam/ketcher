const {
  override,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin,
} = require('customize-cra');
const webpack = require('webpack');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();
const applicationVersion = gitRevisionPlugin.version().split('-')[0];
const envVariables = {
  MODE: process.env.MODE,
  API_PATH: process.env.REACT_APP_API_PATH,
  ENABLE_POLYMER_EDITOR: !!process.env.ENABLE_POLYMER_EDITOR,
  KETCHER_ENABLE_REDUX_LOGGER: JSON.stringify(false),
};

module.exports = override(
  addBundleVisualizer({}, true),
  addWebpackModuleRule({
    test: /\.js$/,
    enforce: 'pre',
    loader: 'source-map-loader',
    exclude: /node_modules/,
  }),
  addWebpackPlugin(new webpack.EnvironmentPlugin(envVariables)),
  addWebpackPlugin(
    new HtmlReplaceWebpackPlugin([
      {
        pattern: '@@version',
        replacement: applicationVersion,
      },
    ])
  )
);

module.exports.envVariables = envVariables;
