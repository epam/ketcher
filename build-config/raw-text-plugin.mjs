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

/**
 * `rollup-plugin-string` has no Rolldown equivalent (see
 * .memory-bank/adr/2026-08-28-vite-for-library-builds.md): this small inline
 * transform imports a package's raw-text data files (`.ket` for
 * ketcher-core/ketcher-macromolecules, `.sdf` for ketcher-react) as raw-text
 * default exports, matching rollup-plugin-string's output shape. Shared here
 * so the transform itself is defined once rather than copied per package.
 */
export const createRawTextPlugin = ({ name, extension }) => ({
  name,
  transform(_code, id) {
    if (!id.endsWith(extension)) {
      return null;
    }

    const content = readFileSync(id, 'utf8');

    return {
      code: `export default ${JSON.stringify(content)};`,
      map: null,
    };
  },
});
