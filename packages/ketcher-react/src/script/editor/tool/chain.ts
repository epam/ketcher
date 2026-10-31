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
  type Action,
  Bond,
  Vec2,
  bondChangingAction,
  fromChain,
  fromItemsFuse,
  getHoverToFuse,
  getItemsToFuse,
  FunctionalGroup,
  SGroup,
  vectorUtils,
  removeInfoLabelFromAtoms,
  CoordinateTransformation,
} from 'ketcher-core';

import { atomLongtapEvent } from './atom';
import type Editor from '../Editor';
import type { Tool } from './Tool';
import { isBondingWithMacroMolecule } from './helper/isMacroMolecule';
import type { ClosestItemWithMap } from '../shared/closest.types';

type MergeItems = ReturnType<typeof getItemsToFuse>;

interface ChainDragContext {
  xy0: Vec2;
  item?: ClosestItemWithMap | null;
  stopTapping?: () => void;
  timeout?: ReturnType<typeof setTimeout>;
  action?: Action;
  mergeItems?: MergeItems;
}

class ChainTool implements Tool {
  private readonly editor: Editor;
  private dragContext: ChainDragContext | undefined;

  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousedown(event: MouseEvent) {
    if (this.dragContext) return;
    if (isBondingWithMacroMolecule(this.editor, event)) {
      return;
    }
    const struct = this.editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
    const rnd = this.editor.render;
    const ci = this.editor.findItem(event, [
      'atoms',
      'bonds',
      'functionalGroups',
    ]);
    const atomResult: Array<number> = [];
    const bondResult: Array<number> = [];
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

    if (ci && functionalGroups.size && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id,
      );

      if (bondId !== null) {
        bondResult.push(bondId);
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
      if (result.length) {
        this.editor.event.removeFG.dispatch({ fgIds: result });
        return;
      }
    } else if (bondResult.length > 0) {
      for (const id of bondResult) {
        const fgId = FunctionalGroup.findFunctionalGroupByBond(
          molecule,
          functionalGroups,
          id,
        );

        if (fgId !== null && !result.includes(fgId)) {
          result.push(fgId);
        }
      }
      if (result.length) {
        this.editor.event.removeFG.dispatch({ fgIds: result });
        return;
      }
    }

    this.editor.hover(null);
    this.dragContext = {
      xy0: CoordinateTransformation.pageToModel(event, rnd),
      item: ci,
    };

    if (ci?.map === 'atoms') {
      this.editor.selection({ atoms: [ci.id] }); // for change atom
      // this event has to be stopped in others events by `tool.dragContext.stopTapping()`
      atomLongtapEvent(this, rnd);
    }

    if (ci?.map === 'functionalGroups') {
      const functionalGroup = molecule.functionalGroups.get(ci.id);
      if (!SGroup.isSaltOrSolvent(functionalGroup?.name ?? '')) {
        const sGroupId = ci.id;
        const sGroup = molecule.sgroups.get(sGroupId);
        const attachmentAtomId = sGroup?.getAttachmentAtomId();
        if (attachmentAtomId !== undefined) {
          this.dragContext.item = {
            map: 'atoms',
            id: attachmentAtomId,
            dist: 0,
          };
        }
      }
    }

    if (!this.dragContext.item)
      // ci.type == 'Canvas'
      delete this.dragContext.item;
    return true;
  }

  mousemove(event: PointerEvent) {
    const editor = this.editor;
    const restruct = editor.render.ctab;
    const dragContext = this.dragContext;

    editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']),
      null,
      event,
    );
    if (dragContext) {
      if (dragContext?.stopTapping) {
        dragContext.stopTapping();
      }

      editor.selection(null);

      if (!dragContext.item || dragContext.item.map === 'atoms') {
        if (dragContext.action) {
          dragContext.action.perform(restruct);
        }

        const atoms = restruct.molecule.atoms;

        const pos0 = dragContext.item
          ? (atoms.get(dragContext.item.id)?.pp ?? dragContext.xy0)
          : dragContext.xy0;

        const pos1 = CoordinateTransformation.pageToModel(event, editor.render);
        const sectCount = Math.ceil(Vec2.diff(pos1, pos0).length());

        const angle = event.ctrlKey
          ? vectorUtils.calcAngle(pos0, pos1)
          : vectorUtils.fracAngle(pos0, pos1);

        const [action, newItems] = fromChain(
          restruct,
          pos0,
          angle,
          sectCount,
          dragContext.item ? dragContext.item.id : null,
        ) as [Action, { atoms: number[]; bonds: number[] }];

        editor.event.message.dispatch({
          info: sectCount + ' sectors',
        });

        dragContext.action = action;
        editor.update(action, true);

        dragContext.mergeItems = getItemsToFuse(editor, newItems);
        editor.hover(getHoverToFuse(dragContext.mergeItems));
      }
    }

    return true;
  }

  mouseup() {
    const struct = this.editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
    let atom: number | undefined;
    const atomResult: Array<number> = [];
    const result: Array<number> = [];

    removeInfoLabelFromAtoms(struct);
    this.editor.render.update(true, null);

    if (this.dragContext?.mergeItems && functionalGroups.size) {
      atom = this.dragContext.mergeItems.atoms.values().next().value;
    }
    if (atom) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        atom,
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
    const dragContext = this.dragContext;

    if (dragContext) {
      delete this.dragContext;

      const editor = this.editor;

      if (dragContext.stopTapping) {
        dragContext.stopTapping();
      }

      if (!dragContext.action && dragContext.item?.map === 'bonds') {
        const bond = molecule.bonds.get(dragContext.item.id) as Bond;

        dragContext.action = bondChangingAction(
          struct,
          dragContext.item.id,
          bond,
          {
            type: Bond.PATTERN.TYPE.SINGLE,
            stereo: Bond.PATTERN.STEREO.NONE,
          },
        );
      } else {
        dragContext.action = dragContext.action
          ? fromItemsFuse(struct, dragContext.mergeItems).mergeWith(
              dragContext.action,
            )
          : fromItemsFuse(struct, dragContext.mergeItems);
      }

      editor.selection(null);
      editor.hover(null);

      if (dragContext.action) {
        editor.update(dragContext.action);
      }

      editor.event.message.dispatch({
        info: false,
      });
    }

    return true;
  }

  cancel() {
    this.mouseup();
  }

  mouseleave() {
    this.mouseup();
  }
}

export default ChainTool;
