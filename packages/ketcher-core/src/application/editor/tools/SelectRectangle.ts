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
import { MonomersAlignment, vectorUtils } from 'application/editor';

type EmptySnapResult = {
  snapPosition: null;
};

type SnapResult = {
  snapPosition: Vec2;
  isAngleSnapped: boolean;
  connectedMonomer: BaseMonomer;
  bond: PolymerBond | HydrogenBond;
  isBondLengthSnapped: boolean;
  isDistanceSnapped: boolean;
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
        isAngleSnapped,
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

  static determineAlignment(
    firstPosition: Vec2,
    secondPosition: Vec2,
  ): MonomersAlignment | null {
    const verticalDiff = Math.abs(firstPosition.y - secondPosition.y);
    const horizontalDiff = Math.abs(firstPosition.x - secondPosition.x);

    if (verticalDiff < 0.75 && horizontalDiff >= 0.75) {
      return 'horizontal';
    } else if (horizontalDiff < 0.75 && verticalDiff >= 0.75) {
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

  static getNextMonomer(
    currentMonomer: BaseMonomer,
    visitedMonomers: Set<number>,
  ) {
    return currentMonomer.polymerBonds
      .filter((bond) => bond.isBackBoneChainConnection)
      .map((bond) => bond.getAnotherMonomer(currentMonomer))
      .filter((monomer) => monomer && !visitedMonomers.has(monomer.id))[0];
  }

  static findRemainingAlignedMonomers(
    startingMonomer: BaseMonomer,
    initialState: BaseMonomer[],
    alignment: MonomersAlignment,
    distance: number,
  ) {
    const visitedMonomers = new Set(initialState.map((monomer) => monomer.id));
    let currentMonomer = startingMonomer;
    let nextMonomer = SelectRectangle.getNextMonomer(
      startingMonomer,
      visitedMonomers,
    );

    const remainingAlignedMonomers: BaseMonomer[] = [];

    while (nextMonomer) {
      const nextMonomerIsAligned = SelectRectangle.checkMonomersAlignment(
        currentMonomer,
        nextMonomer,
        alignment,
        distance,
      );

      if (nextMonomerIsAligned) {
        visitedMonomers.add(currentMonomer.id);
        remainingAlignedMonomers.push(nextMonomer);
        currentMonomer = nextMonomer;
        nextMonomer = SelectRectangle.getNextMonomer(
          currentMonomer,
          visitedMonomers,
        );
      } else {
        break;
      }
    }

    return remainingAlignedMonomers;
  }

  static calculateDistanceSnap(cursorPosition: Vec2, monomer: BaseMonomer) {
    const [firstSideMonomer, secondSideMonomer] = monomer.polymerBonds.map(
      (bond) => bond.getAnotherMonomer(monomer),
    );

    if (firstSideMonomer && secondSideMonomer) {
      const alignment = SelectRectangle.determineAlignment(
        firstSideMonomer.center,
        secondSideMonomer.center,
      );
      if (!alignment) {
        return { isDistanceSnapped: false };
      }

      const alignedMonomers = [monomer, firstSideMonomer, secondSideMonomer];

      if (alignment === 'horizontal') {
        const deltaY1 = Math.abs(cursorPosition.y - firstSideMonomer.center.y);
        const deltaY2 = Math.abs(cursorPosition.y - secondSideMonomer.center.y);

        if (deltaY1 >= 0.75 || deltaY2 >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const distanceToMonomerForSnapping = Math.abs(
          cursorPosition.x - firstSideMonomer.center.x,
        );
        const snapDistance =
          Math.abs(firstSideMonomer.center.x - secondSideMonomer.center.x) / 2;
        if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= 0.375) {
          return { isDistanceSnapped: false };
        }

        const midPoint =
          (firstSideMonomer.center.x + secondSideMonomer.center.x) / 2;
        const distanceSnapPosition = new Vec2(midPoint, cursorPosition.y);

        const additionalAlignedMonomersFromOneSide =
          SelectRectangle.findRemainingAlignedMonomers(
            firstSideMonomer,
            alignedMonomers,
            alignment,
            snapDistance,
          );
        const additionalAlignedMonomersFromOtherSide =
          SelectRectangle.findRemainingAlignedMonomers(
            secondSideMonomer,
            alignedMonomers,
            alignment,
            snapDistance,
          );

        return {
          isDistanceSnapped: true,
          snapDistance,
          distanceSnapPosition,
          alignment,
          alignedMonomers: [
            ...alignedMonomers,
            ...additionalAlignedMonomersFromOneSide,
            ...additionalAlignedMonomersFromOtherSide,
          ],
        };
      } else {
        const deltaX1 = Math.abs(cursorPosition.x - firstSideMonomer.center.x);
        const deltaX2 = Math.abs(cursorPosition.x - secondSideMonomer.center.x);

        if (deltaX1 >= 0.75 || deltaX2 >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const distanceToMonomerForSnapping = Math.abs(
          cursorPosition.y - firstSideMonomer.center.y,
        );
        const snapDistance =
          Math.abs(firstSideMonomer.center.y - secondSideMonomer.center.y) / 2;
        if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= 0.375) {
          return { isDistanceSnapped: false };
        }

        const midPoint =
          (firstSideMonomer.center.y + secondSideMonomer.center.y) / 2;
        const distanceSnapPosition = new Vec2(cursorPosition.x, midPoint);

        const additionalAlignedMonomersFromOneSide =
          SelectRectangle.findRemainingAlignedMonomers(
            firstSideMonomer,
            alignedMonomers,
            alignment,
            snapDistance,
          );
        const additionalAlignedMonomersFromOtherSide =
          SelectRectangle.findRemainingAlignedMonomers(
            secondSideMonomer,
            alignedMonomers,
            alignment,
            snapDistance,
          );

        return {
          isDistanceSnapped: true,
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
    } else {
      const monomerForSnapping = firstSideMonomer ?? secondSideMonomer;
      if (!monomerForSnapping) {
        return { isDistanceSnapped: false };
      }

      const visitedMonomers = new Set([monomer.id]);
      const monomerForAlignment = SelectRectangle.getNextMonomer(
        monomerForSnapping,
        visitedMonomers,
      );

      if (!monomerForAlignment) {
        return { isDistanceSnapped: false };
      }

      const alignment = SelectRectangle.determineAlignment(
        monomerForSnapping.center,
        monomerForAlignment.center,
      );
      if (!alignment) {
        return { isDistanceSnapped: false };
      }

      const alignedMonomers = [
        monomer,
        monomerForSnapping,
        monomerForAlignment,
      ];

      if (alignment === 'horizontal') {
        const delta = Math.abs(cursorPosition.y - monomerForSnapping.center.y);
        if (delta >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const snapDistance = Math.abs(
          monomerForSnapping.center.x - monomerForAlignment.center.x,
        );
        const distanceToMonomerForSnapping = Math.abs(
          cursorPosition.x - monomerForSnapping.center.x,
        );
        if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= 0.375) {
          return { isDistanceSnapped: false };
        }

        const sign = Math.sign(monomerForSnapping.center.x - cursorPosition.x);
        const distanceSnapPosition = new Vec2(
          monomerForSnapping.center.x - sign * snapDistance,
          cursorPosition.y,
        );

        const additionalAlignedMonomers =
          SelectRectangle.findRemainingAlignedMonomers(
            monomerForAlignment,
            alignedMonomers,
            alignment,
            snapDistance,
          );

        return {
          isDistanceSnapped: true,
          snapDistance,
          distanceSnapPosition,
          alignment,
          alignedMonomers: [...alignedMonomers, ...additionalAlignedMonomers],
        };
      } else {
        const delta = Math.abs(cursorPosition.x - monomerForSnapping.center.x);
        if (delta >= 0.75) {
          return { isDistanceSnapped: false };
        }

        const snapDistance = Math.abs(
          monomerForSnapping.center.y - monomerForAlignment.center.y,
        );
        const distanceToMonomerForSnapping = Math.abs(
          cursorPosition.y - monomerForSnapping.center.y,
        );
        if (Math.abs(distanceToMonomerForSnapping - snapDistance) >= 0.375) {
          return { isDistanceSnapped: false };
        }

        const sign = Math.sign(monomerForSnapping.center.y - cursorPosition.y);
        const distanceSnapPosition = new Vec2(
          cursorPosition.x,
          monomerForSnapping.center.y - sign * snapDistance,
        );

        const additionalAlignedMonomers =
          SelectRectangle.findRemainingAlignedMonomers(
            monomerForAlignment,
            alignedMonomers,
            alignment,
            snapDistance,
          );

        return {
          isDistanceSnapped: true,
          snapDistance,
          distanceSnapPosition,
          alignment,
          alignedMonomers: [...alignedMonomers, ...additionalAlignedMonomers],
        };
      }
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

    const {
      isDistanceSnapped,
      distanceSnapPosition,
      snapDistance,
      alignment,
      alignedMonomers,
    } = SelectRectangle.calculateDistanceSnap(
      cursorPositionInAngstroms,
      selectedMonomer,
    );

    const { isAngleSnapped, angleSnapPosition, snappedAngleRad } =
      SelectRectangle.calculateAngleSnap(
        cursorPositionInAngstroms,
        connectedMonomer.position,
        this.editor.mode.modeName === 'snake-layout-mode' ? 90 : 30,
        snapDistance,
      );

    const { isBondLengthSnapped, bondLengthSnapPosition } =
      SelectRectangle.calculateBondLengthSnap(
        cursorPositionInAngstroms,
        connectedMonomer.position,
        snappedAngleRad,
      );

    let snapPosition: Vec2 | undefined;
    if (isBondLengthSnapped) {
      snapPosition = bondLengthSnapPosition;
    } else if (isAngleSnapped) {
      snapPosition = angleSnapPosition;
    } else if (distanceSnapPosition) {
      snapPosition = distanceSnapPosition;
    }

    const onlyOneSnappingIsApplied =
      [isBondLengthSnapped, isAngleSnapped, isDistanceSnapped].filter(
        (value) => value,
      ).length === 1;

    if (snapPosition) {
      const distanceToSnapPosition = Vec2.diff(
        cursorPositionInAngstroms,
        snapPosition,
      ).length();

      if (distanceToSnapPosition < (onlyOneSnappingIsApplied ? 0.375 : 0.55)) {
        return {
          snapPosition: snapPosition.sub(selectedMonomer.position),
          isAngleSnapped,
          bond: shortestMonomerBond,
          connectedMonomer,
          isBondLengthSnapped,
          isDistanceSnapped,
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
        isAngleSnapped,
        connectedMonomer,
        bond,
        isBondLengthSnapped,
        isDistanceSnapped,
        alignment,
        alignedMonomers,
      } = snapResult;

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

      isDistanceSnapped
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
      this.moveStarted = false;
      this.editor.transientDrawingView.clear();
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
}

export { SelectRectangle };
