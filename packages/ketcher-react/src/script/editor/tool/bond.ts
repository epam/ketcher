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
} from 'ketcher-core';

import type Editor from '../Editor';
import type { Tool } from './Tool';
import { isBondingWithMacroMolecule } from './helper/isMacroMolecule';
import type {
  BondActionParams,
  BondItemRef,
  BondToolDragContext,
} from './bond.types';

class BondTool implements Tool {
  private static readonly DRAG_START_THRESHOLD_PX = 10;

  private readonly editor: Editor;
  private readonly atomProps: { label: string };
  private readonly bondProps: Partial<BondAttributes>;
  private dragCtx?: BondToolDragContext;
  isNotActiveTool: boolean | undefined;

  constructor(editor: Editor, bondProps: Partial<BondAttributes>) {
    this.editor = editor;
    this.atomProps = { label: 'C' };
    this.bondProps = bondProps;
    const selection = editor.selection();
    if (selection?.bonds) {
      const struct = editor.render.ctab;
      const molecule = struct.molecule;
      const functionalGroups = molecule.functionalGroups;
      const selectedBonds = selection.bonds;

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
          this.editor.event.removeFG.dispatch({ fgIds: [...fgIds] });
          this.isNotActiveTool = true;
          return;
        }
      }

      const action = fromBondsAttrs(struct, selectedBonds, bondProps);
      editor.update(action);
      editor.selection(null);
      this.isNotActiveTool = true;
    }
  }

  mousedown(event: PointerEvent) {
    if (this.dragCtx) return;
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

    let attachmentAtomId: number | undefined;
    if (ci?.map === 'functionalGroups') {
      const sgroup = molecule.sgroups.get(ci.id);
      attachmentAtomId = sgroup?.getAttachmentAtomId();
    }

    const rnd = this.editor.render;
    this.editor.hover(null);
    this.editor.selection(null);

    const item: BondItemRef | undefined =
      attachmentAtomId !== undefined
        ? { map: 'atoms', id: attachmentAtomId }
        : ci ?? undefined;

    this.dragCtx = {
      xy0: CoordinateTransformation.pageToModel(event, rnd),
      pageX0: event.clientX,
      pageY0: event.clientY,
      hasStartedDragging: false,
    };
    if (item) {
      // ci.type == 'Canvas' when item is absent
      this.dragCtx.item = item;
    }
    return true;
  }

  mousemove(event: PointerEvent) {
    if (isBondingWithMacroMolecule(this.editor, event)) {
      return true;
    }
    if (this.dragCtx) {
      if (!this.isDragStartThresholdReached(event, this.dragCtx)) {
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
    dragCtx: BondToolDragContext,
  ) {
    if (dragCtx.hasStartedDragging) {
      return true;
    }

    const dx = event.clientX - dragCtx.pageX0;
    const dy = event.clientY - dragCtx.pageY0;
    const distance = Math.hypot(dx, dy);
    if (distance < BondTool.DRAG_START_THRESHOLD_PX) {
      return false;
    }

    dragCtx.hasStartedDragging = true;
    return true;
  }

  private handleDragMove(event: PointerEvent) {
    if (!this.dragCtx) return undefined;
    const rnd = this.editor.render;
    const dragCtx = this.dragCtx;
    const hasItem = 'item' in dragCtx;

    const pos = CoordinateTransformation.pageToModel(event, rnd);
    let angle = vectorUtils.calcAngle(dragCtx.xy0, pos);
    if (!event.ctrlKey) angle = vectorUtils.fracAngle(angle, null);

    const degrees = vectorUtils.degrees(angle);
    this.editor.event.message.dispatch({ info: degrees + 'º' });

    if (!hasItem || dragCtx.item?.map === 'atoms') {
      return this.handleBondDrag(event, dragCtx, hasItem);
    }
    return undefined;
  }

  private handleBondDrag(
    event: PointerEvent,
    dragCtx: BondToolDragContext,
    hasItem: boolean,
  ) {
    const rnd = this.editor.render;
    const molecule = rnd.ctab.molecule;

    if (dragCtx.action) dragCtx.action.perform(rnd.ctab);

    let beginAtom;
    let endAtom;
    let beginPos;
    let endPos;

    if (hasItem && dragCtx.item?.map === 'atoms') {
      ({ beginAtom, endAtom } = this.resolveAtomDragTarget(
        event,
        dragCtx,
        molecule,
      ));
    } else {
      const result = this.resolveCanvasDragTarget(event, dragCtx, molecule);
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

    const dist =
      endPos !== undefined ? Vec2.dist(dragCtx.xy0, endPos) : Number.MAX_VALUE;
    this.applyBondAction(event, dragCtx, rnd, molecule, {
      beginAtom,
      endAtom,
      beginPos,
      endPos,
      dist,
    });

    return true;
  }

  private resolveAtomDragTarget(
    event: PointerEvent,
    dragCtx: BondToolDragContext,
    molecule: Struct,
  ) {
    const editor = this.editor;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = dragCtx.item!; // Item is guaranteed by the caller's guard check
    const beginAtom = item.id;
    let endAtom: BondItemRef | null = editor.findItem(
      event,
      ['atoms'],
      item,
    ) as BondItemRef | null;
    const closestSGroup = editor.findItem(event, ['functionalGroups']);
    const sgroup =
      closestSGroup != null
        ? molecule.sgroups.get(closestSGroup.id)
        : undefined;

    if (sgroup) {
      endAtom = this.adjustEndAtomForSGroup(sgroup, beginAtom, endAtom);
    }

    return { beginAtom, endAtom };
  }

  private adjustEndAtomForSGroup(
    sgroup: SGroup,
    beginAtom: number,
    endAtom: BondItemRef | null,
  ): BondItemRef | null {
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
      this.editor.event.removeFG.dispatch({ fgIds: [sgroup.id] });
      endAtom = null;
    }

    return endAtom;
  }

  private resolveCanvasDragTarget(
    event: PointerEvent,
    dragCtx: BondToolDragContext,
    molecule: Struct,
  ) {
    const functionalGroups = molecule.functionalGroups;
    const beginAtom = this.atomProps;
    const beginPos = dragCtx.xy0;
    let endAtom: BondItemRef | null = this.editor.findItem(event, [
      'atoms',
      'functionalGroups',
    ]) as BondItemRef | null;

    if (endAtom?.map === 'atoms' && functionalGroups.size && this.dragCtx) {
      const fgIds = this.collectFunctionalGroupIdsForAtom(
        functionalGroups,
        endAtom.id,
      );
      if (fgIds.length > 0) {
        this.editor.event.removeFG.dispatch({ fgIds });
        delete this.dragCtx;
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
    endAtom: BondItemRef,
  ): BondItemRef | null {
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
    endAtom: BondItemRef | null,
    beginPos: Vec2 | undefined,
  ): { endAtom: number | AtomAttributes; endPos: Vec2 | undefined } {
    let endPos: Vec2 | undefined;
    if (endAtom?.map === 'atoms') {
      return { endAtom: endAtom.id, endPos };
    }

    const newEndAtom: AtomAttributes = this.atomProps;
    const xy1 = CoordinateTransformation.pageToModel(event, rnd);
    if (beginPos) {
      endPos = vectorUtils.calcNewAtomPos(beginPos, xy1, event.ctrlKey);
    } else {
      const atom = rnd.ctab.molecule.atoms.get(beginAtom as number);
      endPos = vectorUtils.calcNewAtomPos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        atom!.pp.get_xy0(),
        xy1,
        event.ctrlKey,
      );
    }

    return { endAtom: newEndAtom, endPos };
  }

  private applyBondAction(
    event: PointerEvent,
    dragCtx: BondToolDragContext,
    rnd: Render,
    molecule: Struct,
    bondParams: BondActionParams,
  ) {
    const { beginAtom, endAtom, beginPos, endPos, dist } = bondParams;
    // don't rotate the bond if the distance between the start and end point is too small
    if (dist > 0.3) {
      const [existingBondId, bond] = this.getExistingBond(
        molecule,
        beginAtom,
        endAtom,
      );
      dragCtx.action = fromBondAddition(
        rnd.ctab,
        this.bondProps,
        beginAtom,
        endAtom,
        beginPos,
        endPos,
      )[0];
      if (existingBondId !== null) {
        dragCtx.existedBond = bond;
        dragCtx.action.mergeWith(fromOneBondDeletion(rnd.ctab, existingBondId));
      }
    } else {
      delete dragCtx.action;
    }
    this.restoreBondWhenHoveringOnCanvas(event);
    if (dragCtx.action) this.editor.update(dragCtx.action, true);
  }

  mouseup(event: PointerEvent) {
    if (this.dragCtx) {
      const dragCtx = this.dragCtx;
      const render = this.editor.render;
      const struct = render.ctab.molecule;
      if (dragCtx.action) {
        this.restoreBondWhenHoveringOnCanvas(event);
        this.editor.update(dragCtx.action);
      } else if (!dragCtx.item) {
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
        const v = new Vec2(1.0 / 2, 0).rotate(
          this.bondProps.type === Bond.PATTERN.TYPE.SINGLE ? -Math.PI / 6 : 0,
        );
        const bondAddition = fromBondAddition(
          render.ctab,
          this.bondProps,
          { label: 'C' },
          { label: 'C' },
          Vec2.diff(xy, v),
          Vec2.sum(xy, v),
        );

        this.editor.update(bondAddition[0]);
      } else if (dragCtx.item.map === 'atoms') {
        // click on atom
        const isAtomSuperatomLeavingGroup = Atom.isSuperatomLeavingGroupAtom(
          struct,
          dragCtx.item.id,
        );
        if (!isAtomSuperatomLeavingGroup) {
          this.editor.update(
            fromBondAddition(render.ctab, this.bondProps, dragCtx.item.id, {
              label: 'C',
            })[0],
          );
          delete dragCtx.existedBond;
        }
      } else if (dragCtx.item.map === 'bonds') {
        const bondProps = { ...(this.bondProps || {}) };
        const bond = struct.bonds.get(dragCtx.item.id) as Bond;

        this.editor.update(
          bondChangingAction(render.ctab, dragCtx.item.id, bond, bondProps),
        );
      }
      delete this.dragCtx;
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
    if (!this.dragCtx) {
      return;
    }
    const dragCtx = this.dragCtx;
    if (!dragCtx.existedBond) {
      return;
    }
    const existedBond = dragCtx.existedBond;
    const isHoveringOverAtom = this.editor.findItem(event, ['atoms']);
    if (!isHoveringOverAtom) {
      if (!dragCtx.item || !dragCtx.action) {
        return;
      }
      const { begin, end } = existedBond;
      const bondEnd = dragCtx.item.id === begin ? end : begin;
      dragCtx.action.mergeWith(
        fromBondAddition(
          this.editor.render.ctab,
          existedBond,
          dragCtx.item.id,
          bondEnd,
        )[0],
      );
      delete dragCtx.existedBond;
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
