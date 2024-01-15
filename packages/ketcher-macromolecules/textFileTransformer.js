/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

module.exports = {
  process(src, filename) {
    const fileContents = fs.readFileSync(path.resolve(filename), 'utf8');
    return `module.exports = ${JSON.stringify(fileContents)};`;
  },
};
