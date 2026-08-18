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

import { type EditMonomerVariant, MonomerMicromolecule } from 'ketcher-core';
import type { Editor } from '../Editor';

/**
 * Given a list of functional-group ids, determine the Edit Monomer dialog
 * variant:
 * - 'single'        — exactly one monomer S-group
 * - 'identical'     — multiple monomers that all share the same template label
 * - 'non-identical' — multiple monomers with differing template labels
 */
export function getMonomerVariant(
  editor: Editor,
  monomerFgIds: number[],
): EditMonomerVariant {
  if (monomerFgIds.length === 1) {
    return 'single';
  }

  const struct = editor.render.ctab.molecule;
  const labels = monomerFgIds.map((id) => {
    const sg = struct.sgroups.get(id);
    if (sg instanceof MonomerMicromolecule) {
      return sg.monomer.monomerItem.label ?? '';
    }
    return '';
  });

  const allIdentical = labels.every((l) => l === labels[0]);
  return allIdentical ? 'identical' : 'non-identical';
}

/**
 * Central dispatcher for FG-related tool interactions.
 *
 * Given a list of functional-group ids (from any tool dispatch site), this
 * helper:
 *  1. Separates monomer S-groups (MonomerMicromolecule) from plain groups.
 *  2. For monomers — dispatches `editor.event.editMonomer` with the computed
 *     variant.
 *  3. For plain groups — dispatches `editor.event.removeFG` as before.
 *
 * This keeps the "Edit Monomer" vs "Edit Abbreviation" routing in one place.
 */
export function dispatchMonomerOrGroupDialog(
  editor: Editor,
  fgIds: number[],
): void {
  if (!fgIds.length) return;

  const struct = editor.render.ctab.molecule;
  const monomerIds: number[] = [];
  const plainIds: number[] = [];

  for (const id of fgIds) {
    const sg = struct.sgroups.get(id);
    if (sg instanceof MonomerMicromolecule) {
      monomerIds.push(id);
    } else {
      plainIds.push(id);
    }
  }

  if (monomerIds.length > 0) {
    const variant = getMonomerVariant(editor, monomerIds);
    editor.event.editMonomer.dispatch({ fgIds: monomerIds, variant });
  }

  if (plainIds.length > 0) {
    editor.event.removeFG.dispatch({ fgIds: plainIds });
  }
}
