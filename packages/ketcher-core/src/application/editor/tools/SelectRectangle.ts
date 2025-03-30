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
  BaseMonomer,
  HydrogenBond,
  MonomerToAtomBond,
  PolymerBond,
  Vec2,
} from 'domain/entities';
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
import { isMacOs } from 'react-device-detect';
import { EraserTool } from './Erase';
import {
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
  SequenceRenderer,
} from 'application/render';
import { vectorUtils } from 'application/editor';

type EmptySnapResult = {
  snapPosition: null;
};

type SnapResult = {
  snapPosition: Vec2;
  isAngleSnapped: boolean;
  isBondLengthSnapped: boolean;
  connectedMonomer: BaseMonomer;
  bond: PolymerBond | HydrogenBond;
};

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

  private startMoveIfNeeded(renderer: BaseRenderer) {
    if (this.editor.mode.modeName === 'sequence-layout-mode') {
      this.moveStarted = !(renderer instanceof BaseSequenceItemRenderer);
    } else {
      this.moveStarted = true;
    }
  }

  mousedown(event) {
    if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;

    const renderer = event.target.__data__;
    const drawingEntitiesToSelect: DrawingEntity[] = [];
    const ModKey = isMacOs ? event.metaKey : event.ctrlKey;
    const modelChanges = new Command();

    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
    this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;

    if (renderer instanceof BaseSequenceItemRenderer) {
      const twoStrandedNode = renderer.twoStrandedNode;
      if (twoStrandedNode.senseNode) {
        drawingEntitiesToSelect.push(twoStrandedNode.senseNode.monomer);
      }
      if (twoStrandedNode.antisenseNode) {
        drawingEntitiesToSelect.push(twoStrandedNode.antisenseNode.monomer);
      }
    } else {
      drawingEntitiesToSelect.push(renderer.drawingEntity);
    }

    if (renderer instanceof BaseRenderer && !event.shiftKey && !ModKey) {
      this.startMoveIfNeeded(renderer);
      if (renderer.drawingEntity.selected) {
        return;
      }
      modelChanges.merge(
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities(),
      );
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
      const { command: selectModelChanges } =
        this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(
          drawingEntitiesToSelect,
        );
      modelChanges.merge(selectModelChanges);
    } else if (renderer instanceof BaseRenderer && event.shiftKey) {
      if (renderer.drawingEntity.selected) {
        return;
      }
      const drawingEntities: DrawingEntity[] = [
        ...this.editor.drawingEntitiesManager.selectedEntitiesArr,
        ...drawingEntitiesToSelect,
      ];
      const { command: selectModelChanges } =
        this.editor.drawingEntitiesManager.getAllSelectedEntitiesForEntities(
          drawingEntities,
        );
      modelChanges.merge(selectModelChanges);
    } else if (renderer instanceof BaseSequenceItemRenderer && ModKey) {
      let drawingEntities: DrawingEntity[] = renderer.currentChain.nodes
        .map((node) => {
          if (node instanceof Nucleoside || node instanceof Nucleotide) {
            return node.monomers;
          } else {
            return node.monomer;
          }
        })
        .flat();
      drawingEntities.forEach((entity) => entity.turnOnSelection());
      const bondsInsideCurrentChain = renderer.currentChain.bonds.filter(
        (bond) => bond.firstMonomer.selected && bond.secondMonomer?.selected,
      );
      drawingEntities = drawingEntities.concat(bondsInsideCurrentChain);
      modelChanges.merge(
        this.editor.drawingEntitiesManager.selectDrawingEntities(
          drawingEntities,
        ),
      );
    } else {
      modelChanges.merge(
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities(),
      );
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
    }

    modelChanges.merge(
      this.editor.drawingEntitiesManager.hideAllMonomersHoverAndAttachmentPoints(),
    );
    this.editor.renderersContainer.update(modelChanges);
    this.setSelectedEntities();
  }

  static calculateAngleSnap(
    cursorPosition: Vec2,
    connectedPosition: Vec2,
    snapAngle: number,
  ) {
    const angle = vectorUtils.calcAngle(cursorPosition, connectedPosition);
    const angleInDegrees = ((angle * 180) / Math.PI + 360) % 360;
    const snapRest = Math.abs(angleInDegrees % snapAngle);
    const leftBorder = snapAngle / 3;
    const rightBorder = (2 * snapAngle) / 3;
    let snappedAngle = angleInDegrees;

    if (snapRest < leftBorder) {
      snappedAngle = angleInDegrees - snapRest;
    } else if (snapRest > rightBorder) {
      snappedAngle = angleInDegrees + snapAngle - snapRest;
    }

    const isAngleSnapped = snappedAngle !== angleInDegrees;

    if (!isAngleSnapped) {
      return {
        isAngleSnapped,
      };
    }

    const snappedAngleRad = (snappedAngle * Math.PI) / 180;
    const distance = Vec2.diff(cursorPosition, connectedPosition).length();
    const angleSnapPosition = new Vec2(
      connectedPosition.x + distance * -Math.cos(snappedAngleRad),
      connectedPosition.y + distance * -Math.sin(snappedAngleRad),
    );

    return {
      isAngleSnapped,
      angleSnapPosition,
      snappedAngleRad,
    };
  }

  static calculateBondLengthSnap(
    cursorPosition: Vec2,
    connectedPosition: Vec2,
    snappedAngle: number | undefined,
  ) {
    const currentDistance = Vec2.diff(
      cursorPosition,
      connectedPosition,
    ).length();
    const standardBondLength = 1.5;
    const isBondLengthSnapped =
      Math.abs(currentDistance - standardBondLength) < 0.375;

    if (!isBondLengthSnapped) {
      return { isBondLengthSnapped };
    }

    const editor = CoreEditor.provideEditorInstance();
    let angle: number;
    if (editor.mode.modeName === 'snake-layout-mode') {
      let rawAngle = vectorUtils.calcAngle(cursorPosition, connectedPosition);
      rawAngle = ((rawAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const step = Math.PI / 2;
      angle = Math.round(rawAngle / step) * step;
    } else {
      angle =
        snappedAngle ??
        vectorUtils.calcAngle(cursorPosition, connectedPosition);
    }

    const bondLengthSnapPosition = new Vec2(
      connectedPosition.x + standardBondLength * -Math.cos(angle),
      connectedPosition.y + standardBondLength * -Math.sin(angle),
    );
    return { isBondLengthSnapped, bondLengthSnapPosition };
  }

  static calculateDistanceSnap(cursorPosition: Vec2, monomer: BaseMonomer) {
    const [firstSideMonomer, secondSideMonomer] = monomer.covalentBonds.map(
      (bond) => bond.getAnotherEntity(monomer),
    );

    if (firstSideMonomer && secondSideMonomer) {
      const verticalDiff = Math.abs(
        firstSideMonomer.center.y - secondSideMonomer.center.y,
      );
      const horizontalDiff = Math.abs(
        firstSideMonomer.center.x - secondSideMonomer.center.x,
      );

      let alignment: 'horizontal' | 'vertical' | undefined;
      if (verticalDiff < 0.75 && horizontalDiff >= 0.75) {
        alignment = 'horizontal';
      } else if (horizontalDiff < 0.75 && verticalDiff >= 0.75) {
        alignment = 'vertical';
      }

      if (!alignment) {
        return { isDistanceSnapped: false };
      }

      if (alignment === 'horizontal') {
        const deltaY1 = Math.abs(cursorPosition.y - firstSideMonomer.center.y);
        const deltaY2 = Math.abs(cursorPosition.y - secondSideMonomer.center.y);

        if (deltaY1 >= 0.75 || deltaY2 >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const midPoint =
          (firstSideMonomer.center.x + secondSideMonomer.center.x) / 2;
        const distanceSnapPosition = new Vec2(midPoint, cursorPosition.y);

        return {
          isDistanceSnapped: true,
          distanceSnapPosition,
        };
      } else if (alignment === 'vertical') {
        const deltaX1 = Math.abs(cursorPosition.x - firstSideMonomer.center.x);
        const deltaX2 = Math.abs(cursorPosition.x - secondSideMonomer.center.x);

        if (deltaX1 >= 0.75 || deltaX2 >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const midPoint =
          (firstSideMonomer.center.y + secondSideMonomer.center.y) / 2;
        const distanceSnapPosition = new Vec2(cursorPosition.x, midPoint);

        return {
          isDistanceSnapped: true,
          distanceSnapPosition,
        };
      }
    } else {
      return { isDistanceSnapped: false };
    }
  }

  private tryToSnap(event: MouseEvent): EmptySnapResult | SnapResult {
    const emptyResult: EmptySnapResult = {
      snapPosition: null,
    };

    if (this.editor.mode.modeName === 'sequence-layout-mode') {
      return emptyResult;
    }

    const selectedEntities =
      this.editor.drawingEntitiesManager.selectedEntitiesArr;
    const modKeyPressed = isMacOs ? event.metaKey : event.ctrlKey;

    if (
      modKeyPressed ||
      selectedEntities.length > 1 ||
      !(selectedEntities[0] instanceof BaseMonomer)
    ) {
      return emptyResult;
    }

    const selectedMonomer = selectedEntities[0] as BaseMonomer;
    const shortestMonomerBond = selectedMonomer.shortestBond;

    if (
      !shortestMonomerBond ||
      shortestMonomerBond instanceof MonomerToAtomBond
    ) {
      return emptyResult;
    }

    const connectedMonomer =
      shortestMonomerBond.getAnotherMonomer(selectedMonomer);
    if (!connectedMonomer) {
      return emptyResult;
    }

    const cursorPositionInAngstroms = Coordinates.canvasToModel(
      this.editor.lastCursorPositionOfCanvas,
    );

    const { isDistanceSnapped, distanceSnapPosition } =
      SelectRectangle.calculateDistanceSnap(
        cursorPositionInAngstroms,
        selectedMonomer,
      );

    const { isAngleSnapped, angleSnapPosition, snappedAngleRad } =
      SelectRectangle.calculateAngleSnap(
        cursorPositionInAngstroms,
        connectedMonomer.position,
        this.editor.mode.modeName === 'snake-layout-mode' ? 90 : 30,
      );

    const { isBondLengthSnapped, bondLengthSnapPosition } =
      SelectRectangle.calculateBondLengthSnap(
        cursorPositionInAngstroms,
        connectedMonomer.position,
        snappedAngleRad,
      );

    let snapPosition: Vec2 | undefined;
    // if (isAngleSnapped && isBondLengthSnapped) {
    //   snapPosition = bondLengthSnapPosition;
    // } else if (isAngleSnapped) {
    //   snapPosition = angleSnapPosition;
    // } else if (isBondLengthSnapped) {
    //   snapPosition = bondLengthSnapPosition;
    // }
    if (isDistanceSnapped) {
      snapPosition = distanceSnapPosition;
    }

    if (snapPosition) {
      const distanceToSnapPosition = Vec2.diff(
        cursorPositionInAngstroms,
        snapPosition,
      ).length();

      if (distanceToSnapPosition < 0.375) {
        return {
          snapPosition: snapPosition.sub(selectedMonomer.position),
          isAngleSnapped,
          isBondLengthSnapped,
          connectedMonomer,
          bond: shortestMonomerBond,
        };
      }
    }

    return emptyResult;
  }

  mousemove(event: MouseEvent) {
    if (!this.moveStarted) {
      return;
    }

    const modelChanges = new Command();

    const snapResult = this.tryToSnap(event);
    const { snapPosition } = snapResult;

    if (snapPosition) {
      modelChanges.merge(
        this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
          snapPosition,
        ),
      );

      const { isAngleSnapped, isBondLengthSnapped, connectedMonomer, bond } =
        snapResult;

      isAngleSnapped
        ? this.editor.transientDrawingView.showAngleSnap({
            connectedMonomer,
            polymerBond: bond,
            isBondLengthSnapped,
          })
        : this.editor.transientDrawingView.hideAngleSnap();

      isBondLengthSnapped
        ? this.editor.transientDrawingView.showBondSnap(bond)
        : this.editor.transientDrawingView.hideBondSnap();
    } else {
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

      this.editor.transientDrawingView.hideBondSnap();
      this.editor.transientDrawingView.hideAngleSnap();
    }

    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;

    requestAnimationFrame(() => {
      this.editor.renderersContainer.update(modelChanges);
      this.editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
      this.editor.transientDrawingView.update();
    });
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

    this.editor.transientDrawingView.clear();
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
    if (event.buttons === 1) {
      return;
    }

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
      this.editor.drawingEntitiesManager.selectedEntities;
    this.editor.events.selectEntities.dispatch(
      this.previousSelectedEntities.map((entity) => entity[1]),
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
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();

      this.editor.renderersContainer.update(modelChanges);
    }
  }
}

export { SelectRectangle };
