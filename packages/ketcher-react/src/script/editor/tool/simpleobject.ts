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
  fromSimpleObjectAddition,
  fromSimpleObjectDeletion,
  fromSimpleObjectResizing,
  SimpleObjectMode,
} from 'ketcher-core';
import Editor from '../Editor';
import { Tool } from './Tool';

class SimpleObjectTool implements Tool {
  private readonly mode: SimpleObjectMode;
  private readonly editor: Editor;
  private dragCtx: any;

  constructor(editor: Editor, mode: SimpleObjectMode) {
    this.mode = mode;
    this.editor = editor;
    this.editor.selection(null);
  }

  mousedown(event) {
    const rnd = this.editor.render;
    const p0 = rnd.page2obj(event);
    this.dragCtx = { p0 };

    const ci = this.editor.findItem(event, ['simpleObjects']);

    if (ci && ci.map === 'simpleObjects') {
      this.editor.hover(null);
      this.editor.selection({ simpleObjects: [ci.id] });
      this.dragCtx.ci = ci;
    } else {
      this.dragCtx.isNew = true;
      this.editor.selection(null);
    }
  }

  mousemove(event) {
    const rnd = this.editor.render;

    if (this.dragCtx) {
      const current = rnd.page2obj(event);
      const diff = current.sub(this.dragCtx.p0);
      this.dragCtx.previous = current;

      if (this.dragCtx.ci) {
        if (this.dragCtx.action) {
          this.dragCtx.action.perform(rnd.ctab);
        }

        if (!this.dragCtx.ci.ref) {
          this.dragCtx.action = fromMultipleMove(
            rnd.ctab,
            this.editor.selection() || {},
            diff,
          );
        } else {
          this.dragCtx.action = fromSimpleObjectResizing(
            rnd.ctab,
            this.dragCtx.ci.id,
            diff,
            current,
            this.dragCtx.ci.ref,
            event.shiftKey,
          );
        }
        this.editor.update(this.dragCtx.action, true);
      } else {
        if (!this.dragCtx.action) {
          const action = fromSimpleObjectAddition(
            rnd.ctab,
            [this.dragCtx.p0, this.dragCtx.p0],
            this.mode,
            false,
          );
          // TODO: need to rework  actions/operations logic
          const addOperation = action.operations[0];
          this.dragCtx.itemId = addOperation.data.id;
          this.dragCtx.action = action;
          this.editor.update(this.dragCtx.action, true);
        } else {
          this.dragCtx.action.perform(rnd.ctab);
        }

        this.dragCtx.action = fromSimpleObjectResizing(
          rnd.ctab,
          this.dragCtx.itemId,
          diff,
          current,
          null,
          event.shiftKey,
        );
        this.editor.update(this.dragCtx.action, true);
      }
    } else {
      const items = this.editor.findItem(event, ['simpleObjects']);
      this.editor.hover(items, null, event);
    }
  }

  mouseup(event) {
    if (!this.dragCtx) {
      return true;
    }

    if (this.dragCtx.action) {
      if (this.dragCtx.isNew) {
        const rnd = this.editor.render;
        this.editor.update(
          fromSimpleObjectDeletion(rnd.ctab, this.dragCtx.itemId),
          true,
        );
        this.dragCtx.action = fromSimpleObjectAddition(
          rnd.ctab,
          [this.dragCtx.p0, this.dragCtx.previous],
          this.mode,
          event.shiftKey,
        );
      }
      this.editor.update(this.dragCtx.action);
    }

    delete this.dragCtx;
    return true;
  }
}

export default SimpleObjectTool;
