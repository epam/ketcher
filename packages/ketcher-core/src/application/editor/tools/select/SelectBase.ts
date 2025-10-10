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
import {
  CoreEditor,
  EditorHistory,
  SelectRectangle,
} from 'application/editor/internal';
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
import { MonomersAlignment, vectorUtils } from 'application/editor';
import {
  HalfMonomerSize,
  MonomerSize,
  StandardBondLength,
} from 'domain/constants';
import { EraserTool } from 'application/editor/tools/Erase';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';

type EmptySnapResult = {
  snapPosition: null;
  connectionLength: number;
};

type SnapResult = {
  snapPosition: Vec2;
  showAngleSnapping: boolean;
  connectedMonomer: BaseMonomer;
  bond: PolymerBond | HydrogenBond;
  showBondLengthSnapping: boolean;
  showDistanceSnapping: boolean;
  showGroupCenterSnapping: boolean;
  alignment: MonomersAlignment | undefined;
  alignedMonomers: BaseMonomer[] | undefined;
  connectionLength: number;
};

type GroupCenterSnapResult = {
  snapPosition: Vec2;
  isVertical: boolean;
  absoluteSnapPosition: Vec2;
  monomerPair: [BaseMonomer, BaseMonomer];
  connectionLength: number;
  showGroupCenterSnapping: true;
};

function isGroupCenterSnapResult(
  result: SnapResult | EmptySnapResult | GroupCenterSnapResult,
): result is GroupCenterSnapResult {
  return (result as GroupCenterSnapResult).showGroupCenterSnapping;
}

abstract class SelectBase implements BaseTool {
  protected mousePositionAfterMove = new Vec2(0, 0, 0);
  protected mousePositionBeforeMove = new Vec2(0, 0, 0);
  protected selectionStartPosition = new Vec2(0, 0, 0);
  protected previousSelectedEntities: [number, DrawingEntity][] = [];
  protected mode: 'moving' | 'selecting' | 'standby' = 'standby';
  private readonly canvasResizeObserver?: ResizeObserver;
  private readonly history: EditorHistory;
  private firstMonomerPositionBeforeMove: Vec2 | undefined;

  constructor(protected readonly editor: CoreEditor) {
    this.history = new EditorHistory(this.editor);
    this.destroy();
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
    this.selectionStartPosition = this.editor.lastCursorPosition;

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

  protected mousedownEntity(
    renderer: BaseRenderer,
    shiftKey = false,
    modKey = false,
  ): void {
    const modelChanges = new Command();
    const drawingEntitiesToSelect: DrawingEntity[] = [];
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

  static calculateAngleSnap(
    monomerPositionPlusCursorDelta: Vec2,
    connectedPosition: Vec2,
    snapAngle: number,
    snappedDistance?: number,
  ) {
    const angle = vectorUtils.calcAngle(
      monomerPositionPlusCursorDelta,
      connectedPosition,
    );
    const angleInDegrees = ((angle * 180) / Math.PI + 360) % 360;
    const snapRest = Math.abs(angleInDegrees % snapAngle);
    const leftBorder = snapAngle / 3;
    const rightBorder = (2 * snapAngle) / 3;
    let snappedAngle: number | null = null;

    if (snapRest < leftBorder) {
      snappedAngle = angleInDegrees - snapRest;
    } else if (snapRest > rightBorder) {
      snappedAngle = angleInDegrees + snapAngle - snapRest;
    }

    if (snappedAngle === null) {
      return { angleSnapPosition: null };
    }

    const snappedAngleRad = (snappedAngle * Math.PI) / 180;
    const distance =
      snappedDistance ??
      Vec2.diff(monomerPositionPlusCursorDelta, connectedPosition).length();
    const angleSnapPosition = new Vec2(
      connectedPosition.x - distance * Math.cos(snappedAngleRad),
      connectedPosition.y - distance * Math.sin(snappedAngleRad),
    );
    const isAngleSnapped =
      Vec2.diff(monomerPositionPlusCursorDelta, angleSnapPosition).length() <
      HalfMonomerSize;

    if (!isAngleSnapped) {
      return {
        angleSnapPosition: null,
      };
    }

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

  static needApplyGroupCenterSnapForOneAxis(
    pointToCheck: number,
    snappingPoint: number,
    threshold: number,
    pointToCheckOnAnotherAxis: number,
    snappingPointOnAnotherAxis: number,
    thresholdOnAnotherAxis,
  ) {
    return (
      pointToCheck < snappingPoint + threshold &&
      pointToCheck > snappingPoint - threshold &&
      pointToCheckOnAnotherAxis <
        snappingPointOnAnotherAxis + thresholdOnAnotherAxis &&
      pointToCheckOnAnotherAxis >
        snappingPointOnAnotherAxis - thresholdOnAnotherAxis
    );
  }

  static calculateGroupCenterSnapPosition(
    selectedEntities: BaseMonomer[],
    connectedMonomers: BaseMonomer[],
    movementDelta: Vec2,
  ) {
    const results: GroupCenterSnapResult[] = [];
    const selectedEntitiesBbox =
      DrawingEntitiesManager.getStructureBbox(selectedEntities);
    const selectedEntitiesCenter = new Vec2(
      selectedEntitiesBbox.left + selectedEntitiesBbox.width / 2,
      selectedEntitiesBbox.top + selectedEntitiesBbox.height / 2,
    );
    const selectedEntitiesCenterWithMovementDelta =
      selectedEntitiesCenter.add(movementDelta);

    for (let i = 0; i < connectedMonomers.length; i++) {
      for (let j = i + 1; j < connectedMonomers.length; j++) {
        const monomerA = connectedMonomers[i];
        const monomerB = connectedMonomers[j];
        const pairBbox = DrawingEntitiesManager.getStructureBbox([
          monomerA,
          monomerB,
        ]);
        const pairCenter = new Vec2(
          pairBbox.left + pairBbox.width / 2,
          pairBbox.top + pairBbox.height / 2,
        );

        if (
          SelectRectangle.needApplyGroupCenterSnapForOneAxis(
            selectedEntitiesCenterWithMovementDelta.x,
            pairCenter.x,
            HalfMonomerSize,
            selectedEntitiesCenterWithMovementDelta.y,
            pairCenter.y,
            HalfMonomerSize * 2,
          )
        ) {
          results.push({
            snapPosition: Vec2.diff(pairCenter, selectedEntitiesCenter),
            isVertical: false,
            absoluteSnapPosition: pairCenter,
            monomerPair: [monomerA, monomerB],
            // connectionLength: 0 is set to prioritize this type of snapping over others to prevent jumps
            connectionLength: 0,
            showGroupCenterSnapping: true,
          });
        } else if (
          SelectRectangle.needApplyGroupCenterSnapForOneAxis(
            selectedEntitiesCenterWithMovementDelta.y,
            pairCenter.y,
            HalfMonomerSize,
            selectedEntitiesCenterWithMovementDelta.x,
            pairCenter.x,
            HalfMonomerSize * 2,
          )
        ) {
          results.push({
            snapPosition: Vec2.diff(pairCenter, selectedEntitiesCenter),
            isVertical: true,
            absoluteSnapPosition: pairCenter,
            monomerPair: [monomerA, monomerB],
            // connectionLength: 0 is set to prioritize this type of snapping over others to prevent jumps
            connectionLength: 0,
            showGroupCenterSnapping: true,
          });
        }
      }
    }

    return results;
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
    const alignment = SelectBase.determineAlignment(
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
      const nextMonomers = SelectBase.getNextMonomers(
        currentMonomer,
        visitedMonomers,
      );
      for (const nextMonomer of nextMonomers) {
        if (!nextMonomer) {
          continue;
        }

        if (
          SelectBase.checkMonomersAlignment(
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

    const alignment = SelectBase.determineAlignment(
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
    const additionalAlignedMonomers = SelectBase.findRemainingAlignedMonomers(
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
      SelectBase.findRemainingAlignedMonomers(
        firstConnectedMonomer,
        alignedMonomers,
        alignment,
        snapDistance,
      );
    const additionalAlignedMonomersFromOtherSide =
      SelectBase.findRemainingAlignedMonomers(
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
      return SelectBase.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    const secondConnectedMonomer =
      secondShortestBond.getAnotherMonomer(initialMonomer);
    if (!secondConnectedMonomer) {
      return SelectBase.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    const alignment = SelectBase.determineAlignment(
      connectedMonomer.center,
      secondConnectedMonomer.center,
    );

    if (!alignment) {
      return SelectBase.calculateSideDistanceSnap(
        cursorPosition,
        initialMonomer,
        connectedMonomer,
      );
    }

    return SelectBase.calculateInBetweenDistanceSnap(
      cursorPosition,
      initialMonomer,
      connectedMonomer,
      secondConnectedMonomer,
      alignment,
    );
  }

  private tryToSnap(event: MouseEvent, movementDelta: Vec2) {
    let snapPosition: Vec2 | undefined;
    const emptyResult: EmptySnapResult = {
      snapPosition: null,
      connectionLength: Infinity,
    };

    if (this.editor.mode.modeName === 'sequence-layout-mode') {
      return emptyResult;
    }
    const modKeyPressed = isMacOs ? event.metaKey : event.ctrlKey;
    const externalConnectionsToSelection =
      this.editor.drawingEntitiesManager.externalConnectionsToSelection;

    if (modKeyPressed || externalConnectionsToSelection.length === 0) {
      return emptyResult;
    }

    const snappingOptions: Array<
      SnapResult | EmptySnapResult | GroupCenterSnapResult
    > = externalConnectionsToSelection.map(
      ({ monomerFromSelection, monomerConnectedToSelection, bond }) => {
        const selectedMonomer = monomerFromSelection;
        const connectedMonomer = monomerConnectedToSelection;
        const connectionLength = Vec2.diff(
          monomerFromSelection.position,
          monomerConnectedToSelection.position,
        ).length();

        if (!connectedMonomer) {
          return emptyResult;
        }

        const {
          distanceSnapPosition,
          snapDistance,
          alignment,
          alignedMonomers,
        } = SelectBase.calculateDistanceSnap(
          selectedMonomer.position,
          selectedMonomer,
          connectedMonomer,
        );

        const { angleSnapPosition, snappedAngleRad } =
          SelectBase.calculateAngleSnap(
            selectedMonomer.position.add(movementDelta),
            connectedMonomer.position,
            this.editor.mode.modeName === 'snake-layout-mode' ? 90 : 30,
            snapDistance,
          );

        const { bondLengthSnapPosition } = SelectBase.calculateBondLengthSnap(
          selectedMonomer.position,
          connectedMonomer.position,
          snappedAngleRad,
        );

        if (bondLengthSnapPosition) {
          snapPosition = bondLengthSnapPosition;
        } else if (angleSnapPosition) {
          snapPosition = angleSnapPosition;
        } else if (distanceSnapPosition) {
          snapPosition = distanceSnapPosition;
        }

        if (!snapPosition) {
          return emptyResult;
        }

        const movementDeltaLength = movementDelta.length();

        const thresholdValue =
          Boolean(distanceSnapPosition) && Boolean(angleSnapPosition)
            ? HalfMonomerSize + 0.1
            : HalfMonomerSize;

        if (movementDeltaLength >= thresholdValue) {
          return emptyResult;
        }

        const showAngleSnapping = Boolean(angleSnapPosition);
        const showBondLengthSnapping = Boolean(bondLengthSnapPosition);
        const showDistanceSnapping =
          !showBondLengthSnapping && Boolean(distanceSnapPosition);

        if (
          !showAngleSnapping &&
          !showBondLengthSnapping &&
          !showDistanceSnapping
        ) {
          return emptyResult;
        }

        return {
          snapPosition: snapPosition.sub(selectedMonomer.position),
          showAngleSnapping,
          bond,
          connectedMonomer,
          showBondLengthSnapping,
          showDistanceSnapping,
          showGroupCenterSnapping: false,
          alignment,
          alignedMonomers,
          connectionLength,
        };
      },
    );

    const selectedMonomers =
      this.editor.drawingEntitiesManager.selectedMonomers;

    if (
      externalConnectionsToSelection.length >= 2 &&
      selectedMonomers.length >= 2
    ) {
      const connectedMonomers = externalConnectionsToSelection.map(
        ({ monomerConnectedToSelection }) => monomerConnectedToSelection,
      );
      const groupCenterSnapResult =
        SelectRectangle.calculateGroupCenterSnapPosition(
          selectedMonomers,
          connectedMonomers,
          movementDelta,
        );
      const firstGroupCenterSnapResult = groupCenterSnapResult[0];

      if (firstGroupCenterSnapResult) {
        snappingOptions.push(firstGroupCenterSnapResult);
      }
    }

    snappingOptions.sort((a, b) => {
      return a.connectionLength - b.connectionLength;
    });

    return snappingOptions[0] || emptyResult;
  }

  mousemove(event: MouseEvent) {
    if (this.mode === 'standby') {
      return;
    }

    if (this.mode === 'selecting') {
      this.updateSelectionViewParams();
      this.onSelectionMove(event.shiftKey);
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

    const snapResult = this.tryToSnap(event, movementDelta);
    const { snapPosition } = snapResult;

    this.editor.transientDrawingView.clear();

    if (snapPosition) {
      modelChanges.merge(
        this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
          snapPosition,
        ),
      );

      if (isGroupCenterSnapResult(snapResult)) {
        this.editor.transientDrawingView.showGroupCenterSnap({
          isVertical: snapResult.isVertical,
          absoluteSnapPosition: snapResult.absoluteSnapPosition,
          monomerPair: snapResult.monomerPair,
        });
      } else {
        const {
          showAngleSnapping,
          connectedMonomer,
          bond,
          showBondLengthSnapping,
          showDistanceSnapping,
          alignment,
          alignedMonomers,
        } = snapResult;

        if (showAngleSnapping) {
          this.editor.transientDrawingView.showAngleSnap({
            connectedMonomer,
            polymerBond: bond,
            isBondLengthSnapped: showBondLengthSnapping,
          });
        }

        if (showBondLengthSnapping) {
          this.editor.transientDrawingView.showBondSnap(bond);
        }

        if (showDistanceSnapping) {
          this.editor.transientDrawingView.showDistanceSnap({
            alignment,
            alignedMonomers,
          });
        }
      }
    } else {
      modelChanges.merge(
        this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
          movementDelta,
        ),
      );
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
      if (this.mode === 'moving' && renderer?.drawingEntity?.selected) {
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

          const modelChanges =
            this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
              new Vec2(0, 0),
              actualMovementDelta,
            );
          this.history.update(modelChanges);
        } else {
          const canvasDelta = Vec2.diff(
            this.mousePositionAfterMove,
            this.mousePositionBeforeMove,
          );
          if (canvasDelta.length() === 0) {
            return;
          }

          const fullMovementOffset = Coordinates.canvasToModel(canvasDelta);
          const modelChanges =
            this.editor.drawingEntitiesManager.moveSelectedDrawingEntities(
              new Vec2(0, 0),
              fullMovementOffset,
            );
          this.history.update(modelChanges);
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
  }

  destroy() {
    this.canvasResizeObserver?.disconnect();

    if (!(this.editor.selectedTool instanceof EraserTool)) {
      const modelChanges =
        this.editor.drawingEntitiesManager.unselectAllDrawingEntities();
      SequenceRenderer.unselectEmptyAndBackboneSequenceNodes();

      this.editor.renderersContainer.update(modelChanges);
    }
  }

  public stopMovement() {
    this.mode = 'standby';
    this.editor.transientDrawingView.clear();
  }
}

export { SelectBase };
