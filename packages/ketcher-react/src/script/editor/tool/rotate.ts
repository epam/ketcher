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
  Bond,
  FlipDirection,
  Vec2,
  fromFlip,
  fromItemsFuse,
  fromRotate,
  getHoverToFuse,
  getItemsToFuse,
  isAttachmentBond,
} from 'ketcher-core';
import assert from 'assert';
import utils from '../shared/utils';
import Editor from '../Editor';
import { Tool } from './Tool';
import { intersection } from 'lodash';

class RotateTool implements Tool {
  private readonly editor: Editor;
  dragCtx: any;
  isNotActiveTool = true;

  constructor(editor: Editor, flipDirection?: FlipDirection) {
    this.editor = editor;

    if (flipDirection) {
      const selectionCenter = this.getCenter();
      const canvasCenter = this.reStruct.getVBoxObj().centre();
      const action = fromFlip(
        this.reStruct,
        this.selection,
        flipDirection,
        selectionCenter || canvasCenter,
      );
      editor.update(action);
      editor.rotateController.rerender();
    }
  }

  private get reStruct() {
    return this.editor.render.ctab;
  }

  private get struct() {
    return this.reStruct.molecule;
  }

  private get selection() {
    return this.editor.selection();
  }

  mousedownHandle(handleCenter: Vec2, center: Vec2) {
    this.dragCtx = {
      xy0: center,
      angle1: utils.calcAngle(center, handleCenter),
    };
  }

  getCenter() {
    if (!this.selection) {
      return;
    }

    let center: Vec2 | undefined;
    const visibleAtoms = this.struct.getSelectedVisibleAtoms(this.selection);

    const attachmentBonds = this.struct.bonds.filter((_bondId, bond) => {
      assert(this.selection != null);
      return isAttachmentBond(bond, this.selection);
    });

    if (attachmentBonds.size > 1) {
      /**
       *  Handle multiple attachment bonds with one intersection:
       *               0    (selected atom)
       *             / | \  (bonds)
       */
      const bondPoints: [number, number][] = [];
      attachmentBonds.forEach((bond) => {
        bondPoints.push([bond.begin, bond.end]);
      });
      const intersectionAtoms = intersection(...bondPoints);
      if (
        intersectionAtoms.length === 1 &&
        visibleAtoms.includes(intersectionAtoms[0])
      ) {
        center = this.struct.atoms.get(intersectionAtoms[0])?.pp;
      }
    } else if (attachmentBonds.size === 1) {
      /**
       * Handle one attachment bond:
       * 1. the bond is unselected
       *          0  (selected atom) --> center
       *          |  (unselected bond)
       *          o  (unselected atom)
       * 2. the bond is selected
       *          0  (selected atom)
       *          |  (selected bond)
       *          o  (unselected atom) --> center
       */
      const attachmentBondId = attachmentBonds.keys().next().value as number;
      const attachmentBond = attachmentBonds.get(attachmentBondId) as Bond;
      const rotatePoint = [attachmentBond.begin, attachmentBond.end].find(
        (atomId) =>
          this.selection?.bonds?.includes(attachmentBondId)
            ? !visibleAtoms.includes(atomId)
            : visibleAtoms.includes(atomId),
      ) as number;
      center = this.struct.atoms.get(rotatePoint)?.pp;
    }

    const { texts, rxnArrows, rxnPluses } = this.selection;
    if (
      !center &&
      (visibleAtoms.length ||
        texts?.length ||
        rxnArrows?.length ||
        rxnPluses?.length)
    ) {
      center = this.reStruct.getSelectionRotationCenter({
        atoms: visibleAtoms,
        texts,
        rxnArrows,
        rxnPluses,
      });
    }

    return center;
  }

  mousemove(event) {
    if (!this.dragCtx) {
      this.editor.hover(null, null, event);
      return true;
    }

    const dragCtx = this.dragCtx;

    const mousePos = this.editor.render.page2obj(event);
    const mouseMoveAngle =
      utils.calcAngle(dragCtx.xy0, mousePos) - dragCtx.angle1;

    let rotateAngle = mouseMoveAngle;
    if (!event.ctrlKey) {
      rotateAngle = utils.fracAngle(mouseMoveAngle, null);
    }

    const rotateAngleInDegrees = utils.degrees(rotateAngle);
    if ('angle' in dragCtx && dragCtx.angle === rotateAngleInDegrees) {
      return true;
    }

    if ('action' in dragCtx) {
      dragCtx.action.perform(this.reStruct);
    }

    dragCtx.angle = rotateAngleInDegrees;
    dragCtx.action = fromRotate(
      this.reStruct,
      this.selection,
      dragCtx.xy0,
      rotateAngle,
    );

    this.editor.event.message.dispatch({ info: rotateAngleInDegrees + 'º' });

    const expSel = this.editor.explicitSelected();
    dragCtx.mergeItems = getItemsToFuse(this.editor, expSel);
    this.editor.hover(getHoverToFuse(dragCtx.mergeItems), null, event);

    this.editor.update(dragCtx.action, true);
    return true;
  }

  mouseup() {
    if (!this.dragCtx) {
      return true;
    }

    const dragCtx = this.dragCtx;

    const action = dragCtx.action
      ? fromItemsFuse(this.reStruct, dragCtx.mergeItems).mergeWith(
          dragCtx.action,
        )
      : fromItemsFuse(this.reStruct, dragCtx.mergeItems);
    delete this.dragCtx;

    this.editor.update(action);

    if (dragCtx.mergeItems) {
      this.editor.selection(null);
    }

    this.editor.event.message.dispatch({
      info: false,
    });
    return true;
  }

  cancel() {
    this.mouseup();
  }

  mouseleave() {
    this.mouseup();
  }
}

export default RotateTool;
