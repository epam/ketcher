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
  Vec2,
  bondChangingAction,
  fromBondAddition,
  fromBondsAttrs,
  FunctionalGroup,
  SGroup,
  fromOneBondDeletion,
  Struct,
  vectorUtils,
  Atom,
  CoordinateTransformation,
} from 'ketcher-core';

import Editor from '../Editor';
import { Tool } from './Tool';
import { isBondingWithMacroMolecule } from './helper/isMacroMolecule';

class BondTool implements Tool {
  private readonly editor: Editor;
  private readonly atomProps: { label: string };
  private readonly bondProps: any;
  private dragCtx: any;
  isNotActiveTool: boolean | undefined;

  constructor(editor, bondProps) {
    this.editor = editor;
    this.atomProps = { label: 'C' };
    this.bondProps = bondProps;
    if (editor.selection()?.bonds) {
      const action = fromBondsAttrs(
        editor.render.ctab,
        editor.selection().bonds,
        bondProps,
      );
      editor.update(action);
      editor.selection(null);
      this.isNotActiveTool = true;
    }
  }

  mousedown(event) {
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
    this.dragCtx = {
      xy0: CoordinateTransformation.pageToModel(event, rnd),
      item:
        attachmentAtomId === undefined
          ? ci
          : {
              map: 'atoms',
              id: attachmentAtomId,
            },
    };

    if (!this.dragCtx.item)
      // ci.type == 'Canvas'
      delete this.dragCtx.item;
    return true;
  }

  mousemove(event) {
    if (isBondingWithMacroMolecule(this.editor, event)) {
      return true;
    }

    if (!this.dragCtx) {
      this.handleHoverWithoutDrag(event);
      return true;
    }

    this.displayBondAngle(event);

    if (this.shouldHandleBondCreation()) {
      this.handleBondCreation(event);
      return true;
    }

    return true;
  }

  private shouldHandleBondCreation(): boolean {
    const hasItem = 'item' in this.dragCtx;
    return !hasItem || this.dragCtx.item?.map === 'atoms';
  }

  private displayBondAngle(event): void {
    const rnd = this.editor.render;
    const pos = CoordinateTransformation.pageToModel(event, rnd);
    let angle = vectorUtils.calcAngle(this.dragCtx.xy0, pos);
    if (!event.ctrlKey) {
      angle = vectorUtils.fracAngle(angle, null);
    }
    const degrees = vectorUtils.degrees(angle);
    this.editor.event.message.dispatch({ info: degrees + 'º' });
  }

  private handleHoverWithoutDrag(event): void {
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']),
      null,
      event,
    );
  }

  private handleBondCreation(event): void {
    const rnd = this.editor.render;
    const dragCtx = this.dragCtx;
    const hasItem = 'item' in dragCtx;

    if ('action' in dragCtx) {
      dragCtx.action.perform(rnd.ctab);
    }

    const bondParams = this.determineBondParameters(event, hasItem);
    if (!bondParams) {
      return;
    }

    const { beginAtom, endAtom, beginPos, endPos, dist } = bondParams;
    this.createBondAction(beginAtom, endAtom, beginPos, endPos, dist);
    this.restoreBondWhenHoveringOnCanvas(event);

    if (dragCtx.action) {
      this.editor.update(dragCtx.action, true);
    }
  }

  private determineBondParameters(event, hasItem) {
    if (hasItem && this.dragCtx.item?.map === 'atoms') {
      return this.handleDragFromAtom(event);
    }
    return this.handleDragFromCanvas(event);
  }

  private handleDragFromAtom(event) {
    const beginAtom = this.dragCtx.item.id;
    const endAtomResult = this.findEndAtomWhenDraggingFromAtom(
      event,
      beginAtom,
    );

    if (endAtomResult === null) {
      return null;
    }

    const { endAtom, endPos, dist } = this.calculateEndAtomAndDistance(
      event,
      endAtomResult,
      undefined,
      beginAtom,
    );

    return {
      beginAtom,
      endAtom,
      beginPos: undefined,
      endPos,
      dist,
    };
  }

  private findEndAtomWhenDraggingFromAtom(event, beginAtom) {
    const editor = this.editor;
    const molecule = editor.render.ctab.molecule;
    let endAtom = editor.findItem(event, ['atoms'], this.dragCtx.item);

    const closestSGroup = editor.findItem(event, ['functionalGroups']);
    if (!closestSGroup?.id) {
      return endAtom;
    }

    const sgroup = molecule.sgroups.get(closestSGroup.id);
    if (!sgroup) {
      return endAtom;
    }

    const updatedEndAtom = this.handleSGroupInteraction(
      sgroup,
      beginAtom,
      endAtom,
    );
    return updatedEndAtom;
  }

  private handleSGroupInteraction(sgroup, beginAtom, endAtom) {
    const closestAttachmentAtomId = sgroup.getAttachmentAtomId();

    if (sgroup.isContracted()) {
      endAtom = this.getEndAtomForContractedSGroup(
        closestAttachmentAtomId,
        beginAtom,
        endAtom,
      );
    }

    if (endAtom && endAtom.id !== closestAttachmentAtomId) {
      this.editor.event.removeFG.dispatch({ fgIds: [sgroup.id] });
      return null;
    }

    return endAtom;
  }

  private getEndAtomForContractedSGroup(
    closestAttachmentAtomId,
    beginAtom,
    endAtom,
  ) {
    const hasAttachmentPoint = closestAttachmentAtomId === undefined;
    const isBeginFunctionalGroupItself = closestAttachmentAtomId === beginAtom;

    if (!hasAttachmentPoint && !isBeginFunctionalGroupItself) {
      return {
        id: closestAttachmentAtomId,
        map: 'atoms',
      };
    }
    return endAtom;
  }

  private handleDragFromCanvas(event) {
    const beginAtom = this.atomProps;
    const beginPos = this.dragCtx.xy0;
    const endAtomResult = this.findEndAtomWhenDraggingFromCanvas(event);

    if (endAtomResult === null) {
      return null;
    }

    const { endAtom, endPos, dist } = this.calculateEndAtomAndDistance(
      event,
      endAtomResult,
      beginPos,
      undefined,
    );

    return {
      beginAtom,
      endAtom,
      beginPos,
      endPos,
      dist,
    };
  }

  private findEndAtomWhenDraggingFromCanvas(event) {
    const editor = this.editor;
    const molecule = editor.render.ctab.molecule;
    const functionalGroups = molecule.functionalGroups;
    let endAtom = editor.findItem(event, ['atoms', 'functionalGroups']);

    const fgIds = this.checkFunctionalGroupsForRemoval(
      endAtom,
      functionalGroups,
    );

    if (fgIds.length > 0) {
      this.editor.event.removeFG.dispatch({ fgIds });
      delete this.dragCtx;
      return null;
    }

    if (endAtom?.map === 'functionalGroups') {
      endAtom = this.getAttachmentAtomFromFunctionalGroup(endAtom, molecule);
    }

    return endAtom;
  }

  private checkFunctionalGroupsForRemoval(endAtom, functionalGroups) {
    const atomResult: Array<number> = [];
    const result: Array<number> = [];

    if (endAtom?.map === 'atoms' && functionalGroups.size && this.dragCtx) {
      const atomId = FunctionalGroup.atomsInFunctionalGroup(
        functionalGroups,
        endAtom.id,
      );
      if (atomId !== null) {
        atomResult.push(atomId);
      }
    }

    for (const id of atomResult) {
      const fgId = FunctionalGroup.findFunctionalGroupByAtom(
        functionalGroups,
        id,
      );
      if (fgId !== null && !result.includes(fgId)) {
        result.push(fgId);
      }
    }

    return result;
  }

  private getAttachmentAtomFromFunctionalGroup(endAtom, molecule) {
    const functionalGroup = molecule.functionalGroups.get(endAtom.id);
    if (SGroup.isSaltOrSolvent(functionalGroup?.name || '')) {
      return endAtom;
    }

    const attachmentAtomId =
      functionalGroup?.relatedSGroup.getAttachmentAtomId();
    return attachmentAtomId === undefined
      ? null
      : {
          map: 'atoms',
          id: attachmentAtomId,
        };
  }

  private calculateEndAtomAndDistance(
    event,
    endAtomResult,
    beginPos,
    beginAtom,
  ) {
    const rnd = this.editor.render;
    let endAtom = endAtomResult;
    let endPos;
    let dist = Number.MAX_VALUE;

    if (endAtom?.map === 'atoms') {
      endAtom = endAtom.id;
    } else {
      endAtom = this.atomProps;
      const xy1 = CoordinateTransformation.pageToModel(event, rnd);
      dist = Vec2.dist(this.dragCtx.xy0, xy1);
      endPos = this.calculateEndPosition(
        beginPos,
        beginAtom,
        xy1,
        event.ctrlKey,
      );
    }

    return { endAtom, endPos, dist };
  }

  private calculateEndPosition(beginPos, beginAtom, xy1, ctrlKey) {
    if (beginPos) {
      return vectorUtils.calcNewAtomPos(beginPos, xy1, ctrlKey);
    }

    if (beginAtom !== undefined) {
      const atom = this.editor.render.ctab.molecule.atoms.get(beginAtom);
      if (atom) {
        return vectorUtils.calcNewAtomPos(atom.pp.get_xy0(), xy1, ctrlKey);
      }
    }

    return undefined;
  }

  private createBondAction(beginAtom, endAtom, beginPos, endPos, dist): void {
    const MIN_DISTANCE = 0.3;
    const rnd = this.editor.render;
    const molecule = rnd.ctab.molecule;
    const dragCtx = this.dragCtx;

    if (dist > MIN_DISTANCE) {
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
        this.dragCtx.existedBond = bond;
        this.dragCtx.action.mergeWith(
          fromOneBondDeletion(rnd.ctab, existingBondId),
        );
      }
    } else {
      delete dragCtx.action;
    }
  }

  mouseup(event) {
    if ('dragCtx' in this) {
      const dragCtx = this.dragCtx;
      const hasItem = 'item' in dragCtx;
      const render = this.editor.render;
      const struct = render.ctab.molecule;
      if ('action' in dragCtx) {
        this.restoreBondWhenHoveringOnCanvas(event);
        this.editor.update(dragCtx.action);
      } else if (!hasItem) {
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
      } else if (hasItem && dragCtx.item.map === 'atoms') {
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
          delete this.dragCtx.existedBond;
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
  restoreBondWhenHoveringOnCanvas(event) {
    if (!this.dragCtx.existedBond) {
      return;
    }
    const isHoveringOverAtom = this.editor.findItem(event, ['atoms']);
    if (!isHoveringOverAtom) {
      const { begin, end } = this.dragCtx.existedBond;
      const bondEnd = this.dragCtx.item.id === begin ? end : begin;
      this.dragCtx.action.mergeWith(
        fromBondAddition(
          this.editor.render.ctab,
          this.dragCtx.existedBond,
          this.dragCtx.item.id,
          bondEnd,
        )[0],
      );
      delete this.dragCtx.existedBond;
    }
  }

  getExistingBond(struct: Struct, begin: number, end: number) {
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
