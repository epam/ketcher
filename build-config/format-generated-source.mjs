/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

// Formats generated source text with the repo's Oxfmt config. Build scripts
// that emit code (the per-package locale resource generators) use this instead
// of each loading `.oxfmtrc.json` and calling Oxfmt themselves.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format } from 'oxfmt';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// The repo's Oxfmt config, minus the keys that only the CLI reads.
const {
  $schema: _schema,
  ignorePatterns: _ignorePatterns,
  ...OXFMT_CONFIG
} = JSON.parse(readFileSync(path.join(REPO_ROOT, '.oxfmtrc.json'), 'utf8'));

/**
 * Format generated source text as Oxfmt would format a file of that name, using
 * the repo's `.oxfmtrc.json`. Throws on parse or format errors so a broken
 * generated file fails the build instead of being written unformatted.
 */
export const formatGeneratedSource = async (fileName, sourceText) => {
  const { code, errors } = await format(fileName, sourceText, OXFMT_CONFIG);
  if (errors.length > 0) {
    throw new Error(
      `${path.relative(REPO_ROOT, fileName)}: Oxfmt could not format the generated source: ${errors
        .map((error) => error.message)
        .join('; ')}`,
    );
  }
  return code;
};
