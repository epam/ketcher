import path from 'path';

export default {
  process(src, filename, _config, _options) {
    return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
  },
};
