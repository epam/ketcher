import { AttachmentPointName, MonomerItemType } from 'domain/types';
import { Vec2 } from 'domain/entities/vec2';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import {
  Peptide,
  BaseMonomer,
  Struct,
  Pool,
  Chem,
  SGroupForest,
} from 'domain/entities';
import {
  AttachmentPointHoverOperation,
  MonomerAddOperation,
  MonomerDeleteOperation,
  MonomerHoverOperation,
  MonomerMoveOperation,
} from 'application/editor/operations/monomer';
import {
  DrawingEntityHoverOperation,
  DrawingEntitySelectOperation,
  DrawingEntityMoveOperation,
  DrawingEntityRedrawOperation,
} from 'application/editor/operations/drawingEntity';
import {
  PolymerBondAddOperation,
  PolymerBondCancelCreationOperation,
  PolymerBondDeleteOperation,
  PolymerBondFinishCreationOperation,
  PolymerBondMoveOperation,
  PolymerBondShowInfoOperation,
} from 'application/editor/operations/polymerBond';
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { Coordinates } from 'application/editor';
import { getCurrentCenterPointOfCanvas } from 'application/utils';

const HORIZONTAL_DISTANCE_FROM_MONOMER = 50;
const VERTICAL_DISTANCE_FROM_MONOMER = 60;
const DISTANCE_FROM_RIGHT = 70;
const DISTANCE_BETWEEN_MONOMERS = 30;
const MONOMER_START_X_POSITION = 70;
const MONOMER_START_Y_POSITION = 70;

type RnaPresetAdditionParams = {
  sugar: MonomerItemType;
  sugarPosition: Vec2;
  rnaBase: MonomerItemType | undefined;
  rnaBasePosition: Vec2 | undefined;
  phosphate: MonomerItemType | undefined;
  phosphatePosition: Vec2 | undefined;
};

export class DrawingEntitiesManager {
  public monomers: Map<number, BaseMonomer> = new Map();
  public polymerBonds: Map<number, PolymerBond> = new Map();
  public micromoleculesHiddenEntities: Struct = new Struct();
  get selectedEntities() {
    return this.allEntities.filter(
      ([, drawingEntity]) => drawingEntity.selected,
    );
  }

  get allEntities() {
    return [
      ...(this.monomers as Map<number, DrawingEntity>),
      ...(this.polymerBonds as Map<number, DrawingEntity>),
    ];
  }

  public deleteSelectedEntities() {
    const mergedCommand = new Command();
    this.selectedEntities.forEach(([, drawingEntity]) => {
      const command = this.deleteDrawingEntity(drawingEntity);
      mergedCommand.merge(command);
    });
    return mergedCommand;
  }

  public deleteAllEntities() {
    const mergedCommand = new Command();
    this.allEntities.forEach(([, drawingEntity]) => {
      const command = this.deleteDrawingEntity(drawingEntity, false);
      mergedCommand.merge(command);
    });
    return mergedCommand;
  }

  public addMonomerChangeModel(
    monomerItem: MonomerItemType,
    position: Vec2,
    _monomer?: BaseMonomer,
  ) {
    if (_monomer) {
      this.monomers.set(_monomer.id, _monomer);
      return _monomer;
    }
    const [Monomer] = monomerFactory(monomerItem);
    const monomer = new Monomer(monomerItem, position);
    monomer.moveAbsolute(position);
    this.monomers.set(monomer.id, monomer);
    return monomer;
  }

  public addMonomer(monomerItem: MonomerItemType, position: Vec2) {
    const command = new Command();
    const operation = new MonomerAddOperation(
      this.addMonomerChangeModel.bind(this, monomerItem, position),
      this.deleteMonomerChangeModel.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public deleteDrawingEntity(
    drawingEntity: DrawingEntity,
    needToDeleteConnectedEntities = true,
  ) {
    if (drawingEntity instanceof BaseMonomer) {
      return this.deleteMonomer(drawingEntity, needToDeleteConnectedEntities);
    } else if (drawingEntity instanceof PolymerBond) {
      return this.deletePolymerBond(drawingEntity);
    } else {
      return new Command();
    }
  }

  public selectDrawingEntity(drawingEntity: DrawingEntity) {
    const command = this.unselectAllDrawingEntities();

    drawingEntity.turnOnSelection();
    command.merge(this.createDrawingEntitySelectionCommand(drawingEntity));

    return command;
  }

  public createDrawingEntitySelectionCommand(drawingEntity: DrawingEntity) {
    const command = new Command();

    const selectionCommand = new DrawingEntitySelectOperation(drawingEntity);
    command.addOperation(selectionCommand);

    return command;
  }

  public unselectAllDrawingEntities() {
    const command = new Command();

    this.allEntities.forEach(([, drawingEntity]) => {
      if (drawingEntity.selected) {
        drawingEntity.turnOffSelection();
        const operation = new DrawingEntitySelectOperation(drawingEntity);
        command.addOperation(operation);
      }
    });

    return command;
  }

  public moveDrawingEntityModelChange(
    drawingEntity: DrawingEntity,
    offset?: Vec2,
  ) {
    if (drawingEntity instanceof PolymerBond) {
      drawingEntity.moveToLinkedMonomers();
    } else {
      assert(offset);
      drawingEntity.moveRelative(offset);
    }

    return drawingEntity;
  }

  public moveSelectedDrawingEntities(
    partOfMovementOffset: Vec2,
    fullMovementOffset?: Vec2,
  ) {
    const command = new Command();

    this.monomers.forEach((drawingEntity) => {
      if (drawingEntity.selected) {
        command.merge(
          this.createDrawingEntityMovingCommand(
            drawingEntity,
            partOfMovementOffset,
            fullMovementOffset,
          ),
        );
      }
    });

    this.polymerBonds.forEach((drawingEntity) => {
      if (
        drawingEntity.selected ||
        drawingEntity.firstMonomer.selected ||
        drawingEntity.secondMonomer?.selected
      ) {
        command.merge(
          this.createDrawingEntityMovingCommand(
            drawingEntity,
            partOfMovementOffset,
            fullMovementOffset,
          ),
        );
      }
    });
    return command;
  }

  public createDrawingEntityMovingCommand(
    drawingEntity: DrawingEntity,
    partOfMovementOffset: Vec2,
    fullMovementOffset?: Vec2,
  ) {
    const command = new Command();

    const movingCommand = new DrawingEntityMoveOperation(
      this.moveDrawingEntityModelChange.bind(
        this,
        drawingEntity,
        partOfMovementOffset,
      ),
      this.moveDrawingEntityModelChange.bind(
        this,
        drawingEntity,
        fullMovementOffset
          ? fullMovementOffset.negated()
          : partOfMovementOffset.negated(),
      ),
      this.moveDrawingEntityModelChange.bind(
        this,
        drawingEntity,
        fullMovementOffset || partOfMovementOffset,
      ),
      drawingEntity,
    );
    command.addOperation(movingCommand);

    return command;
  }

  public createDrawingEntityRedrawCommand(
    drawingEntityRedrawModelChange: () => DrawingEntity,
    invertDrawingEntityRedrawModelChange: () => DrawingEntity,
  ) {
    const command = new Command();

    const redrawCommand = new DrawingEntityRedrawOperation(
      drawingEntityRedrawModelChange,
      invertDrawingEntityRedrawModelChange,
    );
    command.addOperation(redrawCommand);

    return command;
  }

  private deleteMonomerChangeModel(monomer: BaseMonomer) {
    this.monomers.delete(monomer.id);
  }

  public deleteMonomer(
    monomer: BaseMonomer,
    needToDeleteConnectedBonds = true,
  ) {
    const command = new Command();
    const operation = new MonomerDeleteOperation(
      monomer,
      this.addMonomerChangeModel.bind(
        this,
        monomer.monomerItem,
        monomer.position,
      ),
      this.deleteMonomerChangeModel.bind(this),
    );
    command.addOperation(operation);

    if (needToDeleteConnectedBonds && monomer.hasBonds) {
      monomer.forEachBond((bond) => {
        // Do not delete connected bond if it is selected because it is done deleteDrawingEntity method
        // This check helps to avoid operations duplication
        if (bond.selected) return;
        command.merge(this.deletePolymerBond(bond));
      });
    }

    return command;
  }

  public selectIfLocatedInRectangle(
    rectangleTopLeftPoint: Vec2,
    rectangleBottomRightPoint: Vec2,
  ) {
    const command = new Command();
    this.allEntities.forEach(([, drawingEntity]) => {
      const isValueChanged = drawingEntity.selectIfLocatedInRectangle(
        rectangleTopLeftPoint,
        rectangleBottomRightPoint,
      );

      if (isValueChanged) {
        const selectionCommand =
          this.createDrawingEntitySelectionCommand(drawingEntity);

        command.merge(selectionCommand);
      }
    });
    return command;
  }

  public startPolymerBondCreationChangeModel(
    firstMonomer,
    startPosition,
    endPosition,
    _polymerBond?: PolymerBond,
  ) {
    if (_polymerBond) {
      this.polymerBonds.set(_polymerBond.id, _polymerBond);
      return _polymerBond;
    }

    const polymerBond = new PolymerBond(firstMonomer);
    this.polymerBonds.set(polymerBond.id, polymerBond);
    // If we started from a specific AP, we need to 'attach' the bond to the first monomer
    if (firstMonomer.chosenFirstAttachmentPointForBond) {
      const startBondAttachmentPoint = firstMonomer.startBondAttachmentPoint;
      firstMonomer.setBond(startBondAttachmentPoint, polymerBond);
      firstMonomer.setPotentialBond(startBondAttachmentPoint, polymerBond);
    }
    polymerBond.moveBondStartAbsolute(startPosition.x, startPosition.y);
    polymerBond.moveBondEndAbsolute(endPosition.x, endPosition.y);
    return polymerBond;
  }

  public startPolymerBondCreation(firstMonomer, startPosition, endPosition) {
    const command = new Command();

    const operation = new PolymerBondAddOperation(
      this.startPolymerBondCreationChangeModel.bind(
        this,
        firstMonomer,
        startPosition,
        endPosition,
      ),
      this.deletePolymerBondChangeModel.bind(this),
    );

    command.addOperation(operation);

    return { command, polymerBond: operation.polymerBond };
  }

  public deletePolymerBondChangeModel(polymerBond: PolymerBond) {
    this.polymerBonds.delete(polymerBond.id);

    const firstMonomerAttachmentPoint =
      polymerBond.firstMonomer.getAttachmentPointByBond(polymerBond);
    const secondMonomerAttachmentPoint =
      polymerBond.secondMonomer?.getAttachmentPointByBond(polymerBond);
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.secondMonomer?.removePotentialBonds();
    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.secondMonomer?.turnOffSelection();
    if (firstMonomerAttachmentPoint) {
      polymerBond.firstMonomer.unsetBond(firstMonomerAttachmentPoint);
    }
    if (secondMonomerAttachmentPoint) {
      polymerBond.secondMonomer?.unsetBond(secondMonomerAttachmentPoint);
    }
  }

  public deletePolymerBond(polymerBond: PolymerBond) {
    const command = new Command();

    const operation = new PolymerBondDeleteOperation(
      polymerBond,
      this.deletePolymerBondChangeModel.bind(this, polymerBond),
      this.finishPolymerBondCreationModelChange.bind(
        this,
        polymerBond.firstMonomer,
        polymerBond.secondMonomer as BaseMonomer,
        polymerBond.firstMonomer.getAttachmentPointByBond(
          polymerBond,
        ) as string,
        polymerBond.secondMonomer?.getAttachmentPointByBond(
          polymerBond,
        ) as string,
      ),
    );
    command.addOperation(operation);

    return command;
  }

  public cancelPolymerBondCreation(
    polymerBond: PolymerBond,
    secondMonomer?: BaseMonomer,
  ) {
    this.polymerBonds.delete(polymerBond.id);
    const command = new Command();
    polymerBond.firstMonomer.removeBond(polymerBond);
    polymerBond.firstMonomer.removePotentialBonds(true);
    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.firstMonomer.turnOffHover();
    polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();

    secondMonomer?.turnOffSelection();
    secondMonomer?.turnOffHover();
    secondMonomer?.turnOffAttachmentPointsVisibility();
    const operation = new PolymerBondCancelCreationOperation(
      polymerBond,
      secondMonomer,
    );
    command.addOperation(operation);

    return command;
  }

  public movePolymerBond(polymerBond: PolymerBond, position: Vec2) {
    const command = new Command();
    polymerBond.moveBondEndAbsolute(position.x, position.y);

    const operation = new PolymerBondMoveOperation(polymerBond);

    command.addOperation(operation);

    return command;
  }

  public finishPolymerBondCreationModelChange(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: string,
    secondMonomerAttachmentPoint: string,
    _polymerBond?: PolymerBond,
  ) {
    if (_polymerBond) {
      this.polymerBonds.set(_polymerBond.id, _polymerBond);
      firstMonomer.setBond(firstMonomerAttachmentPoint, _polymerBond);
      secondMonomer.setBond(secondMonomerAttachmentPoint, _polymerBond);
      return _polymerBond;
    }

    const polymerBond = new PolymerBond(firstMonomer);
    this.polymerBonds.set(polymerBond.id, polymerBond);
    polymerBond.setSecondMonomer(secondMonomer);
    polymerBond.firstMonomer.setBond(firstMonomerAttachmentPoint, polymerBond);
    assert(polymerBond.secondMonomer);
    polymerBond.secondMonomer.setBond(
      secondMonomerAttachmentPoint,
      polymerBond,
    );

    polymerBond.firstMonomer.removePotentialBonds(true);
    polymerBond.secondMonomer.removePotentialBonds(true);
    polymerBond.firstMonomer.setChosenFirstAttachmentPoint(null);
    polymerBond.secondMonomer?.setChosenSecondAttachmentPoint(null);
    polymerBond.moveToLinkedMonomers();
    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.firstMonomer.turnOffHover();
    polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
    polymerBond.secondMonomer.turnOffSelection();
    polymerBond.secondMonomer.turnOffHover();
    polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();
    polymerBond.turnOffHover();

    return polymerBond;
  }

  public finishPolymerBondCreation(
    polymerBond: PolymerBond,
    secondMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: string,
    secondMonomerAttachmentPoint: string,
  ) {
    const command = new Command();

    const firstMonomer = polymerBond.firstMonomer;
    this.polymerBonds.delete(polymerBond.id);
    const operation = new PolymerBondFinishCreationOperation(
      this.finishPolymerBondCreationModelChange.bind(
        this,
        firstMonomer,
        secondMonomer,
        firstMonomerAttachmentPoint,
        secondMonomerAttachmentPoint,
      ),
      this.deletePolymerBondChangeModel.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public createPolymerBond(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: string,
    secondMonomerAttachmentPoint: string,
  ) {
    const command = new Command();

    const operation = new PolymerBondFinishCreationOperation(
      this.finishPolymerBondCreationModelChange.bind(
        this,
        firstMonomer,
        secondMonomer,
        firstMonomerAttachmentPoint,
        secondMonomerAttachmentPoint,
      ),
      this.deletePolymerBondChangeModel.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public intendToStartBondCreation(monomer: BaseMonomer) {
    const command = new Command();
    monomer.turnOnHover();
    monomer.turnOnAttachmentPointsVisibility();

    const operation = new MonomerHoverOperation(monomer, true);

    command.addOperation(operation);

    return command;
  }

  public intendToStartAttachmenPointBondCreation(
    monomer: BaseMonomer,
    attachmentPointName: AttachmentPointName,
  ) {
    const command = new Command();
    monomer.turnOnHover();
    monomer.turnOnAttachmentPointsVisibility();

    const operation = new AttachmentPointHoverOperation(
      monomer,
      attachmentPointName,
    );

    command.addOperation(operation);

    return command;
  }

  public intendToFinishBondCreation(
    monomer: BaseMonomer,
    bond: PolymerBond,
    shouldCalculateBonds: boolean,
  ) {
    const command = new Command();
    monomer.turnOnHover();
    monomer.turnOnAttachmentPointsVisibility();
    if (shouldCalculateBonds) {
      bond.firstMonomer.removePotentialBonds();
      monomer.removePotentialBonds();
      const firstMonomerValidSourcePoint =
        bond.firstMonomer.getValidSourcePoint(monomer);
      const secondMonomerValidTargetPoint = monomer.getValidTargetPoint(
        bond.firstMonomer,
      );
      bond.firstMonomer.setPotentialBond(firstMonomerValidSourcePoint, bond);
      monomer.setPotentialBond(secondMonomerValidTargetPoint, bond);
    }
    const connectFirstMonomerOperation = new MonomerHoverOperation(
      bond.firstMonomer,
      true,
    );
    const connectSecondMonomerOperation = new MonomerHoverOperation(
      monomer,
      true,
    );
    command.addOperation(connectFirstMonomerOperation);
    command.addOperation(connectSecondMonomerOperation);
    return command;
  }

  public intendToFinishAttachmenPointBondCreation(
    monomer: BaseMonomer,
    bond: PolymerBond,
    attachmentPointName: AttachmentPointName,
    shouldCalculateBonds: boolean,
  ) {
    const command = new Command();
    monomer.turnOnHover();
    monomer.turnOnAttachmentPointsVisibility();

    if (
      monomer.isAttachmentPointUsed(attachmentPointName as AttachmentPointName)
    ) {
      const operation = new MonomerHoverOperation(monomer, true);
      command.addOperation(operation);
      return command;
    }

    if (attachmentPointName) {
      monomer.setPotentialSecondAttachmentPoint(attachmentPointName);
      monomer.setPotentialBond(attachmentPointName, bond);
    }

    if (shouldCalculateBonds) {
      bond.firstMonomer.removePotentialBonds();
      monomer.removePotentialBonds();
      const firstMonomerValidSourcePoint =
        bond.firstMonomer.getValidSourcePoint(monomer);
      const secondMonomerValidTargetPoint = monomer.getValidTargetPoint(
        bond.firstMonomer,
      );
      bond.firstMonomer.setPotentialBond(firstMonomerValidSourcePoint, bond);
      monomer.setPotentialBond(secondMonomerValidTargetPoint, bond);
    }
    const connectFirstMonomerOperation = new MonomerHoverOperation(
      bond.firstMonomer,
      true,
    );
    const connectSecondMonomerOperation = new AttachmentPointHoverOperation(
      monomer,
      attachmentPointName,
    );
    command.addOperation(connectFirstMonomerOperation);
    command.addOperation(connectSecondMonomerOperation);
    return command;
  }

  public cancelIntentionToFinishBondCreation(
    monomer: BaseMonomer,
    polymerBond?: PolymerBond,
  ) {
    const command = new Command();
    monomer.turnOffHover();
    monomer.turnOffAttachmentPointsVisibility();
    monomer.setPotentialSecondAttachmentPoint(null);
    monomer.removePotentialBonds();
    const operation = new MonomerHoverOperation(monomer, true);
    command.addOperation(operation);

    // If the initial AP has been chosen automatically, it needs to be removed
    if (
      polymerBond &&
      !polymerBond.firstMonomer.chosenFirstAttachmentPointForBond
    ) {
      polymerBond.firstMonomer.removePotentialBonds();
      const operation = new MonomerHoverOperation(
        polymerBond.firstMonomer,
        true,
      );
      command.addOperation(operation);
    }

    return command;
  }

  public intendToSelectDrawingEntity(drawingEntity: DrawingEntity) {
    const command = new Command();

    drawingEntity.turnOnHover();

    const operation = new DrawingEntityHoverOperation(drawingEntity);

    command.addOperation(operation);

    return command;
  }

  public cancelIntentionToSelectDrawingEntity(drawingEntity: DrawingEntity) {
    const command = new Command();

    drawingEntity.turnOffHover();

    const operation = new DrawingEntityHoverOperation(drawingEntity);

    command.addOperation(operation);

    return command;
  }

  public showPolymerBondInformation(polymerBond: PolymerBond) {
    const command = new Command();

    polymerBond.turnOnHover();
    polymerBond.firstMonomer.turnOnHover();
    polymerBond.firstMonomer.turnOnAttachmentPointsVisibility();

    assert(polymerBond.secondMonomer);

    polymerBond.secondMonomer.turnOnHover();
    polymerBond.secondMonomer.turnOnAttachmentPointsVisibility();

    const operation = new PolymerBondShowInfoOperation(polymerBond);

    command.addOperation(operation);

    return command;
  }

  public hidePolymerBondInformation(polymerBond: PolymerBond) {
    const command = new Command();

    polymerBond.turnOffHover();
    polymerBond.firstMonomer.turnOffHover();
    polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();

    assert(polymerBond.secondMonomer);

    polymerBond.secondMonomer.turnOffHover();
    polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();

    const operation = new PolymerBondShowInfoOperation(polymerBond);

    command.addOperation(operation);

    return command;
  }

  public addRnaPreset({
    sugar,
    sugarPosition,
    phosphate,
    phosphatePosition,
    rnaBase,
    rnaBasePosition,
  }: RnaPresetAdditionParams) {
    const command = new Command();
    const monomersToAdd: Array<[MonomerItemType, Vec2]> = [];
    if (rnaBase && rnaBasePosition) {
      monomersToAdd.push([rnaBase, rnaBasePosition]);
    }
    monomersToAdd.push([sugar, sugarPosition]);
    if (phosphate && phosphatePosition) {
      monomersToAdd.push([phosphate, phosphatePosition]);
    }

    let previousMonomer: BaseMonomer | undefined;
    monomersToAdd.forEach(([monomerItem, monomerPosition]) => {
      const monomerAddOperation = new MonomerAddOperation(
        this.addMonomerChangeModel.bind(this, monomerItem, monomerPosition),
        this.deleteMonomerChangeModel.bind(this),
      );
      const monomer = monomerAddOperation.monomer;
      command.addOperation(monomerAddOperation);
      if (previousMonomer) {
        // requirements are: Base(R1)-(R3)Sugar(R2)-(R1)Phosphate
        const attPointStart = previousMonomer.getValidSourcePoint(monomer);
        const attPointEnd = monomer.getValidSourcePoint(previousMonomer);

        assert(attPointStart);
        assert(attPointEnd);

        const operation = new PolymerBondFinishCreationOperation(
          this.finishPolymerBondCreationModelChange.bind(
            this,
            previousMonomer,
            monomer,
            attPointStart,
            attPointEnd,
          ),
          this.deletePolymerBondChangeModel.bind(this),
        );
        command.addOperation(operation);
      }
      previousMonomer = monomer;
    });

    return command;
  }

  private findChainByMonomer(
    monomer: BaseMonomer,
    monomerChain: BaseMonomer[] = [],
    monomersInChainSet: Set<number> = new Set(),
  ) {
    monomerChain.push(monomer);
    monomersInChainSet.add(monomer.id);
    for (const attachmentPointName in monomer.attachmentPointsToBonds) {
      const polymerBond = monomer.attachmentPointsToBonds[attachmentPointName];
      if (polymerBond) {
        const nextMonomer =
          monomer === polymerBond.firstMonomer
            ? polymerBond.secondMonomer
            : polymerBond.firstMonomer;
        if (!monomersInChainSet.has(nextMonomer.id)) {
          this.findChainByMonomer(
            nextMonomer,
            monomerChain,
            monomersInChainSet,
          );
        }
      }
    }
    return monomerChain;
  }

  private rearrangeChainModelChange(monomer: BaseMonomer, newPosition: Vec2) {
    monomer.moveAbsolute(newPosition);

    return monomer;
  }

  private rearrangeChain(
    monomer: BaseMonomer,
    initialPosition: Vec2,
    canvasWidth: number,
    rearrangedMonomersSet: Set<number> = new Set(),
    isNextChain = false,
  ) {
    const command = new Command();
    const monomerWidth = monomer.renderer?.monomerSize.width ?? 0;
    const monomerHeight = monomer.renderer?.monomerSize.height ?? 0;
    const heightMonomerWithBond =
      monomerHeight + VERTICAL_DISTANCE_FROM_MONOMER;
    const oldMonomerPosition = monomer.position;
    const newPosition = isNextChain
      ? new Vec2(
          MONOMER_START_X_POSITION,
          initialPosition.y + heightMonomerWithBond,
        )
      : initialPosition;

    const operation = new MonomerMoveOperation(
      this.rearrangeChainModelChange.bind(
        this,
        monomer,
        Coordinates.canvasToModel(newPosition),
      ),
      this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition),
    );
    command.addOperation(operation);
    let lastPosition = newPosition;

    rearrangedMonomersSet.add(monomer.id);
    for (const attachmentPointName in monomer.attachmentPointsToBonds) {
      const polymerBond = monomer.attachmentPointsToBonds[attachmentPointName];
      if (!polymerBond) {
        continue;
      }
      const nextMonomer =
        polymerBond.secondMonomer === monomer
          ? polymerBond.firstMonomer
          : polymerBond.secondMonomer;
      if (rearrangedMonomersSet.has(nextMonomer.id)) {
        continue;
      }
      if (
        (attachmentPointName === 'R2' &&
          nextMonomer.getAttachmentPointByBond(polymerBond) === 'R1') ||
        (attachmentPointName === 'R1' &&
          nextMonomer.getAttachmentPointByBond(polymerBond) === 'R2')
      ) {
        const isMonomerFitCanvas =
          newPosition.x +
            monomerWidth +
            DISTANCE_BETWEEN_MONOMERS +
            HORIZONTAL_DISTANCE_FROM_MONOMER +
            DISTANCE_FROM_RIGHT <
          canvasWidth;
        let rearrangeResult;
        if (isMonomerFitCanvas) {
          rearrangeResult = this.rearrangeChain(
            nextMonomer,
            new Vec2({
              x:
                newPosition.x + monomerWidth + HORIZONTAL_DISTANCE_FROM_MONOMER,
              y: newPosition.y,
            }),
            canvasWidth,
            rearrangedMonomersSet,
          );
        } else {
          rearrangeResult = this.rearrangeChain(
            nextMonomer,
            new Vec2({
              x: MONOMER_START_X_POSITION,
              y: newPosition.y + heightMonomerWithBond,
            }),
            canvasWidth,
            rearrangedMonomersSet,
          );
        }
        lastPosition = rearrangeResult.lastPosition;
        command.merge(rearrangeResult.command);
      } else {
        const diff = Vec2.diff(oldMonomerPosition, monomer.position);
        const pos = Vec2.diff(nextMonomer.position, diff);
        const rearrangeResult = this.rearrangeChain(
          nextMonomer,
          Coordinates.modelToCanvas(pos),
          canvasWidth,
          rearrangedMonomersSet,
        );
        command.merge(rearrangeResult.command);
      }
    }

    return { command, lastPosition };
  }

  public reArrangeChains(canvasWidth: number, isSnakeMode: boolean) {
    const command = new Command();
    if (isSnakeMode) {
      command.merge(this.reArrangeMonomers(canvasWidth));
    }
    command.merge(this.redrawBonds());

    return command;
  }

  private redrawBondsModelChange(polymerBond: PolymerBond) {
    polymerBond.moveToLinkedMonomers();

    return polymerBond;
  }

  public redrawBonds() {
    const command = new Command();

    this.polymerBonds.forEach((polymerBond) => {
      command.merge(
        this.createDrawingEntityRedrawCommand(
          this.redrawBondsModelChange.bind(this, polymerBond),
          this.redrawBondsModelChange.bind(this, polymerBond),
        ),
      );
    });
    return command;
  }

  public reArrangeMonomers(canvasWidth: number) {
    const monomersList = Array.from(this.monomers.values()).filter(
      (monomer) => monomer instanceof Peptide || monomer instanceof Chem,
    );

    const firstMonomersInChains = monomersList.filter((monomer) => {
      const polymerBond = monomer.getBondByAttachmentPoint('R2');
      const nextMonomer =
        polymerBond?.firstMonomer === monomer
          ? polymerBond.secondMonomer
          : polymerBond?.firstMonomer;
      return (
        !monomer.attachmentPointsToBonds.R1 &&
        monomer.attachmentPointsToBonds.R2 &&
        nextMonomer?.getAttachmentPointByBond(
          monomer.attachmentPointsToBonds.R2,
        ) === 'R1'
      );
    });

    firstMonomersInChains.sort((monomer1, monomer2) => {
      if (
        monomer2.position.x + monomer2.position.y <
        monomer1.position.x + monomer1.position.y
      ) {
        return -1;
      } else {
        return 1;
      }
    });

    const filteredFirstMonomersInChains: BaseMonomer[] = [];

    firstMonomersInChains.forEach((monomer, monomerIndex) => {
      const currentMonomerChain: BaseMonomer[] =
        this.findChainByMonomer(monomer);
      let isFirstMonomerInChain = true;
      firstMonomersInChains.forEach(
        (potentialFirstMonomer, potentialFirstMonomerIndex) => {
          if (
            potentialFirstMonomerIndex > monomerIndex &&
            currentMonomerChain.includes(potentialFirstMonomer)
          ) {
            isFirstMonomerInChain = false;
          }
        },
      );
      if (isFirstMonomerInChain) {
        filteredFirstMonomersInChains.push(monomer);
      }
    });
    const command = new Command();
    let lastPosition = new Vec2({
      x: MONOMER_START_X_POSITION,
      y: MONOMER_START_Y_POSITION,
    });

    filteredFirstMonomersInChains.reverse().forEach((monomer, monomerIndex) => {
      const rearrangeResult = this.rearrangeChain(
        monomer,
        lastPosition,
        canvasWidth,
        undefined,
        monomerIndex !== 0,
      );
      command.merge(rearrangeResult.command);
      lastPosition = rearrangeResult.lastPosition;
    });

    return command;
  }

  public setMicromoleculesHiddenEntities(struct: Struct) {
    struct.mergeInto(this.micromoleculesHiddenEntities);
    this.micromoleculesHiddenEntities.atoms = new Pool();
    this.micromoleculesHiddenEntities.bonds = new Pool();
    this.micromoleculesHiddenEntities.halfBonds = new Pool();
    this.micromoleculesHiddenEntities.sgroups = new Pool();
    this.micromoleculesHiddenEntities.functionalGroups = new Pool();
    this.micromoleculesHiddenEntities.sGroupForest = new SGroupForest();
    this.micromoleculesHiddenEntities.frags = new Pool();
  }

  public clearMicromoleculesHiddenEntities() {
    this.micromoleculesHiddenEntities = new Struct();
  }

  public mergeInto(targetDrawingEntitiesManager: DrawingEntitiesManager) {
    this.monomers.forEach((monomer) => {
      targetDrawingEntitiesManager.monomers.set(monomer.id, monomer);
    });
    this.polymerBonds.forEach((polymerBond) => {
      targetDrawingEntitiesManager.polymerBonds.set(
        polymerBond.id,
        polymerBond,
      );
    });
    this.micromoleculesHiddenEntities.mergeInto(
      targetDrawingEntitiesManager.micromoleculesHiddenEntities,
    );
  }

  public centerMacroStructure() {
    const centerPointOfModel = Coordinates.canvasToModel(
      getCurrentCenterPointOfCanvas(),
    );
    const structCenter = this.getMacroStructureCenter();
    const offset = Vec2.diff(centerPointOfModel, structCenter);
    this.monomers.forEach((monomer: BaseMonomer) => {
      monomer.moveAbsolute(new Vec2(monomer.position).add(offset));
    });
    this.polymerBonds.forEach((bond: PolymerBond) => {
      const { x: startX, y: startY } = new Vec2(bond.position).add(offset);
      bond.moveBondStartAbsolute(startX, startY);
      const { x: endX, y: endY } = new Vec2(bond.endPosition).add(offset);
      bond.moveBondEndAbsolute(endX, endY);
    });
  }

  public getMacroStructureCenter() {
    let xmin = 1e50;
    let ymin = xmin;
    let xmax = -xmin;
    let ymax = -ymin;

    this.monomers.forEach((monomer: BaseMonomer) => {
      xmin = Math.min(xmin, monomer.position.x);
      ymin = Math.min(ymin, monomer.position.y);
      xmax = Math.max(xmax, monomer.position.x);
      ymax = Math.max(ymax, monomer.position.y);
    });
    this.polymerBonds.forEach((bond: PolymerBond) => {
      xmin = Math.min(xmin, bond.position.x);
      ymin = Math.min(ymin, bond.position.y);
      xmax = Math.max(xmax, bond.position.x);
      ymax = Math.max(ymax, bond.position.y);
    });
    return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2);
  }
}
