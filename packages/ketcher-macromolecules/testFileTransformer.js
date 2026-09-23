import path from 'path';

export default {
  process(src, filename) {
    const customComponentName = 'icon-' + path.basename(filename);
    return { code: `module.exports = ${JSON.stringify(customComponentName)};` };
  },
};
