/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  Action,
  Scale,
  fromAtomsAttrs,
  CoordinateTransformation,
  type Vec2,
} from 'ketcher-core';
import type Editor from '../Editor';
import type { Tool } from './Tool';
import type { ClosestItemWithMap } from '../shared/closest.types';

interface ReactionMapDragContext {
  item: ClosestItemWithMap;
  xy0: Vec2;
}

class ReactionMapTool implements Tool {
  private readonly editor: Editor;
  private dragCtx: ReactionMapDragContext | undefined;
  private line: ReturnType<Editor['render']['selectionLine']> | null = null;

  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousedown(event: PointerEvent) {
    const rnd = this.editor.render;

    const closestItem = this.editor.findItem(event, ['atoms']);

    if (closestItem?.map === 'atoms') {
      this.editor.hover(null);
      this.dragCtx = {
        item: closestItem,
        xy0: CoordinateTransformation.pageToModel(event, rnd),
      };
    }
  }

  mousemove(event: PointerEvent) {
    const editor = this.editor;
    const rnd = editor.render;

    if (this.dragCtx) {
      const closestItem = this.editor.findItem(
        event,
        ['atoms'],
        this.dragCtx.item,
      );
      const atoms = rnd.ctab.molecule.atoms;

      if (closestItem?.map === 'atoms') {
        editor.hover(closestItem);
        this.updateLine(
          atoms.get(this.dragCtx.item.id)?.pp,
          atoms.get(closestItem.id)?.pp,
        );
      } else {
        editor.hover(null);
        this.updateLine(
          atoms.get(this.dragCtx.item.id)?.pp,
          CoordinateTransformation.pageToModel(event, rnd),
        );
      }
    } else {
      editor.hover(editor.findItem(event, ['atoms']), null, event);
    }
  }

  updateLine(p1: Vec2 | null | undefined, p2: Vec2 | null | undefined) {
    if (this.line) {
      this.line.remove();
      this.line = null;
    }

    if (p1 && p2) {
      const rnd = this.editor.render;
      this.line = rnd.selectionLine(
        Scale.modelToCanvas(p1, rnd.options).add(rnd.options.offset),
        Scale.modelToCanvas(p2, rnd.options).add(rnd.options.offset),
      );
    }
  }

  mouseup(event: PointerEvent) {
    if (this.dragCtx) {
      const sourceId = this.dragCtx.item.id;
      const rnd = this.editor.render;
      const closestItem = this.editor.findItem(event, ['atoms']);

      if (closestItem?.map === 'atoms') {
        const action = new Action();
        const atoms = rnd.ctab.molecule.atoms;
        const atom1 = atoms.get(sourceId);
        const atom2 = atoms.get(closestItem.id);
        const aam1 = atom1?.aam;
        const aam2 = atom2?.aam;

        if (!aam1 || aam1 !== aam2) {
          if ((aam1 && aam1 !== aam2) || (!aam1 && aam2)) {
            atoms.forEach((atom, aid) => {
              if (
                aid !== sourceId &&
                aid !== closestItem.id && // target is reassigned below; don't also reset it (would leave 2 conflicting aam ops on one atom -> broken undo, #2174)
                ((aam1 && atom.aam === aam1) || (aam2 && atom.aam === aam2))
              )
                action.mergeWith(
                  fromAtomsAttrs(rnd.ctab, aid, { aam: 0 }, null),
                );
            });
          }

          if (aam1) {
            action.mergeWith(
              fromAtomsAttrs(rnd.ctab, closestItem.id, { aam: aam1 }, null),
            );
          } else {
            let aam = 0;
            atoms.forEach((atom) => {
              aam = Math.max(aam, atom.aam || 0);
            });
            action.mergeWith(
              fromAtomsAttrs(rnd.ctab, sourceId, { aam: aam + 1 }, null),
            );
            if (closestItem.id !== sourceId) {
              // single-atom self-map: source and target are the same atom -> only one op, so undo can revert it (#2174)
              action.mergeWith(
                fromAtomsAttrs(
                  rnd.ctab,
                  closestItem.id,
                  { aam: aam + 1 },
                  null,
                ),
              );
            }
          }
          this.editor.update(action);
        }
      }
      this.updateLine(null, null);
      this.dragCtx = undefined;
    }
    this.editor.hover(this.editor.findItem(event, ['atoms']), null, event);
  }
}

export default ReactionMapTool;
