/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  process(src, filename) {
    const customComponentName = 'icon-' + path.basename(filename)
    return `module.exports = ${JSON.stringify(customComponentName)};`
  }
}
