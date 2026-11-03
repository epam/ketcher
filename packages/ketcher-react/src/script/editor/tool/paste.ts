/* eslint-disable @typescript-eslint/no-explicit-any */
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
  type Struct,
  type EditorTemplate,
  fromItemsFuse,
  fromPaste,
  fromTemplateOnAtom,
  getHoverToFuse,
  getItemsToFuse,
  notifyItemsToMergeInitializationComplete,
  SGroup,
  Vec2,
  vectorUtils,
  CoordinateTransformation,
} from 'ketcher-core';
import type Editor from '../Editor';
import { dropAndMerge } from './helper/dropAndMerge';
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems';
import { filterNotInContractedSGroup } from './helper/filterNotInCollapsedSGroup';
import type { Tool } from './Tool';
import { debounce } from 'lodash';
import { dispatchMonomerOrGroupDialog } from './monomerDialog.helpers';

let isMovePreviewCalculationInProgress = false;

type PasteItems = ReturnType<typeof fromPaste>[1];

interface AttachDragContext {
  targetAtomId: number;
  template: EditorTemplate;
  action?: Action;
  angle?: number;
}

const debouncedSetAndHoverMergeItems = debounce(function (
  editor,
  pasteItems,
  pasteToolInstance,
  shouldResetTool = false,
) {
  const mergeItems = getItemsToFuse(editor, pasteItems);
  editor.hover(
    getHoverToFuse(mergeItems),
    shouldResetTool ? pasteToolInstance : undefined,
  );
  pasteToolInstance.setMergeItems(mergeItems);
  notifyItemsToMergeInitializationComplete();
}, 50);

class PasteTool implements Tool {
  private readonly editor: Editor;
  private readonly struct: Struct;
  private action: any;
  private dragCtx: any;
  private mergeItems: any;
  private attachDragCtx: AttachDragContext | null = null;
  private pastedAtomIdToStructAtomId = new Map<number, number>();
  private readonly isSingleContractedGroup: boolean;

  constructor(editor, struct) {
    this.editor = editor;
    this.editor.selection(null);
    this.struct = struct;

    this.isSingleContractedGroup =
      struct.isSingleGroup() && !struct.functionalGroups.get(0)?.isExpanded;

    const rnd = this.editor.render;
    const { clientHeight, clientWidth } = rnd.clientArea;
    const clientAreaRect = rnd.clientArea.getBoundingClientRect();
    // Always center the pasted element initially. The mousemove handler will
    // update the position as the user moves the mouse. Using lastEvent here
    // would place the element at the position of a previous mouse event,
    // which could be over an existing element and cause unwanted movement.
    const point = CoordinateTransformation.pageToModel(
      {
        clientX: clientAreaRect.left + clientWidth / 2,
        clientY: clientAreaRect.top + clientHeight / 2,
      },
      rnd,
    );

    const [action, pasteItems] = fromPaste(rnd.ctab, this.struct, point);
    this.action = action;
    this.setPastedAtoms(pasteItems);
    this.editor.update(this.action, true);

    this.editor.update(this.action, true);

    debouncedSetAndHoverMergeItems(this.editor, pasteItems, this, true);
  }

  public setMergeItems(mergeItems) {
    this.mergeItems = mergeItems;
  }

  private get restruct() {
    return this.editor.render.ctab;
  }

  // fromTemplateOnAtom copies only atoms, bonds and s-groups of one fragment
  private get canAttachByBond() {
    const struct = this.struct;
    return (
      struct.atoms.size > 0 &&
      struct.frags.size === 1 &&
      struct.attachmentGroups.size === 0 &&
      struct.rgroupAttachmentPoints.size === 0 &&
      struct.rxnArrows.size === 0 &&
      struct.rxnPluses.size === 0 &&
      struct.simpleObjects.size === 0 &&
      struct.texts.size === 0 &&
      struct.images.size === 0 &&
      struct.multitailArrows.size === 0 &&
      ![...struct.atoms.keys()].some((aid) =>
        struct.isAtomFromMacromolecule(aid),
      )
    );
  }

  private setPastedAtoms(pasteItems: PasteItems) {
    // fromPaste adds one atom per struct atom, in struct order
    const structAtomIds = [...this.struct.atoms.keys()];
    this.pastedAtomIdToStructAtomId = new Map(
      pasteItems.atoms.map((pastedAtomId, index) => [
        pastedAtomId,
        structAtomIds[index],
      ]),
    );
  }

  /**
   * Picks the existing atom the pasted structure is about to merge with,
   * so that dragging away from it attaches the structure by a new bond.
   */
  private createAttachDragContext(event: MouseEvent): AttachDragContext | null {
    const atomsToMerge: Map<number, number> | undefined =
      this.mergeItems?.atoms;
    if (!atomsToMerge?.size || !this.canAttachByBond) {
      return null;
    }

    const cursor = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    const struct = this.editor.struct();
    let closestPair: [pastedAtomId: number, targetAtomId: number] | null = null;
    let minDistance = Infinity;

    for (const [pastedAtomId, targetAtomId] of atomsToMerge) {
      const targetAtom = struct.atoms.get(targetAtomId);
      if (!targetAtom) {
        continue;
      }
      const distance = Vec2.dist(targetAtom.pp, cursor);
      if (distance < minDistance) {
        minDistance = distance;
        closestPair = [pastedAtomId, targetAtomId];
      }
    }

    if (!closestPair) {
      return null;
    }
    const [pastedAtomId, targetAtomId] = closestPair;
    const templateAtomId = this.pastedAtomIdToStructAtomId.get(pastedAtomId);
    if (templateAtomId === undefined) {
      return null;
    }

    return {
      targetAtomId,
      template: prepareTemplate(this.struct, templateAtomId),
    };
  }

  private moveAttachDrag(attachDragCtx: AttachDragContext, event: MouseEvent) {
    const targetPos = this.editor
      .struct()
      .atoms.get(attachDragCtx.targetAtomId)?.pp;
    if (!targetPos) {
      return;
    }
    const cursor = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );

    // keep the merge preview until the cursor leaves the target atom
    if (!attachDragCtx.action && Vec2.dist(targetPos, cursor) <= 1) {
      return;
    }

    if (this.action) {
      debouncedSetAndHoverMergeItems.cancel();
      this.action.perform(this.restruct);
      this.action = null;
      this.mergeItems = null;
      this.editor.hover(null);
    }

    let angle = vectorUtils.calcAngle(targetPos, cursor);
    if (!event.ctrlKey) {
      angle = vectorUtils.fracAngle(angle, null);
    }
    const degrees = vectorUtils.degrees(angle);
    if (attachDragCtx.action && attachDragCtx.angle === degrees) {
      return;
    }

    attachDragCtx.action?.perform(this.restruct);
    attachDragCtx.angle = degrees;
    [attachDragCtx.action] = fromTemplateOnAtom(
      this.restruct,
      attachDragCtx.template,
      attachDragCtx.targetAtomId,
      angle,
      true,
    );
    this.editor.update(attachDragCtx.action, true);
    this.editor.event.message.dispatch({ info: degrees + 'º' });
  }

  mousedown(event: MouseEvent) {
    if (
      !this.isSingleContractedGroup ||
      SGroup.isSaltOrSolvent(this.struct.sgroups.get(0)?.data.name ?? '')
    ) {
      this.attachDragCtx = this.createAttachDragContext(event);
      return;
    }

    if (this.action) {
      // remove pasted group from canvas to find closest group correctly
      this.action?.perform(this.restruct);
    }

    const closestGroupItem = this.editor.findItem(event, ['functionalGroups']);
    const closestGroup = closestGroupItem
      ? this.editor.struct().sgroups.get(closestGroupItem.id)
      : undefined;

    // not dropping on a group (tmp, should be removed when dealing with other entities)
    if (
      !closestGroupItem ||
      SGroup.isSaltOrSolvent(closestGroup?.data.name ?? '')
    ) {
      // recreate action and continue as usual
      const [action] = fromPaste(
        this.restruct,
        this.struct,
        CoordinateTransformation.pageToModel(event, this.editor.render),
      );
      this.action = action;
      return;
    }

    // remove action to prevent error when trying to "perform" it again in mousemove
    this.action = null;

    this.dragCtx = {
      xy0: CoordinateTransformation.pageToModel(event, this.editor.render),
      item: closestGroupItem,
    };
  }

  mousemove(event: MouseEvent) {
    if (this.attachDragCtx) {
      this.moveAttachDrag(this.attachDragCtx, event);
      return;
    }

    this.mergeItems = null;
    this.editor.hover(null);
    if (isMovePreviewCalculationInProgress) {
      return;
    }
    isMovePreviewCalculationInProgress = true;
    if (this.action) {
      this.action?.perform(this.restruct);
    }

    if (this.dragCtx) {
      // template-like logic for group-on-group actions
      let pos0: Vec2 | null | undefined = null;
      const pos1 = CoordinateTransformation.pageToModel(
        event,
        this.editor.render,
      );

      const hasExtraBond = true;

      const struct = this.editor.struct();
      const targetGroup = struct.sgroups.get(this.dragCtx.item.id);
      const atomId = targetGroup?.getAttachmentAtomId();

      if (atomId !== undefined) {
        const atom = this.editor.struct().atoms.get(atomId);
        pos0 = atom?.pp;
      }

      if (!pos0 || atomId === undefined) {
        // Invariant: dragCtx.item always refers to a functional group with a
        // resolvable attachment atom (validated in mousedown). Reaching here
        // with no position indicates a programming error, not a runtime case.
        throw new Error(
          'PasteTool: attachment atom position is missing for the dragged group',
        );
      }

      // calc angle
      let angle = vectorUtils.calcAngle(pos0, pos1);

      if (!event.ctrlKey) {
        angle = vectorUtils.fracAngle(angle, null);
      }

      const degrees = vectorUtils.degrees(angle);

      // check if anything changed since last time
      if (
        // TODO fix the ignored rule
        // eslint-disable-next-line no-prototype-builtins
        this.dragCtx.hasOwnProperty('angle') &&
        this.dragCtx.angle === degrees
      ) {
        requestAnimationFrame(() => {
          isMovePreviewCalculationInProgress = false;
        });
        return;
      }

      if (this.dragCtx.action) {
        this.dragCtx.action.perform(this.restruct);
      }

      this.dragCtx.angle = degrees;

      const [action] = fromTemplateOnAtom(
        this.restruct,
        prepareTemplate(
          this.struct,
          this.struct.sgroups.get(0)?.getAttachmentAtomId() ?? 0,
        ),
        atomId,
        angle,
        hasExtraBond,
      );

      this.dragCtx.action = action;
      this.editor.update(this.dragCtx.action, true);
    } else {
      // common paste logic
      const [action, pasteItems] = fromPaste(
        this.restruct,
        this.struct,
        CoordinateTransformation.pageToModel(event, this.editor.render),
      );
      this.action = action;
      this.setPastedAtoms(pasteItems);
      this.editor.update(this.action, true);
      const visiblePasteItems = filterNotInContractedSGroup(
        pasteItems,
        this.editor.struct(),
      );

      debouncedSetAndHoverMergeItems(this.editor, visiblePasteItems, this);
    }

    requestAnimationFrame(() => {
      isMovePreviewCalculationInProgress = false;
    });
  }

  mouseup() {
    const attachDragCtx = this.attachDragCtx;
    this.attachDragCtx = null;
    if (attachDragCtx?.action) {
      this.editor.hover(null);
      this.editor.update(attachDragCtx.action);
      this.editor.event.message.dispatch({ info: false });
      this.editor.tool('select');
      return;
    }

    const idsOfItemsMerged = this.mergeItems && {
      ...(this.mergeItems.atoms && {
        atoms: [...this.mergeItems.atoms.values()],
      }),
      ...(this.mergeItems.bonds && {
        bonds: [...this.mergeItems.bonds.values()],
      }),
    };

    const groupsIdsInvolvedInMerge = getGroupIdsFromItemArrays(
      this.editor.struct(),
      idsOfItemsMerged,
    );

    if (groupsIdsInvolvedInMerge.length) {
      dispatchMonomerOrGroupDialog(this.editor, groupsIdsInvolvedInMerge);
      return;
    }

    if (this.dragCtx) {
      const dragCtx = this.dragCtx;
      delete this.dragCtx;

      dragCtx.action = dragCtx.action
        ? fromItemsFuse(this.restruct, dragCtx.mergeItems).mergeWith(
            dragCtx.action,
          )
        : fromItemsFuse(this.restruct, dragCtx.mergeItems);

      this.editor.hover(null);
      this.editor.update(dragCtx.action);
      this.editor.event.message.dispatch({ info: false });
    } else {
      // need to delete action first, because editor.update calls this.cancel() and thus action revert 🤦‍♂️
      const action = this.action;
      delete this.action;
      if (!this.isSingleContractedGroup || !this.mergeItems) {
        dropAndMerge(this.editor, this.mergeItems, action);
      }
      this.editor.tool('select');
    }
  }

  cancel() {
    const rnd = this.editor.render;
    this.editor.hover(null);

    if (this.attachDragCtx?.action) {
      this.attachDragCtx.action.perform(rnd.ctab);
      rnd.update();
    }
    this.attachDragCtx = null;

    if (this.action) {
      this.action.perform(rnd.ctab); // revert the action
      delete this.action;
      rnd.update();
    }
  }

  mouseleave() {
    this.cancel();
  }

  mouseLeaveClientArea() {
    this.cancel();
  }
}

/**
Adds position and angle info to the molecule, similar to Template tool native behavior
*/
function prepareTemplate(molecule: Struct, aid: number): EditorTemplate {
  const xy0 = new Vec2();

  molecule.atoms.forEach((atom) => {
    xy0.add_(atom.pp);
  });

  const xy0Center = xy0.scaled(1 / (molecule.atoms.size || 1)); // template center
  const atom = molecule.atoms.get(aid);

  return {
    aid,
    bid: 0,
    molecule,
    angle0: atom ? vectorUtils.calcAngle(atom.pp, xy0Center) : 0, // center tilt
  };
}

export default PasteTool;
