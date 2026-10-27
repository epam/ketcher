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
  fromMultipleMove,
  fromPlusAddition,
  CoordinateTransformation,
  type Vec2,
  type Action,
} from 'ketcher-core';
import type Editor from '../Editor';
import type { Tool } from './Tool';
import { handleMovingPosibilityCursor } from '../utils';

interface ReactionPlusDragContext {
  xy0: Vec2;
  action?: Action;
}

class ReactionPlusTool implements Tool {
  private readonly editor: Editor;
  private dragCtx: ReactionPlusDragContext | undefined;

  constructor(editor: Editor) {
    this.editor = editor;
    this.editor.selection(null);
  }

  mousedown(event: PointerEvent) {
    const rnd = this.editor.render;
    const ci = this.editor.findItem(event, ['rxnPluses']);

    if (ci?.map === 'rxnPluses') {
      this.editor.hover(null);
      this.editor.selection({ rxnPluses: [ci.id] });
      this.dragCtx = { xy0: CoordinateTransformation.pageToModel(event, rnd) };
    }
  }

  mousemove(event: PointerEvent) {
    const editor = this.editor;
    const rnd = editor.render;

    if (this.dragCtx) {
      if (this.dragCtx.action) {
        this.dragCtx.action.perform(rnd.ctab);
      }

      this.dragCtx.action = fromMultipleMove(
        rnd.ctab,
        this.editor.selection() || {},
        CoordinateTransformation.pageToModel(event, rnd).sub(this.dragCtx.xy0),
      );
      editor.update(this.dragCtx.action, true);
    } else {
      const item = editor.findItem(event, ['rxnPluses']);
      editor.hover(item, null, event);

      handleMovingPosibilityCursor(
        item,
        editor.render.paper.canvas,
        editor.render.options.movingStyle.cursor as string,
      );
    }
  }

  mouseup() {
    if (this.dragCtx) {
      if (this.dragCtx.action) {
        this.editor.update(this.dragCtx.action); // TODO investigate, subsequent undo/redo fails
      }

      this.dragCtx = undefined;
    }

    return true;
  }

  click(event: PointerEvent) {
    const rnd = this.editor.render;
    const ci = this.editor.findItem(event, ['rxnPluses']);

    if (!ci) {
      this.editor.update(
        fromPlusAddition(
          rnd.ctab,
          CoordinateTransformation.pageToModel(event, rnd),
        ),
      );
    }
  }
}

export default ReactionPlusTool;
