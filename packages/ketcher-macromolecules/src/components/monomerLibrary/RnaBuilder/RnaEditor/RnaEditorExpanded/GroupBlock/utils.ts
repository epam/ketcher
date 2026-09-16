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

import { MonomerGroups } from 'src/constants';

/**
 * Values are macromoleculesDialogs translation-key suffixes, not display
 * text - MonomerGroups itself must stay untranslated (its values are used
 * as Redux state keys across state/library and state/rna-builder), so
 * callers resolve these through t() rather than rendering them directly.
 */
export const groupNameToRnaEditorItemLabelKey = {
  [MonomerGroups.SUGARS]: 'monomerLibrary.groupLabelSugar',
  [MonomerGroups.BASES]: 'monomerLibrary.groupLabelBase',
  [MonomerGroups.PHOSPHATES]: 'monomerLibrary.groupLabelPhosphate',
};
