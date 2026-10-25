import path from 'node:path';

export default {
  process(source, filename) {
    const customComponentName = 'icon-' + path.basename(filename);
    return { code: `module.exports = ${JSON.stringify(customComponentName)};` };
  },
};
