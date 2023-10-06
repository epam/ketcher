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

import assert from 'assert';
import { FunctionalGroup } from 'ketcher-core';
import Editor from '../Editor';
import { Tool } from './Tool';
import { editRGroupAttachmentPoint } from './apoint.utils';

class APointTool implements Tool {
  private readonly editor: Editor;

  constructor(editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousemove(event) {
    const struct = this.editor.render.ctab.molecule;
    const closestItem = this.editor.findItem(event, [
      'atoms',
      'rgroupAttachmentPoints',
    ]);
    if (closestItem?.map === 'atoms') {
      const atom = struct.atoms.get(closestItem.id);
      if (atom?.label !== 'R#' && atom?.rglabel === null) {
        this.editor.hover(closestItem, null, event);
      }
    } else if (closestItem?.map === 'rgroupAttachmentPoints') {
      this.editor.hover(closestItem, null, event);
    } else {
      this.editor.hover(null);
    }
  }

  click(event) {
    const editor = this.editor;
    const struct = editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
    const ci = editor.findItem(event, ['atoms']);
    const atomResult: Array<number> = [];
    const result: Array<number> = [];

    if (ci && functionalGroups.size && ci.map === 'atoms') {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        ci.id,
      );

      if (atomId !== null) {
        atomResult.push(atomId);
      }
    }

    if (atomResult.length > 0) {
      for (const id of atomResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByAtom(
          functionalGroups,
          id,
        );
        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId);
        }
      }
      this.editor.event.removeFG.dispatch({ fgIds: result });
      return;
    }

    if (ci && ci.map === 'atoms') {
      this.editor.hover(null);
      const atom = molecule.atoms.get(ci.id);
      assert(atom != null);

      if (!atom.isRGroupAttachmentPointEditDisabled) {
        editRGroupAttachmentPoint(editor, atom, ci.id);
      }

      return true;
    }
    return true;
  }
}

export default APointTool;
