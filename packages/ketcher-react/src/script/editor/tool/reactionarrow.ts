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
  fromArrowAddition,
  fromArrowDeletion,
  fromArrowResizing,
  fromMultipleMove,
  RxnArrowMode,
  Vec2,
} from 'ketcher-core';
import assert from 'assert';
import Editor from '../Editor';
import { Tool } from './Tool';

class ReactionArrowTool implements Tool {
  private readonly mode: RxnArrowMode;
  private readonly editor: Editor;
  private dragCtx: any;

  constructor(editor, mode) {
    this.mode = mode;
    this.editor = editor;
    this.editor.selection(null);
  }

  private get render() {
    return this.editor.render;
  }

  private get reStruct() {
    return this.render.ctab;
  }

  mousedown(event) {
    const p0 = this.render.page2obj(event);
    this.dragCtx = { p0 };

    const ci = this.editor.findItem(event, ['rxnArrows']);

    if (ci && ci.map === 'rxnArrows') {
      this.editor.hover(null);
      this.editor.selection({ rxnArrows: [ci.id] });
      this.dragCtx.ci = ci;
    } else {
      this.dragCtx.isNew = true;
      this.editor.selection(null);
    }
  }

  mousemove(event: PointerEvent) {
    if (this.dragCtx) {
      const current = this.render.page2obj(event);
      const diff = current.sub(this.dragCtx.p0);

      if (this.dragCtx.ci) {
        this.dragCtx.itemId = this.dragCtx.ci.id;
        if (this.dragCtx.action) {
          this.dragCtx.action.perform(this.reStruct);
        }

        if (!this.dragCtx.ci.ref) {
          this.dragCtx.action = fromMultipleMove(
            this.reStruct,
            this.editor.selection() || {},
            diff,
          );
        } else {
          this.updateResizingState(this.dragCtx.itemId, true);
          const isSnappingEnabled = !event.ctrlKey;
          this.dragCtx.action = fromArrowResizing(
            this.reStruct,
            this.dragCtx.itemId,
            diff,
            current,
            this.dragCtx.ci.ref,
            isSnappingEnabled,
          );
        }
        this.editor.update(this.dragCtx.action, true);
      } else {
        if (!this.dragCtx.action) {
          const action = fromArrowAddition(
            this.reStruct,
            [this.dragCtx.p0, this.dragCtx.p0],
            this.mode,
          );
          // TODO: need to rework  actions/operations logic
          const addOperation = action.operations[0];
          this.dragCtx.itemId = addOperation.data.id;
          this.dragCtx.action = action;
          this.editor.update(this.dragCtx.action, true);
        } else {
          this.dragCtx.action.perform(this.reStruct);
        }

        this.updateResizingState(this.dragCtx.itemId, true);
        const isSnappingEnabled = !event.ctrlKey;
        this.dragCtx.action = fromArrowResizing(
          this.reStruct,
          this.dragCtx.itemId,
          diff,
          current,
          null,
          isSnappingEnabled,
        );
        this.editor.update(this.dragCtx.action, true);
      }
    } else {
      const items = this.editor.findItem(event, ['rxnArrows']);
      this.editor.hover(items, null, event);
    }
  }

  mouseup(event) {
    if (!this.dragCtx) {
      return true;
    }

    if (this.dragCtx.action) {
      if (this.dragCtx.isNew) {
        this.addNewArrowWithDragging();
      } else {
        this.updateResizingState(this.dragCtx.itemId, false);
        this.editor.update(true);
      }
      this.editor.update(this.dragCtx.action);
    } else {
      this.addNewArrowWithClicking(event);
    }
    delete this.dragCtx;
    return true;
  }

  private addNewArrowWithDragging() {
    const item = this.reStruct.molecule.rxnArrows.get(this.dragCtx.itemId);
    assert(item != null);
    let [p0, p1] = item.pos;
    p1 = getDefaultLengthPos(p0, p1);
    this.editor.update(
      fromArrowDeletion(this.reStruct, this.dragCtx.itemId),
      true,
    );
    this.dragCtx.action = fromArrowAddition(this.reStruct, [p0, p1], this.mode);
  }

  private addNewArrowWithClicking(event) {
    const ci = this.editor.findItem(event, ['rxnArrows']);
    const p0 = this.render.page2obj(event);

    if (!ci) {
      const pos = [p0, getDefaultLengthPos(p0, null)];
      this.editor.update(fromArrowAddition(this.reStruct, pos, this.mode));
    }
  }

  private updateResizingState(arrowId: number, isResizing: boolean) {
    const reArrow = this.reStruct.rxnArrows.get(arrowId);
    assert(reArrow != null);
    reArrow.isResizing = isResizing;
  }
}

function getArrowParams(x1, y1, x2, y2) {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = calcAngle(x2, y2, x1, y1);
  return { length, angle };
}

function getDefaultLengthPos(pos1, pos2) {
  const minLength = 1.5;
  const defaultLength = 2;
  if (!pos2) {
    return new Vec2(pos1.x + defaultLength, pos1.y);
  }
  const arrowParams = getArrowParams(pos1.x, pos1.y, pos2.x, pos2.y);
  if (arrowParams.length <= minLength) {
    const newPos = new Vec2();
    newPos.x =
      pos1.x + defaultLength * Math.cos((Math.PI * arrowParams.angle) / 180);
    newPos.y =
      pos1.y + defaultLength * Math.sin((Math.PI * arrowParams.angle) / 180);
    return newPos;
  }
  return pos2;
}

function calcAngle(x1, y1, x2, y2) {
  const x = x1 - x2;
  const y = y1 - y2;
  if (!x && !y) {
    return 0;
  }
  return (180 + (Math.atan2(-y, -x) * 180) / Math.PI + 360) % 360;
}

export default ReactionArrowTool;
