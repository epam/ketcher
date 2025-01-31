const {
  override,
  addBundleVisualizer,
  addWebpackModuleRule,
  addWebpackPlugin,
} = require('customize-cra');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();
const applicationVersion = gitRevisionPlugin.version().split('-')[0];

const envVariables = {
  MODE: process.env.MODE || 'standalone',
  API_PATH: process.env.REACT_APP_API_PATH,
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
    ]),
  ),
  addWebpackPlugin(
    new CopyPlugin({
      patterns: [
        {
          from: '../node_modules/ketcher-standalone/**/*.wasm',
          to: '[name][ext]',
        },
        {
          from: 'serve.json',
          to: '.',
        },
      ],
    }),
  ),
  (config) => {
    config.plugins = config.plugins.filter(
      (plugin) => !(plugin instanceof HtmlWebpackPlugin),
    );
    config.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'public/index.html',
        chunks: ['main'],
        inject: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: 'public/popup.html',
        chunks: ['popup'],
        inject: true,
      }),
    );
    config.entry = {
      main: './src/index.tsx',
      popup: './src/popupIndex.tsx',
    };
    return config;
  },
);

module.exports.envVariables = envVariables;
