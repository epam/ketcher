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
import { Vec2 } from 'domain/entities';
import { CoreEditor } from 'application/editor';
import { brush as d3Brush, select } from 'd3';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Command } from 'domain/entities/Command';
import { BaseTool } from 'application/editor/tools/Tool';

class SelectRectangle implements BaseTool {
  private brush;
  private brushArea;

  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.destroy();
    this.createBrush();

    this.brush.on('brush', (brushEvent) => {
      const selection = brushEvent.selection;
      if (!selection) return;

      requestAnimationFrame(() => {
        const modelChanges =
          this.editor.drawingEntitiesManager.selectIfLocatedInRectangle(
            new Vec2(selection[0][0], selection[0][1]),
            new Vec2(selection[1][0], selection[1][1]),
          );
        this.editor.renderersContainer.update(modelChanges);
      });
    });
  }

  private createBrush() {
    this.brushArea = select(this.editor.canvas)
      .insert('g', ':first-child')
      .attr('id', 'rectangle-selection-area');

    const brushed = (mo) => {
      if (mo.selection) {
        this.brushArea.call(this.brush.clear);
      }
    };

    this.brush = d3Brush();
    this.brush.on('end', brushed);
    this.brushArea.call(this.brush);

    this.brushArea
      .select('rect.selection')
      .style('fill', 'transparent')
      .style('stroke', 'darkgrey');
  }

  mousedown(event) {
    const renderer = event.target.__data__;
    let modelChanges: Command;
    if (renderer instanceof BaseRenderer) {
      modelChanges = this.editor.drawingEntitiesManager.selectDrawingEntity(
        renderer.drawingEntity,
      );
    } else {
      modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
    }
    this.editor.renderersContainer.update(modelChanges);
  }

  mouseOverDrawingEntity(event) {
    const renderer = event.target.__data__;
    const modelChanges =
      this.editor.drawingEntitiesManager.intendToSelectDrawingEntity(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  mouseLeaveDrawingEntity(event) {
    const renderer: BaseRenderer = event.target.__data__;

    const modelChanges =
      this.editor.drawingEntitiesManager.cancelIntentionToSelectDrawingEntity(
        renderer.drawingEntity,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  destroy() {
    if (this.brush) {
      this.brushArea.remove();
      this.brush = null;
      this.brushArea = null;
    }
    const modelChanges =
      this.editor.drawingEntitiesManager.unselectAllDrawingEntities();

    this.editor.renderersContainer.update(modelChanges);
  }
}

export { SelectRectangle };
