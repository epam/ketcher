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
import { BaseRenderer } from 'application/render/renderers/BaseRenderer';
import { Command } from 'domain/entities/Command';
import { BaseTool } from 'application/editor/tools/Tool';
import { Coordinates } from 'application/editor/shared/coordinates';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { isMacOs } from 'react-device-detect';
import {
  DeprecatedFlexModeOrSnakeModePolymerBondRenderer,
  SequenceRenderer,
} from 'application/render';
import { EraserTool } from 'application/editor/tools/Erase';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { SelectBaseMode } from 'application/editor/tools/select/SelectBase.types';
import { SelectBaseSnappingHandler } from 'application/editor/tools/select/SelectBaseSnappingHandler';
import { SelectBaseTransformHandler } from 'application/editor/tools/select/SelectBaseTransformHandler';

abstract class SelectBase implements BaseTool {
  protected mousePositionAfterMove = new Vec2(0, 0, 0);
  protected mousePositionBeforeMove = new Vec2(0, 0, 0);
  protected selectionStartCanvasPosition = new Vec2(0, 0, 0);
  protected previousSelectedEntities: [number, DrawingEntity][] = [];
  private readonly canvasResizeObserver?: ResizeObserver;
  private firstMonomerPositionBeforeMove: Vec2 | undefined;
  public mode: SelectBaseMode = 'standby';
  private readonly snappingHandler: SelectBaseSnappingHandler;
  private readonly transformHandler: SelectBaseTransformHandler;
  private readonly rotationHandleUnsubscribe?: () => void;
  private readonly rotationCenterUnsubscribe?: () => void;
  private readonly selectEntitiesHandler = () => {
    this.transformHandler.updateRotationView();
  };

  constructor(protected readonly editor: CoreEditor) {
    this.snappingHandler = new SelectBaseSnappingHandler(editor);
    this.transformHandler = new SelectBaseTransformHandler(
      editor,
      (mode) => {
        this.mode = mode;
      },
      () => this.mode,
      (center, bbox) => this.buildRotationViewParams(center, bbox),
    );
    this.destroy();
    [this.rotationHandleUnsubscribe, this.rotationCenterUnsubscribe] =
      this.transformHandler.subscribeToRotationControls();
    this.editor.events.selectEntities.add(this.selectEntitiesHandler);
  }

  // TODO: This type is only to resolve the TS error below. Ideally restructure the if-else order so it won't be called for sequence item at all
  private startMoveIfNeeded(
    renderer: BaseRenderer | (BaseRenderer & BaseSequenceItemRenderer),
  ) {
    let shouldStartMove;
    if (this.editor.mode.modeName === 'sequence-layout-mode') {
      shouldStartMove = !(renderer instanceof BaseSequenceItemRenderer);
    } else {
      shouldStartMove = true;
    }
    if (shouldStartMove) this.mode = 'moving';
  }

  mousedown(event: MouseEvent) {
    if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;

    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;
    this.mousePositionBeforeMove = this.editor.lastCursorPositionOfCanvas;
    this.selectionStartCanvasPosition = Coordinates.viewToCanvas(
      this.editor.lastCursorPosition,
    );

    if (event.target === this.editor.canvas) {
      if (!event.shiftKey) {
        const modelChanges = new Command();
        modelChanges.merge(
          this.editor.drawingEntitiesManager.unselectAllDrawingEntities(),
        );
        SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
        this.editor.renderersContainer.update(modelChanges);
      }
      this.onSelectionStart();
    } else {
      const renderer = event.target?.__data__;

      if (!renderer || !(renderer instanceof BaseRenderer)) {
        const modelChanges = new Command();
        modelChanges.merge(
          this.editor.drawingEntitiesManager.unselectAllDrawingEntities(),
        );
        SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();
        this.editor.renderersContainer.update(modelChanges);
        return;
      }

      const modKey = isMacOs ? event.metaKey : event.ctrlKey;
      this.mousedownEntity(renderer, event.shiftKey, modKey);
    }
  }

  private getCanvasBbox(bbox: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) {
    const topLeft = Coordinates.modelToCanvas(new Vec2(bbox.left, bbox.top));
    const bottomRight = Coordinates.modelToCanvas(
      new Vec2(bbox.left + bbox.width, bbox.top + bbox.height),
    );

    return {
      left: topLeft.x,
      top: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }

  private buildRotationViewParams(
    center: Vec2,
    bbox: {
      left: number;
      top: number;
      width: number;
      height: number;
    },
  ) {
    return {
      center: Coordinates.modelToCanvas(center),
      boundingBox: this.getCanvasBbox(bbox),
      cursor: this.editor.lastCursorPosition,
    };
  }

  protected get userRotationCenter() {
    return this.transformHandler.getUserRotationCenter();
  }

  protected updateRotationView() {
    this.transformHandler.updateRotationView();
  }

  protected startRotation(event: MouseEvent | PointerEvent) {
    this.transformHandler.startRotation(event);
  }

  protected startRotationCenterDrag(event: MouseEvent | PointerEvent) {
    this.transformHandler.startRotationCenterDrag(event);
  }

  protected handleRotationMove(event: MouseEvent) {
    this.transformHandler.handleRotationMove(event);
  }

  protected finishRotation() {
    this.transformHandler.finishRotation();
  }

  protected mousedownEntity(
    renderer: BaseRenderer,
    shiftKey = false,
    modKey = false,
  ): void {
    const modelChanges = new Command();
    const drawingEntitiesToSelect: DrawingEntity[] = [];
    const rxnArrowResizeHandle =
      !shiftKey && !modKey
        ? this.transformHandler.getRxnArrowResizeHandle(renderer)
        : null;

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

    if (!shiftKey && !modKey) {
      if (!rxnArrowResizeHandle) {
        this.startMoveIfNeeded(renderer);
      }
      if (renderer.drawingEntity.selected && !rxnArrowResizeHandle) {
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
    } else if (shiftKey) {
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
    } else if (renderer instanceof BaseSequenceItemRenderer && modKey) {
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
    }

    modelChanges.merge(
      this.editor.drawingEntitiesManager.hideAllMonomersHoverAndAttachmentPoints(),
    );

    this.editor.renderersContainer.update(modelChanges);

    if (renderer.drawingEntity instanceof RxnArrow && rxnArrowResizeHandle) {
      this.transformHandler.startRxnArrowResize(
        renderer.drawingEntity,
        rxnArrowResizeHandle,
      );
    }
  }

  protected onSelectionStart() {
    this.mode = 'selecting';
    this.createSelectionView();
  }

  public isSelectionRunning() {
    return this.mode === 'selecting';
  }

  protected abstract createSelectionView(): void;

  protected abstract updateSelectionViewParams(): void;

  protected abstract onSelectionMove(isShiftPressed: boolean);

  mousemove(event: MouseEvent) {
    if (this.mode === 'standby') {
      return;
    }

    if (this.mode === 'selecting') {
      this.updateSelectionViewParams();
      this.onSelectionMove(event.shiftKey);
      return;
    }

    if (this.mode === 'rotating') {
      this.transformHandler.handleRotationMove(event);
      return;
    }

    if (this.mode === 'rotating-center') {
      this.transformHandler.updateRotationCenterFromCursor();
      return;
    }

    if (this.mode === 'resizing-rxn-arrow') {
      this.transformHandler.resizeRxnArrow(event);
      return;
    }

    if (!this.firstMonomerPositionBeforeMove) {
      this.firstMonomerPositionBeforeMove = this.editor.drawingEntitiesManager
        .selectedMonomers[0]?.position
        ? new Vec2(
            this.editor.drawingEntitiesManager.selectedMonomers[0]?.position,
          )
        : undefined;
    }

    const firstMonomerPosition =
      this.editor.drawingEntitiesManager.selectedMonomers[0]?.position;
    const distanceBetweenFirstMonomerAndCursorBeforeMove =
      this.firstMonomerPositionBeforeMove &&
      Vec2.diff(
        Coordinates.modelToCanvas(this.firstMonomerPositionBeforeMove),
        this.mousePositionBeforeMove,
      );
    const distanceBetweenFirstMonomerAndCursor =
      firstMonomerPosition &&
      Vec2.diff(
        Coordinates.modelToCanvas(firstMonomerPosition),
        this.editor.lastCursorPositionOfCanvas,
      );
    const firstMonomerPositionDelta =
      distanceBetweenFirstMonomerAndCursorBeforeMove &&
      distanceBetweenFirstMonomerAndCursor &&
      Vec2.diff(
        distanceBetweenFirstMonomerAndCursorBeforeMove,
        distanceBetweenFirstMonomerAndCursor,
      );
    const movementDelta = Coordinates.canvasToModel(
      firstMonomerPositionDelta ||
        new Vec2(
          this.editor.lastCursorPositionOfCanvas.x -
            this.mousePositionAfterMove.x,
          this.editor.lastCursorPositionOfCanvas.y -
            this.mousePositionAfterMove.y,
        ),
    );

    const modelChanges = new Command();
    this.snappingHandler.applyMovementWithSnapping(
      event,
      movementDelta,
      modelChanges,
    );

    this.mousePositionAfterMove = this.editor.lastCursorPositionOfCanvas;

    requestAnimationFrame(() => {
      this.editor.renderersContainer.update(modelChanges);
      this.editor.drawingEntitiesManager.rerenderBondsOverlappedByMonomers();
      this.editor.transientDrawingView.update();
    });
  }

  mouseup(event: MouseEvent) {
    const renderer = event.target?.__data__;

    try {
      if (this.mode === 'resizing-rxn-arrow') {
        this.transformHandler.finishRxnArrowResize();
        return;
      }

      if (this.mode === 'rotating') {
        this.transformHandler.finishRotation();
        return;
      }

      if (this.mode === 'rotating-center') {
        this.mode = 'standby';
        this.transformHandler.updateRotationView();
        return;
      }

      if (
        this.mode === 'moving' &&
        (renderer?.drawingEntity?.selected ||
          this.editor.drawingEntitiesManager.selectedEntitiesArr.length > 0)
      ) {
        const selectedMonomers =
          this.editor.drawingEntitiesManager.selectedMonomers;
        const hasMonomerSelection = selectedMonomers.length > 0;
        if (hasMonomerSelection) {
          const firstMonomerCurrentPosition = selectedMonomers[0]?.position;
          const actualMovementDelta =
            this.firstMonomerPositionBeforeMove && firstMonomerCurrentPosition
              ? Vec2.diff(
                  firstMonomerCurrentPosition,
                  this.firstMonomerPositionBeforeMove,
                )
              : undefined;
          const epsilon = 0.001; // small epsilon at which snapping is not triggered
          if (!actualMovementDelta || actualMovementDelta.length() < epsilon) {
            return;
          }

          const history = EditorHistory.getInstance(this.editor);
          const modelChanges =
            this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
              new Vec2(0, 0),
              actualMovementDelta,
            );
          history.update(modelChanges);
        } else {
          const canvasDelta = Vec2.diff(
            this.mousePositionAfterMove,
            this.mousePositionBeforeMove,
          );
          if (canvasDelta.length() === 0) {
            return;
          }

          const history = EditorHistory.getInstance(this.editor);
          const fullMovementOffset = Coordinates.canvasToModel(canvasDelta);
          const modelChanges =
            this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
              new Vec2(0, 0),
              fullMovementOffset,
            );
          history.update(modelChanges);
        }
      }
    } finally {
      this.firstMonomerPositionBeforeMove = undefined;
      this.stopMovement();
      this.setSelectedEntities();
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
    this.transformHandler.updateRotationView();
  }

  destroy() {
    this.canvasResizeObserver?.disconnect();
    this.rotationHandleUnsubscribe?.();
    this.rotationCenterUnsubscribe?.();
    this.editor.events.selectEntities.remove(this.selectEntitiesHandler);

    if (!(this.editor.selectedTool instanceof EraserTool)) {
      const modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();

      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public stopMovement() {
    this.transformHandler.stopMovement();
  }
}

export { SelectBase };
