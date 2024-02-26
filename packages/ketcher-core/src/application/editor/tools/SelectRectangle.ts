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
import { CoreEditor, EditorHistory } from 'application/editor/internal';
import { brush as d3Brush, select } from 'd3';
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Command } from 'domain/entities/Command';
import { BaseTool } from 'application/editor/tools/Tool';
import { Coordinates } from '../shared/coordinates';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceMode } from '../modes';
import { DrawingEntity } from 'domain/entities/DrawingEntity';

class SelectRectangle implements BaseTool {
  private brush;
  private brushArea;
  private moveStarted;
  private sequenceEditSelectionStarted;
  private mousePositionAfterMove = new Vec2(0, 0, 0);
  private mousePositionBeforeMove = new Vec2(0, 0, 0);
  private canvasResizeObserver?: ResizeObserver;
  private history: EditorHistory;

  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.history = new EditorHistory(this.editor);
    this.destroy();
    this.createBrush();

    this.brush.on('brush', (brushEvent) => {
      const selection = brushEvent.selection;
      if (!selection) return;
      requestAnimationFrame(() => {
        const topLeftPoint = Coordinates.viewToCanvas(
          new Vec2(selection[0][0], selection[0][1]),
        );
        const bottomRightPoint = Coordinates.viewToCanvas(
          new Vec2(selection[1][0], selection[1][1]),
        );
        const modelChanges =
          this.editor.drawingEntitiesManager.selectIfLocatedInRectangle(
            topLeftPoint,
            bottomRightPoint,
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

    const handleResizeCanvas = () => {
      const { canvas } = this.editor;
      if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
        return;
      }

      this.brush.extent([
        [0, 0],
        [canvas.width.baseVal.value, canvas.height.baseVal.value],
      ]);

      this.brushArea.call(this.brush);
    };

    const canvasElement = this.editor.canvas;

    if (canvasElement) {
      this.canvasResizeObserver = new ResizeObserver(handleResizeCanvas);
      this.canvasResizeObserver.observe(canvasElement);
    }
  }

  mousedown(event) {
    const renderer = event.target.__data__;
    let modelChanges: Command;
    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
    this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;

    if (this.editor.sequenceEditMode) {
      this.editor.drawingEntitiesManager.addCursorLineForLetters(
        this.editor.lastCursorPositionOfCanvas,
      );
      this.sequenceEditSelectionStarted = true;
      this.brushArea.remove();
    } else {
      this.createBrush();
      if (
        renderer instanceof BaseRenderer &&
        !event.shiftKey &&
        !event.ctrlKey
      ) {
        this.moveStarted = true;
        if (renderer.drawingEntity.selected) {
          return;
        } else {
          const drawingEntities = [renderer.drawingEntity].concat(
            this.editor.drawingEntitiesManager.getRnaEntitiesForSequenceViewClick(
              renderer.drawingEntity,
            ),
          );
          modelChanges =
            this.editor.drawingEntitiesManager.selectDrawingEntities(
              drawingEntities,
            );
        }
      } else if (renderer instanceof BaseRenderer && event.shiftKey) {
        const drawingEntity = renderer.drawingEntity;
        modelChanges =
          this.editor.drawingEntitiesManager.addDrawingEntityToSelection(
            drawingEntity,
          );
      } else if (
        renderer instanceof BaseSequenceItemRenderer &&
        event.ctrlKey
      ) {
        let drawingEntities: DrawingEntity[] = renderer.currentSubChain.nodes
          .map((node) => {
            if (node instanceof Nucleoside) {
              return [node.sugar, node.rnaBase];
            } else if (node instanceof Nucleotide) {
              return [node.sugar, node.rnaBase, node.phosphate];
            } else {
              return node.monomer;
            }
          })
          .flat();
        drawingEntities = drawingEntities.concat(
          renderer.currentSubChain.bonds,
        );

        modelChanges =
          this.editor.drawingEntitiesManager.selectDrawingEntities(
            drawingEntities,
          );
      } else {
        modelChanges =
          this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
      }
      this.editor.renderersContainer.update(modelChanges);
    }
  }

  mousemove() {
    if (this.sequenceEditSelectionStarted) {
      requestAnimationFrame(() => {
        // select all the letters in previous lines
        const topLeftPoint = this.mousePositionAfterMove;
        const bottomRightPoint = this.editor.lastCursorPositionOfCanvas;
        const modelChanges =
          this.editor.drawingEntitiesManager.selectIfLocatedInSequenceEditingArea(
            topLeftPoint,
            bottomRightPoint,
          );
        this.editor.renderersContainer.update(modelChanges);
      });
    }
    if (this.moveStarted) {
      if (this.editor.mode instanceof SequenceMode) {
        return;
      } else {
        const modelChanges =
          this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
            Coordinates.canvasToModel(
              new Vec2(
                this.editor.lastCursorPositionOfCanvas.x -
                  this.mousePositionAfterMove.x,
                this.editor.lastCursorPositionOfCanvas.y -
                  this.mousePositionAfterMove.y,
              ),
            ),
          );
        requestAnimationFrame(() => {
          this.editor.renderersContainer.update(modelChanges);
        });
      }
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
    }
  }

  mouseup(event) {
    const renderer = event.target.__data__;
    if (this.sequenceEditSelectionStarted) {
      this.sequenceEditSelectionStarted = false;
      return;
    }
    if (this.moveStarted && renderer.drawingEntity?.selected) {
      this.moveStarted = false;

      if (
        Vec2.diff(
          this.mousePositionAfterMove,
          this.mousePositionBeforeMove,
        ).length() === 0
      ) {
        return;
      }
      const modelChanges =
        this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
          new Vec2(0, 0),
          Coordinates.canvasToModel(
            new Vec2(
              this.mousePositionAfterMove.x - this.mousePositionBeforeMove.x,
              this.mousePositionAfterMove.y - this.mousePositionBeforeMove.y,
            ),
          ),
        );
      this.history.update(modelChanges);
    }
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

    this.canvasResizeObserver?.disconnect();

    const modelChanges =
      this.editor.drawingEntitiesManager.unselectAllDrawingEntities();

    this.editor.renderersContainer.update(modelChanges);
  }
}

export { SelectRectangle };
