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
} from 'ketcher-core';

import Editor from '../Editor';
import { Tool } from './Tool';

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
    if (editor.selection() && editor.selection()?.bonds) {
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
      this.editor.event.removeFG.dispatch({ fgIds: result });
      return;
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
      this.editor.event.removeFG.dispatch({ fgIds: result });
      return;
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
      xy0: rnd.page2obj(event),
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
    const struct = this.editor.render.ctab;
    const molecule = struct.molecule;
    const functionalGroups = molecule.functionalGroups;
    const editor = this.editor;
    const rnd = editor.render;
    if ('dragCtx' in this) {
      const dragCtx = this.dragCtx;

      const pos = rnd.page2obj(event);
      let angle = vectorUtils.calcAngle(dragCtx.xy0, pos);
      if (!event.ctrlKey) angle = vectorUtils.fracAngle(angle, null);

      const degrees = vectorUtils.degrees(angle);
      this.editor.event.message.dispatch({ info: degrees + 'º' });

      if (!('item' in dragCtx) || dragCtx.item.map === 'atoms') {
        if ('action' in dragCtx) dragCtx.action.perform(rnd.ctab);
        let beginAtom;
        let endAtom;
        let beginPos;
        let endPos;
        if ('item' in dragCtx && dragCtx.item.map === 'atoms') {
          // first mousedown event intersect with any atom
          beginAtom = dragCtx.item.id;
          endAtom = editor.findItem(event, ['atoms'], dragCtx.item);
          const closestSGroup = editor.findItem(event, ['functionalGroups']);
          const sgroup = molecule.sgroups.get(closestSGroup?.id);

          if (sgroup) {
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

            if (endAtom) {
              if (endAtom.id !== closestAttachmentAtomId) {
                this.editor.event.removeFG.dispatch({ fgIds: [sgroup.id] });
                endAtom = null;
              }
            }
          }
        } else {
          // first mousedown event intersect with any canvas
          beginAtom = this.atomProps;
          beginPos = dragCtx.xy0;
          endAtom = editor.findItem(event, ['atoms', 'functionalGroups']);
          const atomResult: Array<number> = [];
          const result: Array<number> = [];
          if (
            endAtom &&
            endAtom.map === 'atoms' &&
            functionalGroups.size &&
            this.dragCtx
          ) {
            const atomId = FunctionalGroup.atomsInFunctionalGroup(
              functionalGroups,
              endAtom.id,
            );
            if (atomId !== null) atomResult.push(atomId);
          } else if (endAtom?.map === 'functionalGroups') {
            const functionalGroup = molecule.functionalGroups.get(endAtom.id);
            if (!SGroup.isSaltOrSolvent(functionalGroup?.name || '')) {
              const attachmentAtomId =
                functionalGroup?.relatedSGroup.getAttachmentAtomId();
              endAtom =
                attachmentAtomId === undefined
                  ? null
                  : {
                      map: 'atoms',
                      id: attachmentAtomId,
                    };
            }
          }
          if (atomResult.length > 0) {
            for (const id of atomResult) {
              const fgId = FunctionalGroup.findFunctionalGroupByAtom(
                functionalGroups,
                id,
              );
              fgId !== null && !result.includes(fgId) && result.push(fgId);
            }
          }
          if (result.length > 0) {
            this.editor.event.removeFG.dispatch({ fgIds: result });
            delete this.dragCtx;
            return;
          }
        }
        let dist = Number.MAX_VALUE;
        if (endAtom?.map === 'atoms') {
          // after mousedown events is appered, cursor is moved and then cursor intersects any atoms
          endAtom = endAtom.id;
        } else {
          endAtom = this.atomProps;
          const xy1 = rnd.page2obj(event);
          dist = Vec2.dist(dragCtx.xy0, xy1);
          if (beginPos) {
            // rotation only, leght of bond = 1;
            endPos = vectorUtils.calcNewAtomPos(beginPos, xy1, event.ctrlKey);
          } else {
            // first mousedown event intersect with any atom and
            // rotation only, leght of bond = 1;
            const atom = rnd.ctab.molecule.atoms.get(beginAtom);
            endPos = vectorUtils.calcNewAtomPos(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              atom!.pp.get_xy0(),
              xy1,
              event.ctrlKey,
            );
          }
        }
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
            this.dragCtx.existedBond = bond;
            this.dragCtx.action.mergeWith(
              fromOneBondDeletion(rnd.ctab, existingBondId),
            );
          }
        } else {
          delete dragCtx.action;
        }
        this.restoreBondWhenHoveringOnCanvas(event);
        this.editor.update(dragCtx.action, true);
        return true;
      }
    }
    this.editor.hover(
      this.editor.findItem(event, ['atoms', 'bonds', 'functionalGroups']),
      null,
      event,
    );
    return true;
  }

  mouseup(event) {
    if ('dragCtx' in this) {
      const dragCtx = this.dragCtx;
      const render = this.editor.render;
      const struct = render.ctab.molecule;
      if ('action' in dragCtx) {
        this.restoreBondWhenHoveringOnCanvas(event);
        this.editor.update(dragCtx.action);
      } else if (!('item' in dragCtx)) {
        const editorOptions = this.editor.options();
        const QUARTER_OF_BOND_WIDTH = 20;
        const QUARTER_OF_BOND_HEIGHT = 5;
        const xy = render.page2obj({
          clientX: event.clientX + QUARTER_OF_BOND_WIDTH * editorOptions.zoom,
          clientY: event.clientY - QUARTER_OF_BOND_HEIGHT * editorOptions.zoom,
        });
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
        this.editor.update(
          fromBondAddition(render.ctab, this.bondProps, dragCtx.item.id, {
            label: 'C',
          })[0],
        );
        delete this.dragCtx.existedBond;
      } else if (dragCtx.item.map === 'bonds') {
        const bondProps = Object.assign({}, this.bondProps);
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
