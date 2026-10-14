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
 * This module alias is resolved at build time via the `resolve.alias`
 * configuration in `vite.config.mjs`, which points it at a different worker
 * shim per build variant (`useViteInlineWorker` for the base64 variants,
 * `useNativeWorkerUrl` for the binaryWasm ones).
 *
 * It must stay an ambient declaration. Mapping it to a concrete file through
 * tsconfig `paths` also makes TypeScript resolve it, which silently overrides
 * the build-time alias and forces every variant onto the same shim.
 */
declare module '_indigo-worker-import-alias_' {
  export function getIndigoWorker(): Worker;
}
