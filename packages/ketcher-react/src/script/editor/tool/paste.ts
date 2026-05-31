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
  Action,
  expandSGroupWithMultipleAttachmentPoint,
  fromPaste,
  FunctionalGroup,
  getHoverToFuse,
  getItemsToFuse,
  notifyItemsToMergeInitializationComplete,
  MergeItems,
  Struct,
  CoordinateTransformation,
} from 'ketcher-core';
import Editor from '../Editor';
import { dropAndMerge } from './helper/dropAndMerge';
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems';
import { filterNotInContractedSGroup } from './helper/filterNotInCollapsedSGroup';
import { Tool } from './Tool';
import { filterSaltAndSolventFromMerge } from './helper/filterSaltAndSolventFromMerge';

let isMovePreviewCalculationInProgress = false;

class PasteTool implements Tool {
  private readonly editor: Editor;
  private readonly struct: Struct;
  private action?: Action | null;
  private mergeItems: MergeItems | null = null;

  constructor(editor, struct) {
    this.editor = editor;
    this.editor.selection(null);
    this.struct = struct;

    const rnd = this.editor.render;
    const { clientHeight, clientWidth } = rnd.clientArea;
    const clientAreaRect = rnd.clientArea.getBoundingClientRect();
    const point = this.editor.lastEvent
      ? CoordinateTransformation.pageToModel(this.editor.lastEvent, rnd)
      : CoordinateTransformation.pageToModel(
          {
            clientX: clientAreaRect.left + clientWidth / 2,
            clientY: clientAreaRect.top + clientHeight / 2,
          },
          rnd,
        );

    const [action, pasteItems] = fromPaste(rnd.ctab, this.struct, point);
    this.action = action;
    this.editor.update(this.action, true);

    action.mergeWith(expandSGroupWithMultipleAttachmentPoint(this.restruct));

    this.editor.update(this.action, true);

    this.mergeItems = filterSaltAndSolventFromMerge(
      getItemsToFuse(this.editor, pasteItems),
      this.editor.struct(),
    );
    this.editor.hover(getHoverToFuse(this.mergeItems), this);
    notifyItemsToMergeInitializationComplete();
  }

  private get restruct() {
    return this.editor.render.ctab;
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

    this.struct.sgroups.forEach((sgroup) => {
      const countAttachmentPoint = FunctionalGroup.getAttachmentPointCount(
        sgroup,
        this.struct,
      );
      if (countAttachmentPoint > 1) {
        sgroup.setAttr('expanded', true);
      }
    });

    const [action, pasteItems] = fromPaste(
      this.restruct,
      this.struct,
      CoordinateTransformation.pageToModel(event, this.editor.render),
    );
    this.action = action;
    this.editor.update(this.action, true, { resizeCanvas: false });
    const visiblePasteItems = filterNotInContractedSGroup(
      pasteItems,
      this.editor.struct(),
    );

    this.mergeItems = filterSaltAndSolventFromMerge(
      getItemsToFuse(this.editor, visiblePasteItems),
      this.editor.struct(),
    );
    this.editor.hover(getHoverToFuse(this.mergeItems));
    notifyItemsToMergeInitializationComplete();

    requestAnimationFrame(() => {
      isMovePreviewCalculationInProgress = false;
    });
  }

  mouseup() {
    const idsOfItemsMerged = {
      atoms: Array.from(this.mergeItems?.atoms.values() ?? []),
      bonds: Array.from(this.mergeItems?.bonds.values() ?? []),
    };

    const groupsIdsInvolvedInMerge = getGroupIdsFromItemArrays(
      this.editor.struct(),
      idsOfItemsMerged,
    );

    if (groupsIdsInvolvedInMerge.length) {
      this.editor.event.removeFG.dispatch({ fgIds: groupsIdsInvolvedInMerge });
      return;
    }

    const action = this.action;
    delete this.action;
    dropAndMerge(this.editor, this.mergeItems, action, true);
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

export default PasteTool;
