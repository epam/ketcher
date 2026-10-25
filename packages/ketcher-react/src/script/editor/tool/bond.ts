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
  type Struct,
  type BondAttributes,
  type AtomAttributes,
  type Render,
  type Pool,
  Bond,
  Vec2,
  bondChangingAction,
  fromBondAddition,
  fromBondsAttrs,
  FunctionalGroup,
  SGroup,
  fromOneBondDeletion,
  vectorUtils,
  Atom,
  CoordinateTransformation,
  entityNotFoundMessage,
} from 'ketcher-core';

import type Editor from '../Editor';
import type { Tool } from './Tool';
import { isBondingWithMacroMolecule } from './helper/isMacroMolecule';
import type {
  BondActionParameters,
  BondItemReference,
  BondToolDragContext,
} from './bond.types';
import { dispatchMonomerOrGroupDialog } from './monomerDialog.helpers';
import {
  type BondValidationFailure,
  createHapticBondDragFlags,
  findHapticBondAttachmentGroupTarget,
  HapticBondToolHelper,
} from './hapticBondTool';
import closest from '../shared/closest';

type BondEndpointItemReference = BondItemReference & {
  map: 'atoms' | 'attachmentGroups';
};

class BondTool implements Tool {
  private static readonly DRAG_START_THRESHOLD_PX = 10;

  private readonly editor: Editor;
  private readonly atomProps: { label: string };
  private readonly bondProperties: Partial<BondAttributes>;
  private readonly hapticBond: HapticBondToolHelper;
  private dragContext?: BondToolDragContext;
  private hapticAttachmentGroupTargetId: number | null = null;
  isNotActiveTool: boolean | undefined;

  private isBondEndpoint(
    item?: BondItemReference | null,
  ): item is BondEndpointItemReference {
    return item?.map === 'atoms' || item?.map === 'attachmentGroups';
  }

  constructor(editor: Editor, bondProperties: Partial<BondAttributes>) {
    this.editor = editor;
    this.atomProps = { label: 'C' };
    this.bondProperties = bondProperties;
    this.hapticBond = new HapticBondToolHelper(editor, bondProperties);
    const selection = editor.selection();
    if (selection?.bonds) {
      const struct = editor.render.ctab;
      const molecule = struct.molecule;
      const functionalGroups = molecule.functionalGroups;
      const selectedBonds = selection.bonds;

      const hasAttachmentGroupHapticBond = selectedBonds.some((bondId) => {
        const bond = molecule.bonds.get(bondId);
        return (
          bond?.type === Bond.PATTERN.TYPE.HAPTIC &&
          (molecule.attachmentGroups.has(bond.begin) ||
            molecule.attachmentGroups.has(bond.end))
        );
      });
      if (hasAttachmentGroupHapticBond) {
        this.isNotActiveTool = true;
        return;
      }

      if (functionalGroups.size) {
        const fgIds = new Set<number>();
        for (const bondId of selectedBonds) {
          const fgId = FunctionalGroup.findFunctionalGroupByBond(
            molecule,
            functionalGroups,
            bondId,
          );
          if (fgId !== null) {
            fgIds.add(fgId);
          }
        }
        if (fgIds.size) {
          dispatchMonomerOrGroupDialog(this.editor, [...fgIds]);
          this.isNotActiveTool = true;
          return;
        }
      }

      if (
        this.hapticBond.hasInvalidSelectedHapticBonds(molecule, selectedBonds)
      ) {
        this.hapticBond.showValidationError('haptic');
        this.isNotActiveTool = true;
        return;
      }

      const action = fromBondsAttrs(struct, selectedBonds, bondProperties);
      editor.update(action);
      editor.selection(null);
      this.isNotActiveTool = true;
    }
  }

  mousedown(event: PointerEvent) {
    if (this.dragContext) return;
    if (isBondingWithMacroMolecule(this.editor, event)) {
      return;
    }
    const struct = this.editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
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
      if (atomId !== null) atomResult.push(atomId);
    }
    if (ci && functionalGroups.size && ci.map === 'bonds') {
      const bondId = FunctionalGroup.bondsInFunctionalGroup(
        molecule,
        functionalGroups,
        ci.id,
      );
      if (bondId !== null) bondResult.push(bondId);
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
        dispatchMonomerOrGroupDialog(this.editor, result);
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
        dispatchMonomerOrGroupDialog(this.editor, result);
        return;
      }
    }

    let attachmentAtomId: number | undefined;
    if (ci?.map === 'functionalGroups') {
      const sgroup = molecule.sgroups.get(ci.id);
      attachmentAtomId = sgroup?.getAttachmentAtomId();
    }

    const rnd = this.editor.render;
    this.editor.hover(null);
    this.editor.selection(null);

    const item: BondItemReference | undefined =
      attachmentAtomId !== undefined
        ? { map: 'atoms', id: attachmentAtomId }
        : (ci ?? undefined);

    this.dragContext = {
      xy0: CoordinateTransformation.pageToModel(event, rnd),
      pageX0: event.clientX,
      pageY0: event.clientY,
      hasStartedDragging: false,
      ...createHapticBondDragFlags(),
    };
    if (item) {
      // ci.type == 'Canvas' when item is absent
      this.dragContext.item = item;
    }
    return true;
  }

  mousemove(event: PointerEvent) {
    if (isBondingWithMacroMolecule(this.editor, event)) {
      return true;
    }
    if (this.dragContext) {
      if (!this.isDragStartThresholdReached(event, this.dragContext)) {
        return true;
      }
      return this.handleDragMove(event);
    }
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']),
      null,
      event,
    );
    return true;
  }

  private isDragStartThresholdReached(
    event: PointerEvent,
    dragContext: BondToolDragContext,
  ) {
    if (dragContext.hasStartedDragging) {
      return true;
    }

    const dx = event.clientX - dragContext.pageX0;
    const dy = event.clientY - dragContext.pageY0;
    const distance = Math.hypot(dx, dy);
    if (distance < BondTool.DRAG_START_THRESHOLD_PX) {
      return false;
    }

    dragContext.hasStartedDragging = true;
    return true;
  }

  private handleDragMove(event: PointerEvent) {
    if (!this.dragContext) return undefined;
    const rnd = this.editor.render;
    const dragContext = this.dragContext;
    const hasItem = 'item' in dragContext;

    const pos = CoordinateTransformation.pageToModel(event, rnd);
    let angle = vectorUtils.calcAngle(dragContext.xy0, pos);
    if (!event.ctrlKey) angle = vectorUtils.fracAngle(angle, null);

    const degrees = vectorUtils.degrees(angle);
    this.editor.event.message.dispatch({ info: degrees + 'º' });

    if (!hasItem || this.isBondEndpoint(dragContext.item)) {
      return this.handleBondDrag(event, dragContext, hasItem);
    }
    return undefined;
  }

  private handleBondDrag(
    event: PointerEvent,
    dragContext: BondToolDragContext,
    hasItem: boolean,
  ) {
    const rnd = this.editor.render;
    const molecule = rnd.ctab.molecule;

    if (dragContext.action) dragContext.action.perform(rnd.ctab);

    let beginAtom;
    let endAtom;
    let beginPos;
    let endPos;

    if (hasItem && this.isBondEndpoint(dragContext.item)) {
      const item = dragContext.item;
      ({ beginAtom, endAtom } = this.resolveAtomDragTarget(
        event,
        item,
        molecule,
      ));
    } else {
      const result = this.resolveCanvasDragTarget(event, dragContext, molecule);
      ({ beginAtom, endAtom, beginPos } = result);
      if (result.shouldReturn) return;
    }

    ({ endAtom, endPos } = this.resolveEndAtomPosition(
      event,
      rnd,
      beginAtom,
      endAtom,
      beginPos,
    ));

    const distance =
      endPos !== undefined
        ? Vec2.dist(dragContext.xy0, endPos)
        : Number.MAX_VALUE;
    this.applyBondAction(event, dragContext, rnd, molecule, {
      beginAtom,
      endAtom,
      beginPos,
      endPos,
      dist: distance,
    });

    return true;
  }

  private resolveAtomDragTarget(
    event: PointerEvent,
    item: BondItemReference,
    molecule: Struct,
  ) {
    const editor = this.editor;
    const beginAtom = item.id;
    let endAtom: BondItemReference | null;

    if (this.hapticBond.isHapticBondType() && item.map === 'atoms') {
      const pointerPosition = CoordinateTransformation.pageToModel(
        event,
        editor.render,
      );
      const attachmentGroupId = findHapticBondAttachmentGroupTarget(
        editor.render.ctab,
        pointerPosition,
      );
      this.updateHapticAttachmentGroupTarget(attachmentGroupId);

      if (attachmentGroupId !== null) {
        endAtom = { map: 'attachmentGroups', id: attachmentGroupId };
      } else {
        const closestAtom = closest.atom(
          editor.render.ctab,
          pointerPosition,
          item,
          null,
        );
        endAtom = closestAtom ? { map: 'atoms', id: closestAtom.id } : null;
      }
    } else {
      this.updateHapticAttachmentGroupTarget(null);
      endAtom = editor.findItem(
        event,
        ['atoms'],
        item,
      ) as BondItemReference | null;
    }

    const closestSGroup = editor.findItem(event, ['functionalGroups']);
    const sgroup =
      closestSGroup != null
        ? molecule.sgroups.get(closestSGroup.id)
        : undefined;

    if (sgroup && endAtom?.map !== 'attachmentGroups') {
      endAtom = this.adjustEndAtomForSGroup(sgroup, beginAtom, endAtom);
    }

    return { beginAtom, endAtom };
  }

  private updateHapticAttachmentGroupTarget(targetId: number | null) {
    if (targetId === this.hapticAttachmentGroupTargetId) {
      return;
    }

    const render = this.editor.render;
    if (this.hapticAttachmentGroupTargetId !== null) {
      render.ctab.attachmentGroups
        .get(this.hapticAttachmentGroupTargetId)
        ?.setHover(false, render);
    }

    this.hapticAttachmentGroupTargetId = targetId;
    if (targetId !== null) {
      render.ctab.attachmentGroups.get(targetId)?.setHover(true, render);
    }
  }

  private adjustEndAtomForSGroup(
    sgroup: SGroup,
    beginAtom: number,
    endAtom: BondItemReference | null,
  ): BondItemReference | null {
    const closestAttachmentAtomId = sgroup.getAttachmentAtomId();

    if (sgroup.isContracted()) {
      const hasAttachmentPoint = closestAttachmentAtomId === undefined;
      const isBeginFunctionalGroupItself =
        closestAttachmentAtomId === beginAtom;
      if (!hasAttachmentPoint && !isBeginFunctionalGroupItself) {
        endAtom = {
          id: closestAttachmentAtomId,
          map: 'atoms',
        };
      }
    }

    if (endAtom && endAtom.id !== closestAttachmentAtomId) {
      dispatchMonomerOrGroupDialog(this.editor, [sgroup.id]);
      endAtom = null;
    }

    return endAtom;
  }

  private resolveCanvasDragTarget(
    event: PointerEvent,
    dragContext: BondToolDragContext,
    molecule: Struct,
  ) {
    const functionalGroups = molecule.functionalGroups;
    const beginAtom = this.atomProps;
    const beginPos = dragContext.xy0;
    let endAtom: BondItemReference | null = this.editor.findItem(event, [
      'atoms',
      'functionalGroups',
    ]) as BondItemReference | null;

    if (endAtom?.map === 'atoms' && functionalGroups.size && this.dragContext) {
      const fgIds = this.collectFunctionalGroupIdsForAtom(
        functionalGroups,
        endAtom.id,
      );
      if (fgIds.length > 0) {
        dispatchMonomerOrGroupDialog(this.editor, fgIds);
        this.dragContext = undefined;
        return { beginAtom, endAtom, beginPos, shouldReturn: true };
      }
    } else if (endAtom?.map === 'functionalGroups') {
      endAtom = this.resolveEndAtomFromFunctionalGroup(molecule, endAtom);
    }

    return { beginAtom, endAtom, beginPos, shouldReturn: false };
  }

  private collectFunctionalGroupIdsForAtom(
    functionalGroups: Pool<FunctionalGroup>,
    atomId: number,
  ) {
    const atomInFg = FunctionalGroup.atomsInFunctionalGroup(
      functionalGroups,
      atomId,
    );
    if (atomInFg === null) return [];

    const fgId = FunctionalGroup.findFunctionalGroupByAtom(
      functionalGroups,
      atomInFg,
    );
    return fgId !== null ? [fgId] : [];
  }

  private resolveEndAtomFromFunctionalGroup(
    molecule: Struct,
    endAtom: BondItemReference,
  ): BondItemReference | null {
    const functionalGroup = molecule.functionalGroups.get(endAtom.id);
    if (!SGroup.isSaltOrSolvent(functionalGroup?.name || '')) {
      const attachmentAtomId =
        functionalGroup?.relatedSGroup.getAttachmentAtomId();
      return attachmentAtomId === undefined
        ? null
        : { map: 'atoms', id: attachmentAtomId };
    }
    return endAtom;
  }

  private resolveEndAtomPosition(
    event: PointerEvent,
    rnd: Render,
    beginAtom: number | AtomAttributes,
    endAtom: BondItemReference | null,
    beginPos: Vec2 | undefined,
  ): { endAtom: number | AtomAttributes; endPos: Vec2 | undefined } {
    let endPos: Vec2 | undefined;
    if (this.isBondEndpoint(endAtom)) {
      return { endAtom: endAtom.id, endPos };
    }

    const newEndAtom: AtomAttributes = this.atomProps;
    const xy1 = CoordinateTransformation.pageToModel(event, rnd);
    let startPos = beginPos;
    if (!startPos) {
      if (typeof beginAtom !== 'number') {
        return { endAtom: newEndAtom, endPos };
      }
      const atom = rnd.ctab.molecule.getBondEndpoint(beginAtom);
      if (!atom) throw new Error(entityNotFoundMessage('Atom', beginAtom));
      startPos = atom.pp.get_xy0();
    }

    endPos = vectorUtils.calcNewAtomPos(startPos, xy1, event.ctrlKey);
    endPos = this.hapticBond.getNewAtomPosition(startPos, endPos);

    return { endAtom: newEndAtom, endPos };
  }

  private rejectBondOperation(
    event: PointerEvent,
    dragContext: BondToolDragContext,
    failure: BondValidationFailure,
  ) {
    this.hapticBond.applyValidationFailure(dragContext, failure);
    this.restoreBondWhenHoveringOnCanvas(event);
    if (dragContext.action) {
      this.editor.update(dragContext.action, true);
      delete dragContext.action;
    }
  }

  private applyBondAction(
    event: PointerEvent,
    dragContext: BondToolDragContext,
    rnd: Render,
    molecule: Struct,
    bondParameters: BondActionParameters,
  ) {
    const {
      beginAtom,
      endAtom,
      beginPos,
      endPos,
      dist: distance,
    } = bondParameters;
    const validationFailure = this.hapticBond.getBondPairValidationFailure(
      molecule,
      beginAtom,
      endAtom,
    );

    if (validationFailure) {
      const shouldShowInvalidHapticPreview =
        validationFailure === 'haptic' &&
        this.hapticBond.isHapticBondType() &&
        dragContext.item?.map === 'atoms';

      if (!shouldShowInvalidHapticPreview) {
        this.rejectBondOperation(event, dragContext, validationFailure);
        return;
      }

      this.hapticBond.applyValidationFailure(dragContext, validationFailure);
    } else {
      this.hapticBond.clearValidationFlags(dragContext);
    }

    // don't rotate the bond if the distance between the start and end point is too small
    if (distance > 0.3) {
      const [existingBondId, bond] = this.getExistingBond(
        molecule,
        beginAtom,
        endAtom,
      );
      dragContext.action = fromBondAddition(
        rnd.ctab,
        this.bondProperties,
        beginAtom,
        endAtom,
        beginPos,
        endPos,
      )[0];
      if (existingBondId !== null) {
        dragContext.existedBond = bond;
        dragContext.action.mergeWith(
          fromOneBondDeletion(rnd.ctab, existingBondId),
        );
      }
    } else {
      delete dragContext.action;
    }
    this.restoreBondWhenHoveringOnCanvas(event);
    if (dragContext.action) this.editor.update(dragContext.action, true);
  }

  mouseup(event: PointerEvent) {
    if (this.dragContext) {
      const dragContext = this.dragContext;
      const render = this.editor.render;
      const struct = render.ctab.molecule;
      this.updateHapticAttachmentGroupTarget(null);
      const dragEndFailure = dragContext.hasStartedDragging
        ? this.hapticBond.resolveDragEndValidationFailure(
            dragContext,
            struct,
            Boolean(dragContext.item),
          )
        : null;

      if (dragContext.action && dragEndFailure) {
        const revertedPreviewAction = dragContext.action.perform(render.ctab);
        delete dragContext.action;
        this.hapticBond.showValidationError(dragEndFailure);
        // The revert removes a temporary endpoint. An incremental update
        // drops its stale `atomsChanged` entry before updating half-bonds.
        this.editor.update(revertedPreviewAction, true);
      } else if (dragContext.action) {
        this.restoreBondWhenHoveringOnCanvas(event);
        this.editor.update(dragContext.action);
      } else if (dragContext.hasStartedDragging) {
        if (dragEndFailure) {
          this.hapticBond.showValidationError(dragEndFailure);
          this.editor.update(true);
        }
      } else if (!dragContext.item) {
        const editorOptions = this.editor.options();
        const QUARTER_OF_BOND_WIDTH = 20;
        const QUARTER_OF_BOND_HEIGHT = 5;
        const xy = CoordinateTransformation.pageToModel(
          {
            clientX: event.clientX + QUARTER_OF_BOND_WIDTH * editorOptions.zoom,
            clientY:
              event.clientY - QUARTER_OF_BOND_HEIGHT * editorOptions.zoom,
          },
          render,
        );
        if (
          this.hapticBond.getBondPairValidationFailure(
            struct,
            { label: 'C' },
            { label: 'C' },
          )
        ) {
          this.hapticBond.cancelBondDragWithValidationError(
            event,
            'haptic',
            () => {
              delete this.dragContext;
            },
          );
          return true;
        }

        const v = new Vec2(1 / 2, 0).rotate(
          this.bondProperties.type === Bond.PATTERN.TYPE.SINGLE
            ? -Math.PI / 6
            : 0,
        );
        const bondAddition = fromBondAddition(
          render.ctab,
          this.bondProperties,
          { label: 'C' },
          { label: 'C' },
          Vec2.diff(xy, v),
          Vec2.sum(xy, v),
        );

        this.editor.update(bondAddition[0]);
      } else if (this.isBondEndpoint(dragContext.item)) {
        // click on atom
        const isAtomSuperatomLeavingGroup =
          dragContext.item.map === 'atoms' &&
          Atom.isSuperatomLeavingGroupAtom(struct, dragContext.item.id);
        if (!isAtomSuperatomLeavingGroup) {
          const atomClickFailure = this.hapticBond.getBondPairValidationFailure(
            struct,
            dragContext.item.id,
            { label: 'C' },
          );
          if (atomClickFailure) {
            this.hapticBond.cancelBondDragWithValidationError(
              event,
              atomClickFailure,
              () => {
                delete this.dragContext;
              },
            );
            return true;
          }

          this.editor.update(
            fromBondAddition(
              render.ctab,
              this.bondProperties,
              dragContext.item.id,
              {
                label: 'C',
              },
            )[0],
          );
          delete dragContext.existedBond;
        }
      } else if (dragContext.item.map === 'bonds') {
        const bondProperties = { ...this.bondProperties };
        const bond = struct.bonds.get(dragContext.item.id) as Bond;
        const bondClickFailure = this.hapticBond.getBondPairValidationFailure(
          struct,
          bond.begin,
          bond.end,
        );

        if (bondClickFailure) {
          this.hapticBond.cancelBondDragWithValidationError(
            event,
            bondClickFailure,
            () => {
              delete this.dragContext;
            },
          );
          return true;
        }

        this.editor.update(
          bondChangingAction(
            render.ctab,
            dragContext.item.id,
            bond,
            bondProperties,
          ),
        );
      }
      this.dragContext = undefined;
    }
    this.editor.event.message.dispatch({
      info: false,
    });
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds']),
      null,
      event,
    );
    return true;
  }

  /*
    If we want to add a new bond, we need to delete previous one
    But we can change our mind, then deleted bond needs to be restored
  */
  restoreBondWhenHoveringOnCanvas(event: PointerEvent) {
    if (!this.dragContext) {
      return;
    }
    const dragContext = this.dragContext;
    if (!dragContext.existedBond) {
      return;
    }
    const existedBond = dragContext.existedBond;
    const isHoveringOverAtom = this.editor.findItem(event, ['atoms']);
    if (!isHoveringOverAtom) {
      if (!dragContext.item || !dragContext.action) {
        return;
      }
      const { begin, end } = existedBond;
      const bondEnd = dragContext.item.id === begin ? end : begin;
      dragContext.action.mergeWith(
        fromBondAddition(
          this.editor.render.ctab,
          existedBond,
          dragContext.item.id,
          bondEnd,
        )[0],
      );
      delete dragContext.existedBond;
    }
  }

  getExistingBond(
    struct: Struct,
    begin: number | AtomAttributes,
    end: number | AtomAttributes,
  ) {
    if (typeof begin !== 'number' || typeof end !== 'number') {
      return [null, null] as const;
    }
    for (const [bondId, bond] of struct.bonds.entries()) {
      const alreadyHasBondInOtherDirection =
        (bond.begin === end && bond.end === begin) ||
        (bond.begin === begin && bond.end === end);
      if (alreadyHasBondInOtherDirection) {
        return [bondId, bond] as const;
      }
    }
    return [null, null] as const;
  }
}

export default BondTool;
