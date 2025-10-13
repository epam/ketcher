import {
  AmbiguousMonomerType,
  AttachmentPointName,
  MonomerItemType,
  MonomerOrAmbiguousType,
} from 'domain/types';
import { Vec2 } from 'domain/entities/vec2';
import { Command } from 'domain/entities/Command';
import { DrawingEntity } from 'domain/entities/DrawingEntity';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import {
  BaseMonomer,
  Chem,
  KetFileMultitailArrowNode,
  LinkerSequenceNode,
  MonomerSequenceNode,
  Phosphate,
  Pool,
  RNABase,
  RxnArrowMode,
  SGroupForest,
  Struct,
  SubChainNode,
  Sugar,
} from 'domain/entities';
import { BondCIP } from 'domain/entities/types';
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
import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { Coordinates, CoreEditor } from 'application/editor/internal';
import {
  isAmbiguousMonomerLibraryItem,
  isRnaBaseOrAmbiguousRnaBase,
  isValidNucleoside,
  isValidNucleotide,
} from 'domain/helpers/monomers';
import {
  ChainsCollection,
  GrouppedChain,
} from 'domain/entities/monomer-chains/ChainsCollection';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { Nucleoside } from './Nucleoside';
import { Nucleotide } from './Nucleotide';
import {
  MACROMOLECULES_BOND_TYPES,
  provideEditorSettings,
  SequenceMode,
  SnakeMode,
} from 'application/editor';
import { CanvasMatrix } from 'domain/entities/canvas-matrix/CanvasMatrix';
import { RecalculateCanvasMatrixOperation } from 'application/editor/operations/modes/snake';
import { Matrix } from 'domain/entities/canvas-matrix/Matrix';
import { Cell } from 'domain/entities/canvas-matrix/Cell';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { KetMonomerClass } from 'application/formatters';
import { Atom, AtomProperties } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import {
  AtomAddOperation,
  AtomDeleteOperation,
} from 'application/editor/operations/coreAtom/atom';
import {
  BondAddOperation,
  BondDeleteOperation,
} from 'application/editor/operations/coreBond/bond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import {
  MonomerToAtomBondAddOperation,
  MonomerToAtomBondDeleteOperation,
} from 'application/editor/operations/monomerToAtomBond/monomerToAtomBond';
import {
  AtomLabel,
  SnakeLayoutCellWidth,
  HalfMonomerSize,
} from 'domain/constants';
import { isMonomerSgroupWithAttachmentPoints } from '../../utilities/monomers';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import {
  MONOMER_CONST,
  RNA_DNA_NON_MODIFIED_PART,
  RnaDnaNaturalAnaloguesEnum,
  StandardAmbiguousRnaBase,
} from 'domain/constants/monomers';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { SnakeLayoutModel } from './snake-layout-model/SnakeLayoutModel';
import {
  ISnakeLayoutMonomersNode,
  isTwoStrandedSnakeLayoutNode,
} from './snake-layout-model/types';
import { SugarWithBaseSnakeLayoutNode } from 'domain/entities/snake-layout-model/SugarWithBaseSnakeLayoutNode';
import { SingleMonomerSnakeLayoutNode } from 'domain/entities/snake-layout-model/SingleMonomerSnakeLayoutNode';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { KetcherLogger, SettingsManager } from 'utilities';
import { EmptyMonomer } from 'domain/entities/EmptyMonomer';
import {
  RxnArrowAddOperation,
  RxnArrowDeleteOperation,
} from 'application/editor/operations/coreRxn/rxnArrow';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { MultitailArrow } from 'domain/entities/CoreMultitailArrow';
import {
  MultitailArrowAddOperation,
  MultitailArrowDeleteOperation,
} from 'application/editor/operations/coreRxn/multitailArrow';
import { KetFileNode } from 'domain/serializers';
import { RxnPlus } from 'domain/entities/CoreRxnPlus';
import {
  RxnPlusAddOperation,
  RxnPlusDeleteOperation,
} from 'application/editor/operations/coreRxn/rxnPlus';
import { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';
import { MoleculeSnakeLayoutNode } from 'domain/entities/snake-layout-model/MoleculeSnakeLayoutNode';

const VERTICAL_DISTANCE_FROM_ROW_WITHOUT_RNA = SnakeLayoutCellWidth;
const VERTICAL_OFFSET_FROM_ROW_WITH_RNA = 142;
export const SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS =
  SnakeLayoutCellWidth * 2 + 30;
export const MONOMER_START_X_POSITION = 20 + SnakeLayoutCellWidth / 2;
export const MONOMER_START_Y_POSITION = 20 + SnakeLayoutCellWidth / 2;

type RnaPresetAdditionParams = {
  sugar: MonomerItemType;
  sugarPosition: Vec2;
  rnaBase: MonomerItemType | undefined;
  rnaBasePosition: Vec2 | undefined;
  phosphate: MonomerItemType | undefined;
  phosphatePosition: Vec2 | undefined;
  existingNode?: Nucleotide | Nucleoside | LinkerSequenceNode;
};

interface MonomerConnectedToSelection {
  monomerFromSelection: BaseMonomer;
  monomerConnectedToSelection: BaseMonomer;
  bond: PolymerBond;
}

export class DrawingEntitiesManager {
  public monomers: Map<number, BaseMonomer> = new Map();
  public polymerBonds: Map<number, PolymerBond | HydrogenBond> = new Map();
  private bondsMonomersOverlaps: Map<number, BaseMonomer> = new Map();
  public atoms: Map<number, Atom> = new Map();
  public bonds: Map<number, Bond> = new Map();
  public monomerToAtomBonds: Map<number, MonomerToAtomBond> = new Map();
  public rxnArrows: Map<number, RxnArrow> = new Map();
  public multitailArrows: Map<number, MultitailArrow> = new Map();
  public rxnPluses: Map<number, RxnPlus> = new Map();

  public micromoleculesHiddenEntities: Struct = new Struct();
  public canvasMatrix?: CanvasMatrix;
  public snakeLayoutMatrix?: Matrix<Cell>;
  public antisenseMonomerToSenseChain: Map<BaseMonomer, Chain> = new Map();

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

    return position ?? new Vec2(0, 0, 0);
  }

  public get bottomLeftMonomerPosition(): Vec2 {
    const bbox = DrawingEntitiesManager.getStructureBbox(this.monomersArray);

    return new Vec2(bbox.left, bbox.bottom);
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

  public get selectedEntities() {
    return this.allEntities.filter(
      ([, drawingEntity]) => drawingEntity.selected,
    );
  }

  public get selectedMonomers() {
    return this.monomersArray.filter((monomer) => monomer.selected);
  }

  public get externalConnectionsToSelection() {
    const connectedMonomers: MonomerConnectedToSelection[] = [];

    this.selectedMonomers.forEach((monomer) => {
      monomer.bonds.forEach((bond) => {
        if (
          !(bond instanceof PolymerBond || bond instanceof HydrogenBond) ||
          !bond.secondMonomer
        ) {
          return;
        }

        if (bond.firstMonomer === monomer && !bond.secondMonomer.selected) {
          connectedMonomers.push({
            monomerFromSelection: monomer,
            monomerConnectedToSelection: bond.secondMonomer,
            bond,
          });
        } else if (
          bond.secondMonomer === monomer &&
          !bond.firstMonomer.selected
        ) {
          connectedMonomers.push({
            monomerFromSelection: monomer,
            monomerConnectedToSelection: bond.firstMonomer,
            bond,
          });
        }
      });
    });

    return connectedMonomers;
  }

  public get allEntities() {
    return [
      ...(this.monomers as Map<number, DrawingEntity>),
      ...(this.polymerBonds as Map<number, DrawingEntity>),
      ...(this.monomerToAtomBonds as Map<number, DrawingEntity>),
      ...(this.atoms as Map<number, DrawingEntity>),
      ...(this.bonds as Map<number, DrawingEntity>),
      ...(this.rxnArrows as Map<number, DrawingEntity>),
      ...(this.multitailArrows as Map<number, DrawingEntity>),
      ...(this.rxnPluses as Map<number, DrawingEntity>),
    ];
  }

  public get allEntitiesArray() {
    return this.allEntities.map(([, drawingEntity]) => drawingEntity);
  }

  public get hasDrawingEntities() {
    return this.allEntities.length !== 0;
  }

  public get hasMonomers() {
    const monomers = [...this.monomers.values()].filter(
      (monomer) =>
        !monomer.monomerItem.props.isMicromoleculeFragment ||
        isMonomerSgroupWithAttachmentPoints(monomer),
    );

    return monomers.length !== 0;
  }

  public get allBondsToMonomers() {
    return [
      ...(this.polymerBonds as Map<number, PolymerBond>),
      ...(this.monomerToAtomBonds as Map<number, MonomerToAtomBond>),
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

    const newMonomer = this.createMonomer(monomerItem, position);

    newMonomer.moveAbsolute(position);
    this.monomers.set(newMonomer.id, newMonomer);

    return newMonomer;
  }

  public createMonomer(
    monomerItem: MonomerOrAmbiguousType,
    position: Vec2,
    generateId = true,
  ) {
    if (isAmbiguousMonomerLibraryItem(monomerItem)) {
      return new AmbiguousMonomer(monomerItem, position, generateId);
    } else {
      const [Monomer] = monomerFactory(monomerItem);

      return new Monomer(monomerItem, position, { generateId });
    }
  }

  public updateMonomerItem(
    monomer: BaseMonomer,
    monomerItemNew: MonomerItemType,
  ) {
    const initialMonomer = this.monomers.get(monomer.id);
    if (!initialMonomer) return monomer;
    initialMonomer.monomerItem = monomerItemNew;
    initialMonomer.recalculateAttachmentPoints();
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
    force = false,
  ) {
    if (drawingEntity instanceof BaseMonomer) {
      return this.deleteMonomer(
        drawingEntity,
        needToDeleteConnectedEntities,
        force,
      );
    } else if (
      drawingEntity instanceof PolymerBond ||
      drawingEntity instanceof HydrogenBond
    ) {
      return this.deletePolymerBond(drawingEntity);
    } else if (drawingEntity instanceof MonomerToAtomBond) {
      return this.deleteMonomerToAtomBond(drawingEntity);
    } else if (drawingEntity instanceof Bond) {
      return this.deleteBond(drawingEntity);
    } else if (drawingEntity instanceof Atom) {
      return this.deleteAtom(drawingEntity, needToDeleteConnectedEntities);
    } else if (drawingEntity instanceof RxnArrow) {
      return this.deleteRxnArrow(drawingEntity);
    } else if (drawingEntity instanceof MultitailArrow) {
      return this.deleteMultitailArrow(drawingEntity);
    } else if (drawingEntity instanceof RxnPlus) {
      return this.deleteRxnPlus(drawingEntity);
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

  private selectDrawingEntitiesModelChange(drawingEntity: DrawingEntity) {
    drawingEntity.turnOnSelection();
  }

  public selectDrawingEntities(drawingEntities: DrawingEntity[]) {
    const command = this.unselectAllDrawingEntities();
    drawingEntities.forEach((drawingEntity: DrawingEntity) => {
      drawingEntity.turnOnSelection();
      const operation = new DrawingEntitySelectOperation(
        drawingEntity,
        this.selectDrawingEntitiesModelChange.bind(this, drawingEntity),
      );
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

    const editor = CoreEditor.provideEditorInstance();
    editor.events.selectEntities.dispatch(
      this.selectedEntities.map((entity) => entity[1]),
    );

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

    const editor = CoreEditor.provideEditorInstance();
    editor.events.selectEntities.dispatch(
      this.selectedEntities.map((entity) => entity[1]),
    );

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
    if (
      drawingEntity instanceof PolymerBond ||
      drawingEntity instanceof HydrogenBond
    ) {
      drawingEntity.moveToLinkedEntities();
      drawingEntity.isOverlappedByMonomer =
        this.checkBondForOverlapsByMonomers(drawingEntity);
    } else if (drawingEntity instanceof Bond) {
      drawingEntity.moveToLinkedAtoms();
    } else if (drawingEntity instanceof MonomerToAtomBond) {
      drawingEntity.moveToLinkedEntities();
    } else {
      assert(offset);
      drawingEntity.moveRelative(offset);
      if (
        drawingEntity instanceof BaseMonomer &&
        isMonomerSgroupWithAttachmentPoints(drawingEntity)
      ) {
        this.moveChemAtomsPoint(drawingEntity, offset);
      }
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

    [
      ...this.atoms.values(),
      ...this.monomers.values(),
      ...this.rxnArrows.values(),
      ...this.multitailArrows.values(),
      ...this.rxnPluses.values(),
    ].forEach((drawingEntity) => {
      if (
        drawingEntity instanceof BaseMonomer &&
        drawingEntity.monomerItem.props.isMicromoleculeFragment &&
        !isMonomerSgroupWithAttachmentPoints(drawingEntity)
      ) {
        return;
      }

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

    this.monomerToAtomBonds.forEach((drawingEntity) => {
      if (
        drawingEntity.selected ||
        drawingEntity.monomer.selected ||
        drawingEntity.atom.selected
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

    this.bonds.forEach((drawingEntity) => {
      if (
        drawingEntity.selected ||
        drawingEntity.firstAtom.selected ||
        drawingEntity.secondAtom.selected
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
    force = false,
  ) {
    const command = new Command();

    if (monomer instanceof EmptyMonomer) {
      return command;
    }

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
        if (bond.selected && !force) return;

        if (bond instanceof PolymerBond || bond instanceof HydrogenBond) {
          // We need to remove connected bond when doing a group selection even if it is not selected
          // and mark it as selected to avoid operations duplication
          bond.turnOnSelection();
          command.merge(this.deletePolymerBond(bond));
        } else {
          command.merge(this.deleteMonomerToAtomBond(bond));
        }
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
      if (
        drawingEntity instanceof Chem &&
        drawingEntity.monomerItem.props.isMicromoleculeFragment &&
        !isMonomerSgroupWithAttachmentPoints(drawingEntity)
      ) {
        return;
      }

      const isPreviousSelected = previousSelectedEntities.find(
        ([, entity]) => entity === drawingEntity,
      );

      let isValueChanged;
      const editor = CoreEditor.provideEditorInstance();
      if (
        editor.mode instanceof SequenceMode &&
        drawingEntity instanceof PolymerBond
      ) {
        isValueChanged = this.checkBondSelectionForSequenceMode(drawingEntity);
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

  public selectIfLocatedInPolygon(
    polygonPoints: Vec2[],
    previousSelectedEntities: [number, DrawingEntity][],
    shiftKey = false,
  ) {
    const command = new Command();
    this.allEntities.forEach(([, drawingEntity]) => {
      if (
        drawingEntity instanceof Chem &&
        drawingEntity.monomerItem.props.isMicromoleculeFragment &&
        !isMonomerSgroupWithAttachmentPoints(drawingEntity)
      ) {
        return;
      }

      const isPreviousSelected = previousSelectedEntities.find(
        ([, entity]) => entity === drawingEntity,
      );

      let isValueChanged;
      const editor = CoreEditor.provideEditorInstance();
      if (
        editor.mode instanceof SequenceMode &&
        drawingEntity instanceof PolymerBond
      ) {
        isValueChanged = this.checkBondSelectionForSequenceMode(drawingEntity);
      } else {
        isValueChanged = drawingEntity.selectIfLocatedInPolygon(
          polygonPoints,
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

  private checkBondSelectionForSequenceMode(bond: PolymerBond) {
    const prevSelectedValue = bond.selected;
    if (bond.firstMonomer.selected && bond.secondMonomer?.selected) {
      bond.turnOnSelection();
    } else {
      bond.turnOffSelection();
    }
    return prevSelectedValue !== bond.selected;
  }

  public startPolymerBondCreationChangeModel(
    firstMonomer,
    startPosition,
    endPosition,
    bondType = MACROMOLECULES_BOND_TYPES.SINGLE,
    _polymerBond?: PolymerBond | HydrogenBond,
  ) {
    if (_polymerBond) {
      this.polymerBonds.set(_polymerBond.id, _polymerBond);
      return _polymerBond;
    }

    const polymerBond =
      bondType === MACROMOLECULES_BOND_TYPES.HYDROGEN
        ? new HydrogenBond(firstMonomer)
        : new PolymerBond(firstMonomer);
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

  public startPolymerBondCreation(
    firstMonomer: BaseMonomer,
    startPosition: Vec2,
    endPosition: Vec2,
    bondType: MACROMOLECULES_BOND_TYPES,
  ) {
    const command = new Command();

    const operation = new PolymerBondAddOperation(
      this.startPolymerBondCreationChangeModel.bind(
        this,
        firstMonomer,
        startPosition,
        endPosition,
        bondType,
      ),
      this.deletePolymerBondChangeModel.bind(this),
    );

    command.addOperation(operation);

    return { command, polymerBond: operation.polymerBond };
  }

  public deletePolymerBondChangeModel(polymerBond: PolymerBond | HydrogenBond) {
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
    if (firstMonomerAttachmentPoint || polymerBond instanceof HydrogenBond) {
      polymerBond.firstMonomer.unsetBond(
        firstMonomerAttachmentPoint,
        polymerBond,
      );
    }
    if (secondMonomerAttachmentPoint || polymerBond instanceof HydrogenBond) {
      polymerBond.secondMonomer?.unsetBond(
        secondMonomerAttachmentPoint,
        polymerBond,
      );
    }
  }

  public deletePolymerBond(polymerBond: PolymerBond | HydrogenBond) {
    const command = new Command();
    const firstAttachmentPoint =
      polymerBond.firstMonomer.getAttachmentPointByBond(
        polymerBond,
      ) as AttachmentPointName;
    const secondAttachmentPoint =
      polymerBond.secondMonomer?.getAttachmentPointByBond(
        polymerBond,
      ) as AttachmentPointName;

    const operation = new PolymerBondDeleteOperation(
      polymerBond,
      this.deletePolymerBondChangeModel.bind(this, polymerBond),
      (_polymerBond?: PolymerBond | HydrogenBond) =>
        this.finishPolymerBondCreationModelChange(
          polymerBond.firstMonomer,
          polymerBond.secondMonomer as BaseMonomer,
          firstAttachmentPoint,
          secondAttachmentPoint,
          MACROMOLECULES_BOND_TYPES.SINGLE,
          _polymerBond,
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
    bondType?: MACROMOLECULES_BOND_TYPES,
    _polymerBond?: PolymerBond,
  ) {
    if (_polymerBond) {
      this.polymerBonds.set(_polymerBond.id, _polymerBond);
      firstMonomer.setBond(firstMonomerAttachmentPoint, _polymerBond);
      secondMonomer.setBond(secondMonomerAttachmentPoint, _polymerBond);
      return _polymerBond;
    }

    const isHydrogenBond = bondType === MACROMOLECULES_BOND_TYPES.HYDROGEN;
    const polymerBond = isHydrogenBond
      ? new HydrogenBond(firstMonomer)
      : new PolymerBond(firstMonomer);
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
    polymerBond.moveToLinkedEntities();
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
    bondType = MACROMOLECULES_BOND_TYPES.SINGLE,
  ) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();

    const firstMonomer = polymerBond.firstMonomer;
    this.polymerBonds.delete(polymerBond.id);
    const operation = new PolymerBondFinishCreationOperation(
      (polymerBond?: PolymerBond) =>
        this.finishPolymerBondCreationModelChange(
          firstMonomer,
          secondMonomer,
          firstMonomerAttachmentPoint,
          secondMonomerAttachmentPoint,
          bondType,
          polymerBond,
        ),
      this.deletePolymerBondChangeModel.bind(this),
    );

    command.addOperation(operation);

    if (editor.mode instanceof SnakeMode) {
      command.merge(this.recalculateCanvasMatrix());
    }

    command.merge(this.recalculateAntisenseChains());

    return command;
  }

  public createPolymerBond(
    firstMonomer: BaseMonomer,
    secondMonomer: BaseMonomer,
    firstMonomerAttachmentPoint: AttachmentPointName,
    secondMonomerAttachmentPoint: AttachmentPointName,
    bondType = MACROMOLECULES_BOND_TYPES.SINGLE,
  ) {
    const command = new Command();

    const operation = new PolymerBondFinishCreationOperation(
      (polymerBond?: PolymerBond) =>
        this.finishPolymerBondCreationModelChange(
          firstMonomer,
          secondMonomer,
          firstMonomerAttachmentPoint,
          secondMonomerAttachmentPoint,
          bondType,
          polymerBond,
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

  public intendToSelectAllConnectedDrawingEntities(startEntity: DrawingEntity) {
    const command = new Command();
    this.visitAllConnectedEntities(startEntity, (drawingEntity) => {
      drawingEntity.turnOnHover();

      const operation = new DrawingEntityHoverOperation(drawingEntity);

      command.addOperation(operation);
    });

    return command;
  }

  public cancelIntentionToSelectDrawingEntity(drawingEntity: DrawingEntity) {
    const command = new Command();

    drawingEntity.turnOffHover();

    const operation = new DrawingEntityHoverOperation(drawingEntity);

    command.addOperation(operation);

    return command;
  }

  public cancelIntentionToSelectAllConnectedDrawingEntities(
    startEntity: DrawingEntity,
  ) {
    const command = new Command();

    this.visitAllConnectedEntities(startEntity, (drawingEntity) => {
      drawingEntity.turnOffHover();

      const operation = new DrawingEntityHoverOperation(drawingEntity);

      command.addOperation(operation);
    });

    return command;
  }

  public showPolymerBondInformation(polymerBond: PolymerBond) {
    const command = new Command();

    polymerBond.turnOnHover();
    polymerBond.firstMonomer.turnOnHover();

    assert(polymerBond.secondMonomer);

    polymerBond.secondMonomer.turnOnHover();

    if (!(polymerBond instanceof HydrogenBond)) {
      polymerBond.firstMonomer.turnOnAttachmentPointsVisibility();
      polymerBond.secondMonomer.turnOnAttachmentPointsVisibility();
    }

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

  public hideAllMonomersHoverAndAttachmentPoints() {
    const command = new Command();

    this.monomers.forEach((monomer) => {
      monomer.turnOffHover();
      monomer.turnOffAttachmentPointsVisibility();

      const operation = new MonomerHoverOperation(monomer, true);

      command.addOperation(operation);
    });

    return command;
  }

  public addRnaPresetFromNode = (
    node: Nucleotide | Nucleoside | LinkerSequenceNode,
  ) => {
    // TODO: Consider combining it with the method below to avoid code duplication
    const command = new Command();
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

    monomers.forEach((monomer, monomerIndex) => {
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
      if (monomerIndex > 0) {
        const previousMonomer = monomers[monomerIndex - 1];
        const attPointStart = previousMonomer.getValidSourcePoint(monomer);
        const attPointEnd = monomer.getValidSourcePoint(previousMonomer);

        assert(attPointStart);
        assert(attPointEnd);

        const operation = new PolymerBondFinishCreationOperation(
          (polymerBond?: PolymerBond) =>
            this.finishPolymerBondCreationModelChange(
              previousMonomer as BaseMonomer,
              monomer,
              attPointStart,
              attPointEnd,
              MACROMOLECULES_BOND_TYPES.SINGLE,
              polymerBond,
            ),
          this.deletePolymerBondChangeModel.bind(this),
        );
        command.addOperation(operation);
      }
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

    const monomers: BaseMonomer[] = [];

    monomersToAdd.forEach(([monomerItem, monomerPosition], monomerIndex) => {
      const monomerAddOperation = new MonomerAddOperation(
        this.addMonomerChangeModel.bind(this, monomerItem, monomerPosition),
        this.deleteMonomerChangeModel.bind(this),
      );
      const monomer = monomerAddOperation.monomer;
      monomers.push(monomer);
      command.addOperation(monomerAddOperation);
      if (monomerIndex > 0) {
        const previousMonomer = monomers[monomerIndex - 1];
        // requirements are: Base(R1)-(R3)Sugar(R2)-(R1)Phosphate
        const attPointStart = previousMonomer.getValidSourcePoint(monomer);
        const attPointEnd = monomer.getValidSourcePoint(previousMonomer);

        assert(attPointStart);
        assert(attPointEnd);

        const operation = new PolymerBondFinishCreationOperation(
          (polymerBond?: PolymerBond) =>
            this.finishPolymerBondCreationModelChange(
              previousMonomer as BaseMonomer,
              monomer,
              attPointStart,
              attPointEnd,
              MACROMOLECULES_BOND_TYPES.SINGLE,
              polymerBond,
            ),
          this.deletePolymerBondChangeModel.bind(this),
        );
        command.addOperation(operation);
      }
    });

    return { command, monomers };
  }

  public rearrangeChainModelChange(monomer: BaseMonomer, newPosition: Vec2) {
    if (isMonomerSgroupWithAttachmentPoints(monomer)) {
      const offset = newPosition.sub(monomer.position);

      this.moveChemAtomsPoint(monomer, offset);
    }

    monomer.moveAbsolute(newPosition);

    return monomer;
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

  private calculateSnakeLayoutMatrix(chainsCollection: ChainsCollection) {
    const snakeLayoutMatrix = new Matrix<Cell>();
    const monomersGroupedByY = new Map<number, Map<number, BaseMonomer>>();
    const monomerToNode = chainsCollection.monomerToNode;

    this.monomers.forEach((monomer) => {
      const x = Number(monomer.position.x.toFixed());
      const y = Number(monomer.position.y.toFixed());

      if (!monomersGroupedByY.has(y)) {
        monomersGroupedByY.set(y, new Map<number, BaseMonomer>());
      }

      const monomersGroupedByX = monomersGroupedByY.get(y);

      monomersGroupedByX?.set(x, monomer);
    });

    const sortedGroupedMonomers = [...monomersGroupedByY.entries()].map(
      ([y, groupedByX]) => {
        const groupedByYArray: [number, [number, BaseMonomer][]] = [
          y,
          [...groupedByX.entries()],
        ];

        return groupedByYArray;
      },
    );
    sortedGroupedMonomers.sort((a, b) => a[0] - b[0]);

    sortedGroupedMonomers.forEach(([y, groupedByY], index) => {
      groupedByY.sort((a, b) => Number(a[0]) - Number(b[0]));
      sortedGroupedMonomers[index] = [y, groupedByY];
    });

    const monomerXToIndexInMatrix = {};

    const longestRow = sortedGroupedMonomers.reduce(
      (longestRow, currentRow) =>
        currentRow[1].length > longestRow[1].length ? currentRow : longestRow,
      sortedGroupedMonomers[0],
    );

    longestRow[1].forEach(([x], index) => {
      monomerXToIndexInMatrix[x] = index;
    });

    sortedGroupedMonomers.forEach(([, groupedByX], indexY) => {
      groupedByX.forEach(([x, monomer]) => {
        snakeLayoutMatrix.set(
          Number(indexY),
          Number(monomerXToIndexInMatrix[x]),
          new Cell(
            monomerToNode.get(monomer),
            [],
            Number(indexY),
            Number(monomerXToIndexInMatrix[x]),
            monomer,
          ),
        );
      });
    });

    return snakeLayoutMatrix;
  }

  private rearrangeSingleMonomerSnakeLayoutNode(
    snakeLayoutNode: SingleMonomerSnakeLayoutNode,
    newPosition: Vec2,
    rearrangedMonomersSet: Set<number>,
    needRepositionMonomers = true,
  ) {
    const command = new Command();

    if (needRepositionMonomers) {
      this.addRnaOperations(
        command,
        snakeLayoutNode.monomer.position,
        newPosition,
        snakeLayoutNode.monomer,
      );
    }

    rearrangedMonomersSet.add(snakeLayoutNode.monomer?.id);

    return command;
  }

  private rearrangeSugarWithBaseSnakeLayoutNode(
    snakeLayoutNode: SugarWithBaseSnakeLayoutNode,
    newSugarPosition: Vec2,
    rearrangedMonomersSet: Set<number>,
    needRepositionMonomers = true,
    isAntisense = false,
  ) {
    const command = new Command();

    if (needRepositionMonomers) {
      this.addRnaOperations(
        command,
        snakeLayoutNode.sugar.position,
        newSugarPosition,
        snakeLayoutNode.sugar,
      );
      this.addRnaOperations(
        command,
        snakeLayoutNode.base?.position,
        new Vec2(
          newSugarPosition.x,
          newSugarPosition.y + (isAntisense ? -1 : 1) * SnakeLayoutCellWidth,
        ),
        snakeLayoutNode.base,
      );
    }

    rearrangedMonomersSet.add(snakeLayoutNode.sugar.id);
    rearrangedMonomersSet.add(snakeLayoutNode.base?.id);

    return command;
  }

  public applySnakeLayout(
    isSnakeMode: boolean,
    needRedrawBonds = true,
    needRepositionMonomers = true,
    needRecalculateOldAntisense = true,
    needRepositionMolecules = true,
  ) {
    if (this.monomers.size === 0) {
      return new Command();
    }

    const previousSnakeLayoutMatrix = this.snakeLayoutMatrix;
    const command = new Command();
    let chainsCollection: ChainsCollection;

    command.merge(this.recalculateAntisenseChains(needRecalculateOldAntisense));

    // not only snake mode???
    if (isSnakeMode) {
      const editor = CoreEditor.provideEditorInstance();
      const editorSettings = provideEditorSettings();
      const canvasWidth = editor.canvas.width.baseVal.value;
      const cellWidthInAngstroms =
        SnakeLayoutCellWidth / editorSettings.macroModeScale;

      const lineLengthFromSettings =
        SettingsManager.editorLineLength['snake-layout-mode'];
      const lineLengthFromCanvasWidth = Math.floor(
        (canvasWidth - SnakeLayoutCellWidth) / SnakeLayoutCellWidth,
      );

      if (lineLengthFromSettings === 0) {
        SettingsManager.editorLineLength = {
          'snake-layout-mode': lineLengthFromCanvasWidth,
        };
      }

      const rearrangedMonomersSet: Set<number> = new Set();
      let lastPosition = new Vec2({
        x: MONOMER_START_X_POSITION,
        y: MONOMER_START_Y_POSITION,
      });

      chainsCollection = ChainsCollection.fromMonomers([
        ...this.monomers.values(),
      ]);
      chainsCollection.rearrange();

      const snakeLayoutModel = new SnakeLayoutModel(
        chainsCollection,
        this,
        needRepositionMolecules,
      );
      let hasAntisenseInRow = false;
      let hasRnaInRow = false;
      let snakeLayoutNodesInRow: ISnakeLayoutMonomersNode[] = [];
      let previousSenseNode: ISnakeLayoutMonomersNode | undefined;
      let previousAntisenseNode: ISnakeLayoutMonomersNode | undefined;
      let newSenseNodePosition = lastPosition;

      snakeLayoutModel.forEachChain((chain) => {
        chain.forEachRow((row) => {
          const firstNodeInRow = row.snakeLayoutModelItems[0];

          if (
            hasAntisenseInRow &&
            isTwoStrandedSnakeLayoutNode(firstNodeInRow)
          ) {
            const r1BondToPreviousMonomer =
              firstNodeInRow.senseNode?.monomers[0].attachmentPointsToBonds.R1;

            if (r1BondToPreviousMonomer instanceof PolymerBond) {
              r1BondToPreviousMonomer.hasAntisenseInRow = true;
            }

            const r2BondFromPreviousSenseNode =
              previousSenseNode?.monomers[0].attachmentPointsToBonds.R2;
            const r1BondFromPreviousAntisenseNode =
              previousAntisenseNode?.monomers[0].attachmentPointsToBonds.R1;
            if (r2BondFromPreviousSenseNode instanceof PolymerBond) {
              r2BondFromPreviousSenseNode.nextRowPositionX =
                newSenseNodePosition.x;
            }
            if (r1BondFromPreviousAntisenseNode instanceof PolymerBond) {
              r1BondFromPreviousAntisenseNode.nextRowPositionX =
                newSenseNodePosition.x;
            }
          }

          hasAntisenseInRow = false;
          hasRnaInRow = false;
          snakeLayoutNodesInRow = [];

          row.snakeLayoutModelItems.forEach((twoStrandedSnakeLayoutNode) => {
            if (twoStrandedSnakeLayoutNode instanceof MoleculeSnakeLayoutNode) {
              const moleculeBbox = DrawingEntitiesManager.getStructureBbox(
                twoStrandedSnakeLayoutNode.molecule,
              );
              const offset = Vec2.diff(
                Coordinates.canvasToModel(newSenseNodePosition),
                new Vec2(
                  moleculeBbox.left + cellWidthInAngstroms / 4,
                  moleculeBbox.top + cellWidthInAngstroms / 4,
                ),
              );

              twoStrandedSnakeLayoutNode.molecule.forEach((atom) => {
                command.merge(
                  this.createDrawingEntityMovingCommand(atom, offset),
                );
              });
            } else if (
              isTwoStrandedSnakeLayoutNode(twoStrandedSnakeLayoutNode)
            ) {
              const senseNode = twoStrandedSnakeLayoutNode.senseNode;
              const antisenseNode = twoStrandedSnakeLayoutNode.antisenseNode;

              if (senseNode) {
                if (senseNode instanceof SugarWithBaseSnakeLayoutNode) {
                  command.merge(
                    this.rearrangeSugarWithBaseSnakeLayoutNode(
                      senseNode,
                      newSenseNodePosition,
                      rearrangedMonomersSet,
                      needRepositionMonomers,
                    ),
                  );
                  hasRnaInRow = true;
                } else if (senseNode instanceof SingleMonomerSnakeLayoutNode) {
                  command.merge(
                    this.rearrangeSingleMonomerSnakeLayoutNode(
                      senseNode,
                      newSenseNodePosition,
                      rearrangedMonomersSet,
                      needRepositionMonomers,
                    ),
                  );
                }

                snakeLayoutNodesInRow.push(senseNode);
              }

              if (antisenseNode) {
                if (antisenseNode instanceof SugarWithBaseSnakeLayoutNode) {
                  command.merge(
                    this.rearrangeSugarWithBaseSnakeLayoutNode(
                      antisenseNode,
                      new Vec2(
                        newSenseNodePosition.x,
                        newSenseNodePosition.y + SnakeLayoutCellWidth * 3,
                      ),
                      rearrangedMonomersSet,
                      needRepositionMonomers,
                      true,
                    ),
                  );
                  hasRnaInRow = true;
                } else if (
                  antisenseNode instanceof SingleMonomerSnakeLayoutNode
                ) {
                  command.merge(
                    this.rearrangeSingleMonomerSnakeLayoutNode(
                      antisenseNode,
                      new Vec2(
                        newSenseNodePosition.x,
                        newSenseNodePosition.y + SnakeLayoutCellWidth * 3,
                      ),
                      rearrangedMonomersSet,
                      needRepositionMonomers,
                    ),
                  );
                }

                hasAntisenseInRow = true;
                snakeLayoutNodesInRow.push(antisenseNode);
              }

              previousSenseNode = senseNode || previousSenseNode;
              previousAntisenseNode = antisenseNode || previousAntisenseNode;
            }

            lastPosition = newSenseNodePosition;
            newSenseNodePosition = new Vec2(
              lastPosition.x + SnakeLayoutCellWidth,
              lastPosition.y,
            );
          });

          newSenseNodePosition = new Vec2(
            MONOMER_START_X_POSITION,
            lastPosition.y +
              (hasRnaInRow || hasAntisenseInRow // hasAntisenseInPreviousRow used here because currently antisense y reserves space for RNA
                ? VERTICAL_OFFSET_FROM_ROW_WITH_RNA
                : VERTICAL_DISTANCE_FROM_ROW_WITHOUT_RNA) +
              (hasAntisenseInRow ? SNAKE_LAYOUT_Y_OFFSET_BETWEEN_CHAINS : 0),
          );
        });
      });

      const snakeLayoutMatrix =
        this.calculateSnakeLayoutMatrix(chainsCollection);
      this.snakeLayoutMatrix = snakeLayoutMatrix;

      command.merge(
        this.recalculateCanvasMatrix(
          chainsCollection,
          previousSnakeLayoutMatrix,
        ),
      );
    }

    if (needRedrawBonds) {
      command.merge(this.redrawBonds());
    }

    return command;
  }

  private redrawBondsModelChange(
    bond: PolymerBond | MonomerToAtomBond | Bond,
    startPosition?: Vec2,
    endPosition?: Vec2,
  ) {
    if (bond instanceof MonomerToAtomBond) {
      bond.moveToLinkedEntities();

      return bond;
    }

    if (startPosition && endPosition) {
      bond.moveBondStartAbsolute(startPosition.x, startPosition.y);
      bond.moveBondEndAbsolute(endPosition.x, endPosition.y);
    } else {
      bond.moveToLinkedEntities();
    }

    return bond;
  }

  public redrawBonds() {
    const command = new Command();

    [
      ...this.polymerBonds.values(),
      ...this.monomerToAtomBonds.values(),
      ...this.bonds.values(),
    ].forEach((polymerBond) => {
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

  public isNucleosideAndPhosphateConnectedAsNucleotide(
    nucleoside: Nucleoside,
    phosphate: Phosphate,
  ) {
    if (
      !(nucleoside instanceof Nucleoside) ||
      !(phosphate instanceof Phosphate)
    )
      return false;

    const r2Bond = nucleoside.sugar.attachmentPointsToBonds.R2;

    return (
      !(r2Bond instanceof MonomerToAtomBond) &&
      r2Bond?.secondMonomer === phosphate
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
    this.micromoleculesHiddenEntities.rxnArrows = new Pool();
    this.micromoleculesHiddenEntities.rxnPluses = new Pool();
    this.micromoleculesHiddenEntities.multitailArrows = new Pool();
  }

  public clearMicromoleculesHiddenEntities() {
    this.micromoleculesHiddenEntities = new Struct();
  }

  public mergeInto(targetDrawingEntitiesManager: DrawingEntitiesManager) {
    const command = new Command();
    const monomerToNewMonomer = new Map<BaseMonomer, BaseMonomer>();
    const atomToNewAtom = new Map<Atom, Atom>();
    const mergedDrawingEntities = new DrawingEntitiesManager();
    const editor = CoreEditor.provideEditorInstance();
    const viewModel = editor.viewModel;

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
          polymerBond instanceof HydrogenBond
            ? MACROMOLECULES_BOND_TYPES.HYDROGEN
            : MACROMOLECULES_BOND_TYPES.SINGLE,
        );
      command.merge(polymerBondCreateCommand);

      const addedPolymerBond = polymerBondCreateCommand.operations[0]
        .polymerBond as PolymerBond;

      mergedDrawingEntities.polymerBonds.set(
        addedPolymerBond.id,
        addedPolymerBond,
      );
    });

    this.atoms.forEach((atom) => {
      const atomAddCommand = targetDrawingEntitiesManager.addAtom(
        atom.position,
        monomerToNewMonomer.get(atom.monomer) as BaseMonomer,
        atom.atomIdInMicroMode,
        atom.label,
        atom.properties,
      );
      const addedAtom = atomAddCommand.operations[0].atom as Atom;

      command.merge(atomAddCommand);
      mergedDrawingEntities.atoms.set(addedAtom.id, addedAtom);
      atomToNewAtom.set(atom, addedAtom);
    });

    this.bonds.forEach((bond) => {
      const newFirstAtom = atomToNewAtom.get(bond.firstAtom);
      const newSecondAtom = atomToNewAtom.get(bond.secondAtom);

      if (!newFirstAtom || !newSecondAtom) {
        return;
      }

      const bondAddCommand = targetDrawingEntitiesManager.addBond(
        newFirstAtom,
        newSecondAtom,
        bond.type,
        bond.stereo,
        bond.bondIdInMicroMode,
        bond.cip,
      );
      const addedBond = bondAddCommand.operations[0].bond as Bond;

      command.merge(bondAddCommand);
      mergedDrawingEntities.bonds.set(addedBond.id, addedBond);
    });

    viewModel.initialize([...targetDrawingEntitiesManager.bonds.values()]);

    this.monomerToAtomBonds.forEach((monomerToAtomBond) => {
      const bondAddCommand = targetDrawingEntitiesManager.addMonomerToAtomBond(
        monomerToNewMonomer.get(monomerToAtomBond.monomer) as BaseMonomer,
        atomToNewAtom.get(monomerToAtomBond.atom) as Atom,
        monomerToAtomBond.monomer.getAttachmentPointByBond(
          monomerToAtomBond,
        ) as AttachmentPointName,
      );

      const addedBond = bondAddCommand.operations[0]
        .monomerToAtomBond as MonomerToAtomBond;

      command.merge(bondAddCommand);
      mergedDrawingEntities.monomerToAtomBonds.set(addedBond.id, addedBond);
    });

    this.rxnArrows.forEach((rxnArrow) => {
      const rxnArrowAddCommand = targetDrawingEntitiesManager.addRxnArrow(
        rxnArrow.type,
        rxnArrow.startEndPosition,
        rxnArrow.height,
      );

      const addedRxnArrow = rxnArrowAddCommand.operations[0]
        .rxnArrow as RxnArrow;

      command.merge(rxnArrowAddCommand);
      mergedDrawingEntities.rxnArrows.set(addedRxnArrow.id, addedRxnArrow);
    });

    this.multitailArrows.forEach((multitailArrow) => {
      const arrowAddCommand = targetDrawingEntitiesManager.addMultitailArrow(
        multitailArrow.toKetNode(),
      );

      const addedArrow = arrowAddCommand.operations[0]
        .multitailArrow as MultitailArrow;

      command.merge(arrowAddCommand);
      mergedDrawingEntities.multitailArrows.set(addedArrow.id, addedArrow);
    });

    this.rxnPluses.forEach((rxnPlus) => {
      const plusAddCommand = targetDrawingEntitiesManager.addRxnPlus(
        rxnPlus.position,
      );

      const addedPlus = plusAddCommand.operations[0].rxnPlus as RxnPlus;

      command.merge(plusAddCommand);
      mergedDrawingEntities.rxnPluses.set(addedPlus.id, addedPlus);
    });

    this.micromoleculesHiddenEntities.mergeInto(
      targetDrawingEntitiesManager.micromoleculesHiddenEntities,
    );

    return { command, mergedDrawingEntities };
  }

  public filterSelection() {
    const filteredDrawingEntitiesManager = new DrawingEntitiesManager();

    this.selectedEntities.forEach(([, entity]) => {
      if (entity instanceof BaseMonomer) {
        filteredDrawingEntitiesManager.addMonomerChangeModel(
          entity.monomerItem,
          entity.position,
          entity,
        );
      } else if (entity instanceof Atom) {
        filteredDrawingEntitiesManager.addMonomerChangeModel(
          entity.monomer.monomerItem,
          entity.monomer.position,
          entity.monomer,
        );
      } else if (entity instanceof PolymerBond && entity.secondMonomer) {
        const firstAttachmentPoint =
          entity.firstMonomer.getAttachmentPointByBond(entity);
        const secondAttachmentPoint =
          entity.secondMonomer?.getAttachmentPointByBond(entity);
        if (
          firstAttachmentPoint &&
          secondAttachmentPoint &&
          entity.firstMonomer.selected &&
          entity.secondMonomer?.selected
        ) {
          filteredDrawingEntitiesManager.finishPolymerBondCreationModelChange(
            entity.firstMonomer,
            entity.secondMonomer,
            firstAttachmentPoint,
            secondAttachmentPoint,
            undefined,
            entity,
          );
        }
      } else if (entity instanceof HydrogenBond && entity.secondMonomer) {
        filteredDrawingEntitiesManager.finishPolymerBondCreationModelChange(
          entity.firstMonomer,
          entity.secondMonomer,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
          entity,
        );
      } else if (entity instanceof MonomerToAtomBond) {
        filteredDrawingEntitiesManager.addMonomerToAtomBondChangeModel(
          entity.monomer,
          entity.atom,
          entity.monomer.getAttachmentPointByBond(
            entity,
          ) as AttachmentPointName,
          entity,
        );
      } else if (entity instanceof Bond) {
        filteredDrawingEntitiesManager.addBondChangeModel(
          entity.firstAtom,
          entity.secondAtom,
          entity.type,
          entity.stereo,
          entity.bondIdInMicroMode,
          entity,
          entity.cip,
        );
      } else if (entity instanceof RxnArrow) {
        filteredDrawingEntitiesManager.addRxnArrowModelChange(
          entity.type,
          entity.startEndPosition,
          entity.height,
          entity.initiallySelected,
          entity,
        );
      } else if (entity instanceof MultitailArrow) {
        filteredDrawingEntitiesManager.addMultitailArrowArrowModelChange(
          entity.toKetNode(),
          entity,
        );
      } else if (entity instanceof RxnPlus) {
        filteredDrawingEntitiesManager.addRxnPlusModelChange(
          entity.position,
          entity.initiallySelected,
          entity,
        );
      }
    });

    return filteredDrawingEntitiesManager;
  }

  public centerMacroStructure() {
    const centerPointOfModel = Coordinates.canvasToModel(
      this.getCurrentCenterPointOfCanvas(),
    );
    const structCenter = this.getMacroStructureCenter();
    const offset = Vec2.diff(centerPointOfModel, structCenter);

    this.allEntities.forEach(([, entity]) => {
      this.moveDrawingEntityModelChange(entity, offset);
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

  public rerenderMolecules() {
    const editor = CoreEditor.provideEditorInstance();

    this.atoms.forEach((atom) => {
      editor.renderersContainer.deleteAtom(atom);
      editor.renderersContainer.addAtom(atom);
    });

    this.bonds.forEach((bond) => {
      editor.renderersContainer.deleteBond(bond);
      editor.renderersContainer.addBond(bond);
    });

    this.rxnArrows.forEach((rxnArrow) => {
      editor.renderersContainer.deleteRxnArrow(rxnArrow);
      editor.renderersContainer.addRxnArrow(rxnArrow);
    });

    this.multitailArrows.forEach((multitailArrow) => {
      editor.renderersContainer.deleteMultitailArrow(multitailArrow);
      editor.renderersContainer.addMultitailArrow(multitailArrow);
    });

    this.rxnPluses.forEach((rxnPlus) => {
      editor.renderersContainer.deleteRxnPlus(rxnPlus);
      editor.renderersContainer.addRxnPlus(rxnPlus);
    });
  }

  public applyMonomersSequenceLayout() {
    const chainsCollection = ChainsCollection.fromMonomers([
      ...this.monomers.values(),
    ]);

    chainsCollection.rearrange();
    this.rerenderMolecules();
    SequenceRenderer.show(chainsCollection);

    return chainsCollection;
  }

  public clearCanvas() {
    const editor = CoreEditor.provideEditorInstance();

    // TODO rewrite to work with base class (drawingEntity)

    this.monomers.forEach((monomer) => {
      editor.renderersContainer.deleteMonomer(monomer);
    });

    this.polymerBonds.forEach((polymerBond) => {
      editor.renderersContainer.deletePolymerBond(polymerBond);
    });

    this.monomerToAtomBonds.forEach((monomerToAtomBond) => {
      editor.renderersContainer.deleteMonomerToAtomBond(monomerToAtomBond);
    });

    this.atoms.forEach((atom) => {
      editor.renderersContainer.deleteAtom(atom);
    });

    this.bonds.forEach((bond) => {
      editor.renderersContainer.deleteBond(bond);
    });

    this.rxnArrows.forEach((bond) => {
      editor.renderersContainer.deleteRxnArrow(bond);
    });

    this.multitailArrows.forEach((bond) => {
      editor.renderersContainer.deleteMultitailArrow(bond);
    });

    this.rxnPluses.forEach((rxnPlus) => {
      editor.renderersContainer.deleteRxnPlus(rxnPlus);
    });

    SequenceRenderer.clear();
  }

  public applyFlexLayoutMode(needRedrawBonds = false) {
    const editor = CoreEditor.provideEditorInstance();
    const command = new Command();

    if (needRedrawBonds) {
      command.merge(this.redrawBonds());
    }

    this.detectBondsOverlappedByMonomers();

    this.monomers.forEach((monomer) => {
      editor.renderersContainer.deleteMonomer(monomer);
      editor.renderersContainer.addMonomer(monomer);
    });

    this.polymerBonds.forEach((polymerBond) => {
      editor.renderersContainer.deletePolymerBond(polymerBond);
      editor.renderersContainer.addPolymerBond(polymerBond);
    });

    this.rerenderMolecules();

    this.monomerToAtomBonds.forEach((monomerToAtomBond) => {
      editor.renderersContainer.deleteMonomerToAtomBond(monomerToAtomBond);
      editor.renderersContainer.addMonomerToAtomBond(monomerToAtomBond);
    });

    return command;
  }

  public rerenderBondsOverlappedByMonomers() {
    const editor = CoreEditor.provideEditorInstance();

    if (editor.mode instanceof SequenceMode) {
      return;
    }

    const monomersToCheck = this.selectedEntities
      .filter(([, entity]) => entity instanceof BaseMonomer)
      .map(([, entity]) => entity as BaseMonomer);
    const outstandingBonds = this.polymerBondsArray.filter((polymerBond) =>
      monomersToCheck.some(
        (monomer) =>
          polymerBond.firstMonomer !== monomer &&
          polymerBond.secondMonomer !== monomer,
      ),
    );

    outstandingBonds.forEach((polymerBond) => {
      const previousIsOverlappedByMonomer = polymerBond.isOverlappedByMonomer;
      polymerBond.isOverlappedByMonomer = this.checkBondForOverlapsByMonomers(
        polymerBond,
        monomersToCheck,
      );
      if (polymerBond.isOverlappedByMonomer !== previousIsOverlappedByMonomer) {
        editor.renderersContainer.deletePolymerBond(polymerBond, false, false);
        editor.renderersContainer.addPolymerBond(polymerBond, false);
      }
    });
  }

  public getAllSelectedEntitiesForEntities(drawingEntities: DrawingEntity[]) {
    const command = new Command();
    const editor = CoreEditor.provideEditorInstance();
    editor.events.selectEntities.dispatch(drawingEntities);
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
            polymerBond instanceof PolymerBond &&
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
      let monomerType = monomer.monomerItem.props.MonomerType;

      if (monomer instanceof AmbiguousMonomer) {
        monomerType =
          monomer.monomerClass === KetMonomerClass.CHEM
            ? MONOMER_CONST.CHEM
            : monomer.monomers[0].monomerItem.props.MonomerType;
      }
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
    ambiguousMonomerItem: AmbiguousMonomerType,
    position: Vec2,
  ) {
    const command = new Command();
    const operation = new MonomerAddOperation(
      this.addAmbiguousMonomerChangeModel.bind(
        this,
        ambiguousMonomerItem,
        position,
      ),
      this.deleteMonomerChangeModel.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  private addAtomChangeModel(
    position: Vec2,
    monomer: BaseMonomer,
    atomIdInMicroMode: number,
    label: AtomLabel,
    properties?: AtomProperties,
    _atom?: Atom,
  ) {
    if (_atom) {
      this.atoms.set(_atom.id, _atom);

      return _atom;
    }

    const atom = new Atom(
      position,
      monomer,
      atomIdInMicroMode,
      label,
      properties,
    );

    this.atoms.set(atom.id, atom);

    return atom;
  }

  public addAtom(
    position: Vec2,
    monomer: BaseMonomer,
    atomIdInMicroMode: number,
    label: AtomLabel,
    properties?: AtomProperties,
  ) {
    const command = new Command();
    const atomAddOperation = new AtomAddOperation(
      (atom?: Atom) =>
        this.addAtomChangeModel(
          position,
          monomer,
          atomIdInMicroMode,
          label,
          properties,
          atom,
        ),
      this.deleteAtomChangeModel.bind(this),
    );

    command.addOperation(atomAddOperation);

    return command;
  }

  private deleteAtomChangeModel(atom: Atom) {
    this.atoms.delete(atom.id);

    return atom;
  }

  private deleteAtom(atom: Atom, needToDeleteConnectedEntities = true) {
    const command = new Command();

    command.addOperation(
      new AtomDeleteOperation(
        atom,
        this.deleteAtomChangeModel.bind(this, atom),
        () =>
          this.addAtomChangeModel(
            atom.position,
            atom.monomer,
            atom.atomIdInMicroMode,
            atom.label,
            atom.properties,
            atom,
          ),
      ),
    );

    if (needToDeleteConnectedEntities) {
      atom.bonds.forEach((bond) => {
        if (bond.selected) {
          return;
        }
        if (bond instanceof Bond) {
          command.merge(this.deleteBond(bond));
        }
      });

      this.monomerToAtomBonds.forEach((monomerToAtomBond) => {
        if (monomerToAtomBond.atom === atom && !monomerToAtomBond.selected) {
          command.merge(this.deleteMonomerToAtomBond(monomerToAtomBond));
        }
      });
    }

    return command;
  }

  private addBondChangeModel(
    firstAtom: Atom,
    secondAtom: Atom,
    type: number,
    stereo: number,
    bondIdInMicroMode: number,
    _bond?: Bond,
    cip?: BondCIP | null,
  ) {
    if (_bond) {
      this.bonds.set(_bond.id, _bond);

      return _bond;
    }

    const bond = new Bond(
      firstAtom,
      secondAtom,
      bondIdInMicroMode,
      type,
      stereo,
      cip,
    );

    this.bonds.set(bond.id, bond);
    firstAtom.addBond(bond);
    secondAtom.addBond(bond);

    return bond;
  }

  public addBond(
    firstAtom: Atom,
    secondAtom: Atom,
    type: number,
    stereo: number,
    bondIdInMicroMode: number,
    cip?: BondCIP | null,
  ) {
    const command = new Command();
    const bondAddOperation = new BondAddOperation(
      (bond?: Bond) =>
        this.addBondChangeModel(
          firstAtom,
          secondAtom,
          type,
          stereo,
          bondIdInMicroMode,
          bond,
          cip,
        ),
      (bond: Bond) => this.deleteBondChangeModel(bond),
    );

    command.addOperation(bondAddOperation);

    return command;
  }

  private deleteBondChangeModel(bond: Bond) {
    this.bonds.delete(bond.id);

    const firstAtom = bond.firstAtom;
    const secondAtom = bond.secondAtom;
    [firstAtom, secondAtom].forEach((atom) => {
      atom.deleteBond(bond.id);
    });

    return bond;
  }

  private deleteBond(bond: Bond, needToDeleteDisconnectedAtoms = true) {
    const command = new Command();

    command.addOperation(
      new BondDeleteOperation(
        bond,
        this.deleteBondChangeModel.bind(this, bond),
        (bond: Bond) =>
          this.addBondChangeModel(
            bond.firstAtom,
            bond.secondAtom,
            bond.type,
            bond.stereo,
            bond.bondIdInMicroMode,
            bond,
          ),
      ),
    );

    const firstAtom = bond.firstAtom;
    const secondAtom = bond.secondAtom;
    [firstAtom, secondAtom].forEach((atom) => {
      atom.deleteBond(bond.id);

      if (
        !needToDeleteDisconnectedAtoms ||
        !atom.bonds.every((atomBond) => atomBond instanceof MonomerToAtomBond)
      ) {
        return;
      }

      this.monomerToAtomBonds.forEach((monomerToAtomBond) => {
        if (monomerToAtomBond.atom !== atom || monomerToAtomBond.selected) {
          return;
        }
        command.merge(this.deleteAtom(atom, true));
      });
    });
    return command;
  }

  public addMonomerToAtomBondChangeModel(
    monomer: BaseMonomer,
    atom: Atom,
    attachmentPoint: AttachmentPointName,
    _monomerToAtomBond?: MonomerToAtomBond,
  ) {
    if (_monomerToAtomBond) {
      this.monomerToAtomBonds.set(_monomerToAtomBond.id, _monomerToAtomBond);
      monomer.setBond(attachmentPoint, _monomerToAtomBond);
      atom.addBond(_monomerToAtomBond);
      return _monomerToAtomBond;
    }

    const monomerToAtomBond = new MonomerToAtomBond(monomer, atom);
    atom.addBond(monomerToAtomBond);
    this.monomerToAtomBonds.set(monomerToAtomBond.id, monomerToAtomBond);

    monomerToAtomBond.moveToLinkedEntities();
    monomer.setBond(attachmentPoint, monomerToAtomBond);
    monomer.turnOffAttachmentPointsVisibility();
    monomer.turnOffHover();

    return monomerToAtomBond;
  }

  private deleteMonomerToAtomBondChangeModel(
    monomerAtomBond: MonomerToAtomBond,
  ) {
    const attachmentPointName =
      monomerAtomBond.monomer.getAttachmentPointByBond(monomerAtomBond);

    if (attachmentPointName) {
      monomerAtomBond.monomer.unsetBond(attachmentPointName);
    }
    this.monomerToAtomBonds.delete(monomerAtomBond.id);
    monomerAtomBond.atom.deleteBond(monomerAtomBond.id);
    return monomerAtomBond;
  }

  public deleteMonomerToAtomBond(monomerAtomBond: MonomerToAtomBond) {
    const command = new Command();

    command.addOperation(
      new MonomerToAtomBondDeleteOperation(
        monomerAtomBond,
        this.deleteMonomerToAtomBondChangeModel.bind(this, monomerAtomBond),
        this.addMonomerToAtomBondChangeModel.bind(
          this,
          monomerAtomBond.monomer,
          monomerAtomBond.atom,
          monomerAtomBond.monomer.getAttachmentPointByBond(
            monomerAtomBond,
          ) as AttachmentPointName,
        ),
      ),
    );

    return command;
  }

  public addMonomerToAtomBond(
    monomer: BaseMonomer,
    atom: Atom,
    attachmentPoint: AttachmentPointName,
  ) {
    const command = new Command();
    const monomerAddToAtomBondOperation = new MonomerToAtomBondAddOperation(
      this.addMonomerToAtomBondChangeModel.bind(
        this,
        monomer,
        atom,
        attachmentPoint,
      ),
      this.deleteMonomerToAtomBondChangeModel.bind(this),
    );

    command.addOperation(monomerAddToAtomBondOperation);

    return command;
  }

  // TODO create separate class for BoundingBox
  public static getStructureBbox(drawingEntities: DrawingEntity[]) {
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;

    drawingEntities.forEach((drawingEntity) => {
      const monomerPosition = drawingEntity.position;

      left = left ? Math.min(left, monomerPosition.x) : monomerPosition.x;
      right = right ? Math.max(right, monomerPosition.x) : monomerPosition.x;
      top = top ? Math.min(top, monomerPosition.y) : monomerPosition.y;
      bottom = bottom ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
    });

    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }

  private static antisenseChainBasesMap(isDnaAntisense: boolean) {
    const antisenseMap = {
      [RnaDnaNaturalAnaloguesEnum.ADENINE]: RnaDnaNaturalAnaloguesEnum.URACIL,
      [RnaDnaNaturalAnaloguesEnum.CYTOSINE]: RnaDnaNaturalAnaloguesEnum.GUANINE,
      [RnaDnaNaturalAnaloguesEnum.GUANINE]: RnaDnaNaturalAnaloguesEnum.CYTOSINE,
      [RnaDnaNaturalAnaloguesEnum.THYMINE]: RnaDnaNaturalAnaloguesEnum.ADENINE,
      [RnaDnaNaturalAnaloguesEnum.URACIL]: RnaDnaNaturalAnaloguesEnum.ADENINE,
      [StandardAmbiguousRnaBase.N]: StandardAmbiguousRnaBase.N,
      [StandardAmbiguousRnaBase.B]: StandardAmbiguousRnaBase.V,
      [StandardAmbiguousRnaBase.D]: StandardAmbiguousRnaBase.H,
      [StandardAmbiguousRnaBase.H]: StandardAmbiguousRnaBase.D,
      [StandardAmbiguousRnaBase.K]: StandardAmbiguousRnaBase.M,
      [StandardAmbiguousRnaBase.W]: StandardAmbiguousRnaBase.W,
      [StandardAmbiguousRnaBase.Y]: StandardAmbiguousRnaBase.R,
      [StandardAmbiguousRnaBase.M]: StandardAmbiguousRnaBase.K,
      [StandardAmbiguousRnaBase.R]: StandardAmbiguousRnaBase.Y,
      [StandardAmbiguousRnaBase.S]: StandardAmbiguousRnaBase.S,
      [StandardAmbiguousRnaBase.V]: StandardAmbiguousRnaBase.B,
    };
    if (isDnaAntisense) {
      antisenseMap[RnaDnaNaturalAnaloguesEnum.ADENINE] =
        RnaDnaNaturalAnaloguesEnum.THYMINE;
    }

    return antisenseMap;
  }

  public markMonomerAsAntisense(monomer: BaseMonomer) {
    const command = new Command();

    command.merge(
      this.modifyMonomerItem(monomer, {
        ...monomer.monomerItem,
        isSense: false,
        isAntisense: true,
      }),
    );

    return command;
  }

  public markMonomerAsSense(monomer: BaseMonomer) {
    const command = new Command();

    command.merge(
      this.modifyMonomerItem(monomer, {
        ...monomer.monomerItem,
        isSense: true,
        isAntisense: false,
      }),
    );

    return command;
  }

  public recalculateAntisenseChains(needRecalculateOldAntisense = true) {
    const command = new Command();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...this.monomers.values(),
    ]);
    const handledChains = new Set<Chain>();

    if (needRecalculateOldAntisense) {
      this.monomers.forEach((monomer) => {
        command.merge(
          this.modifyMonomerItem(monomer, {
            ...monomer.monomerItem,
            isAntisense: false,
            isSense: false,
          }),
        );
      });
      this.antisenseMonomerToSenseChain = new Map();
    }

    chainsCollection.chains.forEach((chain) => {
      if (handledChains.has(chain)) {
        return;
      }

      if (!needRecalculateOldAntisense) {
        const isAntisenseChain = chain.monomers.some(
          (monomer) => monomer.monomerItem.isAntisense,
        );
        const isSenseChain = chain.monomers.some(
          (monomer) => monomer.monomerItem.isSense,
        );

        if (isSenseChain) {
          chain.monomers.forEach((monomer) => {
            command.merge(this.markMonomerAsSense(monomer));
          });

          return;
        }

        if (isAntisenseChain) {
          chain.monomers.forEach((monomer) => {
            command.merge(this.markMonomerAsAntisense(monomer));
          });

          return;
        }
      }

      let senseChain: GrouppedChain;
      const chainsToCheck =
        chainsCollection.getAllChainsWithConnectionInBlock(chain);

      const chainToMonomers = new Map<GrouppedChain, BaseMonomer[]>();

      chainsToCheck.forEach((chainToCheck) => {
        chainToMonomers.set(chainToCheck, chainToCheck.chain.monomers);
      });

      const largestChainsMonomersAmount = Math.max(
        ...[...chainToMonomers.values()].map((monomers) => monomers.length),
      );

      const largestChains = [...chainToMonomers.entries()].filter(
        ([, monomers]) => monomers.length === largestChainsMonomersAmount,
      );

      if (largestChains.length === 1) {
        senseChain = largestChains[0][0];
      } else {
        const chainsToCenters = new Map<GrouppedChain, Vec2>();
        const chainsToComplimentaryChainsAmount = new Map<
          GrouppedChain,
          number
        >();

        largestChains.forEach(([chainToCheck]) => {
          const complimentayChains =
            chainsCollection.getComplimentaryChainsWithData(chainToCheck.chain);

          chainsToComplimentaryChainsAmount.set(
            chainToCheck,
            complimentayChains.length,
          );
        });

        largestChains.forEach(([chainToCheck, monomers]) => {
          const chainBbox = DrawingEntitiesManager.getStructureBbox(monomers);

          chainsToCenters.set(
            chainToCheck,
            new Vec2(
              chainBbox.left + chainBbox.width / 2,
              chainBbox.top + chainBbox.height / 2,
            ),
          );
        });

        const chainsToCenterArray = [...chainsToCenters.entries()];
        const chainWithLowestCenter = chainsToCenterArray.reduce(
          ([previousChain, previousChainCenter], [chainToCheck, center]) => {
            return center.y < previousChainCenter.y
              ? [chainToCheck, center]
              : [previousChain, previousChainCenter];
          },
          chainsToCenterArray[0],
        );
        const chainsToComplimentaryChainsAmountArray = [
          ...chainsToComplimentaryChainsAmount.entries(),
        ];
        const chainWithMoreComplimentaryChains =
          chainsToComplimentaryChainsAmountArray.reduce(
            (
              [previousChain, previousChainComplimentaryChainsAmount],
              [chainToCheck, complimentaryChainsAmount],
            ) => {
              return complimentaryChainsAmount >
                previousChainComplimentaryChainsAmount
                ? [chainToCheck, complimentaryChainsAmount]
                : [previousChain, previousChainComplimentaryChainsAmount];
            },
            chainsToComplimentaryChainsAmountArray[0],
          );

        senseChain =
          chainsToComplimentaryChainsAmount.size === 1
            ? chainWithMoreComplimentaryChains[0]
            : chainWithLowestCenter[0];
      }

      const { group: senseGroup } = senseChain;

      chainsToCheck.forEach(({ chain, group }) => {
        handledChains.add(chain);
        if (group === senseGroup) {
          chain.monomers.forEach((monomer) => {
            command.merge(this.markMonomerAsSense(monomer));
          });
        } else {
          chain.monomers.forEach((monomer) => {
            command.merge(this.markMonomerAsAntisense(monomer));
            this.antisenseMonomerToSenseChain.set(monomer, senseChain.chain);
          });
        }
      });
    });

    return command;
  }

  public get hasAntisenseChains() {
    return [...this.monomers.values()].some(
      (monomer) => monomer.monomerItem.isAntisense,
    );
  }

  public static getAntisenseBaseLabel(
    rnaBaseMonomerOrLabel: RNABase | AmbiguousMonomer | string,
    isDnaAntisense: boolean,
  ) {
    let baseLabelKey: string;

    if (typeof rnaBaseMonomerOrLabel === 'string') {
      baseLabelKey = rnaBaseMonomerOrLabel;
    } else if (rnaBaseMonomerOrLabel instanceof AmbiguousMonomer) {
      baseLabelKey = rnaBaseMonomerOrLabel.monomerItem.label;
    } else {
      baseLabelKey =
        rnaBaseMonomerOrLabel.monomerItem.props.MonomerNaturalAnalogCode;
    }

    return DrawingEntitiesManager.antisenseChainBasesMap(isDnaAntisense)[
      baseLabelKey
    ];
  }

  public static createAntisenseNode(
    node: Nucleoside | Nucleotide,
    needAddPhosphate = false,
    isDnaAntisense: boolean,
  ) {
    const antisenseBaseLabel = DrawingEntitiesManager.getAntisenseBaseLabel(
      node.rnaBase,
      isDnaAntisense,
    );

    if (!antisenseBaseLabel) {
      return;
    }
    const sugarName = isDnaAntisense
      ? RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA
      : RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
    return (needAddPhosphate ? Nucleotide : Nucleoside).createOnCanvas(
      antisenseBaseLabel,
      node.monomer.position.add(new Vec2(0, 3)),
      sugarName,
    );
  }

  public createAntisenseChain(isDnaAntisense: boolean) {
    const editor = CoreEditor.provideEditorInstance();
    const command = new Command();
    const selectedMonomers = this.selectedEntities
      .filter(([, drawingEntity]) => drawingEntity instanceof BaseMonomer)
      .map(([, monomer]) => monomer as BaseMonomer);
    const chainsCollection = ChainsCollection.fromMonomers(selectedMonomers);
    const chainsForAntisenseCreation = chainsCollection.chains.filter(
      (chain) => {
        return chain.subChains.some((subChain) =>
          subChain.nodes.some(
            (node) =>
              (node instanceof Nucleotide || node instanceof Nucleoside) &&
              Boolean(
                DrawingEntitiesManager.getAntisenseBaseLabel(
                  node.rnaBase,
                  isDnaAntisense,
                ),
              ) &&
              node.monomer.selected,
          ),
        );
      },
    );
    const selectedPiecesInChains: SubChainNode[][] = [];

    chainsForAntisenseCreation.forEach((chain) => {
      let selectedPiece: SubChainNode[] = [];
      let hasRnaInPiece = false;

      chain.nodes.forEach((node) => {
        const hasSelectedMonomerInNode = node.monomers.some(
          (monomer) => monomer.selected,
        );

        if (!hasSelectedMonomerInNode) {
          if (hasRnaInPiece) {
            selectedPiecesInChains.push(selectedPiece);
          }
          selectedPiece = [];
          hasRnaInPiece = false;
        } else {
          selectedPiece.push(node);
        }

        if (node instanceof Nucleoside || node instanceof Nucleotide) {
          hasRnaInPiece = true;
        }
      });

      if (hasRnaInPiece) {
        selectedPiecesInChains.push(selectedPiece);
      }

      selectedPiece = [];
      hasRnaInPiece = false;
    });

    let lastAddedNode;
    let lastAddedMonomer: BaseMonomer | undefined;

    selectedPiecesInChains.forEach((selectedPiece) => {
      selectedPiece.reverse().forEach((nodeToHandle) => {
        const senseNode =
          nodeToHandle instanceof Nucleotide &&
          nodeToHandle.phosphate.selected &&
          !nodeToHandle.monomer.selected
            ? new MonomerSequenceNode(nodeToHandle.phosphate)
            : nodeToHandle;

        if (!senseNode.monomer.selected) {
          lastAddedMonomer = undefined;
          lastAddedNode = undefined;

          return;
        }

        if (
          senseNode instanceof Nucleotide ||
          senseNode instanceof Nucleoside
        ) {
          const antisenseNodeCreationResult =
            DrawingEntitiesManager.createAntisenseNode(
              senseNode,
              false,
              isDnaAntisense,
            );

          if (!antisenseNodeCreationResult) {
            return;
          }

          const { modelChanges: addNucleotideCommand, node: addedNode } =
            antisenseNodeCreationResult;

          command.merge(addNucleotideCommand);

          let addedPhosphate: BaseMonomer | undefined;

          if (senseNode instanceof Nucleotide && senseNode.phosphate.selected) {
            const phosphateLibraryItem = getRnaPartLibraryItem(
              editor,
              RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
            );

            if (!phosphateLibraryItem) {
              KetcherLogger.warn(
                'Phosphate is not found in monomers library. Skipping phosphate addition.',
              );

              return;
            }

            const monomerAddCommand = this.addMonomer(
              phosphateLibraryItem,
              senseNode.phosphate.position.add(new Vec2(0, 3)),
            );
            addedPhosphate = monomerAddCommand.operations[0]
              .monomer as BaseMonomer;

            command.merge(monomerAddCommand);
            command.merge(
              this.createPolymerBond(
                addedPhosphate,
                addedNode.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          if (lastAddedNode) {
            command.merge(
              this.createPolymerBond(
                lastAddedMonomer || lastAddedNode.lastMonomerInNode,
                addedPhosphate || addedNode.firstMonomerInNode,
                AttachmentPointName.R2,
                AttachmentPointName.R1,
              ),
            );
          }

          command.merge(
            this.createPolymerBond(
              senseNode.rnaBase,
              addedNode.rnaBase,
              AttachmentPointName.HYDROGEN,
              AttachmentPointName.HYDROGEN,
              MACROMOLECULES_BOND_TYPES.HYDROGEN,
            ),
          );

          lastAddedMonomer = undefined;
          lastAddedNode = addedNode;
        } else {
          lastAddedMonomer =
            lastAddedMonomer || lastAddedNode?.lastMonomerInNode;

          senseNode.monomers.reverse().forEach((monomer) => {
            if (!monomer.selected) {
              lastAddedMonomer = undefined;
              lastAddedNode = undefined;

              return;
            }

            if (!monomer.hasAttachmentPoint(AttachmentPointName.R2)) {
              editor.events.error.dispatch(
                `Monomer ${monomer.label} does not have attachment point R2. Antisense was not created for this monomer.`,
              );

              return;
            }

            if (
              lastAddedMonomer &&
              !lastAddedMonomer.hasAttachmentPoint(AttachmentPointName.R1)
            ) {
              editor.events.error.dispatch(
                `Monomer ${lastAddedMonomer.label} does not have attachment point R1. Antisense was not created for this monomer.`,
              );

              return;
            }

            const monomerAddCommand = this.addMonomer(
              monomer.monomerItem,
              monomer.position.add(new Vec2(0, 4.25)),
            );
            const addedMonomer = monomerAddCommand.operations[0]
              .monomer as BaseMonomer;

            command.merge(monomerAddCommand);

            if (lastAddedMonomer) {
              command.merge(
                this.createPolymerBond(
                  lastAddedMonomer,
                  addedMonomer,
                  AttachmentPointName.R2,
                  AttachmentPointName.R1,
                ),
              );
            }

            lastAddedNode = senseNode;
            lastAddedMonomer = addedMonomer;
          });
        }
      });
      lastAddedNode = undefined;
      lastAddedMonomer = undefined;
    });

    command.merge(this.applySnakeLayout(true, true));

    if (editor.mode instanceof SequenceMode) {
      command.addOperation(new ReinitializeModeOperation());
    }

    command.setUndoOperationsByPriority();

    return command;
  }

  public get monomersArray() {
    return [...this.monomers.values()];
  }

  public get polymerBondsArray() {
    return [...this.polymerBonds.values()];
  }

  public get molecules() {
    return this.monomersArray.filter((monomer) => {
      return (
        monomer.monomerItem.props.isMicromoleculeFragment &&
        !isMonomerSgroupWithAttachmentPoints(monomer)
      );
    });
  }

  private checkBondForOverlapsByMonomers(
    polymerBond: PolymerBond,
    monomers?: BaseMonomer[],
  ) {
    const editor = CoreEditor.provideEditorInstance();
    if (!editor || editor.mode instanceof SequenceMode) {
      return false;
    }

    const secondMonomer = polymerBond.secondMonomer;
    if (!secondMonomer) {
      return false;
    }

    if (!polymerBond.isHorizontal && !polymerBond.isVertical) {
      return false;
    }

    const monomersToUse = monomers ?? this.monomersArray;
    // Skip processing for large structures for now as in worst case its has O(n^2) complexity and may freeze the app
    // Further optimization might be needed to allow that
    if (monomersToUse.length > 500) {
      return false;
    }

    const previousOverlap = this.bondsMonomersOverlaps.get(polymerBond.id);
    const monomersToUseWithPreviousOverlap = previousOverlap
      ? [previousOverlap, ...monomersToUse]
      : monomersToUse;

    const overlappingMonomer = monomersToUseWithPreviousOverlap.find(
      (monomer) => {
        if (
          monomer.id === polymerBond.firstMonomer.id ||
          monomer.id === secondMonomer.id
        ) {
          return false;
        }

        const distanceFromMonomerToLine =
          monomer.center.calculateDistanceToLine([
            polymerBond.firstMonomer.center,
            secondMonomer.center,
          ]);

        return distanceFromMonomerToLine < HalfMonomerSize;
      },
    );

    if (overlappingMonomer) {
      this.bondsMonomersOverlaps.set(polymerBond.id, overlappingMonomer);
    }

    return Boolean(overlappingMonomer);
  }

  public detectBondsOverlappedByMonomers(
    polymerBonds?: Array<PolymerBond | HydrogenBond>,
  ) {
    const bondsToCheck = polymerBonds ?? this.polymerBondsArray;
    bondsToCheck.forEach((polymerBond) => {
      polymerBond.isOverlappedByMonomer =
        this.checkBondForOverlapsByMonomers(polymerBond);
    });
  }

  private deleteRxnArrowModelChange(rxnArrow: RxnArrow) {
    this.rxnArrows.delete(rxnArrow.id);
  }

  private addRxnArrowModelChange(
    type: RxnArrowMode,
    position: [Vec2, Vec2],
    height?: number,
    initiallySelected?: initiallySelectedType,
    _arrow?: RxnArrow,
  ) {
    if (_arrow) {
      this.rxnArrows.set(_arrow.id, _arrow);

      return _arrow;
    }

    const rxnArrow = new RxnArrow(type, position, height, initiallySelected);

    this.rxnArrows.set(rxnArrow.id, rxnArrow);

    return rxnArrow;
  }

  public addRxnArrow(
    type: RxnArrowMode,
    position: [Vec2, Vec2],
    height?: number,
    initiallySelected?: initiallySelectedType,
  ) {
    const command = new Command();
    const operation = new RxnArrowAddOperation(
      this.addRxnArrowModelChange.bind(
        this,
        type,
        position,
        height,
        initiallySelected,
      ),
      this.deleteRxnArrowModelChange.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public deleteRxnArrow(rxnArrow: RxnArrow) {
    const command = new Command();
    const operation = new RxnArrowDeleteOperation(
      rxnArrow,
      this.deleteRxnArrowModelChange.bind(this),
      this.addRxnArrowModelChange.bind(
        this,
        rxnArrow.type,
        rxnArrow.startEndPosition,
        rxnArrow.height,
        rxnArrow.initiallySelected,
      ),
    );

    command.addOperation(operation);

    return command;
  }

  private deleteMultitailArrowModelChange(multitailArrow: MultitailArrow) {
    this.multitailArrows.delete(multitailArrow.id);
  }

  private addMultitailArrowArrowModelChange(
    multitailArrowKetNode: KetFileNode<KetFileMultitailArrowNode>,
    _arrow?: MultitailArrow,
  ) {
    if (_arrow) {
      this.multitailArrows.set(_arrow.id, _arrow);

      return _arrow;
    }

    const multitailArrow = MultitailArrow.fromKet(multitailArrowKetNode);

    this.multitailArrows.set(multitailArrow.id, multitailArrow);

    return multitailArrow;
  }

  public addMultitailArrow(
    multitailArrowKetNode: KetFileNode<KetFileMultitailArrowNode>,
  ) {
    const command = new Command();
    const operation = new MultitailArrowAddOperation(
      this.addMultitailArrowArrowModelChange.bind(this, multitailArrowKetNode),
      this.deleteMultitailArrowModelChange.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public deleteMultitailArrow(multitailArrow: MultitailArrow) {
    const command = new Command();
    const operation = new MultitailArrowDeleteOperation(
      multitailArrow,
      this.deleteMultitailArrowModelChange.bind(this),
      this.addMultitailArrowArrowModelChange.bind(
        this,
        multitailArrow.toKetNode(),
      ),
    );

    command.addOperation(operation);

    return command;
  }

  private deleteRxnPlusModelChange(rxnPlus: RxnPlus) {
    this.rxnPluses.delete(rxnPlus.id);
  }

  private addRxnPlusModelChange(
    position: Vec2,
    initiallySelected?: initiallySelectedType,
    _rxnPlus?: RxnPlus,
  ) {
    if (_rxnPlus) {
      this.rxnPluses.set(_rxnPlus.id, _rxnPlus);

      return _rxnPlus;
    }

    const rxnPlus = new RxnPlus(position, initiallySelected);

    this.rxnPluses.set(rxnPlus.id, rxnPlus);

    return rxnPlus;
  }

  public addRxnPlus(position: Vec2, initiallySelected?: initiallySelectedType) {
    const command = new Command();
    const operation = new RxnPlusAddOperation(
      this.addRxnPlusModelChange.bind(this, position, initiallySelected),
      this.deleteRxnPlusModelChange.bind(this),
    );

    command.addOperation(operation);

    return command;
  }

  public deleteRxnPlus(rxnPlus: RxnPlus) {
    const command = new Command();
    const operation = new RxnPlusDeleteOperation(
      rxnPlus,
      this.deleteRxnPlusModelChange.bind(this),
      this.addRxnPlusModelChange.bind(
        this,
        rxnPlus.position,
        rxnPlus.initiallySelected,
      ),
    );

    command.addOperation(operation);

    return command;
  }

  public selectAllConnectedEntities(startEntity: DrawingEntity) {
    const command = new Command();
    const process = (entity: DrawingEntity) => {
      entity.selected = true;
      command.merge(this.createDrawingEntitySelectionCommand(entity));
    };

    this.visitAllConnectedEntities(startEntity, process);
    return command;
  }

  private visitAllConnectedEntities(
    startEntity: DrawingEntity,
    process: (entity: DrawingEntity) => void,
  ): void {
    const queue = [startEntity];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current || visited.has(current.id)) continue;
      process(current);
      visited.add(current.id);

      if (current instanceof BaseMonomer) {
        queue.push(...current.hydrogenBonds, ...current.bonds);
      } else if (current instanceof HydrogenBond) {
        queue.push(
          current.firstEndEntity,
          ...(current.secondEndEntity ? [current.secondEndEntity] : []),
        );
      } else if (current instanceof PolymerBond) {
        queue.push(current.firstMonomer);
        if (current.secondMonomer) queue.push(current.secondMonomer);
      } else if (current instanceof MonomerToAtomBond) {
        queue.push(current.monomer, current.atom);
      } else if (current instanceof Bond) {
        queue.push(current.firstAtom, current.secondAtom);
      } else if (current instanceof Atom) {
        queue.push(...current.bonds);
      }
    }
  }

  public getConnectedMolecule(
    startEntity: DrawingEntity,
    entitiesToReturn: Array<typeof Atom | typeof Bond> = [Atom, Bond],
  ) {
    const connectedMoleculeMonomers: Array<Atom | Bond> = [];
    const queue = [startEntity];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current || visited.has(current.id)) continue;

      visited.add(current.id);

      if (current instanceof Bond) {
        queue.push(current.firstAtom, current.secondAtom);
        if (entitiesToReturn.includes(Bond)) {
          connectedMoleculeMonomers.push(current);
        }
      } else if (current instanceof Atom) {
        queue.push(...current.bonds);
        if (entitiesToReturn.includes(Atom)) {
          connectedMoleculeMonomers.push(current);
        }
      }
    }

    return connectedMoleculeMonomers;
  }
}
