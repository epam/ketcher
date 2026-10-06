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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

// Loads a repo-root .env file, if present, without overriding variables
// already set in the shell (dotenv's default: existing process.env values
// win). This lets a consumer set KETCHER_MULTI_LANGUAGE_BUILD=true in a
// local .env instead of exporting it before every build invocation - see
// packages/ketcher-react/src/locales/README.md for the full flag docs.
loadEnv({
  path: path.resolve(
    fileURLToPath(new URL('.', import.meta.url)),
    '../.env',
  ),
});

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
 * The documentation link target. `HELP_LINK` can override the nearest git
 * tag, which falls back to `master` outside a git checkout (e.g. in Docker).
 */
export const getTagName = () => {
  if (process.env.HELP_LINK) {
    return process.env.HELP_LINK;
  }

  try {
    return execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    console.error(error);
    return 'master';
  }
};

const ISO_DATE_SECONDS_LENGTH = 19;
const formatBuildDate = (date) =>
  date.toISOString().slice(0, ISO_DATE_SECONDS_LENGTH);

const getBuildDate = () => {
  const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH;

  if (sourceDateEpoch !== undefined) {
    const epochSeconds = Number(sourceDateEpoch);
    const date = new Date(epochSeconds * 1000);

    if (
      !/^\d+$/.test(sourceDateEpoch) ||
      !Number.isSafeInteger(epochSeconds) ||
      Number.isNaN(date.getTime())
    ) {
      throw new Error(
        'SOURCE_DATE_EPOCH must be a non-negative integer timestamp in seconds',
      );
    }

    return formatBuildDate(date);
  }

  try {
    const commitEpochSeconds = Number(
      execSync('git log -1 --format=%ct', { encoding: 'utf8' }).trim(),
    );
    return formatBuildDate(new Date(commitEpochSeconds * 1000));
  } catch {
    // Source archives without Git metadata must remain buildable.
    return formatBuildDate(new Date());
  }
};

/**
 * `process.env.*` substitutions injected into a package's bundle.
 *
 * Build metadata uses a shared source so packages built from the same commit
 * receive identical values.
 */
export const createReplaceValues = ({ version, isProduction }) => ({
  'process.env.NODE_ENV': JSON.stringify(
    isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
  ),
  'process.env.VERSION': JSON.stringify(version),
  'process.env.BUILD_DATE': JSON.stringify(getBuildDate()),
  // TODO: add logic to init BUILD_NUMBER
  'process.env.BUILD_NUMBER': JSON.stringify(undefined),
  'process.env.HELP_LINK': JSON.stringify(getTagName()),
  'process.env.INDIGO_VERSION': JSON.stringify(
    process.env.INDIGO_VERSION || '',
  ),
  'process.env.INDIGO_MACHINE': JSON.stringify(
    process.env.INDIGO_MACHINE || '',
  ),
  'process.env.KETCHER_MULTI_LANGUAGE_BUILD': JSON.stringify(
    process.env.KETCHER_MULTI_LANGUAGE_BUILD === 'true' ? 'true' : 'false',
  ),
});
