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
import { RnaBuilderPresetsItem } from 'state/rna-builder';

/**
 * Values are macromoleculesDialogs translation-key suffixes, not display
 * text - groupName doubles as a Redux state key (setActiveRnaBuilderItem,
 * selectAmbiguousMonomersInCategory, data-testid suffixes), so callers
 * resolve these through t() rather than rendering groupName directly.
 */
export const groupNameToTabLabelKey = {
  [RnaBuilderPresetsItem.Presets]: 'monomerLibrary.presetsTab',
  [MonomerGroups.SUGARS]: 'monomerLibrary.sugarsTab',
  [MonomerGroups.BASES]: 'monomerLibrary.basesTab',
  [MonomerGroups.PHOSPHATES]: 'monomerLibrary.phosphatesTab',
  [MonomerGroups.NUCLEOTIDES]: 'monomerLibrary.nucleotidesTab',
};
