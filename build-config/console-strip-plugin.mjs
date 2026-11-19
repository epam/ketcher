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

import { resolve, sep } from 'node:path';
import strip from '@rollup/plugin-strip';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The Rollup baseline ran `@rollup/plugin-strip` in production builds, which
 * removes `console.*` and `assert.*` calls from the src/ modules. Rolldown has
 * no built-in equivalent, so the same plugin runs here with its default
 * options. It is `enforce: 'post'` because it parses plain JavaScript and must
 * see the output of Vite's TypeScript/JSX transform, not the raw source.
 * Shared so the include pattern and ordering are defined once for every
 * package that strips in production.
 *
 * `root` is the package directory. Returns `[]` outside production, so callers
 * spread it unconditionally. The include is a RegExp on purpose: plugin-strip
 * passes string patterns to `createFilter`, which resolves them against
 * `process.cwd()`, so a glob only matches when the build starts in the package.
 */
export const createConsoleStripPlugin = ({ root, isProduction }) => {
  if (!isProduction) {
    return [];
  }

  const srcDir = resolve(root, 'src').split(sep).join('/');
  return [
    {
      ...strip({ include: new RegExp(`^${escapeRegExp(srcDir)}/`) }),
      enforce: 'post',
    },
  ];
};
