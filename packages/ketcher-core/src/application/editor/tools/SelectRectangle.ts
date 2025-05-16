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

import { BaseMonomer, HydrogenBond, PolymerBond, Vec2 } from 'domain/entities';
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
import { MonomersAlignment, vectorUtils } from 'application/editor';
import {
  HalfMonomerSize,
  MonomerSize,
  StandardBondLength,
} from 'domain/constants';

type EmptySnapResult = {
  snapPosition: null;
};

type SnapResult = {
  snapPosition: Vec2;
  showAngleSnapping: boolean;
  connectedMonomer: BaseMonomer;
  bond: PolymerBond | HydrogenBond;
  showBondLengthSnapping: boolean;
  showDistanceSnapping: boolean;
  alignment: MonomersAlignment | undefined;
  alignedMonomers: BaseMonomer[] | undefined;
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

  // TODO: This type is only to resolve the TS error below. Ideally restructure the if-else order so it won't be called for sequence item at all
  private startMoveIfNeeded(
    renderer: BaseRenderer | (BaseRenderer & BaseSequenceItemRenderer),
  ) {
    if (this.editor.mode.modeName === 'sequence-layout-mode') {
      this.moveStarted = !(renderer instanceof BaseSequenceItemRenderer);
    } else {
      this.moveStarted = true;
    }
  }

  mousedown(event: MouseEvent) {
    if (CoreEditor.provideEditorInstance().isSequenceAnyEditMode) return;

    const renderer = event.target?.__data__;

    if (!renderer) {
      return;
    }

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
      this.startMoveIfNeeded(renderer as BaseRenderer);
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
    snappedDistance?: number,
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
        angleSnapPosition: null,
      };
    }

    const snappedAngleRad = (snappedAngle * Math.PI) / 180;
    const distance =
      snappedDistance ?? Vec2.diff(cursorPosition, connectedPosition).length();
    const angleSnapPosition = new Vec2(
      connectedPosition.x - distance * Math.cos(snappedAngleRad),
      connectedPosition.y - distance * Math.sin(snappedAngleRad),
    );

    return {
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
    const isBondLengthSnapped =
      Math.abs(currentDistance - StandardBondLength) < HalfMonomerSize;

    if (!isBondLengthSnapped) {
      return { bondLengthSnapPosition: null };
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
      connectedPosition.x + StandardBondLength * -Math.cos(angle),
      connectedPosition.y + StandardBondLength * -Math.sin(angle),
    );
    return { bondLengthSnapPosition };
  }

  static determineAlignment(
    firstPosition: Vec2,
    secondPosition: Vec2,
  ): MonomersAlignment | null {
    const verticalDiff = Math.abs(firstPosition.y - secondPosition.y);
    const horizontalDiff = Math.abs(firstPosition.x - secondPosition.x);

    if (verticalDiff < MonomerSize && horizontalDiff >= MonomerSize) {
      return 'horizontal';
    } else if (horizontalDiff < MonomerSize && verticalDiff >= MonomerSize) {
      return 'vertical';
    }

    return null;
  }

  static checkMonomersAlignment(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    snapAlignment: MonomersAlignment,
    distance: number,
  ) {
    const alignment = SelectRectangle.determineAlignment(
      firstMonomer.center,
      secondMonomer.center,
    );

    if (alignment !== snapAlignment) {
      return false;
    }

    const distanceBetweenMonomers =
      alignment === 'horizontal'
        ? Math.abs(firstMonomer.center.x - secondMonomer.center.x)
        : Math.abs(firstMonomer.center.y - secondMonomer.center.y);

    return Math.abs(distanceBetweenMonomers - distance) < 0.0001;
  }

  static getNextMonomers(
    currentMonomer: BaseMonomer,
    visitedMonomers: Set<number>,
  ) {
    return currentMonomer.polymerBondsSortedByLength
      .map((bond) => bond.getAnotherMonomer(currentMonomer))
      .filter((monomer) => monomer && !visitedMonomers.has(monomer.id));
  }

  static findRemainingAlignedMonomers(
    startingMonomer: BaseMonomer,
    initialState: BaseMonomer[],
    alignment: MonomersAlignment,
    distance: number,
  ) {
    const visitedMonomers = new Set(initialState.map((monomer) => monomer.id));
    const remainingAlignedMonomers: BaseMonomer[] = [];

    const traverse = (currentMonomer: BaseMonomer) => {
      const nextMonomers = SelectRectangle.getNextMonomers(
        currentMonomer,
        visitedMonomers,
      );
      for (const nextMonomer of nextMonomers) {
        if (!nextMonomer) {
          continue;
        }

        if (
          SelectRectangle.checkMonomersAlignment(
            currentMonomer,
            nextMonomer,
            alignment,
            distance,
          )
        ) {
          visitedMonomers.add(nextMonomer.id);
          remainingAlignedMonomers.push(nextMonomer);
          traverse(nextMonomer);
        }
      }
    };

    traverse(startingMonomer);

    return remainingAlignedMonomers;
  }

  static calculateSideDistanceSnap(
    cursorPosition: Vec2,
    initialMonomer: BaseMonomer,
    connectedMonomer: BaseMonomer,
  ) {
    const bondToMonomerForAlignment =
      connectedMonomer.polymerBondsSortedByLength.find(
        (bond) => bond.getAnotherMonomer(connectedMonomer) !== initialMonomer,
      );
    if (!bondToMonomerForAlignment) {
      return { distanceSnapPosition: null };
    }

    const monomerForAlignment =
      bondToMonomerForAlignment.getAnotherMonomer(connectedMonomer);
    if (!monomerForAlignment) {
      return { distanceSnapPosition: null };
    }

    const alignment = SelectRectangle.determineAlignment(
      connectedMonomer.center,
      monomerForAlignment.center,
    );
    if (!alignment) {
      return { distanceSnapPosition: null };
    }

    const isHorizontal = alignment === 'horizontal';
    const primaryAxis: 'x' | 'y' = isHorizontal ? 'x' : 'y';
    const secondaryAxis: 'x' | 'y' = isHorizontal ? 'y' : 'x';

    if (
      Math.abs(
        cursorPosition[secondaryAxis] - connectedMonomer.center[secondaryAxis],
      ) >= MonomerSize
    ) {
      return { distanceSnapPosition: null };
    }

    const snapDistance = Math.abs(
      connectedMonomer.center[primaryAxis] -
        monomerForAlignment.center[primaryAxis],
    );
    const distanceToMonomerForSnapping = Math.abs(
      cursorPosition[primaryAxis] - connectedMonomer.center[primaryAxis],
    );
    if (
      Math.abs(distanceToMonomerForSnapping - snapDistance) >= HalfMonomerSize
    ) {
      return { distanceSnapPosition: null };
    }

    const sign = Math.sign(
      connectedMonomer.center[primaryAxis] - cursorPosition[primaryAxis],
    );
    const newPrimaryCoord =
      connectedMonomer.center[primaryAxis] - sign * snapDistance;
    const distanceSnapPosition = isHorizontal
      ? new Vec2(newPrimaryCoord, cursorPosition.y)
      : new Vec2(cursorPosition.x, newPrimaryCoord);

    const alignedMonomers = [
      initialMonomer,
      connectedMonomer,
      monomerForAlignment,
    ];
    const additionalAlignedMonomers =
      SelectRectangle.findRemainingAlignedMonomers(
        monomerForAlignment,
        alignedMonomers,
        alignment,
        snapDistance,
      );

    return {
      snapDistance,
      distanceSnapPosition,
      alignment,
      alignedMonomers: [...alignedMonomers, ...additionalAlignedMonomers],
    };
  }

  static calculateInBetweenDistanceSnap(
    cursorPosition: Vec2,
    initialMonomer: BaseMonomer,
    firstConnectedMonomer: BaseMonomer,
    secondConnectedMonomer: BaseMonomer,
    alignment: MonomersAlignment,
  ) {
    const isHorizontal = alignment === 'horizontal';
    const primaryAxis: 'x' | 'y' = isHorizontal ? 'x' : 'y';
    const secondaryAxis: 'x' | 'y' = isHorizontal ? 'y' : 'x';

    const firstDelta = Math.abs(
      cursorPosition[secondaryAxis] -
        firstConnectedMonomer.center[secondaryAxis],
    );
    const secondDelta = Math.abs(
      cursorPosition[secondaryAxis] -
        secondConnectedMonomer.center[secondaryAxis],
    );
    if (firstDelta >= MonomerSize || secondDelta >= MonomerSize) {
      return { distanceSnapPosition: null };
    }

    const distanceToMonomerForSnapping = Math.abs(
      cursorPosition[primaryAxis] - firstConnectedMonomer.center[primaryAxis],
    );
    const snapDistance =
      Math.abs(
        firstConnectedMonomer.center[primaryAxis] -
          secondConnectedMonomer.center[primaryAxis],
      ) / 2;
    if (
      Math.abs(distanceToMonomerForSnapping - snapDistance) >= HalfMonomerSize
    ) {
      return { distanceSnapPosition: null };
    }

    const midPoint =
      (firstConnectedMonomer.center[primaryAxis] +
        secondConnectedMonomer.center[primaryAxis]) /
      2;
    const distanceSnapPosition = isHorizontal
      ? new Vec2(midPoint, cursorPosition.y)
      : new Vec2(cursorPosition.x, midPoint);

    const alignedMonomers = [
      initialMonomer,
      firstConnectedMonomer,
      secondConnectedMonomer,
    ];

    const additionalAlignedMonomersFromOneSide =
      SelectRectangle.findRemainingAlignedMonomers(
        firstConnectedMonomer,
        alignedMonomers,
        alignment,
        snapDistance,
      );
    const additionalAlignedMonomersFromOtherSide =
      SelectRectangle.findRemainingAlignedMonomers(
        secondConnectedMonomer,
        alignedMonomers,
        alignment,
        snapDistance,
      );

    return {
      snapDistance,
      distanceSnapPosition,
      alignment,
      alignedMonomers: [
        ...alignedMonomers,
        ...additionalAlignedMonomersFromOneSide,
        ...additionalAlignedMonomersFromOtherSide,
      ],
    };
  }

  static calculateDistanceSnap(
    cursorPosition: Vec2,
    initialMonomer: BaseMonomer,
    connectedMonomer: BaseMonomer,
  ) {
    const secondShortestBond = initialMonomer.polymerBondsSortedByLength[1];
    if (!secondShortestBond) {
      return SelectRectangle.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    const secondConnectedMonomer =
      secondShortestBond.getAnotherMonomer(initialMonomer);
    if (!secondConnectedMonomer) {
      return SelectRectangle.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    const alignment = SelectRectangle.determineAlignment(
      connectedMonomer.center,
      secondConnectedMonomer.center,
    );

    if (!alignment) {
      return SelectRectangle.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    return SelectRectangle.calculateInBetweenDistanceSnap(
      cursorPosition,
      initialMonomer,
      connectedMonomer,
      secondConnectedMonomer,
      alignment,
    );
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
    const shortestMonomerBond = selectedMonomer.polymerBondsSortedByLength[0];

    if (!shortestMonomerBond) {
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

    const { distanceSnapPosition, snapDistance, alignment, alignedMonomers } =
      SelectRectangle.calculateDistanceSnap(
        cursorPositionInAngstroms,
        selectedMonomer,
        connectedMonomer,
      );

    const { angleSnapPosition, snappedAngleRad } =
      SelectRectangle.calculateAngleSnap(
        cursorPositionInAngstroms,
        connectedMonomer.position,
        this.editor.mode.modeName === 'snake-layout-mode' ? 90 : 30,
        snapDistance,
      );

    const { bondLengthSnapPosition } = SelectRectangle.calculateBondLengthSnap(
      cursorPositionInAngstroms,
      connectedMonomer.position,
      snappedAngleRad,
    );

    let snapPosition: Vec2 | undefined;
    if (bondLengthSnapPosition) {
      snapPosition = bondLengthSnapPosition;
    } else if (angleSnapPosition) {
      snapPosition = angleSnapPosition;
    } else if (distanceSnapPosition) {
      snapPosition = distanceSnapPosition;
    }

    if (snapPosition) {
      const distanceToSnapPosition = Vec2.diff(
        cursorPositionInAngstroms,
        snapPosition,
      ).length();

      const thresholdValue =
        Boolean(distanceSnapPosition) && Boolean(angleSnapPosition)
          ? HalfMonomerSize + 0.1
          : HalfMonomerSize;

      if (distanceToSnapPosition < thresholdValue) {
        const showAngleSnapping = Boolean(angleSnapPosition);
        const showBondLengthSnapping = Boolean(bondLengthSnapPosition);
        const showDistanceSnapping =
          !showBondLengthSnapping && Boolean(distanceSnapPosition);

        return {
          snapPosition: snapPosition.sub(selectedMonomer.position),
          showAngleSnapping,
          bond: shortestMonomerBond,
          connectedMonomer,
          showBondLengthSnapping,
          showDistanceSnapping,
          alignment,
          alignedMonomers,
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

      const {
        showAngleSnapping,
        connectedMonomer,
        bond,
        showBondLengthSnapping,
        showDistanceSnapping,
        alignment,
        alignedMonomers,
      } = snapResult;

      showAngleSnapping
        ? this.editor.transientDrawingView.showAngleSnap({
            connectedMonomer,
            polymerBond: bond,
            isBondLengthSnapped: showBondLengthSnapping,
          })
        : this.editor.transientDrawingView.hideAngleSnap();

      showBondLengthSnapping
        ? this.editor.transientDrawingView.showBondSnap(bond)
        : this.editor.transientDrawingView.hideBondSnap();

      showDistanceSnapping
        ? this.editor.transientDrawingView.showDistanceSnap({
            alignment,
            alignedMonomers,
          })
        : this.editor.transientDrawingView.hideDistanceSnap();
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
      this.editor.transientDrawingView.hideDistanceSnap();
    }

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
      if (this.moveStarted && renderer?.drawingEntity?.selected) {
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
    } finally {
      this.stopMovement();
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

  public stopMovement() {
    this.moveStarted = false;
    this.editor.transientDrawingView.clear();
  }
}

export { SelectRectangle };
