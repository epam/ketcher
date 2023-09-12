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
  Action,
  fromTemplateOnCanvas,
  fromMultipleMove,
  getHoverToFuse,
} from 'ketcher-core';
import Editor from '../Editor';
import { MODES } from 'src/constants';
import { getAngleFromEvent, getBondFlipSign } from './template';

const PREVIEW_DELAY = 300;
type CiType = { map: string; id: number; dist: number };

function getUniqueCiId(ci: CiType) {
  return `${ci.id}-${ci.map}`;
}

class TemplatePreview {
  private readonly editor: Editor;
  private readonly template;
  private readonly mode;
  private floatingPreviewAction: Action | null;
  private connectedPreviewAction: Action | null;
  private connectedPreviewTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPreviewId: string | null;

  private floatingPreview: {
    atoms: number[];
    bonds: number[];
  } | null;

  private position: Vec2;
  private previousPosition: Vec2;

  constructor(editor: Editor, template, mode) {
    this.editor = editor;
    this.template = template;
    this.floatingPreviewAction = new Action();
    this.connectedPreviewAction = null;
    this.connectedPreviewTimeout = null;
    this.lastPreviewId = null;
    this.mode = mode;
    this.floatingPreview = null;
    this.position = new Vec2();
    this.previousPosition = new Vec2();
  }

  private get struct() {
    return this.restruct.molecule;
  }

  private get restruct() {
    return this.editor.render.ctab;
  }

  private get isModeFunctionalGroup(): boolean {
    return this.mode === MODES.FG;
  }

  hidePreview() {
    this.hideConnectedPreview();
    this.hideFloatingPreview();
  }

  private getPreviewTarget() {
    const ci: CiType | null = this.editor.findItem(event, ['atoms', 'bonds']);

    if (ci && this.restruct.molecule[ci.map].get(ci.id)?.isPreview === false) {
      return ci;
    } else {
      return null;
    }
  }

  movePreview(event: MouseEvent) {
    this.position = this.editor.render.page2obj(event);

    const ci = this.getPreviewTarget();
    const isMouseAwayFromAtomsAndBonds = !ci;
    const isPreviewTargetChanged =
      ci && this.lastPreviewId !== getUniqueCiId(ci);

    const shouldHidePreview =
      isMouseAwayFromAtomsAndBonds || isPreviewTargetChanged;

    const shouldShowPreview =
      ci && !this.connectedPreviewAction && !this.connectedPreviewTimeout;

    if (shouldHidePreview) {
      this.hideConnectedPreview();
    }

    if (shouldShowPreview) {
      this.lastPreviewId = getUniqueCiId(ci);
      this.connectedPreviewTimeout = setTimeout(() => {
        this.hideFloatingPreview();
        this.showConnectedPreview(event, ci);
      }, PREVIEW_DELAY);
    } else if (shouldHidePreview) {
      if (!this.floatingPreview) {
        this.showFloatingPreview(this.position);
        this.previousPosition = this.position;
        this.editor.render.update(true, null, { resizeCanvas: false });
      } else {
        const dist = this.position.sub(this.previousPosition);
        this.previousPosition = this.position;
        fromMultipleMove(this.restruct, this.floatingPreview, dist);
        this.editor.render.update(true, null, { resizeCanvas: false });
        const mergeItems = getItemsToFuse(this.editor, this.floatingPreview);
        this.editor.hover(getHoverToFuse(mergeItems));
      }
    }
    this.previousPosition = this.position;
  }

  private showFloatingPreview(position: Vec2) {
    [this.floatingPreviewAction, this.floatingPreview] = fromTemplateOnCanvas(
      this.restruct,
      this.template,
      position,
    );

    this.editor.render.update(true, null, { resizeCanvas: false });
  }

  private hideFloatingPreview() {
    if (this.floatingPreviewAction) {
      const action = this.floatingPreviewAction.perform(this.restruct);
      this.editor.update(action, true);
      this.floatingPreviewAction = null;
      this.floatingPreview = null;
    }
  }

  private hideConnectedPreview() {
    if (this.connectedPreviewAction) {
      this.connectedPreviewAction.perform(this.restruct);
      this.connectedPreviewAction = null;
      this.editor.render.update();
    }
    if (this.connectedPreviewTimeout) {
      clearTimeout(this.connectedPreviewTimeout);
      this.connectedPreviewTimeout = null;
    }
  }

  private showConnectedPreview(event: MouseEvent, ci: CiType) {
    if (ci.map === 'bonds' && !this.isModeFunctionalGroup) {
      const bond = this.struct.bonds.get(ci.id);

      if (!bond) {
        return;
      }

      const sign1 = getBondFlipSign(this.struct, bond);
      const sign2 = this.template.sign;
      const shouldFlip = sign1 * sign2 > 0;

      const promise = fromTemplateOnBondAction(
        this.restruct,
        this.template,
        ci.id,
        this.editor.event,
        shouldFlip,
        true,
        true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as Promise<any>;

      promise.then(([action, pasteItems]) => {
        if (!this.isModeFunctionalGroup) {
          const mergeItems = getItemsToFuse(this.editor, pasteItems);
          action = fromItemsFuse(this.restruct, mergeItems).mergeWith(action);
          this.editor.update(action, true);
          this.connectedPreviewAction = action;
        }
      });
    } else if (ci.map === 'atoms') {
      const angle = getAngleFromEvent(event, ci, this.restruct);

      let [action, pasteItems] = fromTemplateOnAtom(
        this.restruct,
        this.template,
        ci.id,
        angle,
        false,
        true,
      );

      if (pasteItems && !this.isModeFunctionalGroup) {
        const mergeItems = getItemsToFuse(this.editor, pasteItems);
        action = fromItemsFuse(this.restruct, mergeItems).mergeWith(action);
      }

      this.editor.update(action, true);
      this.connectedPreviewAction = action;
    }
  }
}

export default TemplatePreview;
