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
  type ReStruct,
  type Struct,
  Vec2,
  fromItemsFuse,
  fromTemplateOnAtom,
  fromTemplateOnBondAction,
  fromTemplateOnCanvas,
  getHoverToFuse,
  getItemsToFuse,
  FunctionalGroup,
  SGroup,
  fromFragmentDeletion,
  fromSgroupDeletion,
  Action,
  vectorUtils,
  BondAttr,
  AtomAttr,
  MonomerMicromolecule,
  CoordinateTransformation,
} from 'ketcher-core';
import type Editor from '../Editor';
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems';
import { MODES } from 'src/constants';
import type { Tool } from './Tool';
import TemplatePreview from './templatePreview';
import {
  getAngleFromEvent,
  getBondFlipSign,
  getSign,
} from './template.helpers';

export { getAngleFromEvent, getBondFlipSign, getSign };

class TemplateTool implements Tool {
  private readonly editor: Editor;
  private readonly mode: any;
  private readonly template: any;
  private readonly findItems: Array<string>;
  public templatePreview: TemplatePreview | null;
  private dragCtx: any;
  private targetGroupsIds: Array<number> = [];
  private readonly isSaltOrSolvent: boolean;
  private event: Event | undefined;

  constructor(editor: Editor, tmpl) {
    this.editor = editor;
    this.mode = getTemplateMode(tmpl);
    this.editor.selection(null);
    this.isSaltOrSolvent = SGroup.isSaltOrSolvent(tmpl.struct.name);
    const sGroup = tmpl.struct.sgroups.values().next().value as
      | SGroup
      | undefined;
    this.template = {
      aid: (parseInt(tmpl.aid) || sGroup?.getAttachmentAtomId()) ?? 0,
      bid: parseInt(tmpl.bid) || 0,
    };

    this.templatePreview = new TemplatePreview(
      editor,
      this.template,
      this.mode,
    );

    const frag = tmpl.struct;
    frag.rescale();

    const xy0 = new Vec2();
    frag.atoms.forEach((atom) => {
      xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
    });

    this.template.molecule = frag; // preloaded struct
    this.findItems = [];
    this.template.xy0 = xy0.scaled(1 / (frag.atoms.size || 1)); // template center

    const atom = frag.atoms.get(this.template.aid);
    if (atom) {
      this.template.angle0 = vectorUtils.calcAngle(atom.pp, this.template.xy0); // center tilt
      this.findItems.push('atoms');
    }

    const bond = frag.bonds.get(this.template.bid);
    if (bond && !this.isModeFunctionalGroup) {
      // template location sign against attachment bond
      this.template.sign = getSign(frag, bond, this.template.xy0);
      this.findItems.push('bonds');
    }

    const sGroupSize = frag.sgroups.size;
    if (sGroupSize) {
      this.findItems.push('functionalGroups');
    }
  }

  private get struct() {
    return this.editor.render.ctab.molecule;
  }

  private get functionalGroups() {
    return this.struct.functionalGroups;
  }

  private get isModeFunctionalGroup(): boolean {
    return this.mode === MODES.FG;
  }

  private get closestItem() {
    return this.editor.findItem(this.event, [
      'atoms',
      'bonds',
      'sgroups',
      'functionalGroups',
    ]);
  }

  private get isNeedToShowRemoveAbbreviationPopup(): boolean {
    const targetId = this.findKeyOfRelatedGroupId(
      this.closestItem?.id as number,
    );
    if (targetId === undefined) {
      return false;
    }
    const functionalGroup = this.functionalGroups.get(targetId);

    if (functionalGroup?.relatedSGroup instanceof MonomerMicromolecule) {
      return false;
    }

    const isTargetExpanded = functionalGroup?.isExpanded;
    const isTargetAtomOrBond =
      this.targetGroupsIds.length && !this.isModeFunctionalGroup;

    return Boolean(isTargetExpanded || isTargetAtomOrBond);
  }

  private findKeyOfRelatedGroupId(
    clickedClosestItemId?: number,
  ): number | undefined {
    if (clickedClosestItemId === undefined) {
      return undefined;
    }
    let targetId;

    const relatedGroupId = FunctionalGroup.findFunctionalGroupByAtom(
      this.functionalGroups,
      clickedClosestItemId,
    );

    this.functionalGroups.forEach((fg, key) => {
      if (fg.relatedSGroupId === relatedGroupId) {
        targetId = key;
      }
    });

    return targetId;
  }

  private showRemoveAbbreviationPopup(): Promise<void> {
    return this.editor.event.removeFG
      .dispatch({ fgIds: this.targetGroupsIds })
      .then(() => {
        // case when we remove abbreviation group, click on benzene ring and try to add it
        this.targetGroupsIds.length = 0;
        return Promise.resolve();
      });
  }

  async mousedown(event: MouseEvent) {
    const target = this.editor.findItem(event, this.findItems);
    const struct = this.editor.struct();

    this.event = event;

    this.templatePreview?.hidePreview();

    if (this.functionalGroups.size) {
      this.targetGroupsIds = getGroupIdsFromItemArrays(this.struct, {
        ...(this.closestItem?.map === 'atoms' && {
          atoms: [this.closestItem.id],
        }),
        ...(this.closestItem?.map === 'bonds' && {
          bonds: [this.closestItem.id],
        }),
      });

      if (
        // if point is functional group/sgroup and it is not expanded
        (this.closestItem?.map === 'functionalGroups' ||
          this.closestItem?.map === 'sgroups') &&
        FunctionalGroup.isContractedFunctionalGroup(
          this.closestItem.id,
          this.functionalGroups,
        )
      ) {
        this.targetGroupsIds.push(this.closestItem.id);
      }
    }

    if (struct.isTargetFromMacromolecule(target)) {
      return;
    }

    if (this.isNeedToShowRemoveAbbreviationPopup) {
      await this.showRemoveAbbreviationPopup();

      return;
    }

    this.editor.hover(null);

    this.dragCtx = {
      xy0: CoordinateTransformation.pageToModel(event, this.editor.render),
      item: this.editor.findItem(this.event, this.findItems),
    };

    const dragCtx = this.dragCtx;
    const ci = dragCtx.item;

    if (!ci) {
      //  ci.type == 'Canvas'
      delete dragCtx.item;
      return;
    }

    if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      // calculate fragment center
      const bond = this.struct.bonds.get(ci.id)!;

      // calculate default template flip
      dragCtx.sign1 = getBondFlipSign(this.struct, bond);
      dragCtx.sign2 = this.template.sign;
    }
  }

  mousemove(event) {
    if (!this.dragCtx) {
      this.editor.hover(
        this.editor.findItem(event, this.findItems),
        null,
        event,
      );

      this.templatePreview?.movePreview(event);

      return;
    }

    if (this.isSaltOrSolvent) {
      delete this.dragCtx.item;
      return;
    }

    const eventPosition = CoordinateTransformation.pageToModel(
      event,
      this.editor.render,
    );
    const dragCtx = this.dragCtx;
    const ci = dragCtx.item;
    let targetPos: Vec2 | null | undefined = null;
    /* moving when attached to bond */
    if (ci && ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      const bond = this.struct.bonds.get(ci.id);
      let sign = getSign(this.struct, bond, eventPosition);

      if (dragCtx.sign1 * this.template.sign > 0) {
        sign = -sign;
      }

      if (sign !== dragCtx.sign2 || !dragCtx.action) {
        if (dragCtx.action) {
          dragCtx.action.perform(this.editor.render.ctab);
        } // undo previous action

        dragCtx.sign2 = sign;
        const [action, pasteItems] = fromTemplateOnBondAction(
          this.editor.render.ctab,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          false,
        ) as Array<any>;

        dragCtx.action = action;
        this.editor.update(dragCtx.action, true);

        dragCtx.mergeItems = getItemsToFuse(this.editor, pasteItems);
        this.editor.hover(getHoverToFuse(dragCtx.mergeItems));
      }
      return;
    }
    /* end */

    let extraBond: boolean | null = null;
    // calc initial pos and is extra bond needed
    if (!ci) {
      //  ci.type == 'Canvas'
      targetPos = dragCtx.xy0;
    } else if (ci.map === 'atoms' || ci.map === 'functionalGroups') {
      const atomId = getTargetAtomId(this.struct, ci);

      if (atomId !== undefined) {
        const atom = this.struct.atoms.get(atomId);
        targetPos = atom?.pp ?? null;

        if (targetPos) {
          extraBond = this.isModeFunctionalGroup
            ? true
            : Vec2.dist(targetPos, eventPosition) > 1;
        }
      }
    }

    if (!targetPos) {
      return;
    }

    // calc angle
    let angle = vectorUtils.calcAngle(targetPos, eventPosition);

    if (!event.ctrlKey) {
      angle = vectorUtils.fracAngle(angle, null);
    }

    const degrees = vectorUtils.degrees(angle);
    this.editor.event.message.dispatch({ info: degrees + 'º' });

    // check if anything changed since last time
    if (
      // eslint-disable-next-line no-prototype-builtins
      dragCtx.hasOwnProperty('angle') &&
      dragCtx.angle === degrees &&
      // eslint-disable-next-line no-prototype-builtins
      (!dragCtx.hasOwnProperty('extra_bond') ||
        dragCtx.extra_bond === extraBond)
    ) {
      return;
    }

    // undo previous action
    if (dragCtx.action) {
      dragCtx.action.perform(this.editor.render.ctab);
    }

    // create new action
    dragCtx.angle = degrees;
    let action: Action | null = null;

    if (!ci) {
      const isAddingFunctionalGroup = this.template?.molecule?.sgroups.size;
      if (isAddingFunctionalGroup) {
        // skip, b/c we dont want to do any additional actions (e.g. rotating for s-groups)
        return;
      }
      [action] = fromTemplateOnCanvas(
        this.editor.render.ctab,
        this.template,
        targetPos,
        angle,
      );
    } else if (ci?.map === 'atoms' || ci?.map === 'functionalGroups') {
      const atomId = getTargetAtomId(this.struct, ci);
      [action] = fromTemplateOnAtom(
        this.editor.render.ctab,
        this.template,
        atomId,
        angle,
        extraBond,
      );
      dragCtx.extra_bond = extraBond;
    }
    dragCtx.action = action;

    this.editor.update(dragCtx.action, true);

    // TODO: refactor after #2195 comes into effect
    if (this.targetGroupsIds.length) this.targetGroupsIds.length = 0;
  }

  mouseup(event?) {
    const dragCtx = this.dragCtx;

    if (!dragCtx) {
      return;
    }

    delete this.dragCtx;

    const restruct = this.editor.render.ctab;
    let ci = dragCtx.item;

    /* after moving around bond */
    if (
      dragCtx.action &&
      ci &&
      ci.map === 'bonds' &&
      !this.isModeFunctionalGroup
    ) {
      dragCtx.action.perform(restruct); // revert drag action

      const promise = fromTemplateOnBondAction(
        restruct,
        this.template,
        ci.id,
        this.editor.event,
        dragCtx.sign1 * dragCtx.sign2 > 0,
        true,
      ) as Promise<any>;

      promise.then(([action, pasteItems]) => {
        const mergeItems = getItemsToFuse(this.editor, pasteItems);
        action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
        this.editor.update(action);
      });
      return;
    }
    /* end */

    let action, functionalGroupRemoveAction;

    if (
      ci?.map === 'functionalGroups' &&
      FunctionalGroup.isContractedFunctionalGroup(
        ci.id,
        this.functionalGroups,
      ) &&
      this.isModeFunctionalGroup &&
      this.targetGroupsIds.length
    ) {
      const restruct = this.editor.render.ctab;
      const functionalGroupToReplace = this.struct.sgroups.get(ci.id)!;

      if (
        this.isSaltOrSolvent &&
        functionalGroupToReplace.isGroupAttached(this.struct)
      ) {
        addOnCanvasWithoutMerge({
          restruct,
          template: this.template,
          dragCtx,
          editor: this.editor,
          event,
        });
        return;
      }

      functionalGroupRemoveAction = new Action();
      const { atomId: sGroupPositionAtomId } =
        functionalGroupToReplace.getContractedPosition(restruct.molecule);
      const atomsWithoutAttachmentAtom = SGroup.getAtoms(
        this.struct,
        functionalGroupToReplace,
      ).filter((id) => id !== sGroupPositionAtomId);

      functionalGroupRemoveAction.mergeWith(
        fromSgroupDeletion(restruct, ci.id),
      );
      functionalGroupRemoveAction.mergeWith(
        fromFragmentDeletion(restruct, { atoms: atomsWithoutAttachmentAtom }),
      );

      ci = { map: 'atoms', id: sGroupPositionAtomId };
    }

    if (!dragCtx.action) {
      if (!ci) {
        addOnCanvasWithoutMerge({
          restruct,
          template: this.template,
          dragCtx,
          editor: this.editor,
          event,
        });
        return;
      } else if (ci.map === 'atoms') {
        const degree = restruct.atoms.get(ci.id)?.a.neighbors.length;

        if (degree && degree >= 1 && this.isSaltOrSolvent) {
          addOnCanvasWithoutMerge({
            restruct,
            template: this.template,
            dragCtx,
            editor: this.editor,
            event,
          });
          return;
        }

        const angle = getAngleFromEvent(event, ci, restruct);

        [action] = fromTemplateOnAtom(
          restruct,
          this.template,
          ci.id,
          angle,
          false,
        );
        if (functionalGroupRemoveAction) {
          action = functionalGroupRemoveAction.mergeWith(action);
        }
        dragCtx.action = action;
      } else if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
        const promise = fromTemplateOnBondAction(
          restruct,
          this.template,
          ci.id,
          this.editor.event,
          dragCtx.sign1 * dragCtx.sign2 > 0,
          true,
        ) as Promise<any>;

        promise.then(([action, pasteItems]) => {
          if (!this.isModeFunctionalGroup) {
            const mergeItems = getItemsToFuse(this.editor, pasteItems);
            action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
            this.editor.update(action);
          }
        });

        return;
      }
    }
    for (const id of restruct.molecule.bonds.keys()) {
      new BondAttr(id, 'isPreview', false).perform(restruct);
    }

    for (const id of restruct.molecule.atoms.keys()) {
      new AtomAttr(id, 'isPreview', false).perform(restruct);
    }
    const completeAction = dragCtx.action;
    if (completeAction && !completeAction.isDummy(restruct)) {
      this.editor.update(completeAction);
    }
    this.editor.hover(this.editor.findItem(event, null), null, event);
  }

  cancel() {
    this.templatePreview?.hidePreview();
    this.mouseup();
  }

  mouseleave() {
    this.cancel();
  }

  mouseLeaveClientArea() {
    this.templatePreview?.hidePreview();
  }
}

function addOnCanvasWithoutMerge({
  restruct,
  template,
  dragCtx,
  editor,
  event,
}: {
  restruct: ReStruct;
  template: Struct;
  dragCtx;
  editor: Editor;
  event: PointerEvent;
}) {
  const [action] = fromTemplateOnCanvas(
    restruct,
    template,
    dragCtx.xy0,
    0,
    false,
  );
  editor.update(action);
  editor.selection(null);
  editor.hover(editor.findItem(event, null), null, event);
  editor.event.message.dispatch({
    info: false,
  });
}

function getTemplateMode(tmpl) {
  if (tmpl.mode) {
    return tmpl.mode;
  }

  if (['Functional Groups', 'Salts and Solvents'].includes(tmpl.props?.group)) {
    return MODES.FG;
  }

  return null;
}

function getTargetAtomId(struct: Struct, ci): number | void {
  if (ci.map === 'atoms') {
    return ci.id;
  }

  if (ci.map === 'functionalGroups') {
    const group = struct.sgroups.get(ci.id);
    return group?.getAttachmentAtomId();
  }
}

export default TemplateTool;
