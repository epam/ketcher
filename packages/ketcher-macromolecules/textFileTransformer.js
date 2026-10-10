import path from 'node:path';
import fs from 'node:fs';

export default {
  process(src, filename) {
    const fileContents = fs.readFileSync(path.resolve(filename), 'utf8');
    return { code: `module.exports = ${JSON.stringify(fileContents)};` };
  },
};
