import {
  AttachmentPointName,
  MonomerItemType,
  AmbiguousMonomerType,
  MonomerOrAmbiguousType,
} from 'domain/types';
import { Vec2 } from 'domain/entities/vec2';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import {
  BaseMonomer,
  LinkerSequenceNode,
  Phosphate,
  Pool,
  RNABase,
  SGroupForest,
  Struct,
  Sugar,
} from 'domain/entities';
import {
  AttachmentPointHoverOperation,
  MonomerAddOperation,
  MonomerDeleteOperation,
  MonomerHoverOperation,
  MonomerItemModifyOperation,
  MonomerMoveOperation,
} from 'application/editor/operations/monomer';
import {
  DrawingEntityHoverOperation,
  DrawingEntityMoveOperation,
  DrawingEntityRedrawOperation,
  DrawingEntitySelectOperation,
} from 'application/editor/operations/drawingEntity';
import {
  PolymerBondAddOperation,
  PolymerBondCancelCreationOperation,
  PolymerBondDeleteOperation,
  PolymerBondFinishCreationOperation,
  PolymerBondMoveOperation,
  PolymerBondShowInfoOperation,
  ReconnectPolymerBondOperation,
} from 'application/editor/operations/polymerBond';
import {
  MONOMER_CONST,
  monomerFactory,
} from 'application/editor/operations/monomer/monomerFactory';
import { Coordinates, CoreEditor } from 'application/editor/internal';
import {
  getNextMonomerInChain,
  getPhosphateFromSugar,
  isAmbiguousMonomerLibraryItem,
  isRnaBaseOrAmbiguousRnaBase,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import { RNA_MONOMER_DISTANCE } from 'application/editor/tools/RnaPreset';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { Nucleoside } from './Nucleoside';
import { Nucleotide } from './Nucleotide';
import { SequenceMode, SnakeMode } from 'application/editor';
import { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
import { RecalculateCanvasMatrixOperation } from 'application/editor/operations/modes/snake';
import { Matrix } from 'domain/entities/canvas-matrix/Matrix';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { Atom } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { AtomAddOperation } from 'application/editor/operations/coreAtom/atom';
import { BondAddOperation } from 'application/editor/operations/coreBond/bond';

const VERTICAL_DISTANCE_FROM_MONOMER = 30;
const DISTANCE_FROM_RIGHT = 55;
export const SNAKE_LAYOUT_CELL_WIDTH = 60;
export const MONOMER_START_X_POSITION = 20 + SNAKE_LAYOUT_CELL_WIDTH / 2;
export const MONOMER_START_Y_POSITION = 20 + SNAKE_LAYOUT_CELL_WIDTH / 2;

type RnaPresetAdditionParams = {
  sugar: MonomerItemType;
  sugarPosition: Vec2;
  rnaBase: MonomerItemType | undefined;
  rnaBasePosition: Vec2 | undefined;
  phosphate: MonomerItemType | undefined;
  phosphatePosition: Vec2 | undefined;
  existingNode?: Nucleotide | Nucleoside | LinkerSequenceNode;
};

type NucleotideOrNucleoside = {
  sugar: Sugar;
  phosphate?: Phosphate;
  rnaBase: RNABase | AmbiguousMonomer;
  baseMonomer: Sugar | Phosphate;
};

export class DrawingEntitiesManager {
  public monomers: Map<number, BaseMonomer> = new Map();
  public polymerBonds: Map<number, PolymerBond> = new Map();
  public atoms: Map<number, Atom> = new Map();
  public bonds: Map<number, Bond> = new Map();

  public micromoleculesHiddenEntities: Struct = new Struct();
  public canvasMatrix?: CanvasMatrix;
  public snakeLayoutMatrix?: Matrix<Cell>;
  public get bottomRightMonomerPosition(): Vec2 {
    let position: Vec2 | null = null;

    this.monomers.forEach((monomer) => {
      if (
        !position ||
        monomer.position.x + monomer.position.y > position.x + position.y
      ) {
        position = monomer.position;
      }
    });

    return position || new Vec2(0, 0, 0);
  }

  get selectedEntitiesArr() {
    const selectedEntities: DrawingEntity[] = [];
    this.allEntities.forEach(([, drawingEntity]) => {
      if (drawingEntity.selected) {
        selectedEntities.push(drawingEntity);
      }
    });
    return selectedEntities;
  }

  get selectedEntities() {
    return this.allEntities.filter(
      ([, drawingEntity]) => drawingEntity.selected,
    );
  }

  get allEntities() {
    return [
      ...(this.monomers as Map<number, DrawingEntity>),
      ...(this.polymerBonds as Map<number, DrawingEntity>),
      ...(this.bonds as Map<number, DrawingEntity>),
      ...(this.atoms as Map<number, DrawingEntity>),
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
    const monomer = this.createMonomer(monomerItem, position);
    monomer.moveAbsolute(position);
    this.monomers.set(monomer.id, monomer);
    return monomer;
  }

  public createMonomer(monomerItem: MonomerOrAmbiguousType, position: Vec2) {
    if (isAmbiguousMonomerLibraryItem(monomerItem)) {
      return new AmbiguousMonomer(monomerItem, position);
    } else {
      const [Monomer] = monomerFactory(monomerItem);

      return new Monomer(monomerItem, position);
    }
  }

  public updateMonomerItem(
    monomer: BaseMonomer,
    monomerItemNew: MonomerItemType,
  ) {
    const initialMonomer = this.monomers.get(monomer.id);
    if (!initialMonomer) return monomer;
    initialMonomer.monomerItem = monomerItemNew;
    this.monomers.set(monomer.id, initialMonomer);
    return initialMonomer;
  }

  public addMonomer(
    monomerItem: MonomerItemType,
    position: Vec2,
    _monomer?: BaseMonomer,
  ) {
    const command = new Command();
    let addMonomerChangeModelCallback = this.addMonomerChangeModel.bind(
      this,
      monomerItem,
      position,
    );
    if (_monomer) {
      addMonomerChangeModelCallback = addMonomerChangeModelCallback.bind(
        this,
        _monomer,
      );
    }
    const operation = new MonomerAddOperation(
      addMonomerChangeModelCallback,
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

  public selectDrawingEntities(drawingEntities: DrawingEntity[]) {
    const command = this.unselectAllDrawingEntities();
    drawingEntities.forEach((drawingEntity: DrawingEntity) => {
      drawingEntity.turnOnSelection();
      const operation = new DrawingEntitySelectOperation(drawingEntity);
      command.addOperation(operation);
    });
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
        command.merge(this.unselectDrawingEntity(drawingEntity));
      }
    });

    return command;
  }

  public unselectDrawingEntity(drawingEntity: DrawingEntity) {
    const command = new Command();
    drawingEntity.turnOffSelection();
    command.addOperation(new DrawingEntitySelectOperation(drawingEntity));
    return command;
  }

  public selectAllDrawingEntities() {
    const command = new Command();

    this.allEntities.forEach(([, drawingEntity]) => {
      if (!drawingEntity.selected) {
        drawingEntity.turnOnSelection();
        const operation = new DrawingEntitySelectOperation(drawingEntity);
        command.addOperation(operation);
      }
    });

    return command;
  }

  public addDrawingEntitiesToSelection(drawingEntities: DrawingEntity[]) {
    const command = new Command();
    drawingEntities.forEach((drawingEntity: DrawingEntity) => {
      if (drawingEntity.selected) {
        drawingEntity.turnOffSelection();
      } else {
        drawingEntity.turnOnSelection();
      }
      command.addOperation(new DrawingEntitySelectOperation(drawingEntity));
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
      // if (drawingEntity instanceof BaseMonomer)
      // this.moveChemAtomsPoint(drawingEntity, offset);
    }

    return drawingEntity;
  }

  private moveChemAtomsPoint(drawingEntity: BaseMonomer, offset?: Vec2) {
    if (drawingEntity.monomerItem.props.isMicromoleculeFragment && offset) {
      drawingEntity.monomerItem.struct.atoms.forEach((atom) => {
        atom.pp.add_(offset);
      });

      drawingEntity.monomerItem.struct.sgroups.forEach((sgroup) => {
        sgroup.pp?.add_(offset);
      });
    }
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

        // We need to remove connected bond when doing a group selection even if it is not selected
        // and mark it as selected to avoid operations duplication
        bond.turnOnSelection();
        command.merge(this.deletePolymerBond(bond));
      });
    }

    return command;
  }

  public modifyMonomerItem(
    monomer: BaseMonomer,
    monomerItemNew: MonomerItemType,
  ) {
    const command = new Command();
    const operation = new MonomerItemModifyOperation(
      monomer,
      this.updateMonomerItem.bind(this, monomer, monomerItemNew),
      this.updateMonomerItem.bind(this, monomer, monomer.monomerItem),
    );
    command.addOperation(operation);

    return command;
  }

  public selectIfLocatedInRectangle(
    rectangleTopLeftPoint: Vec2,
    rectangleBottomRightPoint: Vec2,
    previousSelectedEntities: [number, DrawingEntity][],
    shiftKey = false,
  ) {
    const command = new Command();
    this.allEntities.forEach(([, drawingEntity]) => {
      const isPreviousSelected = previousSelectedEntities.find(
        ([, entity]) => entity === drawingEntity,
      );
      let isValueChanged;
      const editor = CoreEditor.provideEditorInstance();
      if (
        editor.mode instanceof SequenceMode &&
        drawingEntity instanceof PolymerBond
      ) {
        isValueChanged = this.checkBondSelectionForSequenceMode(
          drawingEntity,
          isValueChanged,
        );
      } else {
        isValueChanged = drawingEntity.selectIfLocatedInRectangle(
          rectangleTopLeftPoint,
          rectangleBottomRightPoint,
          !!isPreviousSelected,
          shiftKey,
        );
      }
      if (isValueChanged) {
        const selectionCommand =
          this.createDrawingEntitySelectionCommand(drawingEntity);

        command.merge(selectionCommand);
      }
    });
    return command;
  }

  private checkBondSelectionForSequenceMode(
    bond: PolymerBond,
    isValueChanged: boolean,
  ) {
    const prevSelectedValue = bond.selected;
    if (bond.firstMonomer.selected && bond.secondMonomer?.selected) {
      bond.turnOnSelection();
    } else {
      bond.turnOffSelection();
    }
    isValueChanged = prevSelectedValue !== bond.selected;
    return isValueChanged;
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
    if (this.polymerBonds.get(polymerBond.id) !== polymerBond) {
      return;
    }

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
        ) as AttachmentPointName,
        polymerBond.secondMonomer?.getAttachmentPointByBond(
          polymerBond,
        ) as AttachmentPointName,
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
    firstMonomerAttachmentPoint: AttachmentPointName,
    secondMonomerAttachmentPoint: AttachmentPointName,
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
    firstMonomerAttachmentPoint: AttachmentPointName,
    secondMonomerAttachmentPoint: AttachmentPointName,
  ) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

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

    if (editor.mode instanceof SnakeMode) {
      command.merge(this.recalculateCanvasMatrix());
    }

    return command;
  }

  public createPolymerBond(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: AttachmentPointName,
    secondMonomerAttachmentPoint: AttachmentPointName,
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

    if (monomer.isAttachmentPointUsed(attachmentPointName)) {
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

  public addRnaPresetFromNode = (
    node: Nucleotide | Nucleoside | LinkerSequenceNode,
  ) => {
    // TODO: Consider combining it with the method below to avoid code duplication
    const command = new Command();
    let previousMonomer: BaseMonomer | undefined;
    const sugarMonomer = node.monomers.find(
      (monomer) => monomer instanceof Sugar,
    ) as Sugar | AmbiguousMonomer;
    const phosphateMonomer = node.monomers.find(
      (monomer) => monomer instanceof Phosphate,
    ) as Phosphate | AmbiguousMonomer;
    const rnaBaseMonomer = node.monomers.find((monomer) =>
      isRnaBaseOrAmbiguousRnaBase(monomer),
    ) as RNABase | AmbiguousMonomer;
    const monomers = [rnaBaseMonomer, sugarMonomer, phosphateMonomer].filter(
      (monomer) => monomer !== undefined,
    ) as BaseMonomer[];

    monomers.forEach((monomer) => {
      const monomerAddOperation =
        monomer instanceof AmbiguousMonomer
          ? new MonomerAddOperation(
              this.addAmbiguousMonomerChangeModel.bind(
                this,
                monomer.variantMonomerItem,
                monomer.position,
                monomer,
              ),
              this.deleteMonomerChangeModel.bind(this),
            )
          : new MonomerAddOperation(
              this.addMonomerChangeModel.bind(
                this,
                monomer.monomerItem,
                monomer.position,
                monomer,
              ),
              this.deleteMonomerChangeModel.bind(this),
            );

      command.addOperation(monomerAddOperation);
      if (previousMonomer) {
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
  };

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
    const monomers: BaseMonomer[] = [];

    monomersToAdd.forEach(([monomerItem, monomerPosition]) => {
      const monomerAddOperation = new MonomerAddOperation(
        this.addMonomerChangeModel.bind(this, monomerItem, monomerPosition),
        this.deleteMonomerChangeModel.bind(this),
      );
      const monomer = monomerAddOperation.monomer;
      monomers.push(monomer);
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

    return { command, monomers };
  }

  public rearrangeChainModelChange(monomer: BaseMonomer, newPosition: Vec2) {
    if (monomer.monomerItem.props.isMicromoleculeFragment) {
      const offset = newPosition.sub(monomer.position);
      // this.moveChemAtomsPoint(monomer, offset);
    }

    monomer.moveAbsolute(newPosition);

    return monomer;
  }

  public getNucleotideSize(nucleotide: NucleotideOrNucleoside) {
    const width =
      (nucleotide.sugar.renderer?.monomerSize?.width || 0) +
      (nucleotide.phosphate?.renderer?.monomerSize?.width || 0) +
      (nucleotide.phosphate ? RNA_MONOMER_DISTANCE : 0);
    const height =
      (nucleotide.sugar.renderer?.monomerSize?.height || 0) +
      (nucleotide.rnaBase.renderer?.monomerSize?.height || 0) +
      RNA_MONOMER_DISTANCE;
    return { width, height };
  }

  private reArrangeChain(
    monomer: BaseMonomer,
    lastPosition: Vec2,
    canvasWidth: number,
    rearrangedMonomersSet: Set<number>,
    maxVerticalDistance: number,
    snakeLayoutMatrix: Matrix<Cell>,
    firstMonomer?: BaseMonomer,
  ) {
    const command = new Command();
    const heightMonomerWithBond =
      SNAKE_LAYOUT_CELL_WIDTH / 2 + VERTICAL_DISTANCE_FROM_MONOMER;
    const isNewRow = lastPosition.x === MONOMER_START_X_POSITION;
    maxVerticalDistance = isNewRow
      ? heightMonomerWithBond
      : Math.max(maxVerticalDistance, heightMonomerWithBond);
    monomer.isMonomerInRnaChainRow =
      maxVerticalDistance > heightMonomerWithBond;
    const oldMonomerPosition = monomer.position;
    const operation = new MonomerMoveOperation(
      this.rearrangeChainModelChange.bind(
        this,
        monomer,
        Coordinates.canvasToModel(lastPosition),
      ),
      this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition),
    );
    command.addOperation(operation);
    rearrangedMonomersSet.add(monomer.id);

    const matrixX = isNewRow
      ? snakeLayoutMatrix.height
      : snakeLayoutMatrix.height - 1;
    const matrixY = isNewRow
      ? 0
      : snakeLayoutMatrix.getRow(matrixX)?.length ?? 0;

    snakeLayoutMatrix.set(
      matrixX,
      matrixY,
      new Cell(null, [], matrixX, matrixY, monomer),
    );

    const nextPositionAndVerticalDistance =
      this.getNextMonomerPositionForSnakeLayout(
        monomer,
        lastPosition,
        canvasWidth,
        rearrangedMonomersSet,
        maxVerticalDistance,
      );

    return {
      lastPosition:
        nextPositionAndVerticalDistance?.lastPosition || lastPosition,
      maxVerticalDistance:
        nextPositionAndVerticalDistance?.maxVerticalDistance ||
        maxVerticalDistance,
      nextMonomer: getNextMonomerInChain(monomer, firstMonomer),
      command,
    };
  }

  private reArrangeRnaChain(
    nucleotide: NucleotideOrNucleoside,
    lastPosition: Vec2,
    canvasWidth: number,
    rearrangedMonomersSet: Set<number>,
    maxVerticalDistance: number,
    snakeLayoutMatrix: Matrix<Cell>,
    firstMonomer?: BaseMonomer,
  ) {
    const command = new Command();
    const nucleotideSize = this.getNucleotideSize(nucleotide);
    const { height } = nucleotideSize;
    const heightWithBond = height + VERTICAL_DISTANCE_FROM_MONOMER;
    const isNewRow = lastPosition.x === MONOMER_START_X_POSITION;
    maxVerticalDistance = Math.max(maxVerticalDistance, heightWithBond);
    nucleotide.sugar.isMonomerInRnaChainRow = true;
    nucleotide.rnaBase.isMonomerInRnaChainRow = true;
    const oldSugarPosition = nucleotide.sugar.position;
    const rnaBasePosition = new Vec2(
      lastPosition.x,
      lastPosition.y +
        (nucleotide.sugar.renderer?.monomerSize?.height ?? 0) / 2 +
        (nucleotide.rnaBase.renderer?.monomerSize?.height ?? 0) / 2 +
        RNA_MONOMER_DISTANCE,
    );
    this.addRnaOperations(
      command,
      oldSugarPosition,
      lastPosition,
      nucleotide.sugar,
    );
    this.addRnaOperations(
      command,
      nucleotide.rnaBase?.position,
      rnaBasePosition,
      nucleotide.rnaBase,
    );
    rearrangedMonomersSet.add(nucleotide.sugar.id);
    rearrangedMonomersSet.add(nucleotide.rnaBase?.id);

    const matrixX = isNewRow
      ? snakeLayoutMatrix.height
      : snakeLayoutMatrix.height - 1;
    const matrixY = isNewRow
      ? 0
      : snakeLayoutMatrix.getRow(matrixX)?.length ?? 0;

    snakeLayoutMatrix.set(
      matrixX,
      matrixY,
      new Cell(null, [], matrixX, matrixY, nucleotide.sugar),
    );

    if (nucleotide.phosphate) {
      nucleotide.phosphate.isMonomerInRnaChainRow = true;
      const phosphatePosition = new Vec2(
        lastPosition.x + SNAKE_LAYOUT_CELL_WIDTH,
        lastPosition.y,
      );
      this.addRnaOperations(
        command,
        nucleotide.phosphate?.position,
        phosphatePosition,
        nucleotide.phosphate,
      );
      rearrangedMonomersSet.add(nucleotide.phosphate?.id);
      snakeLayoutMatrix.set(
        matrixX,
        matrixY + 1,
        new Cell(null, [], matrixX, matrixY, nucleotide.sugar),
      );
    }
    const lastMonomerInNucleotide =
      nucleotide.baseMonomer === nucleotide.sugar && nucleotide.phosphate
        ? nucleotide.phosphate
        : nucleotide.sugar;

    const nextMonomerPositionAndVerticalDistance =
      this.getNextMonomerPositionForSnakeLayout(
        lastMonomerInNucleotide,
        lastPosition,
        canvasWidth,
        rearrangedMonomersSet,
        maxVerticalDistance,
        nucleotide.phosphate
          ? SNAKE_LAYOUT_CELL_WIDTH * 2
          : SNAKE_LAYOUT_CELL_WIDTH,
      );

    const nextMonomer = getNextMonomerInChain(
      lastMonomerInNucleotide,
      firstMonomer,
    );

    return {
      command,
      lastPosition:
        nextMonomerPositionAndVerticalDistance?.lastPosition || lastPosition,
      maxVerticalDistance:
        nextMonomerPositionAndVerticalDistance?.maxVerticalDistance ||
        maxVerticalDistance,
      nextMonomer,
    };
  }

  private getNextMonomerPositionForSnakeLayout(
    monomer: BaseMonomer,
    lastPosition: Vec2,
    canvasWidth: number,
    rearrangedMonomersSet: Set<number>,
    maxVerticalDistance: number,
    width?: number,
  ) {
    let nextPositionAndDistance;
    for (const attachmentPointName in monomer.attachmentPointsToBonds) {
      const polymerBond = monomer.attachmentPointsToBonds[attachmentPointName];
      const nextMonomer = polymerBond?.getAnotherMonomer(monomer);
      if (!polymerBond || rearrangedMonomersSet.has(nextMonomer.id)) {
        continue;
      }
      if (
        (attachmentPointName === 'R2' &&
          nextMonomer.getAttachmentPointByBond(polymerBond) === 'R1') ||
        (attachmentPointName === 'R1' &&
          nextMonomer.getAttachmentPointByBond(polymerBond) === 'R2')
      ) {
        nextPositionAndDistance = this.getNextPositionAndDistance(
          lastPosition,
          maxVerticalDistance,
          canvasWidth,
          width,
        );
      }
    }
    return nextPositionAndDistance;
  }

  private addRnaOperations(
    command: Command,
    oldMonomerPosition: Vec2 | undefined,
    newPosition: Vec2 | undefined,
    monomer?: BaseMonomer,
  ) {
    if (!monomer || !oldMonomerPosition || !newPosition) {
      return;
    }
    const operation = new MonomerMoveOperation(
      this.rearrangeChainModelChange.bind(
        this,
        monomer,
        Coordinates.canvasToModel(newPosition),
      ),
      this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition),
    );
    command.addOperation(operation);
  }

  private recalculateCanvasMatrixModelChange(
    snakeLayoutMatrix?: Matrix<Cell>,
    _chainsCollection?: ChainsCollection,
  ) {
    if (!snakeLayoutMatrix || snakeLayoutMatrix.height === 0) {
      return;
    }

    const chainsCollection =
      _chainsCollection ||
      ChainsCollection.fromMonomers(Array.from(this.monomers.values()));

    if (!_chainsCollection) {
      chainsCollection.rearrange();
    }

    this.canvasMatrix = new CanvasMatrix(chainsCollection, {
      initialMatrix: snakeLayoutMatrix,
    });

    return this.redrawBonds();
  }

  public recalculateCanvasMatrix(
    chainsCollection?: ChainsCollection,
    previousSnakeLayoutMatrix?: Matrix<Cell>,
  ) {
    const command = new Command();

    command.addOperation(
      new RecalculateCanvasMatrixOperation(
        this.recalculateCanvasMatrixModelChange.bind(
          this,
          this.snakeLayoutMatrix,
          chainsCollection,
        ),
        this.recalculateCanvasMatrixModelChange.bind(
          this,
          previousSnakeLayoutMatrix,
          chainsCollection,
        ),
      ),
    );

    return command;
  }

  public reArrangeChains(
    canvasWidth: number,
    isSnakeMode: boolean,
    needRedrawBonds = true,
  ) {
    const snakeLayoutMatrix = new Matrix<Cell>();
    const previousSnakeLayoutMatrix = this.snakeLayoutMatrix;
    const command = new Command();
    let chainsCollection;

    if (isSnakeMode) {
      const rearrangedMonomersSet: Set<number> = new Set();
      let lastPosition = new Vec2({
        x: MONOMER_START_X_POSITION,
        y: MONOMER_START_Y_POSITION,
      });
      let maxVerticalDistance = 0;
      chainsCollection = ChainsCollection.fromMonomers([
        ...this.monomers.values(),
      ]);
      chainsCollection.rearrange();

      chainsCollection.chains.forEach((chain) => {
        chain.forEachNode(({ node }) => {
          if (rearrangedMonomersSet.has(node.monomer.id)) {
            return;
          }

          if (node instanceof Nucleoside || node instanceof Nucleotide) {
            const rearrangeResult = this.reArrangeRnaChain(
              {
                sugar: node.sugar,
                phosphate:
                  node instanceof Nucleotide
                    ? node.phosphate
                    : getPhosphateFromSugar(node.sugar),
                rnaBase: node.rnaBase,
                baseMonomer: node.firstMonomerInNode,
              },
              lastPosition,
              canvasWidth,
              rearrangedMonomersSet,
              maxVerticalDistance,
              snakeLayoutMatrix,
            );
            lastPosition = rearrangeResult.lastPosition;
            maxVerticalDistance = rearrangeResult.maxVerticalDistance;
            command.merge(rearrangeResult.command);
          } else {
            node.monomers.forEach((monomer) => {
              const rearrangeResult = this.reArrangeChain(
                monomer,
                lastPosition,
                canvasWidth,
                rearrangedMonomersSet,
                maxVerticalDistance,
                snakeLayoutMatrix,
              );
              lastPosition = rearrangeResult.lastPosition;
              maxVerticalDistance = rearrangeResult.maxVerticalDistance;
              command.merge(rearrangeResult.command);
            });
          }
        });
        lastPosition = getFirstPosition(maxVerticalDistance, lastPosition);
        maxVerticalDistance = 0;
      });
    }

    if (needRedrawBonds) {
      command.merge(this.redrawBonds());
    }

    this.snakeLayoutMatrix = snakeLayoutMatrix;

    command.merge(
      this.recalculateCanvasMatrix(chainsCollection, previousSnakeLayoutMatrix),
    );

    return command;
  }

  private redrawBondsModelChange(
    polymerBond: PolymerBond,
    startPosition?: Vec2,
    endPosition?: Vec2,
  ) {
    if (startPosition && endPosition) {
      polymerBond.moveBondStartAbsolute(startPosition.x, startPosition.y);
      polymerBond.moveBondEndAbsolute(endPosition.x, endPosition.y);
    } else {
      polymerBond.moveToLinkedMonomers();
    }

    return polymerBond;
  }

  public redrawBonds() {
    const command = new Command();

    this.polymerBonds.forEach((polymerBond) => {
      command.merge(
        this.createDrawingEntityRedrawCommand(
          this.redrawBondsModelChange.bind(this, polymerBond),
          this.redrawBondsModelChange.bind(
            this,
            polymerBond,
            polymerBond.startPosition,
            polymerBond.endPosition,
          ),
        ),
      );
    });
    return command;
  }

  public getNextPositionAndDistance(
    lastPosition: Vec2,
    height: number,
    canvasWidth: number,
    width = SNAKE_LAYOUT_CELL_WIDTH,
  ) {
    const isMonomerFitCanvas =
      lastPosition.x +
        width +
        DISTANCE_FROM_RIGHT +
        SNAKE_LAYOUT_CELL_WIDTH / 2 <
      canvasWidth;

    if (!isMonomerFitCanvas) {
      return {
        maxVerticalDistance: 0,
        lastPosition: getFirstPosition(height, lastPosition),
      };
    }

    return {
      maxVerticalDistance: height,
      lastPosition: new Vec2({
        x: lastPosition.x + width,
        y: lastPosition.y,
      }),
    };
  }

  public isNucleosideAndPhosphateConnectedAsNucleotide(
    nucleoside: Nucleoside,
    phosphate: Phosphate,
  ) {
    if (
      !(nucleoside instanceof Nucleoside) ||
      !(phosphate instanceof Phosphate)
    )
      return false;

    return (
      nucleoside.sugar.attachmentPointsToBonds.R2?.secondMonomer === phosphate
    );
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
    const command = new Command();
    const monomerToNewMonomer = new Map<BaseMonomer, BaseMonomer>();
    const mergedDrawingEntities = new DrawingEntitiesManager();
    this.monomers.forEach((monomer) => {
      const monomerAddCommand =
        monomer instanceof AmbiguousMonomer
          ? targetDrawingEntitiesManager.addAmbiguousMonomer(
              {
                ...monomer.variantMonomerItem,
              },
              monomer.position,
            )
          : targetDrawingEntitiesManager.addMonomer(
              monomer.monomerItem,
              monomer.position,
            );

      command.merge(monomerAddCommand);

      const addedMonomer = monomerAddCommand.operations[0]
        .monomer as BaseMonomer;

      mergedDrawingEntities.monomers.set(addedMonomer.id, addedMonomer);

      monomerToNewMonomer.set(
        monomer,
        monomerAddCommand.operations[0].monomer as BaseMonomer,
      );
    });
    this.polymerBonds.forEach((polymerBond) => {
      assert(polymerBond.secondMonomer);
      const polymerBondCreateCommand =
        targetDrawingEntitiesManager.createPolymerBond(
          monomerToNewMonomer.get(polymerBond.firstMonomer) as BaseMonomer,
          monomerToNewMonomer.get(polymerBond.secondMonomer) as BaseMonomer,
          polymerBond.firstMonomer.getAttachmentPointByBond(
            polymerBond,
          ) as AttachmentPointName,
          polymerBond.secondMonomer.getAttachmentPointByBond(
            polymerBond,
          ) as AttachmentPointName,
        );
      command.merge(polymerBondCreateCommand);

      const addedPolymerBond = polymerBondCreateCommand.operations[0]
        .polymerBond as PolymerBond;

      mergedDrawingEntities.polymerBonds.set(
        addedPolymerBond.id,
        addedPolymerBond,
      );
    });
    this.micromoleculesHiddenEntities.mergeInto(
      targetDrawingEntitiesManager.micromoleculesHiddenEntities,
    );

    return { command, mergedDrawingEntities };
  }

  public centerMacroStructure() {
    const centerPointOfModel = Coordinates.canvasToModel(
      this.getCurrentCenterPointOfCanvas(),
    );
    const structCenter = this.getMacroStructureCenter();
    const offset = Vec2.diff(centerPointOfModel, structCenter);
    this.monomers.forEach((monomer: BaseMonomer) => {
      this.moveMonomer(monomer, new Vec2(monomer.position).add(offset));
    });
    this.polymerBonds.forEach((bond: PolymerBond) => {
      const { x: startX, y: startY } = new Vec2(bond.position).add(offset);
      bond.moveBondStartAbsolute(startX, startY);
      const { x: endX, y: endY } = new Vec2(bond.endPosition).add(offset);
      bond.moveBondEndAbsolute(endX, endY);
    });
  }

  public getCurrentCenterPointOfCanvas() {
    const editor = CoreEditor.provideEditorInstance();
    const originalCenterPointOfCanvas = new Vec2(
      editor.canvasOffset.width / 2,
      editor.canvasOffset.height / 2,
    );
    return Coordinates.viewToCanvas(originalCenterPointOfCanvas);
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

  public applyMonomersSequenceLayout() {
    const chainsCollection = ChainsCollection.fromMonomers([
      ...this.monomers.values(),
    ]);
    chainsCollection.rearrange();

    SequenceRenderer.show(chainsCollection);

    return chainsCollection;
  }

  public clearCanvas() {
    const editor = CoreEditor.provideEditorInstance();

    this.monomers.forEach((monomer) => {
      editor.renderersContainer.deleteMonomer(monomer);
    });

    this.polymerBonds.forEach((polymerBond) => {
      editor.renderersContainer.deletePolymerBond(polymerBond);
    });

    SequenceRenderer.removeEmptyNodes();
  }

  public applyFlexLayoutMode(needRedrawBonds = false) {
    const editor = CoreEditor.provideEditorInstance();
    const command = new Command();

    if (needRedrawBonds) {
      command.merge(this.redrawBonds());
    }

    this.monomers.forEach((monomer) => {
      editor.renderersContainer.deleteMonomer(monomer);
      editor.renderersContainer.addMonomer(monomer);
    });

    this.polymerBonds.forEach((polymerBond) => {
      editor.renderersContainer.deletePolymerBond(polymerBond);
      editor.renderersContainer.addPolymerBond(polymerBond);
    });

    SequenceRenderer.removeEmptyNodes();

    return command;
  }

  public rerenderPolymerBonds() {
    const editor = CoreEditor.provideEditorInstance();

    this.polymerBonds.forEach((polymerBond) => {
      editor.renderersContainer.deletePolymerBond(polymerBond);
      editor.renderersContainer.addPolymerBond(polymerBond);
    });
  }

  public getAllSelectedEntitiesForEntities(drawingEntities: DrawingEntity[]) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    drawingEntities.forEach((monomer) => monomer.turnOnSelection());
    const newDrawingEntities = drawingEntities.reduce(
      (
        selectedDrawingEntities: DrawingEntity[],
        drawingEntity: DrawingEntity,
      ) => {
        const res =
          editor.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
            drawingEntity,
            true,
            selectedDrawingEntities,
          );
        res.drawingEntities.forEach((entity) =>
          command.addOperation(new DrawingEntitySelectOperation(entity)),
        );
        return selectedDrawingEntities.concat(res.drawingEntities);
      },
      [],
    );
    return { command, drawingEntities: newDrawingEntities };
  }

  public getAllSelectedEntitiesForSingleEntity(
    drawingEntity: DrawingEntity,
    needToSelectConnectedBonds = true,
    selectedDrawingEntities?: DrawingEntity[],
  ) {
    const command = new Command();
    command.addOperation(new DrawingEntitySelectOperation(drawingEntity));
    drawingEntity.turnOnSelection();
    let drawingEntities: DrawingEntity[] = [drawingEntity];

    const editor = CoreEditor.provideEditorInstance();
    if (
      !(editor.mode instanceof SequenceMode) ||
      drawingEntity instanceof PolymerBond
    ) {
      return { command, drawingEntities };
    }
    if (drawingEntity instanceof Sugar && drawingEntity.isPartOfRNA) {
      const sugar = drawingEntity;
      if (isValidNucleoside(sugar)) {
        const nucleoside = Nucleoside.fromSugar(sugar);
        drawingEntities = nucleoside.monomers;
      } else if (isValidNucleotide(sugar)) {
        const nucleotide = Nucleotide.fromSugar(sugar);
        drawingEntities = nucleotide.monomers;
      }
      drawingEntities.forEach((entity) => {
        if (!(entity instanceof Sugar)) {
          entity.turnOnSelection();
          command.addOperation(new DrawingEntitySelectOperation(entity));
        }
      });
    }
    drawingEntities.forEach((entity) => {
      const monomer = entity as BaseMonomer;
      if (needToSelectConnectedBonds && monomer.hasBonds) {
        monomer.forEachBond((polymerBond) => {
          if (
            !selectedDrawingEntities?.includes(polymerBond) &&
            !drawingEntities.includes(polymerBond) &&
            polymerBond.getAnotherMonomer(monomer)?.selected
          ) {
            drawingEntities.push(polymerBond);
            polymerBond.turnOnSelection();
            command.addOperation(new DrawingEntitySelectOperation(polymerBond));
          }
        });
      }
    });
    return { command, drawingEntities };
  }

  public validateIfApplicableForFasta() {
    const monomerTypes = new Set();
    let isValid = true;

    this.monomers.forEach((monomer) => {
      const monomerType = monomer.monomerItem.props.MonomerType;
      monomerTypes.add(monomerType);
      if (monomerType === MONOMER_CONST.CHEM || monomerTypes.size > 1) {
        isValid = false;
      }
    });

    return isValid;
  }

  public moveMonomer(monomer: BaseMonomer, position: Vec2) {
    const oldMonomerPosition = monomer.position;
    const command = new Command();
    const operation = new MonomerMoveOperation(
      this.rearrangeChainModelChange.bind(this, monomer, position),
      this.rearrangeChainModelChange.bind(this, monomer, oldMonomerPosition),
    );
    command.addOperation(operation);

    return command;
  }

  public removeHoverForAllMonomers() {
    const command = new Command();
    this.monomers.forEach((monomer) => {
      if (!monomer.hovered) {
        return;
      }

      monomer.turnOffHover();
      monomer.turnOffAttachmentPointsVisibility();

      command.addOperation(new MonomerHoverOperation(monomer, true));
    });

    return command;
  }

  private reconnectPolymerBondModelChange(
    polymerBond: PolymerBond,
    {
      newFirstMonomerAttachmentPoint,
      newSecondMonomerAttachmentPoint,
      initialFirstMonomerAttachmentPoint,
      initialSecondMonomerAttachmentPoint,
    }: {
      newFirstMonomerAttachmentPoint: AttachmentPointName;
      newSecondMonomerAttachmentPoint: AttachmentPointName;
      initialFirstMonomerAttachmentPoint: AttachmentPointName;
      initialSecondMonomerAttachmentPoint: AttachmentPointName;
    },
  ) {
    polymerBond.firstMonomer.unsetBond(initialFirstMonomerAttachmentPoint);
    polymerBond.secondMonomer?.unsetBond(initialSecondMonomerAttachmentPoint);

    polymerBond.firstMonomer.setBond(
      newFirstMonomerAttachmentPoint,
      polymerBond,
    );
    polymerBond.secondMonomer?.setBond(
      newSecondMonomerAttachmentPoint,
      polymerBond,
    );

    return polymerBond;
  }

  public reconnectPolymerBond(
    polymerBond: PolymerBond,
    newFirstMonomerAttachmentPoint: AttachmentPointName,
    newSecondMonomerAttachmentPoint: AttachmentPointName,
    initialFirstMonomerAttachmentPoint: AttachmentPointName,
    initialSecondMonomerAttachmentPoint: AttachmentPointName,
  ) {
    const command = new Command();

    command.addOperation(
      new ReconnectPolymerBondOperation(
        this.reconnectPolymerBondModelChange.bind(this, polymerBond, {
          newFirstMonomerAttachmentPoint,
          newSecondMonomerAttachmentPoint,
          initialFirstMonomerAttachmentPoint,
          initialSecondMonomerAttachmentPoint,
        }),
        this.reconnectPolymerBondModelChange.bind(this, polymerBond, {
          newFirstMonomerAttachmentPoint: initialFirstMonomerAttachmentPoint,
          newSecondMonomerAttachmentPoint: initialSecondMonomerAttachmentPoint,
          initialFirstMonomerAttachmentPoint: newFirstMonomerAttachmentPoint,
          initialSecondMonomerAttachmentPoint: newSecondMonomerAttachmentPoint,
        }),
      ),
    );

    return command;
  }

  private addAmbiguousMonomerChangeModel(
    variantMonomerItem: AmbiguousMonomerType,
    position: Vec2,
    _monomer?: BaseMonomer,
  ) {
    if (_monomer) {
      this.monomers.set(_monomer.id, _monomer);

      return _monomer;
    }

    const monomer = new AmbiguousMonomer(variantMonomerItem, position);

    this.monomers.set(monomer.id, monomer);

    return monomer;
  }

  public addAmbiguousMonomer(
    variantMonomerItem: AmbiguousMonomerType,
    position: Vec2,
  ) {
    const command = new Command();
    const operation = new MonomerAddOperation(
      this.addAmbiguousMonomerChangeModel.bind(
        this,
        variantMonomerItem,
        position,
      ),
      () => {},
    );

    command.addOperation(operation);

    return command;
  }

  private addAtomChangeModel(position: Vec2) {
    const atom = new Atom(position);
    this.atoms.set(atom.id, atom);
    return atom;
  }

  public addAtom(position: Vec2) {
    const command = new Command();
    const atomAddOperation = new AtomAddOperation(
      this.addAtomChangeModel.bind(this, position),
      this.addAtomChangeModel.bind(this, position),
    );
    command.addOperation(atomAddOperation);
    return command;
  }

  private addBondChangeModel(firstAtom: Atom, secondAtom: Atom, type: number) {
    const bond = new Bond(firstAtom, secondAtom, type);
    this.bonds.set(bond.id, bond);
    return bond;
  }

  public addBond(firstAtom: Atom, secondAtom: Atom, type: number) {
    const command = new Command();
    const bondAddOperation = new BondAddOperation(
      this.addBondChangeModel.bind(this, firstAtom, secondAtom, type),
      this.addBondChangeModel.bind(this, firstAtom, secondAtom, type),
    );
    command.addOperation(bondAddOperation);
    return command;
  }
}
function getFirstPosition(height: number, lastPosition: Vec2) {
  return new Vec2(MONOMER_START_X_POSITION, lastPosition.y + height);
}
