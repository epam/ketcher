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
import { BaseMonomer } from '../../../domain/entities/BaseMonomer';
import { Vec2 } from '../../../domain/entities/vec2';
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
import { EraserTool } from './Erase';
import { DeprecatedFlexModeOrSnakeModePolymerBondRenderer } from 'application/render';
import { PolymerBond } from 'domain/entities';
import { vectorUtils } from 'application/editor';
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
  }

  private createBrush() {
    this.brushArea = select(this.editor.canvas)
      .insert('g', ':first-child')
      .attr('id', 'rectangle-selection-area');

    this.brush = d3Brush();

    const brushed = (mo) => {
      this.setSelectedEntities();
      if (mo.selection) {
        this.brushArea?.call(this.brush?.clear);
      }
    };

    const onStartBrush = () => {
      const editor = CoreEditor.provideEditorInstance();
      if (editor.isSequenceEditInRNABuilderMode) {
        this.brushArea.select('rect.selection').style('stroke', 'transparent');
      } else {
        this.brushArea.select('rect.selection').style('stroke', 'darkgrey');
      }
    };

    const onBrush = (brushEvent) => {
      const selection = brushEvent.selection;
      const editor = CoreEditor.provideEditorInstance();
      if (
        !selection ||
        editor.isSequenceEditMode ||
        editor.isSequenceEditInRNABuilderMode
      )
        return;
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
            this.previousSelectedEntities,
            brushEvent.sourceEvent.shiftKey,
          );

        this.editor.renderersContainer.update(modelChanges);
      });
    };

    this.brush.on('start', onStartBrush);
    this.brush.on('brush', onBrush);
    this.brush.on('end', brushed);

    this.brushArea.call(this.brush);

    this.brushArea.select('rect.selection').style('fill', 'transparent');
    this.brushArea.select('rect.overlay').attr('cursor', 'default');

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
    if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;

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
      modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
      const { command: selectModelChanges } =
        this.editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
          renderer.drawingEntity,
        );
      modelChanges.merge(selectModelChanges);
    } else if (renderer instanceof BaseRenderer && event.shiftKey) {
      if (renderer.drawingEntity.selected) {
        return;
      }
      const drawingEntities: DrawingEntity[] = [
        ...this.editor.drawingEntitiesManager.selectedEntitiesArr,
        renderer.drawingEntity,
      ];
      ({ command: modelChanges } =
        this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(
          drawingEntities,
        ));
    } else if (renderer instanceof BaseSequenceItemRenderer && ModKey) {
      let drawingEntities: DrawingEntity[] = renderer.currentSubChain.nodes
        .map((node) => {
          if (node instanceof Nucleoside || node instanceof Nucleotide) {
            return node.monomers;
          } else {
            return node.monomer;
          }
        })
        .flat();
      drawingEntities.forEach((entity) => entity.turnOnSelection());
      const bondsInsideCurrentChain = renderer.currentSubChain.bonds.filter(
        (bond) => bond.firstMonomer.selected && bond.secondMonomer?.selected,
      );
      drawingEntities = drawingEntities.concat(bondsInsideCurrentChain);
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

  mousemove(event: MouseEvent) {
    if (this.editor.mode instanceof SequenceMode || !this.moveStarted) {
      return;
    }
    const modelChanges = new Command();

    const SNAPPING_ANGLE = 30;
    const selectedEntities =
      this.editor.drawingEntitiesManager.selectedEntitiesArr;
    let isAppliedSnap = false;

    if (
      selectedEntities.length === 1 &&
      selectedEntities[0] instanceof BaseMonomer &&
      !(event.ctrlKey || event.metaKey)
    ) {
      const selectedMonomer = selectedEntities[0] as BaseMonomer;
      const connectedMonomer = selectedMonomer.covalentBonds
        .filter((bond) => bond instanceof PolymerBond)[0]
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ?.getAnotherMonomer(selectedMonomer);
      const cursorPositionInAngstroms = Coordinates.canvasToModel(
        this.editor.lastCursorPositionOfCanvas,
      );

      if (connectedMonomer) {
        const angle = vectorUtils.calcAngle(
          cursorPositionInAngstroms,
          connectedMonomer.position,
        );
        const angleInDegrees = ((angle * 180) / Math.PI + 360) % 360;
        const snapRest = Math.abs(angleInDegrees % SNAPPING_ANGLE);
        const leftSnappingBorder = SNAPPING_ANGLE / 3;
        const rightSnappingBorder = (SNAPPING_ANGLE * 2) / 3;
        const angleToSnap =
          snapRest < leftSnappingBorder
            ? angleInDegrees - snapRest
            : snapRest > rightSnappingBorder
            ? angleInDegrees + SNAPPING_ANGLE - snapRest
            : angleInDegrees;

        if (angleToSnap !== angleInDegrees) {
          const angleToSnapInRadians = (angleToSnap * Math.PI) / 180;
          const distanceToConnectedMonomer = Vec2.diff(
            cursorPositionInAngstroms,
            connectedMonomer.position,
          ).length();
          let snappedMonomerPosition = new Vec2(
            connectedMonomer.position.x +
              distanceToConnectedMonomer * -Math.cos(angleToSnapInRadians),
            connectedMonomer.position.y +
              distanceToConnectedMonomer * -Math.sin(angleToSnapInRadians),
          );
          const distanceToSnappingBorder = Vec2.diff(
            cursorPositionInAngstroms,
            snappedMonomerPosition,
          ).length();

          if (distanceToSnappingBorder < 0.5) {
            if (
              distanceToConnectedMonomer > 1.5 - 0.5 &&
              distanceToConnectedMonomer < 1.5 + 0.5
            ) {
              snappedMonomerPosition = new Vec2(
                connectedMonomer.position.x +
                  1.5 * -Math.cos(angleToSnapInRadians),
                connectedMonomer.position.y +
                  1.5 * -Math.sin(angleToSnapInRadians),
              );
            }

            isAppliedSnap = true;

            if (isAppliedSnap) {
              modelChanges.merge(
                this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
                  snappedMonomerPosition.sub(selectedMonomer.position),
                ),
              );
            }
          }

          // console.log(connectedMonomer.position, snappedMonomerPosition, distanceToConnectedMonomer)
          // const snappedMonomerPosition = new Vec2(
          //   selectedMonomer.position.x,
          //   selectedMonomer.position.y,
          // ).rotateAroundOrigin(angleToSnap, connectedMonomer.position);

          // console.log(snappedMonomerPosition, selectedMonomer.position)
        }
      }
    }

    if (this.moveStarted) {
      if (!isAppliedSnap) {
        modelChanges.merge(
          this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
            Coordinates.canvasToModel(
              new Vec2(
                this.editor.lastCursorPositionOfCanvas.x -
                  this.mousePositionAfterMove.x,
                this.editor.lastCursorPositionOfCanvas.y -
                  this.mousePositionAfterMove.y,
              ),
            ),
          ),
        );
      }
      this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
      requestAnimationFrame(() => {
        this.editor.renderersContainer.update(modelChanges);
      });
    }
  }

  mouseup(event) {
    const renderer = event.target.__data__;
    if (this.moveStarted && renderer?.drawingEntity?.selected) {
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

  public mouseOverPolymerBond(event) {
    const renderer: DeprecatedFlexModeOrSnakeModePolymerBondRenderer =
      event.target.__data__;

    const modelChanges =
      this.editor.drawingEntitiesManager.showPolymerBondInformation(
        renderer.polymerBond,
      );
    this.editor.renderersContainer.update(modelChanges);
  }

  public mouseLeavePolymerBond(event) {
    const renderer: DeprecatedFlexModeOrSnakeModePolymerBondRenderer =
      event.target.__data__;
    if (!renderer.polymerBond) {
      return;
    }

    const modelChanges =
      this.editor.drawingEntitiesManager.hidePolymerBondInformation(
        renderer.polymerBond,
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

    if (!(this.editor.selectedTool instanceof EraserTool)) {
      const modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();

      this.editor.renderersContainer.update(modelChanges);
    }
  }
}

export { SelectRectangle };
