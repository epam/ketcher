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
 * Modules that resolve the `_indigo-worker-import-alias_` placeholder in
 * ketcher-standalone's sources. Which one is substituted decides how the Indigo
 * worker is loaded, and therefore which of the standalone build variants is
 * being produced.
 *
 * Paths are relative to `src/infrastructure/services/struct/`, the directory
 * that holds the module doing the placeholder import.
 *
 * Shared with `example`, whose dev/build path aliases the same placeholder.
 */
export const INDIGO_WORKER_IMPORTS = {
  /** Worker inlined into the bundle as a Blob - the base64 variants. */
  INLINE: './indigoWorkerImports/useViteInlineWorker',
  /** Worker emitted as its own chunk and fetched - the binaryWasm variants. */
  WORKER_URL: './indigoWorkerImports/useNativeWorkerUrl',
};
