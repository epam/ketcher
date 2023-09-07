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
  Vec2,
  fromItemsFuse,
  fromTemplateOnAtom,
  fromTemplateOnBondAction,
  getItemsToFuse,
  ReStruct,
  Struct,
  Action,
  vectorUtils,
  Bond,
  fromTemplateOnCanvas,
  fromMultipleMove,
  getHoverToFuse,
} from 'ketcher-core';
import Editor from '../Editor';
import { MODES } from 'src/constants';
import { Tool } from './Tool';

export const PREVIEW_DELAY = 300;

function getBondFlipSign(struct: Struct, bond: Bond): number {
  const xy0 = new Vec2();
  const frid = struct.atoms.get(bond?.begin as number)?.fragment;
  const frIds = struct.getFragmentIds(frid as number);
  let count = 0;

  let loop = struct.halfBonds.get(bond?.hb1 as number)?.loop;

  if (loop && loop < 0) {
    loop = struct.halfBonds.get(bond?.hb2 as number)?.loop;
  }

  if (loop && loop >= 0) {
    const loopHbs = struct.loops.get(loop)?.hbs;
    loopHbs?.forEach((hb) => {
      const halfBondBegin = struct.halfBonds.get(hb)?.begin;

      if (halfBondBegin) {
        const hbbAtom = struct.atoms.get(halfBondBegin);

        if (hbbAtom) {
          xy0.add_(hbbAtom.pp); // eslint-disable-line no-underscore-dangle
          count++;
        }
      }
    });
  } else {
    frIds.forEach((id) => {
      const atomById = struct.atoms.get(id);

      if (atomById) {
        xy0.add_(atomById.pp); // eslint-disable-line no-underscore-dangle
        count++;
      }
    });
  }

  const v0 = xy0.scaled(1 / count);
  return getSign(struct, bond, v0) || 1;
}

function getAngleFromEvent(event, ci, restruct) {
  const degree = restruct.atoms.get(ci.id)?.a.neighbors.length;
  let angle;
  if (degree && degree > 1) {
    // common case
    angle = null;
  } else if (degree === 1) {
    // on chain end
    const atom = restruct.molecule.atoms.get(ci.id);
    const neiId =
      atom && restruct.molecule.halfBonds.get(atom.neighbors[0])?.end;
    const nei: any =
      (neiId || neiId === 0) && restruct.molecule.atoms.get(neiId);

    angle = event.ctrlKey
      ? vectorUtils.calcAngle(nei?.pp, atom?.pp)
      : vectorUtils.fracAngle(vectorUtils.calcAngle(nei.pp, atom?.pp), null);
  } else {
    // on single atom
    angle = 0;
  }
  return angle;
}

function getUniqueCiId(ci) {
  return `${ci.id}-${ci.map}`;
}

export enum TemplatePreviewState {
  FLOATING = 'floating',
  CONNECTED = 'connected',
}

export class TemplatePreview {
  private readonly editor: Editor;
  private readonly template: any;
  private readonly mode: any;
  private isPreviewVisible: boolean;
  private floatingPreviewAction: Action | null;
  private connectedPreviewAction: Action | null;
  private previewTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPreviewId: string | null;

  private connectedPreview: any;

  private position: Vec2;
  private previousPosition: Vec2;

  constructor(editor: Editor, template) {
    this.editor = editor;
    this.template = template;

    this.isPreviewVisible = false;
    this.floatingPreviewAction = new Action();
    this.connectedPreviewAction = new Action();
    this.previewTimeout = null;
    this.lastPreviewId = null;
    this.mode = getTemplateMode(template);

    this.connectedPreview = null;

    this.position = new Vec2();
    this.previousPosition = new Vec2();
  }

  private get struct() {
    return this.editor.render.ctab.molecule;
  }

  private get isModeFunctionalGroup(): boolean {
    return this.mode === MODES.FG;
  }

  movePreview(position: Vec2) {
    const clientPosition = positionToClient(position);
    const scaledPosition = this.editor.render.page2obj(clientPosition);
    this.position = scaledPosition;
    const restruct = this.editor.render.ctab;

    const ci = this.editor.findItem(clientPosition, ['atoms', 'bonds']);
    const isMouseAwayFromAtomsAndBonds = !ci;
    const isPreviewTargetChanged =
      ci && this.lastPreviewId !== getUniqueCiId(ci);

    const shouldHidePreview =
      isMouseAwayFromAtomsAndBonds || isPreviewTargetChanged;
    if (shouldHidePreview) {
      this.hideConnectedPreview();
    }

    const shouldShowPreview =
      ci && !this.isPreviewVisible && !this.previewTimeout;
    if (shouldShowPreview) {
      this.lastPreviewId = getUniqueCiId(ci);

      this.previewTimeout = setTimeout(() => {
        this.showConnectedPreview(positionToClient(position), ci, restruct);
      }, PREVIEW_DELAY);
    } else if (shouldHidePreview) {
      if (!this.connectedPreview) {
        this.showFloatingPreview(this.position);
        this.previousPosition = scaledPosition;
        this.editor.render.update(true, null, { resizeCanvas: false });
      } else {
        const dist = this.position.sub(this.previousPosition);
        this.previousPosition = this.position;
        fromMultipleMove(restruct, this.connectedPreview, dist);
        this.editor.render.update(true, null, { resizeCanvas: false });
        const mergeItems = getItemsToFuse(this.editor, this.connectedPreview);
        this.editor.hover(getHoverToFuse(mergeItems), this);
      }
    }
    this.previousPosition = this.position;
  }

  showFloatingPreview(scaledPosition: Vec2) {
    const restruct = this.editor.render.ctab;
    [this.connectedPreviewAction, this.connectedPreview] = fromTemplateOnCanvas(
      restruct,
      this.template,
      scaledPosition,
    );

    this.editor.render.update(true, null, { resizeCanvas: false });
  }

  hideFloatingPreview() {
    if (this.floatingPreviewAction) {
      const restruct = this.editor.render.ctab;
      this.floatingPreviewAction.perform(restruct);
      this.editor.render.update(true, null, { resizeCanvas: false });
      this.floatingPreviewAction = null;
    }
  }

  hideConnectedPreview() {
    if (this.isPreviewVisible && this.floatingPreviewAction) {
      this.floatingPreviewAction.perform(this.editor.render.ctab);
      this.floatingPreviewAction = null;
      this.isPreviewVisible = false;
      this.editor.render.update();
    }
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }
  }

  showConnectedPreview(
    event: MouseEvent | { clientX: number; clientY: number },
    ci,
    restruct: ReStruct,
  ) {
    if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      // preview for bonds
      this.isPreviewVisible = true;
      this.editor.hoverIcon.hide();
      const bond = this.struct.bonds.get(ci.id);

      if (!bond) {
        return;
      }

      const sign1 = getBondFlipSign(this.struct, bond);
      const sign2 = this.template.sign;
      const shouldFlip = sign1 * sign2 > 0;

      const promise = fromTemplateOnBondAction(
        restruct,
        this.template,
        ci.id,
        this.editor.event,
        shouldFlip,
        true,
        true,
      ) as Promise<any>;

      promise.then(([action, pasteItems]) => {
        if (!this.isModeFunctionalGroup) {
          const mergeItems = getItemsToFuse(this.editor, pasteItems);
          action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
          this.editor.update(action, true);
          this.floatingPreviewAction = action;
        }
      });
    } else if (ci.map === 'atoms') {
      // preview for atoms
      this.isPreviewVisible = true;
      this.editor.hoverIcon.hide();
      const angle = getAngleFromEvent(event, ci, restruct);

      let [action, pasteItems] = fromTemplateOnAtom(
        restruct,
        this.template,
        ci.id,
        angle,
        false,
        true,
      );

      if (pasteItems && !this.isModeFunctionalGroup) {
        const mergeItems = getItemsToFuse(this.editor, pasteItems);
        action = fromItemsFuse(restruct, mergeItems).mergeWith(action);
      }

      this.editor.update(action, true);
      this.floatingPreviewAction = action;
    }
  }
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

function getSign(molecule, bond, v) {
  const begin = molecule.atoms.get(bond.begin).pp;
  const end = molecule.atoms.get(bond.end).pp;

  const sign = Vec2.cross(Vec2.diff(begin, end), Vec2.diff(v, end));

  if (sign > 0) {
    return 1;
  }

  if (sign < 0) {
    return -1;
  }

  return 0;
}

function positionToClient(position: Vec2) {
  return {
    clientX: position.x,
    clientY: position.y,
  }
}

export default TemplatePreview;
