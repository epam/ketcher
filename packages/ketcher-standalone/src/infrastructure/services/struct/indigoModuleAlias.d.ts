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
 * configuration in `rollup.config.mjs`. The alias `_indigo-ketcher-import-alias_` is
 * replaced with the actual Indigo WASM module path during the build.
 */
declare module '_indigo-ketcher-import-alias_' {
  import { IndigoModule } from './indigoWorker.types';
  const indigoModuleFn: (options?: object) => Promise<IndigoModule>;
  export default indigoModuleFn;
}
