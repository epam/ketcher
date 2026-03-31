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

/** Allowed HELM alias characters: letters, digits, hyphen, underscore, asterisk. */
const MONOMER_LIBRARY_HELM_ALIAS_PATTERN = /^[A-Za-z0-9_*-]+$/;

/**
 * `updateMonomersLibrary` requires a non-empty HELM alias per monomer template.
 * Missing (`undefined`), empty/whitespace, invalid type, or disallowed characters fail.
 */
export function isValidMonomerLibraryHelmAliasForUpdate(
  aliasHELM: unknown,
): boolean {
  if (aliasHELM === undefined || aliasHELM === null) {
    return false;
  }
  if (typeof aliasHELM !== 'string') {
    return false;
  }
  const trimmed = aliasHELM.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return MONOMER_LIBRARY_HELM_ALIAS_PATTERN.test(trimmed);
}

export function getMonomerLibraryHelmAliasLoadFailedMessage(
  monomerName: string,
): string {
  return `Load of "${monomerName}" monomer has failed, monomer definition contains invalid HELM alias value. The HELM alias must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*), spaces prohibited.`;
}
