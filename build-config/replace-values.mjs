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

import { execSync } from 'node:child_process';

/**
 * Build-time constants shared by every package build and by the `example` app.
 *
 * These used to live in the packages' own bundler configs, which meant
 * `example` had to import from `packages/*&#47;rollup.config.mjs` to stay in sync.
 * They live here so no build config is ever imported across a package boundary.
 */

export const mode = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

/**
 * The nearest git tag, used as the documentation link target.
 * Falls back to `master` outside a git checkout (e.g. in a Docker build).
 */
export const getTagName = () => {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' });
  } catch (error) {
    console.error(error);
    return 'master';
  }
};

/**
 * `process.env.*` substitutions injected into a package's bundle.
 *
 * `helpLink` differs per package by design: ketcher-react resolves it from the
 * git tag, while ketcher-macromolecules reads it from the environment.
 */
export const createReplaceValues = ({ version, isProduction, helpLink }) => ({
  'process.env.NODE_ENV': JSON.stringify(
    isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
  ),
  'process.env.VERSION': JSON.stringify(version),
  'process.env.BUILD_DATE': JSON.stringify(
    new Date().toISOString().slice(0, 19),
  ),
  // TODO: add logic to init BUILD_NUMBER
  'process.env.BUILD_NUMBER': JSON.stringify(undefined),
  'process.env.HELP_LINK': JSON.stringify(helpLink),
  'process.env.INDIGO_VERSION': JSON.stringify(
    process.env.INDIGO_VERSION || '',
  ),
  'process.env.INDIGO_MACHINE': JSON.stringify(
    process.env.INDIGO_MACHINE || '',
  ),
});
