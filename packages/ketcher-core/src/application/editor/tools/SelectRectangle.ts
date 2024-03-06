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
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { SequenceMode } from '../modes';
import { isMacOs } from 'react-device-detect';

class SelectRectangle implements BaseTool {
  private brush;
  private brushArea;
  private moveStarted;
  private mousePositionAfterMove = new Vec2(0, 0, 0);
  private mousePositionBeforeMove = new Vec2(0, 0, 0);
  private canvasResizeObserver?: ResizeObserver;
  private history: EditorHistory;
  private previousSelectedEntities: [number, DrawingEntity][] = [];

  constructor(private editor: CoreEditor) {
    this.editor = editor;
    this.history = new EditorHistory(this.editor);
    this.destroy();
    this.createBrush();
    console.log(this.editor);
  }

  private createBrush() {
    this.brushArea = select(this.editor.canvas)
      .insert('g', ':first-child')
      .attr('id', 'rectangle-selection-area');

    this.brush = d3Brush();

    const brushed = (mo) => {
      this.setSelectedEntities();
      if (mo.selection) {
        this.brushArea.call(this.brush?.clear);
      }
    };

    const onBrush = (brushEvent) => {
      const selection = brushEvent.selection;
      if (!selection) return;
      requestAnimationFrame(() => {
        const topLeftPoint = Coordinates.viewToCanvas(
          new Vec2(selection[0][0], selection[0][1]),
        );
        const bottomRightPoint = Coordinates.viewToCanvas(
          new Vec2(selection[1][0], selection[1][1]),
        );
        console.log(this.editor);
        const modelChanges =
          this.editor.drawingEntitiesManager.selectIfLocatedInRectangle(
            topLeftPoint,
            bottomRightPoint,
            this.previousSelectedEntities,
            brushEvent.sourceEvent.shiftKey,
          );

        this.editor.renderersContainer.update(modelChanges);
      });
    };

    this.brush.on('brush', onBrush);
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

      this.brush
        .extent([
          [0, 0],
          [canvas.width.baseVal.value, canvas.height.baseVal.value],
        ])
        .keyModifiers(false)
        .filter((e) => {
          e.preventDefault();
          if (e.shiftKey) {
            e.stopPropagation();
          }
          return true;
        });

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
    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
    this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;
    const ModKey = isMacOs ? event.metaKey : event.ctrlKey;

    let modelChanges: Command;
    if (renderer instanceof BaseRenderer && !event.shiftKey && !ModKey) {
      this.moveStarted = true;
      if (
        renderer.drawingEntity.selected &&
        !(this.editor.mode instanceof SequenceMode)
      ) {
        return;
      }
      const drawingEntities =
        this.editor.drawingEntitiesManager.getDrawingEntities(
          renderer.drawingEntity,
          false,
        );
      modelChanges =
        this.editor.drawingEntitiesManager.selectDrawingEntities(
          drawingEntities,
        );
    } else if (renderer instanceof BaseRenderer && event.shiftKey) {
      if (renderer.drawingEntity.selected) {
        return;
      }
      const drawingEntities =
        this.editor.drawingEntitiesManager.getDrawingEntities(
          renderer.drawingEntity,
        );
      modelChanges =
        this.editor.drawingEntitiesManager.addDrawingEntitiesToSelection(
          drawingEntities,
        );
    } else if (renderer instanceof BaseSequenceItemRenderer && ModKey) {
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
      drawingEntities = drawingEntities.concat(renderer.currentSubChain.bonds);
      modelChanges =
        this.editor.drawingEntitiesManager.selectDrawingEntities(
          drawingEntities,
        );
    } else {
      modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
    }
    this.editor.renderersContainer.update(modelChanges);
    this.setSelectedEntities();
  }

  mousemove() {
    if (this.editor.mode instanceof SequenceMode) {
      return;
    }
    if (this.moveStarted) {
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
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
      requestAnimationFrame(() => {
        this.editor.renderersContainer.update(modelChanges);
      });
    }
  }

  mouseup(event) {
    const renderer = event.target.__data__;
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

  setSelectedEntities() {
    this.previousSelectedEntities =
      this.editor.drawingEntitiesManager.allEntities.filter(
        ([, drawingEntity]) => drawingEntity.selected,
      );
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
