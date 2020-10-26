const {
  override,
  addLessLoader,
  addBundleVisualizer
} = require('customize-cra')

module.exports = override(addLessLoader(), addBundleVisualizer({}, true))
