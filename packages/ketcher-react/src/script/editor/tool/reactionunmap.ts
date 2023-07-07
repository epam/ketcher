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

import { Action, fromAtomsAttrs } from 'ketcher-core';
import Editor from '../Editor';
import { Tool } from './Tool';

class ReactionUnmapTool implements Tool {
  private readonly editor: Editor;

  constructor(editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousemove(event) {
    const ci = this.editor.findItem(event, ['atoms']);

    if (ci && ci.map === 'atoms') {
      this.editor.hover(
        this.editor.render.ctab.molecule.atoms.get(ci.id)?.aam ? ci : null,
        null,
        event,
      );
    } else {
      this.editor.hover(null);
    }
  }

  mouseup(event) {
    const ci = this.editor.findItem(event, ['atoms']);
    const atoms = this.editor.render.ctab.molecule.atoms;

    if (ci && ci.map === 'atoms' && atoms.get(ci.id)?.aam) {
      const action = new Action();
      const aam = atoms.get(ci.id)?.aam;
      atoms.forEach((atom, aid) => {
        if (atom.aam === aam) {
          action.mergeWith(
            fromAtomsAttrs(this.editor.render.ctab, aid, { aam: 0 }, null),
          );
        }
      });
      this.editor.update(action);
    }
    this.editor.hover(this.editor.findItem(event, ['atoms']), null, event);
  }
}

export default ReactionUnmapTool;
