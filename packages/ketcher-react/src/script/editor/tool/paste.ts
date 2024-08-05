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

import {
  expandSGroupWithMultipleAttachmentPoint,
  fromItemsFuse,
  fromPaste,
  fromTemplateOnAtom,
  getHoverToFuse,
  getItemsToFuse,
  notifyItemsToMergeInitializationComplete,
  SGroup,
  Struct,
  Vec2,
  vectorUtils,
} from 'ketcher-core';
import Editor from '../Editor';
import { dropAndMerge } from './helper/dropAndMerge';
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems';
import { filterNotInContractedSGroup } from './helper/filterNotInCollapsedSGroup';
import { Tool } from './Tool';
import { debounce } from 'lodash';

let isMovePreviewCalculationInProgress = false;

const debouncedSetAndHoverMergeItems = debounce(function (
  editor,
  pasteItems,
  pasteToolInstance,
  needResetTool = false,
) {
  const mergeItems = getItemsToFuse(editor, pasteItems);
  editor.hover(
    getHoverToFuse(mergeItems),
    needResetTool ? pasteToolInstance : undefined,
  );
  pasteToolInstance.setMergeItems(mergeItems);
  notifyItemsToMergeInitializationComplete();
},
50);

class PasteTool implements Tool {
  private readonly editor: Editor;
  private readonly struct: Struct;
  private action: any;
  private dragCtx: any;
  private mergeItems: any;
  private readonly isSingleContractedGroup: boolean;

  constructor(editor, struct) {
    this.editor = editor;
    this.editor.selection(null);
    this.struct = struct;

    this.isSingleContractedGroup =
      struct.isSingleGroup() && !struct.functionalGroups.get(0)?.isExpanded;

    const rnd = this.editor.render;
    const { clientHeight, clientWidth } = rnd.clientArea;
    const point = this.editor.lastEvent
      ? rnd.page2obj(this.editor.lastEvent)
      : rnd.page2obj({
          pageX: clientWidth / 2,
          pageY: clientHeight / 2,
        } as MouseEvent);

    const [action, pasteItems] = fromPaste(rnd.ctab, this.struct, point);
    this.action = action;
    this.editor.update(this.action, true);

    action.mergeWith(expandSGroupWithMultipleAttachmentPoint(this.restruct));

    this.editor.update(this.action, true);

    debouncedSetAndHoverMergeItems(this.editor, pasteItems, this, true);
  }

  public setMergeItems(mergeItems) {
    this.mergeItems = mergeItems;
  }

  private get restruct() {
    return this.editor.render.ctab;
  }

  mousedown(event) {
    if (
      !this.isSingleContractedGroup ||
      SGroup.isSaltOrSolvent(this.struct.sgroups.get(0)?.data.name)
    ) {
      return;
    }

    if (this.action) {
      // remove pasted group from canvas to find closest group correctly
      this.action?.perform(this.restruct);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const closestGroupItem = this.editor.findItem(event, ['functionalGroups'])!;
    const closestGroup = this.editor.struct().sgroups.get(closestGroupItem?.id);

    // not dropping on a group (tmp, should be removed when dealing with other entities)
    if (!closestGroupItem || SGroup.isSaltOrSolvent(closestGroup?.data.name)) {
      // recreate action and continue as usual
      const [action] = fromPaste(
        this.restruct,
        this.struct,
        this.editor.render.page2obj(event),
      );
      this.action = action;
      return;
    }

    // remove action to prevent error when trying to "perform" it again in mousemove
    this.action = null;

    this.dragCtx = {
      xy0: this.editor.render.page2obj(event),
      item: closestGroupItem,
    };
  }

  mousemove(event) {
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
      const pos1 = this.editor.render.page2obj(event);

      const extraBond = true;

      const struct = this.editor.struct();
      const targetGroup = struct.sgroups.get(this.dragCtx.item.id);
      const atomId = targetGroup?.getAttachmentAtomId();

      if (atomId !== undefined) {
        const atom = this.editor.struct().atoms.get(atomId);
        pos0 = atom?.pp;
      }

      // calc angle
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let angle = vectorUtils.calcAngle(pos0!, pos1);

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
        prepareTemplateFromSingleGroup(this.struct),
        atomId,
        angle,
        extraBond,
      );

      this.dragCtx.action = action;
      this.editor.update(this.dragCtx.action, true);
    } else {
      // common paste logic
      const [action, pasteItems] = fromPaste(
        this.restruct,
        this.struct,
        this.editor.render.page2obj(event),
      );
      this.action = action;
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
    const idsOfItemsMerged = this.mergeItems && {
      ...(this.mergeItems.atoms && {
        atoms: Array.from(this.mergeItems.atoms.values()),
      }),
      ...(this.mergeItems.bonds && {
        bonds: Array.from(this.mergeItems.bonds.values()),
      }),
    };

    const groupsIdsInvolvedInMerge = getGroupIdsFromItemArrays(
      this.editor.struct(),
      idsOfItemsMerged,
    );

    if (groupsIdsInvolvedInMerge.length) {
      this.editor.event.removeFG.dispatch({ fgIds: groupsIdsInvolvedInMerge });
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
    }
  }

  cancel() {
    const rnd = this.editor.render;
    this.editor.hover(null);

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

type Template = {
  aid?: number;
  molecule?: Struct;
  xy0?: Vec2;
  angle0?: number;
};

/** Adds position and angle info to the molecule, similar to Template tool native behavior */
function prepareTemplateFromSingleGroup(molecule: Struct): Template | null {
  const template: Template = {};
  const sgroup = molecule.sgroups.get(0);
  const xy0 = new Vec2();

  molecule.atoms.forEach((atom) => {
    xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
  });

  template.aid = sgroup?.getAttachmentAtomId() || 0;
  template.molecule = molecule;
  template.xy0 = xy0.scaled(1 / (molecule.atoms.size || 1)); // template center

  const atom = molecule.atoms.get(template.aid);
  if (atom) {
    template.angle0 = vectorUtils.calcAngle(atom.pp, template.xy0); // center tilt
  }

  return template;
}

export default PasteTool;
