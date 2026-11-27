/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type Action,
  type Handle,
  type ShapeDrawSession,
  type SimpleObjectMode,
  type Vec2,
  createShapeDrawSession,
  fromMultipleMove,
  fromSimpleObjectAddition,
  fromSimpleObjectDeletion,
  fromSimpleObjectGeometryUpdate,
  fromSimpleObjectHandleDrag,
  CoordinateTransformation,
  SimpleObjectDelete,
} from 'ketcher-core';
import type Editor from '../Editor';
import type { ClosestItemWithMap } from '../shared/closest.types';
import type { Tool } from './Tool';

interface SimpleObjectDragContext {
  p0: Vec2;
  previous?: Vec2;
  ci?: ClosestItemWithMap<Handle>;
  drawSession?: ShapeDrawSession;
  action?: Action;
  itemId?: number;
}

class SimpleObjectTool implements Tool {
  private readonly mode: SimpleObjectMode;
  private readonly editor: Editor;
  private dragCtx?: SimpleObjectDragContext;

  constructor(editor: Editor, mode: SimpleObjectMode) {
    this.mode = mode;
    this.editor = editor;
    this.editor.selection(null);
  }

  mousedown(event: PointerEvent) {
    const rnd = this.editor.render;
    const p0 = CoordinateTransformation.pageToModel(event, rnd);
    this.dragCtx = { p0 };

    const ci = this.editor.findItem(event, [
      'simpleObjects',
    ]) as ClosestItemWithMap<Handle> | null;

    if (ci?.map === 'simpleObjects') {
      this.editor.hover(null);
      this.editor.selection({ simpleObjects: [ci.id] });
      this.dragCtx.ci = ci;
    } else {
      this.dragCtx.drawSession = createShapeDrawSession(this.mode, p0);
      this.editor.selection(null);
    }
  }

  mousemove(event: PointerEvent) {
    const rnd = this.editor.render;

    if (!this.dragCtx) {
      const items = this.editor.findItem(event, ['simpleObjects']);
      this.editor.hover(items, null, event);
      return;
    }

    const current = CoordinateTransformation.pageToModel(event, rnd);
    this.dragCtx.previous = current;
    this.dragCtx.action?.perform(rnd.ctab);

    if (this.dragCtx.ci) {
      this.dragCtx.action = this.dragCtx.ci.ref
        ? fromSimpleObjectHandleDrag(
            rnd.ctab,
            this.dragCtx.ci.id,
            this.dragCtx.ci.ref,
            current,
          )
        : fromMultipleMove(
            rnd.ctab,
            this.editor.selection() ?? {},
            current.sub(this.dragCtx.p0),
          );
      this.editor.update(this.dragCtx.action, true);
      return;
    }

    const preview = this.dragCtx.drawSession?.update(current, {
      shift: event.shiftKey,
    });
    if (!preview) {
      return;
    }

    if (this.dragCtx.itemId === undefined) {
      const addition = fromSimpleObjectAddition(
        rnd.ctab,
        [preview.start, preview.start],
        this.mode,
        false,
      );
      const addOperation = addition.operations[0];
      if (!(addOperation instanceof SimpleObjectDelete)) {
        throw new TypeError(
          'Expected SimpleObjectDelete as the first operation of fromSimpleObjectAddition',
        );
      }
      this.dragCtx.itemId = addOperation.data.id;
      this.editor.update(addition, true);
    }

    this.dragCtx.action = fromSimpleObjectGeometryUpdate(
      rnd.ctab,
      this.dragCtx.itemId,
      preview,
    );
    this.editor.update(this.dragCtx.action, true);
  }

  mouseup(event: PointerEvent) {
    const dragCtx = this.dragCtx;
    delete this.dragCtx;

    if (!dragCtx?.action) {
      return;
    }

    if (dragCtx.drawSession && dragCtx.itemId !== undefined) {
      const rnd = this.editor.render;
      this.editor.update(
        fromSimpleObjectDeletion(rnd.ctab, dragCtx.itemId),
        true,
      );
      const shape = dragCtx.drawSession.finish(dragCtx.previous ?? dragCtx.p0, {
        shift: event.shiftKey,
      });
      if (!shape) {
        return;
      }
      this.editor.update(
        fromSimpleObjectAddition(
          rnd.ctab,
          [shape.start, shape.end],
          this.mode,
          false,
        ),
      );
      return;
    }

    this.editor.update(dragCtx.action);
  }
}

export default SimpleObjectTool;
