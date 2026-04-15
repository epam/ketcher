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

import { Atom, fromAtomsAttrs } from 'ketcher-core';
import Editor from '../Editor';
import { Tool } from './Tool';

/**
 * Lone-pair toggle tool.
 * Click on an atom to toggle its lone-pair display override:
 *   'show'  → 'hide'   (lone pairs were explicitly shown, turn them off)
 *   anything else → 'show'  (turn lone pairs on for this atom)
 */
class LonePairTool implements Tool {
  private readonly editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousemove(event) {
    const ci = this.editor.findItem(event, ['atoms']);
    const molecule = this.editor.render.ctab.molecule;
    const atom = ci?.map === 'atoms' ? molecule.atoms.get(ci.id) : null;
    if (atom && this.isToggleableAtom(atom)) {
      this.editor.hover(ci);
    } else {
      this.editor.hover(null, null, event);
    }
    return true;
  }

  click(event) {
    const editor = this.editor;
    const rnd = editor.render;
    const molecule = rnd.ctab.molecule;
    const ci = editor.findItem(event, ['atoms']);

    if (!ci || ci.map !== 'atoms') return true;

    const atom = molecule.atoms.get(ci.id);
    if (!atom || !this.isToggleableAtom(atom)) return true;

    const currentDisplay = atom.lonePairDisplay ?? 'inherit';
    const newDisplay = currentDisplay === 'show' ? 'hide' : 'show';

    editor.update(
      fromAtomsAttrs(rnd.ctab, ci.id, { lonePairDisplay: newDisplay }, null),
    );

    return true;
  }

  private isToggleableAtom(atom: Atom): boolean {
    return !atom.atomList && !atom.rglabel;
  }
}

export default LonePairTool;
