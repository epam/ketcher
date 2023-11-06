import { MonomerItemType } from 'domain/types';
import { Vec2 } from 'domain/entities/vec2';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Sugar } from 'domain/entities/Sugar';
import { Phosphate } from 'domain/entities/Phosphate';
import {
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
import { provideEditorSettings } from 'application/editor/editorSettings';
import { Scale } from 'domain/helpers';
import { Peptide } from 'domain/entities/Peptide';
import { Chem } from 'domain/entities/Chem';
import { Struct } from 'domain/entities/struct';
import { Pool } from 'domain/entities/pool';
import { SGroupForest } from 'domain/entities/sgroupForest';

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
      const command = this.deleteDrawingEntity(drawingEntity);
      mergedCommand.merge(command);
    });
    return mergedCommand;
  }

  public addMonomer(monomerItem: MonomerItemType, position: Vec2) {
    const [Monomer] = monomerFactory(monomerItem);
    const monomer = new Monomer(monomerItem, position);
    monomer.moveAbsolute(position);
    this.monomers.set(monomer.id, monomer);

    const command = new Command();
    const operation = new MonomerAddOperation(monomer);

    command.addOperation(operation);

    return command;
  }

  public deleteDrawingEntity(drawingEntity: DrawingEntity) {
    if (drawingEntity instanceof BaseMonomer) {
      return this.deleteMonomer(drawingEntity);
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

  public moveSelectedDrawingEntities(offset: Vec2) {
    const command = new Command();

    this.monomers.forEach((drawingEntity) => {
      if (drawingEntity.selected) {
        drawingEntity.moveRelative(offset);
        command.merge(this.createDrawingEntityMovingCommand(drawingEntity));
      }
    });

    this.polymerBonds.forEach((drawingEntity) => {
      if (
        drawingEntity.selected ||
        drawingEntity.firstMonomer.selected ||
        drawingEntity.secondMonomer?.selected
      ) {
        drawingEntity.moveToLinkedMonomers();
        command.merge(this.createDrawingEntityMovingCommand(drawingEntity));
      }
    });
    return command;
  }

  public createDrawingEntityMovingCommand(drawingEntity: DrawingEntity) {
    const command = new Command();

    const movingCommand = new DrawingEntityMoveOperation(drawingEntity);
    command.addOperation(movingCommand);

    return command;
  }

  public createDrawingEntityRedrawCommand(drawingEntity: DrawingEntity) {
    const command = new Command();

    const redrawCommand = new DrawingEntityRedrawOperation(drawingEntity);
    command.addOperation(redrawCommand);

    return command;
  }

  public deleteMonomer(monomer: BaseMonomer) {
    this.monomers.delete(monomer.id);
    const command = new Command();
    const operation = new MonomerDeleteOperation(monomer);
    command.addOperation(operation);

    if (monomer.hasBonds) {
      monomer.forEachBond((bond) => {
        command.merge(this.deletePolymerBond(bond));
      });
    }

    return command;
  }

  public moveMonomer(monomer: BaseMonomer, position: Vec2) {
    const command = new Command();
    monomer.moveAbsolute(position);

    const operation = new MonomerMoveOperation(monomer);

    command.addOperation(operation);

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

  public addPolymerBond(firstMonomer, startPosition, endPosition) {
    const polymerBond = new PolymerBond(firstMonomer);
    this.polymerBonds.set(polymerBond.id, polymerBond);
    firstMonomer.setPotentialBond(
      firstMonomer.startBondAttachmentPoint,
      polymerBond,
    );
    polymerBond.moveBondStartAbsolute(startPosition.x, startPosition.y);
    polymerBond.moveBondEndAbsolute(endPosition.x, endPosition.y);

    const command = new Command();
    const operation = new PolymerBondAddOperation(polymerBond);

    command.addOperation(operation);

    return { command, polymerBond };
  }

  public deletePolymerBond(polymerBond: PolymerBond) {
    this.polymerBonds.delete(polymerBond.id);
    const command = new Command();
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
    const operation = new PolymerBondDeleteOperation(polymerBond);
    command.addOperation(operation);

    return command;
  }

  public cancelPolymerBondCreation(polymerBond: PolymerBond) {
    this.polymerBonds.delete(polymerBond.id);
    const command = new Command();
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.firstMonomer.turnOffHover();
    polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();
    const operation = new PolymerBondCancelCreationOperation(polymerBond);
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

  public finishPolymerBondCreation(
    polymerBond,
    secondMonomer,
    firstMonomerAttachmentPoint,
    secondMonomerAttachmentPoint,
  ) {
    const command = new Command();

    polymerBond.setSecondMonomer(secondMonomer);
    polymerBond.firstMonomer.setBond(firstMonomerAttachmentPoint, polymerBond);
    assert(polymerBond.secondMonomer);
    polymerBond.secondMonomer.setBond(
      secondMonomerAttachmentPoint,
      polymerBond,
    );
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.secondMonomer.removePotentialBonds();

    polymerBond.moveToLinkedMonomers();

    polymerBond.firstMonomer.turnOffSelection();
    polymerBond.firstMonomer.turnOffHover();
    polymerBond.firstMonomer.turnOffAttachmentPointsVisibility();

    polymerBond.secondMonomer.turnOffSelection();
    polymerBond.secondMonomer.turnOffHover();
    polymerBond.secondMonomer.turnOffAttachmentPointsVisibility();

    polymerBond.turnOffHover();

    const operation = new PolymerBondFinishCreationOperation(polymerBond);

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

  public intendToFinishBondCreation(monomer: BaseMonomer, bond: PolymerBond) {
    const command = new Command();
    monomer.turnOnHover();
    monomer.turnOnAttachmentPointsVisibility();
    const availableAttachmentPointForBondEnd =
      monomer.availableAttachmentPointForBondEnd;
    if (availableAttachmentPointForBondEnd) {
      monomer.setPotentialBond(availableAttachmentPointForBondEnd, bond);
    }
    bond.firstMonomer.removePotentialBonds();
    monomer.removePotentialBonds();
    const firstValidAttPoint = monomer.getValidSourcePoint(bond.firstMonomer);
    const secondValidAttPonint = monomer.getValidTargetPoint(bond.firstMonomer);
    bond.firstMonomer.setPotentialBond(secondValidAttPonint, bond);
    monomer.setPotentialBond(firstValidAttPoint, bond);
    const connectFirstMonomerOperation = new MonomerHoverOperation(
      bond.firstMonomer,
      true,
    );
    const connecSecondMonomerOperation = new MonomerHoverOperation(
      monomer,
      true,
    );
    command.addOperation(connectFirstMonomerOperation);
    command.addOperation(connecSecondMonomerOperation);
    return command;
  }

  public cancelIntentionToFinishBondCreation(
    monomer: BaseMonomer,
    polymerBond?: PolymerBond,
  ) {
    const command = new Command();
    if (
      polymerBond &&
      polymerBond.firstMonomer.getPotentialAttachmentPointByBond(
        polymerBond,
      ) === 'R1' &&
      polymerBond.firstMonomer.hasAttachmentPoint('R2') &&
      !polymerBond.firstMonomer.isAttachmentPointUsed('R2')
    ) {
      polymerBond.firstMonomer.removePotentialBonds();
      polymerBond.firstMonomer.setPotentialBond('R2', polymerBond);
      const operation = new MonomerHoverOperation(
        polymerBond.firstMonomer,
        true,
      );
      command.addOperation(operation);
    }

    monomer.turnOffHover();
    monomer.turnOffAttachmentPointsVisibility();
    monomer.removePotentialBonds();

    const operation = new MonomerHoverOperation(monomer, true);

    command.addOperation(operation);

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
      const [Monomer] = monomerFactory(monomerItem);
      const monomer = new Monomer(monomerItem, monomerPosition);
      this.monomers.set(monomer.id, monomer);
      let monomerAddOperation;
      if (previousMonomer) {
        const polymerBond = new PolymerBond(previousMonomer);
        this.polymerBonds.set(polymerBond.id, polymerBond);
        monomerAddOperation = new MonomerAddOperation(monomer, () => {
          polymerBond.moveToLinkedMonomers();
        });
        command.addOperation(monomerAddOperation);
        polymerBond.setSecondMonomer(monomer);

        // requirements are: Base(R1)-(R3)Sugar(R1)-(R2)Phosphate
        const attPointStart = previousMonomer.R1AttachmentPoint;
        let attPointEnd;

        if (monomer instanceof Sugar) {
          attPointEnd = monomer.isAttachmentPointUsed('R3') ? undefined : 'R3';
        } else if (monomer instanceof Phosphate) {
          attPointEnd = monomer.R2AttachmentPoint;
        }

        assert(attPointStart);
        assert(attPointEnd);

        previousMonomer.setBond(attPointStart, polymerBond);
        monomer.setBond(attPointEnd, polymerBond);
        const operation = new PolymerBondAddOperation(polymerBond);
        command.addOperation(operation);
      } else {
        monomerAddOperation = new MonomerAddOperation(monomer);
        command.addOperation(monomerAddOperation);
      }

      previousMonomer = monomer;
    });

    return command;
  }

  private findChainByMonomer(
    monomer: BaseMonomer,
    monomerChain: BaseMonomer[] = [],
    previousMonomer?: BaseMonomer,
  ) {
    monomerChain.push(monomer);
    for (const attachmentPointName in monomer.attachmentPointsToBonds) {
      const polymerBond = monomer.attachmentPointsToBonds[attachmentPointName];
      if (polymerBond) {
        const nextMonomer =
          monomer === polymerBond.firstMonomer
            ? polymerBond.secondMonomer
            : polymerBond.firstMonomer;
        if (previousMonomer !== nextMonomer) {
          this.findChainByMonomer(nextMonomer, monomerChain, monomer);
        }
      }
    }
    return monomerChain;
  }

  private rearrangeChain(
    monomer: BaseMonomer,
    initialPosition: Vec2,
    canvasWidth: number,
    lastMonomer?: BaseMonomer,
    isNextChain = false,
  ) {
    const command = new Command();
    const editorSettings = provideEditorSettings();
    const monomerWidth = monomer.renderer?.bodyWidth ?? 0;
    const monomerHeight = monomer.renderer?.bodyHeight ?? 0;
    const heightMonomerWithBond =
      monomerHeight + VERTICAL_DISTANCE_FROM_MONOMER;
    const oldMonomerPosition = monomer.position;
    const newPosition = isNextChain
      ? new Vec2(
          MONOMER_START_X_POSITION,
          initialPosition.y + heightMonomerWithBond,
        )
      : initialPosition;
    monomer.moveAbsolute(Scale.canvasToModel(newPosition, editorSettings));
    const operation = new MonomerMoveOperation(monomer);
    command.addOperation(operation);
    let lastPosition = newPosition;

    for (const attachmentPointName in monomer.attachmentPointsToBonds) {
      const polymerBond = monomer.attachmentPointsToBonds[attachmentPointName];
      if (!polymerBond) {
        continue;
      }
      const nextMonomer =
        polymerBond.secondMonomer === monomer
          ? polymerBond.firstMonomer
          : polymerBond.secondMonomer;
      if (nextMonomer === lastMonomer) {
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
            monomer,
          );
        } else {
          rearrangeResult = this.rearrangeChain(
            nextMonomer,
            new Vec2({
              x: MONOMER_START_X_POSITION,
              y: newPosition.y + heightMonomerWithBond,
            }),
            canvasWidth,
            monomer,
          );
        }
        lastPosition = rearrangeResult.lastPosition;
        command.merge(rearrangeResult.command);
      } else {
        const diff = Vec2.diff(oldMonomerPosition, monomer.position);
        const pos = Vec2.diff(nextMonomer.position, diff);
        const rearrangeResult = this.rearrangeChain(
          nextMonomer,
          Scale.modelToCanvas(pos, editorSettings),
          canvasWidth,
          monomer,
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

  public redrawBonds() {
    const command = new Command();

    this.polymerBonds.forEach((drawingEntity) => {
      drawingEntity.moveToLinkedMonomers();
      command.merge(this.createDrawingEntityRedrawCommand(drawingEntity));
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
}
