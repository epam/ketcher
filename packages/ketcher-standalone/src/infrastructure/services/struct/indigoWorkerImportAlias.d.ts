/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/**
 * This module alias is resolved by Rollup at build time via the `@rollup/plugin-alias`
 * configuration in `rollup.config.mjs`. The alias `_indigo-worker-import-alias_` is
 * replaced with one of the modules in `indigoWorkerImports/`, depending on the build type.
 * Do not map it with tsconfig `paths`: rollup-plugin-typescript2 would resolve it before
 * the alias plugin and every build would get the same worker loader.
 */
declare module '_indigo-worker-import-alias_' {
  export function getIndigoWorker(): Worker;
}
