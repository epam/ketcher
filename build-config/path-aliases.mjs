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

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * `rollup-plugin-typescript2`/`rollup-plugin-tsconfig-paths` resolved a
 * package's tsconfig `paths` aliases at bundle time via a TS-aware resolveId.
 * Rolldown's native TS transform does not do this, so each library's
 * `resolve.alias` must reproduce those `paths` explicitly.
 *
 * This used to be hand-transcribed per package, with nothing enforcing that
 * a future tsconfig `paths` edit gets mirrored. This derives the aliases
 * programmatically from the package's own tsconfig instead (the same
 * approach `example/vite.config.js` already uses for package-scoped
 * resolution), so the two can never drift.
 *
 * Reads `tsconfig.build.json` (the config actually driving the build) and
 * falls back to `tsconfig.json`'s `paths` only if `tsconfig.build.json` does
 * not override `paths` itself (a plain `extends` does not merge `paths` -
 * TypeScript replaces the whole map - so this mirrors that same
 * override-not-merge behavior for a single `extends` level, which is all any
 * of the three library tsconfigs use).
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readTsconfigPaths = (packageDir) => {
  const buildConfig = JSON.parse(
    readFileSync(resolve(packageDir, 'tsconfig.build.json'), 'utf8'),
  );

  if (buildConfig.compilerOptions?.paths) {
    return buildConfig.compilerOptions.paths;
  }

  const baseConfig = JSON.parse(
    readFileSync(resolve(packageDir, 'tsconfig.json'), 'utf8'),
  );

  return baseConfig.compilerOptions?.paths || {};
};

export const createPathAliases = (packageDir) => {
  const paths = readTsconfigPaths(packageDir);
  const bases = new Map();

  for (const [pattern, replacements] of Object.entries(paths)) {
    const hasWildcard = pattern.endsWith('/*');
    const base = hasWildcard ? pattern.slice(0, -2) : pattern;
    const replacement = replacements[0];

    if (!replacement) {
      continue;
    }

    const replacementHasWildcard = replacement.endsWith('/*');
    const replacementBase = replacementHasWildcard
      ? replacement.slice(0, -2)
      : replacement;

    const existing = bases.get(base);

    bases.set(base, {
      hasWildcard: Boolean(existing?.hasWildcard) || hasWildcard,
      replacementBase,
    });
  }

  return [...bases.entries()].map(
    ([base, { hasWildcard, replacementBase }]) => {
      const absoluteReplacement = resolve(packageDir, replacementBase);

      return hasWildcard
        ? {
            find: new RegExp(`^${escapeRegExp(base)}(\\/.*)?$`),
            replacement: `${absoluteReplacement}$1`,
          }
        : {
            find: new RegExp(`^${escapeRegExp(base)}$`),
            replacement: absoluteReplacement,
          };
    },
  );
};
