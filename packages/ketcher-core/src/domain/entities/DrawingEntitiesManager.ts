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

const HORIZONTAL_DISTANCE_FROM_MONOMER = 40;
const VERTICAL_DISTANCE_FROM_MONOMER = 60;
const DISTANCE_FROM_RIGHT = 70;
const DISTANCE_BETWEEN_MONOMERS = 30;

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

  public addMonomer(monomerItem: MonomerItemType, position: Vec2, id?: number) {
    const [Monomer] = monomerFactory(monomerItem);
    const monomer = new Monomer(monomerItem, position);
    monomer.moveAbsolute(position);
    this.monomers.set(id || monomer.id, monomer);

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
    assert(secondMonomer.renderer);
    polymerBond.secondMonomer.setBond(
      secondMonomerAttachmentPoint,
      polymerBond,
    );
    polymerBond.firstMonomer.removePotentialBonds();
    polymerBond.secondMonomer.removePotentialBonds();

    polymerBond.moveBondEndAbsolute(
      secondMonomer.renderer.center.x,
      secondMonomer.renderer.center.y,
    );

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
    if (monomer.availableAttachmentPointForBondEnd) {
      monomer.setPotentialBond(
        monomer.availableAttachmentPointForBondEnd,
        bond,
      );
    }

    const operation = new MonomerHoverOperation(monomer, true);

    command.addOperation(operation);

    return command;
  }

  public cancelIntentionToFinishBondCreation(monomer: BaseMonomer) {
    const command = new Command();

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

  private rearrangeChain(
    initCoords: Vec2,
    chain: BaseMonomer[],
    canvasWidth: number,
  ) {
    const command = new Command();
    const editorSettings = provideEditorSettings();
    const monomerWidth = chain[0].renderer?.bodyWidth ?? 0;
    const monomerHeight = chain[0].renderer?.bodyHeight ?? 0;
    const heightMonomerWithBond =
      monomerHeight + VERTICAL_DISTANCE_FROM_MONOMER;
    chain[0].moveAbsolute(Scale.scaled2obj(initCoords, editorSettings));
    const operation = new MonomerMoveOperation(chain[0]);
    command.addOperation(operation);

    for (let i = 1; i < chain.length; i++) {
      const prevPosition = Scale.obj2scaled(
        chain[i - 1].position,
        editorSettings,
      );
      const isMonomerFitCanvas =
        prevPosition.x +
          DISTANCE_BETWEEN_MONOMERS +
          initCoords.x +
          HORIZONTAL_DISTANCE_FROM_MONOMER +
          DISTANCE_FROM_RIGHT >
        canvasWidth;

      if (isMonomerFitCanvas) {
        chain[i].moveAbsolute(
          Scale.scaled2obj(
            new Vec2({
              x: initCoords.x,
              y: prevPosition.y + heightMonomerWithBond,
              z: initCoords.z,
            }),
            editorSettings,
          ),
        );
      } else {
        chain[i].moveAbsolute(
          Scale.scaled2obj(
            new Vec2({
              x:
                prevPosition.x +
                monomerWidth +
                HORIZONTAL_DISTANCE_FROM_MONOMER,
              y: prevPosition.y,
              z: initCoords.z,
            }),
            editorSettings,
          ),
        );
      }
      const operation = new MonomerMoveOperation(chain[i]);
      command.addOperation(operation);
    }
    const lastCoord = Scale.obj2scaled(
      chain[chain.length - 1].position,
      editorSettings,
    );
    return { command, lastCoord };
  }

  private findChainByMonomer(monomer: BaseMonomer) {
    let firstMonomer = monomer;
    while (this.getPrevMonomer(firstMonomer)) {
      firstMonomer = this.getPrevMonomer(firstMonomer) ?? firstMonomer;
    }

    const monomerChain = [] as BaseMonomer[];
    let monomerInTheChain = firstMonomer;
    monomerChain.push(monomerInTheChain);
    while (this.getNextMonomer(monomerInTheChain)) {
      monomerInTheChain =
        this.getNextMonomer(monomerInTheChain) ?? firstMonomer;
      monomerChain.push(monomerInTheChain);
    }
    return monomerChain;
  }

  private findTopLeftMonomer(monomersList: BaseMonomer[]) {
    let topLeftMonomer = monomersList[0];

    let topLeftMonomerCoords =
      topLeftMonomer.position.x + topLeftMonomer.position.y;

    for (const monomer of monomersList) {
      const coords = monomer.position.x + monomer.position.y;
      if (coords < topLeftMonomerCoords) {
        topLeftMonomer = monomer;
        topLeftMonomerCoords = coords;
      }
    }
    return topLeftMonomer;
  }

  private getPrevMonomer(monomer: BaseMonomer) {
    return monomer.attachmentPointsToBonds.R1?.firstMonomer;
  }

  private getNextMonomer(monomer: BaseMonomer) {
    return monomer.attachmentPointsToBonds.R2?.secondMonomer;
  }

  public reArrangeChain(canvasWidth: number, isSnakeMode: boolean) {
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
    const monomersList = Array.from(this.monomers.values());

    const topLeftMonomer = this.findTopLeftMonomer(monomersList);

    let unusedMonomerList = [...monomersList];
    const chainsList = [] as BaseMonomer[][];
    const firstChain = this.findChainByMonomer(topLeftMonomer);
    unusedMonomerList = unusedMonomerList.filter(
      (monomer) => !firstChain.includes(monomer),
    );
    chainsList.push(firstChain);

    while (unusedMonomerList.length) {
      const chain = this.findChainByMonomer(unusedMonomerList[0]);
      unusedMonomerList = unusedMonomerList.filter(
        (monomer) => !chain.includes(monomer),
      );
      chainsList.push(chain);
    }

    const monomerHeight = monomersList[0].renderer?.bodyHeight ?? 0;
    let initCoords = new Vec2({
      x: 40,
      y: 40,
      z: 0,
    });
    const command = new Command();
    chainsList.forEach((chain) => {
      const { lastCoord, command: newCommand } = this.rearrangeChain(
        initCoords,
        chain,
        canvasWidth,
      );
      initCoords = new Vec2({
        x: initCoords.x,
        y: lastCoord.y + monomerHeight + VERTICAL_DISTANCE_FROM_MONOMER,
        z: 0,
      });
      command.merge(newCommand);
    });

    return command;
  }
}
