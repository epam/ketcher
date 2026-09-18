import path from 'path';
import fs from 'fs';
import type { Transformer } from '@jest/transform';

/**
 * Jest transformer for importing text files as string modules.
 * Converts text file imports into CommonJS modules that export the file contents as strings.
 * This allows importing .txt, .md, and other text files directly in tests.
 *
 * @example
 * // In jest.config.js:
 * // transform: { '\\.(txt|md)$': '<rootDir>/textFileTransformer.ts' }
 *
 * // In test file:
 * // import content from './file.txt';
 * // typeof content === 'string'
 */
const textFileTransformer: Transformer = {
  process(src: string, filename: string): { code: string } {
    const fileContents: string = fs.readFileSync(
      path.resolve(filename),
      'utf8',
    );
    return {
      code: `module.exports = ${JSON.stringify(fileContents)};`,
    };
  },
};

export default textFileTransformer;
