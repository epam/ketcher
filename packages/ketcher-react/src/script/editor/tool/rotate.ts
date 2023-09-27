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
  Atom,
  Bond,
  FlipDirection,
  FunctionalGroup,
  Vec2,
  fromFlip,
  fromItemsFuse,
  fromRotate,
  getHoverToFuse,
  getItemsToFuse,
  isAttachmentBond,
  vectorUtils,
} from 'ketcher-core';
import assert from 'assert';
import { intersection, throttle } from 'lodash';
import Editor, { Selection } from '../Editor';
import { Tool } from './Tool';
import { normalizeAngle } from '../utils/normalizeAngle';

type SnapMode = 'one-bond' | 'multiple-bonds';
type SnapInfo = {
  snapMode: SnapMode;
  rotatableHalfBondAngle: number;
  absoluteSnapAngles: number[];
  snapAngleToHalfBonds: Map<number, number[]>;
  snapAngleDrawingProps: {
    isSnapping: boolean;
    absoluteAngle: number;
    relativeAngle: number;
  } | null;
};

const SNAP_ANGLES_RELATIVE_TO_FIXED_BOND = [
  Math.PI / 2,
  -Math.PI / 2,
  (2 * Math.PI) / 3,
  -(2 * Math.PI) / 3,
  Math.PI,
]; // 90, -90, 120, -120, 180 degrees
const MAX_SNAP_DELTA = Math.PI / 18; // 10 degrees
const ANGLE_INDICATOR_VISIBLE_DELTA = Math.PI / 9; // 20 degrees

class RotateTool implements Tool {
  private readonly editor: Editor;
  dragCtx: any;
  isNotActiveTool = true;
  private centerAtomId?: number;
  private snapInfo: SnapInfo | null = null;

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

  public get snapAngleDrawingProps() {
    if (this.snapInfo?.snapAngleDrawingProps) {
      return {
        snapMode: this.snapInfo.snapMode,
        ...this.snapInfo.snapAngleDrawingProps,
      };
    }
    return null;
  }

  mousedownHandle(handleCenter: Vec2, center: Vec2) {
    this.dragCtx = {
      xy0: center,
      angle1: vectorUtils.calcAngle(center, handleCenter),
    };
    this.initSnapInfo();
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
        this.centerAtomId = intersectionAtoms[0];
        center = this.struct.atoms.get(this.centerAtomId)?.pp;
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
      this.centerAtomId = [attachmentBond.begin, attachmentBond.end].find(
        (atomId) =>
          this.selection?.bonds?.includes(attachmentBondId)
            ? !visibleAtoms.includes(atomId)
            : visibleAtoms.includes(atomId),
      ) as number;
      center = this.struct.atoms.get(this.centerAtomId)?.pp;
    }

    const { texts, rxnArrows, rxnPluses } = this.selection;
    if (
      !center &&
      (visibleAtoms.length ||
        texts?.length ||
        rxnArrows?.length ||
        rxnPluses?.length)
    ) {
      center = this.reStruct.getSelectionBoxCenter({
        atoms: visibleAtoms,
        texts,
        rxnArrows,
        rxnPluses,
      });
    }

    return center;
  }

  mousemove = throttle((event) => {
    if (!this.dragCtx) {
      this.editor.hover(null, null, event);
      return true;
    }

    const dragCtx = this.dragCtx;

    const mousePos = this.editor.render.page2obj(event);
    const mouseMoveAngle =
      vectorUtils.calcAngle(dragCtx.xy0, mousePos) - dragCtx.angle1;

    let rotateAngle = mouseMoveAngle;
    this.reStruct.clearSnappingBonds();
    if (this.snapInfo) {
      this.snapInfo.snapAngleDrawingProps = null;
    }
    if (!event.ctrlKey) {
      const [isSnapping, rotateAngleWithSnapping] = this.snap(mouseMoveAngle);
      rotateAngle = isSnapping
        ? rotateAngleWithSnapping
        : vectorUtils.fracAngle(mouseMoveAngle, null);
    }

    const rotateAngleInDegrees = vectorUtils.degrees(rotateAngle);
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
  }, 40); // 25fps

  mouseup() {
    if (!this.dragCtx) {
      return true;
    }

    this.reStruct.clearSnappingBonds();
    this.editor.update(true);

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

  private initSnapInfo() {
    if (this.centerAtomId === undefined) {
      this.snapInfo = null;
      return;
    }

    const centerAtom = this.struct.atoms.get(this.centerAtomId);
    assert(centerAtom != null);
    const {
      rotatableHalfBondIds,
      rotatableHalfBondAngles,
      fixedHalfBondIds,
      fixedHalfBondAngles,
    } = this.partitionNeighborsBySelection(this.selection, centerAtom);

    // Don't support this case
    if (rotatableHalfBondIds.length > 1) {
      this.snapInfo = null;
      return;
    }

    const rotatableHalfBondId = rotatableHalfBondIds[0];
    const rotatableHalfBondAngle = rotatableHalfBondAngles[0];
    const { absoluteSnapAngles, snapAngleToHalfBonds, snapMode } =
      this.calculateAbsoluteSnapAngles(
        fixedHalfBondIds,
        fixedHalfBondAngles,
        rotatableHalfBondId,
      );

    this.snapInfo = {
      snapMode,
      rotatableHalfBondAngle,
      absoluteSnapAngles,
      snapAngleToHalfBonds,
      snapAngleDrawingProps: null,
    };
  }

  private calculateAbsoluteSnapAngles(
    fixedHalfBondIds: number[],
    fixedHalfBondAngles: number[],
    rotatableHalfBondId: number,
  ) {
    let snapMode: SnapMode = 'one-bond';
    let absoluteSnapAngles: number[] = [];
    let snapAngleToHalfBonds: Map<number, number[]> = new Map();
    if (fixedHalfBondIds.length === 1) {
      const fixedHalfBondId = fixedHalfBondIds[0];
      const fixedHalfBondAngle = fixedHalfBondAngles[0];
      [absoluteSnapAngles, snapAngleToHalfBonds] =
        this.calculateAbsoluteAnglesByFixedBond(
          fixedHalfBondId,
          fixedHalfBondAngle,
          rotatableHalfBondId,
        );
    } else if (fixedHalfBondIds.length > 1) {
      snapMode = 'multiple-bonds';
      [absoluteSnapAngles, snapAngleToHalfBonds] =
        this.calculateAbsoluteAnglesByBisector(
          fixedHalfBondIds,
          fixedHalfBondAngles,
          rotatableHalfBondId,
        );
    }
    return { absoluteSnapAngles, snapAngleToHalfBonds, snapMode };
  }

  private calculateAbsoluteAnglesByFixedBond(
    fixedHalfBondId: number,
    fixedHalfBondAngle: number,
    rotatableHalfBondId: number,
  ) {
    const absoluteSnapAngles: number[] = [];
    const snapAngleToHalfBonds: Map<number, number[]> = new Map();
    SNAP_ANGLES_RELATIVE_TO_FIXED_BOND.forEach((angle) => {
      const snapAngle = normalizeAngle(fixedHalfBondAngle + angle);
      absoluteSnapAngles.push(snapAngle);
      snapAngleToHalfBonds.set(snapAngle, [
        rotatableHalfBondId,
        fixedHalfBondId,
      ]);
    });
    return [absoluteSnapAngles, snapAngleToHalfBonds] as const;
  }

  private calculateAbsoluteAnglesByBisector(
    fixedHalfBondIds: number[],
    fixedHalfBondAngles: number[],
    rotatableHalfBondId: number,
  ) {
    const absoluteSnapAngles: number[] = [];
    const snapAngleToHalfBonds: Map<number, number[]> = new Map();
    const length = fixedHalfBondIds.length;
    for (let i = 0; i < length; i++) {
      const previousHalfBondId = fixedHalfBondIds[i];
      const previousHalfBondAngle = fixedHalfBondAngles[i];
      for (let j = i + 1; j < length; j++) {
        const currentHalfBondId = fixedHalfBondIds[j];
        const currentHalfBondAngle = fixedHalfBondAngles[j];
        const difference = currentHalfBondAngle - previousHalfBondAngle;
        const bisectorAngle = normalizeAngle(
          currentHalfBondAngle - difference / 2,
        );
        const snapAngle =
          difference > Math.PI
            ? bisectorAngle
            : normalizeAngle(bisectorAngle + Math.PI);
        absoluteSnapAngles.push(snapAngle);
        snapAngleToHalfBonds.set(snapAngle, [
          rotatableHalfBondId,
          previousHalfBondId,
          currentHalfBondId,
        ]);
      }
    }
    return [absoluteSnapAngles, snapAngleToHalfBonds] as const;
  }

  private partitionNeighborsBySelection(
    selection: Selection | null,
    atom: Atom,
  ) {
    const rotatableHalfBondIds: number[] = [];
    const rotatableHalfBondAngles: number[] = [];
    const fixedHalfBondIds: number[] = [];
    const fixedHalfBondAngles: number[] = [];

    atom.neighbors.forEach((halfBondId) => {
      const halfBond = this.struct.halfBonds.get(halfBondId);
      assert(halfBond != null);
      const neighborAtomId = halfBond.end;
      if (selection?.atoms?.includes(neighborAtomId)) {
        if (
          !FunctionalGroup.isHalfBondInContractedFunctionalGroup(
            halfBond,
            this.struct,
          )
        ) {
          rotatableHalfBondIds.push(halfBondId);
          rotatableHalfBondAngles.push(halfBond.ang);
        }
      } else {
        fixedHalfBondIds.push(halfBondId);
        fixedHalfBondAngles.push(halfBond.ang);
      }
    });

    return {
      rotatableHalfBondIds,
      rotatableHalfBondAngles,
      fixedHalfBondIds,
      fixedHalfBondAngles,
    };
  }

  private snap(mouseMoveAngle: number): [boolean, number] {
    let isSnapping = false;
    let rotateAngle = 0;
    if (!this.snapInfo) {
      return [isSnapping, rotateAngle];
    }

    const newRotatedHalfBondAngle = normalizeAngle(
      this.snapInfo.rotatableHalfBondAngle + mouseMoveAngle,
    );
    this.snapInfo.absoluteSnapAngles.some((snapAngle, index) => {
      if (Math.abs(newRotatedHalfBondAngle - snapAngle) <= MAX_SNAP_DELTA) {
        isSnapping = true;
        assert(this.snapInfo != null);
        rotateAngle = snapAngle - this.snapInfo.rotatableHalfBondAngle;
        this.saveSnappingBonds(snapAngle);
        this.snapInfo.snapAngleDrawingProps = {
          isSnapping,
          absoluteAngle: snapAngle,
          relativeAngle: SNAP_ANGLES_RELATIVE_TO_FIXED_BOND[index],
        };
        return true;
      } else if (
        Math.abs(newRotatedHalfBondAngle - snapAngle) <
        ANGLE_INDICATOR_VISIBLE_DELTA
      ) {
        assert(this.snapInfo != null);
        this.snapInfo.snapAngleDrawingProps = {
          isSnapping,
          absoluteAngle: snapAngle,
          relativeAngle: SNAP_ANGLES_RELATIVE_TO_FIXED_BOND[index],
        };
        return true;
      }
      return false;
    });

    return [isSnapping, rotateAngle];
  }

  private saveSnappingBonds(snapAngle: number) {
    const halfBondsToBeHighlighted =
      this.snapInfo?.snapAngleToHalfBonds.get(snapAngle);
    const bondIds = halfBondsToBeHighlighted?.map((halfBond) => {
      const bondId = this.struct.getBondIdByHalfBond(halfBond);
      assert(bondId != null);
      return bondId;
    });
    bondIds?.forEach((bondId) => {
      this.reStruct.addSnappingBonds(bondId);
    });
  }
}

export default RotateTool;
