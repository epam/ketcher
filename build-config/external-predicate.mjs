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

/**
 * Rollup's peerDepsExternal({ includeDependencies: true }) externalized every
 * entry in `dependencies` and `peerDependencies`. No plugin equivalent exists
 * for Rolldown, so it is reproduced by hand from package.json here, shared by
 * every library's Vite config so the predicate itself is not re-derived per
 * package (see .memory-bank/adr/2026-08-28-vite-for-library-builds.md).
 *
 * peerDepsExternal externalizes a package's deep imports too (e.g.
 * `ajv/dist/runtime/ucs2length`, `lodash/fp`), not just the bare package
 * name. Rolldown's `external` array only does exact-string matching, so this
 * is reproduced as a predicate function.
 *
 * `nodeBuiltins` and `extraExternals` let each package add to its own
 * external set without changing another package's: `ketcher-core` adds the
 * `events` Node builtin (resolved to a bundled polyfill by Rolldown where
 * Rollup left it external), and `ketcher-react` adds its own `pkg.name`
 * (`ketcher-macromolecules`' bundled ESM entry re-imports the real
 * `ketcher-react` package - a documented circular-dependency workaround
 * Rollup only ever warned about and left external; Rolldown hard-fails
 * unless it is listed explicitly).
 */
export const createExternalPredicate = ({
  pkg,
  nodeBuiltins = [],
  extraExternals = [],
}) => {
  const packageExternals = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...extraExternals,
  ];

  const nodeBuiltinExternals = [...nodeBuiltins];

  const allExternals = [...packageExternals, ...nodeBuiltinExternals];

  const external = (id) =>
    allExternals.some((dep) => id === dep || id.startsWith(`${dep}/`));

  return { external, packageExternals, nodeBuiltinExternals, allExternals };
};
