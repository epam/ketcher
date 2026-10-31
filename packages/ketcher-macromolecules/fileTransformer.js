import path from 'node:path';

export default {
  process(source, filename, _config, _options) {
    return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';';
  },
};
