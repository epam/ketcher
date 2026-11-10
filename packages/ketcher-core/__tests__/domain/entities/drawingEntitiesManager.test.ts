import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { peptideMonomerItem, polymerEditorTheme } from '../../mock-data';
import {
  Atom,
  Bond,
  SGroup,
  SGroupBracketType,
  SGroupAttachmentPoint,
  Vec2,
} from 'domain/entities';
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
  sgroup.data.fieldName = 'FieldName';
  sgroup.data.fieldValue = 'Value';
  const sgroupId = struct.sgroups.add(sgroup);
  struct.atomAddToSGroup(sgroupId, firstAtomId);
  struct.atomAddToSGroup(sgroupId, secondAtomId);
  struct.markFragments();

  return { struct, sgroup };
}

function createStructWithSplitSGroup(options?: { name?: string }) {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  const thirdAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(5, 0) }),
  );
  const fourthAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(6, 0) }),
  );
  struct.bonds.add(
    new Bond({
      begin: firstAtomId,
      end: secondAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    }),
  );
  struct.bonds.add(
    new Bond({
      begin: thirdAtomId,
      end: fourthAtomId,
      type: Bond.PATTERN.TYPE.SINGLE,
    }),
  );
  const sgroup = new SGroup(SGroup.TYPES.SUP);
  sgroup.data.name = options?.name ?? '';
  const sgroupId = struct.sgroups.add(sgroup);
  struct.atomAddToSGroup(sgroupId, firstAtomId);
  struct.atomAddToSGroup(sgroupId, secondAtomId);
  struct.atomAddToSGroup(sgroupId, thirdAtomId);
  struct.atomAddToSGroup(sgroupId, fourthAtomId);
  sgroup.addAttachmentPoint(
    new SGroupAttachmentPoint(firstAtomId, undefined, undefined, 1),
  );
  sgroup.addAttachmentPoint(
    new SGroupAttachmentPoint(thirdAtomId, undefined, undefined, 2),
  );
  struct.markFragments();

  return struct;
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

  it('invalidates and restores bracket positions when a macro atom is moved', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const { struct, sgroup } = createStructWithSGroup();
    sgroup.id = 0;
    const brackets = {
      opening: {
        type: SGroupBracketType.Round,
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: SGroupBracketType.Round,
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    sgroup.data.brackets = brackets;
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        editor.drawingEntitiesManager,
      );
    editor.renderersContainer.update(modelChanges);
    const macroGroup = [...editor.drawingEntitiesManager.sgroups.values()][0]
      .sgroup;
    const atom = [...editor.drawingEntitiesManager.atoms.values()][0];
    const command =
      editor.drawingEntitiesManager.createDrawingEntityMovingCommand(
        atom,
        new Vec2(1, 0),
      );

    editor.renderersContainer.update(command);
    expect(macroGroup.data.brackets?.opening.position).toBeUndefined();
    command.invert(editor.renderersContainer);
    expect(macroGroup.data.brackets).toEqual(brackets);
    command.execute(editor.renderersContainer);
    expect(macroGroup.data.brackets?.closing.position).toBeUndefined();
  });

  it('invalidates bracket positions and restores membership when a macro atom is deleted', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const { struct, sgroup } = createStructWithSGroup();
    sgroup.id = 0;
    const brackets = {
      opening: {
        type: SGroupBracketType.Curly,
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: SGroupBracketType.Curly,
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    sgroup.data.brackets = brackets;
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        editor.drawingEntitiesManager,
      );
    editor.renderersContainer.update(modelChanges);
    const macroGroup = [...editor.drawingEntitiesManager.sgroups.values()][0]
      .sgroup;
    const atom = [...editor.drawingEntitiesManager.atoms.values()][0];
    const originalMembers = [...macroGroup.atoms];
    const command = editor.drawingEntitiesManager.deleteDrawingEntity(atom);

    editor.renderersContainer.update(command);
    expect(macroGroup.atoms).not.toContain(atom.atomIdInMicroMode);
    expect(macroGroup.data.brackets?.opening.position).toBeUndefined();
    expect(macroGroup.data.bracketType).toBe(SGroupBracketType.Curly);
    command.invert(editor.renderersContainer);
    expect(macroGroup.atoms).toEqual(originalMembers);
    expect(macroGroup.data.brackets).toEqual(brackets);
    command.execute(editor.renderersContainer);
    expect(macroGroup.atoms).not.toContain(atom.atomIdInMicroMode);
    expect(macroGroup.data.brackets?.closing.position).toBeUndefined();
  });

  it('invalidates and restores bracket positions when a fragment monomer moves', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    const { struct, sgroup } = createStructWithSGroup(SGroup.TYPES.SUP);
    sgroup.id = 0;
    sgroup.addAttachmentPoint(
      new SGroupAttachmentPoint(sgroup.atoms[0], undefined, undefined, 1),
    );
    const brackets = {
      opening: {
        type: SGroupBracketType.Round,
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: SGroupBracketType.Round,
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    sgroup.data.brackets = brackets;
    const { modelChanges } =
      MacromoleculesConverter.convertStructToDrawingEntities(
        struct,
        editor.drawingEntitiesManager,
      );
    editor.renderersContainer.update(modelChanges);
    const monomer = [...editor.drawingEntitiesManager.monomers.values()][0];
    const macroGroup = [...monomer.monomerItem.struct.sgroups.values()][0];
    const command = editor.drawingEntitiesManager.moveMonomer(
      monomer,
      Vec2.sum(monomer.position, new Vec2(1, 0)),
    );

    editor.renderersContainer.update(command);
    expect(macroGroup.data.brackets?.opening.position).toBeUndefined();
    command.invert(editor.renderersContainer);
    expect(macroGroup.data.brackets).toEqual(brackets);
    command.execute(editor.renderersContainer);
    expect(macroGroup.data.brackets?.closing.position).toBeUndefined();
  });

  it('drops positions from partial S-groups without changing the source', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const struct = createStructWithSplitSGroup();
    const source = [...struct.sgroups.values()][0];
    const brackets = {
      opening: {
        type: SGroupBracketType.Round,
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: SGroupBracketType.Round,
        position: { start: { x: 7, y: -1 }, end: { x: 7, y: 1 } },
      },
    };
    source.data.brackets = brackets;

    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );
    const partialGroups = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].map((monomer) => [...monomer.monomerItem.struct.sgroups.values()][0]);
    expect(partialGroups).toHaveLength(2);
    partialGroups.forEach((group) => {
      expect(group.data.bracketType).toBe(SGroupBracketType.Round);
      expect(group.data.brackets?.opening.position).toBeUndefined();
      expect(group.data.brackets?.closing.position).toBeUndefined();
      expect(group.data.brackets).not.toBe(source.data.brackets);
    });
    partialGroups[0].data.bracketType = SGroupBracketType.Curly;
    expect(partialGroups[1].data.bracketType).toBe(SGroupBracketType.Round);
    expect(source.data.brackets).toEqual(brackets);
  });

  it('should split disconnected superatom fragments with attachment points into separate macro molecules', () => {
    const editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    const struct = createStructWithSplitSGroup();

    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );

    const monomers = Array.from(
      editor.drawingEntitiesManager.monomers.values(),
    );

    expect(monomers).toHaveLength(2);
    monomers.forEach((monomer) => {
      const sgroup = monomer.monomerItem.struct.sgroups.get(0);

      expect(sgroup?.isSuperatomWithoutLabel).toBe(true);
      expect(sgroup?.getAttachmentPoints()).toHaveLength(1);
    });
  });

  it('should not group disconnected fragments by S-group when attachment points are split across fragments', () => {
    const struct = createStructWithSplitSGroup({ name: 'Split' });

    const groupedFragments =
      MacromoleculesConverter.getFragmentsGroupedBySgroup(struct);

    expect(groupedFragments).toHaveLength(2);
    groupedFragments.forEach((fragmentsGroup) => {
      expect(fragmentsGroup).toHaveLength(1);
    });
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
    expect(
      [...editor.renderersContainer.sgroups.values()][0].labelTooltipText,
    ).toBe('FieldName=Value');
  });

  describe('getAntisenseBaseLabel', () => {
    it.each([
      ['A', false, 'U'],
      ['A', true, 'T'],
      ['C', false, 'G'],
      ['G', false, 'C'],
      ['T', false, 'A'],
      ['U', false, 'A'],
      ['X', false, undefined],
      ['X', true, undefined],
    ] as const)('maps %s (dna=%s) to %s', (label, isDnaAntisense, expected) => {
      expect(
        DrawingEntitiesManager.getAntisenseBaseLabel(label, isDnaAntisense),
      ).toBe(expected);
    });
  });
});
