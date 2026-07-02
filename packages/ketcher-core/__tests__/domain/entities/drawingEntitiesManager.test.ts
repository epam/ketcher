import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { peptideMonomerItem } from '../../mock-data';
import { Atom, Bond, SGroup, Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import {
  PolymerBondAddOperation,
  PolymerBondDeleteOperation,
} from 'application/editor/operations/polymerBond';
import { PolymerBond } from 'domain/entities/PolymerBond';
import {
  DrawingEntityHoverOperation,
  DrawingEntityMoveOperation,
  DrawingEntitySelectOperation,
} from 'application/editor/operations/drawingEntity';
import {
  MonomerAddOperation,
  MonomerDeleteOperation,
  MonomerHoverOperation,
} from 'application/editor/operations/monomer';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import { CoreEditor, MACROMOLECULES_BOND_TYPES } from 'application/editor';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { INVALID } from 'domain/entities/BaseMicromoleculeEntity';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Struct } from 'domain/entities/struct';

function createStructWithSGroup(type = SGroup.TYPES.MUL) {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  struct.bonds.add(
    new Bond({
      begin: firstAtomId,
      end: secondAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    }),
  );
  const sgroup = new SGroup(type);
  sgroup.data.fieldValue = 'Value';
  const sgroupId = struct.sgroups.add(sgroup);
  struct.atomAddToSGroup(sgroupId, firstAtomId);
  struct.atomAddToSGroup(sgroupId, secondAtomId);
  struct.markFragments();

  return { struct, sgroup };
}

describe('Drawing Entities Manager', () => {
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeEach(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: jest.fn(() => ({ x: 0, y: 0, width: 10, height: 10 })),
    });
  });

  afterEach(() => {
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        configurable: true,
        value: originalGetBBox,
      });
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  it('should create monomer', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const command = drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerAddOperation);
    expect(drawingEntitiesManager.monomers.get(0)).toBeInstanceOf(Peptide);
  });

  it('should create polymer bond', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const { command, polymerBond } =
      drawingEntitiesManager.startPolymerBondCreation(
        new Peptide(peptideMonomerItem),
        new Vec2(0, 0),
        new Vec2(10, 10),
        MACROMOLECULES_BOND_TYPES.SINGLE,
      );
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(PolymerBondAddOperation);
    expect(polymerBond).toBeInstanceOf(PolymerBond);
    expect(drawingEntitiesManager.polymerBonds.get(polymerBond.id)).toEqual(
      polymerBond,
    );
  });

  it('should create correct polymer bond when second monomer has only R2 point', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const firstPeptide = new Peptide(peptideMonomerItem);
    firstPeptide.attachmentPointsToBonds = { R1: null, R2: null };
    firstPeptide.potentialAttachmentPointsToBonds = { R1: null, R2: null };
    const secondPeptide = new Peptide(peptideMonomerItem);
    secondPeptide.attachmentPointsToBonds = { R2: null };
    secondPeptide.potentialAttachmentPointsToBonds = { R2: null };

    const { polymerBond } = drawingEntitiesManager.startPolymerBondCreation(
      firstPeptide,
      new Vec2(0, 0),
      new Vec2(10, 10),
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );

    const resultingOperations =
      drawingEntitiesManager.intendToFinishBondCreation(
        secondPeptide,
        polymerBond,
        true,
      ).operations;

    expect(resultingOperations).toHaveLength(2);
    expect(resultingOperations[0]).toMatchObject({
      peptide: {
        potentialAttachmentPointsToBonds: {
          R1: polymerBond,
          R2: null,
        },
        attachmentPointsToBonds: {
          R1: null,
          R2: null,
        },
      },
    });
  });

  it('should delete peptide', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const renderersManager = new RenderersManager({ theme: {} });
    drawingEntitiesManager.addMonomer(peptideMonomerItem, new Vec2(0, 0));
    const peptide = Array.from(drawingEntitiesManager.monomers)[0][1];
    expect(peptide).toBeInstanceOf(Peptide);
    const command = drawingEntitiesManager.deleteMonomer(peptide);
    renderersManager.update(command);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerDeleteOperation);
    expect(drawingEntitiesManager.monomers.size).toEqual(0);
  });

  it('should delete polymer bond', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const renderersManager = new RenderersManager({ theme: {} });
    const { polymerBond } = drawingEntitiesManager.startPolymerBondCreation(
      new Peptide(peptideMonomerItem),
      new Vec2(0, 0),
      new Vec2(10, 10),
      MACROMOLECULES_BOND_TYPES.SINGLE,
    );
    expect(
      Array.from(drawingEntitiesManager.polymerBonds)[0][1],
    ).toBeInstanceOf(PolymerBond);
    const command = drawingEntitiesManager.deletePolymerBond(polymerBond);
    renderersManager.update(command);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(PolymerBondDeleteOperation);
    expect(drawingEntitiesManager.polymerBonds.size).toEqual(0);
  });

  it('should select drawing entity', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const drawingEntity = new Peptide(peptideMonomerItem);
    const command = drawingEntitiesManager.selectDrawingEntity(drawingEntity);
    expect(drawingEntity.selected).toBeTruthy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntitySelectOperation);
  });

  it('should move peptide', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const renderersManager = new RenderersManager({ theme: {} });
    jest.spyOn(renderersManager, 'moveDrawingEntity').mockImplementation();
    drawingEntitiesManager.addMonomer(peptideMonomerItem, new Vec2(0, 0));
    const peptide = Array.from(drawingEntitiesManager.monomers)[0][1];
    peptide.turnOnSelection();
    const command = drawingEntitiesManager.moveSelectedDrawingEntities(
      new Vec2(100, 200),
    );
    renderersManager.update(command);
    expect(peptide.position.x).toEqual(100);
    expect(peptide.position.y).toEqual(200);
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntityMoveOperation);
  });

  it('should hover drawing entity', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const peptide = new Peptide(peptideMonomerItem);
    const command = drawingEntitiesManager.intendToSelectDrawingEntity(peptide);
    expect(peptide.hovered).toBeTruthy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(DrawingEntityHoverOperation);
  });

  it('should cancel the intention of polymer bond creation and turn off hover', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const peptide = new Peptide(peptideMonomerItem);
    drawingEntitiesManager.intendToSelectDrawingEntity(peptide);
    expect(peptide.hovered).toBeTruthy();
    const command =
      drawingEntitiesManager.cancelIntentionToFinishBondCreation(peptide);
    expect(peptide.hovered).toBeFalsy();
    expect(command.operations.length).toEqual(1);
    expect(command.operations[0]).toBeInstanceOf(MonomerHoverOperation);
  });

  it('should normalize invalid selection flags for reaction entities', () => {
    const drawingEntitiesManager = new DrawingEntitiesManager();

    drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(10, 0)],
      undefined,
      INVALID,
    );
    drawingEntitiesManager.addRxnPlus(new Vec2(5, 5), INVALID);

    expect(
      Array.from(drawingEntitiesManager.rxnArrows.values())[0],
    ).toMatchObject({
      initiallySelected: undefined,
    });
    expect(
      Array.from(drawingEntitiesManager.rxnPluses.values())[0],
    ).toMatchObject({
      initiallySelected: undefined,
    });

    const struct = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      drawingEntitiesManager,
      struct,
    );

    const rxnArrow = Array.from(struct.rxnArrows.values())[0];
    const rxnPlus = Array.from(struct.rxnPluses.values())[0];

    expect(rxnArrow.getInitiallySelected()).toBeUndefined();
    expect(rxnPlus.getInitiallySelected()).toBeUndefined();
  });

  it('should create macro S-group drawing entities for micromolecule fragments', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const { struct } = createStructWithSGroup();

    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        editor.drawingEntitiesManager,
      );

    expect(editor.drawingEntitiesManager.sgroups.size).toEqual(1);
    expect(
      [...editor.drawingEntitiesManager.sgroups.values()][0].sgroup.type,
    ).toBe(SGroup.TYPES.MUL);

    editor.renderersContainer.update(modelChanges);

    expect(editor.renderersContainer.sgroups.size).toEqual(1);
    expect(document.querySelector('[data-testid="s-group"]')).toBeTruthy();
    expect(document.querySelector('[data-label-text="1"]')).toBeTruthy();
  });

  it('should store monomer expanded state as a boolean in converted S-groups', () => {
    const struct = new Struct();
    const monomer = new Peptide(peptideMonomerItem);
    monomer.monomerItem.expanded = undefined;

    const collapsedSGroup =
      MacromoleculesConverter.convertMonomerToMonomerMicromolecule(
        monomer,
        struct,
      );

    expect(collapsedSGroup.data.expanded).toBe(false);

    monomer.monomerItem.expanded = true;
    const expandedSGroup =
      MacromoleculesConverter.convertMonomerToMonomerMicromolecule(
        monomer,
        struct,
      );

    expect(expandedSGroup.data.expanded).toBe(true);
  });

  it('should render macro data S-group field values', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const { struct } = createStructWithSGroup(SGroup.TYPES.DAT);
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        editor.drawingEntitiesManager,
      );

    editor.renderersContainer.update(modelChanges);

    expect(document.querySelector('[data-label-text="Value"]')).toBeTruthy();
  });
});
