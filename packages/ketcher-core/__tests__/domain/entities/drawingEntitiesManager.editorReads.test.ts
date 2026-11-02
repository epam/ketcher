import {
  CoreEditor,
  FlexMode,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
  SnakeMode,
} from 'application/editor';
import type { BaseMode } from 'application/editor/modes/BaseMode';
import { Command } from 'domain/entities/Command';
import { ReinitializeModeOperation } from 'application/editor/operations/modes';
import { RecalculateCanvasMatrixOperation } from 'application/editor/operations/modes/snake';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import {
  addOverlapFixture,
  addPeptide,
  bondPeptides,
  centerDetached,
  createEditor,
  deserializeKet,
  ETHANE_KET,
  makeDetachedManager,
} from './drawingEntitiesManager.editorReads.helpers';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

const describeEntity = (entity: DrawingEntity) =>
  entity instanceof PolymerBond ? 'bond' : (entity as BaseMonomer).label;

describe('DrawingEntitiesManager reads of the editor', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const open = (mode?: BaseMode) => {
    ({ canvas, editor } = createEditor(mode));

    return editor.drawingEntitiesManager;
  };

  afterEach(() => {
    jest.restoreAllMocks();
    editor.destroy();
    canvas.remove();
  });

  describe('selection events', () => {
    it('dispatches an empty selection when everything is unselected', () => {
      const dem = open(new FlexMode());
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      dem.selectDrawingEntities([a, b]);
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      dem.unselectAllDrawingEntities();

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith([]);
      expect([a.selected, b.selected]).toEqual([false, false]);
    });

    it('dispatches every entity when everything is selected', () => {
      const dem = open(new FlexMode());
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      dem.selectAllDrawingEntities();

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith([a, b]);
      expect([a.selected, b.selected]).toEqual([true, true]);
    });

    it('dispatches the requested entities and returns the expanded list in sequence mode', () => {
      const dem = open(new SequenceMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      const result = dem.getAllSelectedEntitiesForEntities([node!.sugar]);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith([node!.sugar]);
      expect(result.drawingEntities.map(describeEntity)).toEqual([
        'R',
        'A',
        'bond',
      ]);
    });

    it('returns only the requested entities in flex mode', () => {
      const dem = open(new FlexMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      const result = dem.getAllSelectedEntitiesForEntities([node!.sugar]);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith([node!.sugar]);
      expect(result.drawingEntities).toEqual([node!.sugar]);
    });

    it('selects one entity and dispatches the cleared selection once', () => {
      const dem = open(new FlexMode());
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      dem.selectDrawingEntity(b);
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      dem.selectDrawingEntity(a);

      expect(dispatch.mock.calls).toEqual([[[]]]);
      expect([a.selected, b.selected]).toEqual([true, false]);
    });

    it('selects a list of entities and dispatches the cleared selection once', () => {
      const dem = open(new FlexMode());
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      const c = addPeptide(editor, 'A', 6, 0);
      dem.selectDrawingEntity(c);
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');

      dem.selectDrawingEntities([a, b]);

      expect(dispatch.mock.calls).toEqual([[[]]]);
      expect([a.selected, b.selected, c.selected]).toEqual([true, true, false]);
    });
  });

  describe('selection by a shape depends on the mode', () => {
    // Model (0, 0) is canvas (0, 0) and model (3, 0) is canvas (120, 0).
    // The shapes cover monomer A and the middle of the bond A-B, not B.
    const topLeft = new Vec2(-20, -20);
    const bottomRight = new Vec2(80, 20);
    const polygon = [
      new Vec2(-20, -20),
      new Vec2(80, -20),
      new Vec2(80, 20),
      new Vec2(-20, 20),
    ];

    const buildPair = (mode: BaseMode) => {
      const dem = open(mode);
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      const bond = bondPeptides(editor, a, b);

      return { dem, a, b, bond };
    };

    it('selects a bond inside a rectangle in flex mode', () => {
      const { dem, a, b, bond } = buildPair(new FlexMode());

      dem.selectIfLocatedInRectangle(topLeft, bottomRight, []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        true,
      ]);
    });

    it('selects a bond in a rectangle only when both its monomers are selected in sequence mode', () => {
      const { dem, a, b, bond } = buildPair(new SequenceMode());

      dem.selectIfLocatedInRectangle(topLeft, bottomRight, []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        false,
      ]);

      dem.selectIfLocatedInRectangle(topLeft, new Vec2(200, 20), []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        true,
        true,
      ]);
    });

    it('selects a bond inside a polygon in flex mode', () => {
      const { dem, a, b, bond } = buildPair(new FlexMode());

      dem.selectIfLocatedInPolygon(polygon, []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        true,
      ]);
    });

    it('selects a bond in a polygon only when both its monomers are selected in sequence mode', () => {
      const { dem, a, b, bond } = buildPair(new SequenceMode());

      dem.selectIfLocatedInPolygon(polygon, []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        false,
      ]);
    });
  });

  describe('finishing a polymer bond', () => {
    const finishBond = (mode: BaseMode) => {
      const dem = open(mode);
      const a = addPeptide(editor, 'A', 0, 0);
      const b = addPeptide(editor, 'A', 3, 0);
      const { command, polymerBond } = dem.startPolymerBondCreation(
        a,
        a.position,
        b.position,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      );
      editor.renderersContainer.update(command);

      return dem.finishPolymerBondCreation(
        polymerBond,
        b,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
    };

    const recalculatesCanvasMatrix = (command: Command) =>
      command.operations.some(
        (operation) => operation instanceof RecalculateCanvasMatrixOperation,
      );

    it('recalculates the canvas matrix in snake mode', () => {
      expect(recalculatesCanvasMatrix(finishBond(new SnakeMode()))).toBe(true);
    });

    it('does not recalculate the canvas matrix in flex mode', () => {
      expect(recalculatesCanvasMatrix(finishBond(new FlexMode()))).toBe(false);
    });

    it('creates the bond between the two monomers', () => {
      const command = finishBond(new FlexMode());

      editor.renderersContainer.update(command);

      expect(editor.drawingEntitiesManager.polymerBondsArray).toHaveLength(1);
    });
  });

  describe('bonds overlapped by monomers', () => {
    it('flags an overlapped bond in flex mode', () => {
      const dem = open(new FlexMode());
      const { overlappedBond, clearBond } = addOverlapFixture(editor);

      dem.detectBondsOverlappedByMonomers();

      expect(overlappedBond.isOverlappedByMonomer).toBe(true);
      expect(clearBond.isOverlappedByMonomer).toBe(false);
    });

    it('flags nothing in sequence mode', () => {
      const dem = open(new SequenceMode());
      const { overlappedBond } = addOverlapFixture(editor);

      dem.detectBondsOverlappedByMonomers();

      expect(overlappedBond.isOverlappedByMonomer).toBe(false);
    });

    it('flags an overlapped bond when it is moved in flex mode', () => {
      const dem = open(new FlexMode());
      const { overlappedBond } = addOverlapFixture(editor);

      dem.moveDrawingEntityModelChange(overlappedBond);

      expect(overlappedBond.isOverlappedByMonomer).toBe(true);
    });

    it('flags nothing when a bond is moved in sequence mode', () => {
      const dem = open(new SequenceMode());
      const { overlappedBond } = addOverlapFixture(editor);

      dem.moveDrawingEntityModelChange(overlappedBond);

      expect(overlappedBond.isOverlappedByMonomer).toBe(false);
    });

    it('re-renders only the bonds whose overlap changed in flex mode', () => {
      const dem = open(new FlexMode());
      const { b, overlappedBond } = addOverlapFixture(editor);
      dem.selectDrawingEntity(b);
      const deleteBond = jest.spyOn(
        editor.renderersContainer,
        'deletePolymerBond',
      );
      const addBond = jest.spyOn(editor.renderersContainer, 'addPolymerBond');

      dem.rerenderBondsOverlappedByMonomers();

      expect(overlappedBond.isOverlappedByMonomer).toBe(true);
      expect(deleteBond.mock.calls).toEqual([[overlappedBond, false, false]]);
      expect(addBond.mock.calls).toEqual([[overlappedBond, false]]);
      expect(deleteBond.mock.invocationCallOrder[0]).toBeLessThan(
        addBond.mock.invocationCallOrder[0],
      );

      dem.rerenderBondsOverlappedByMonomers();

      expect(deleteBond).toHaveBeenCalledTimes(1);
      expect(addBond).toHaveBeenCalledTimes(1);
    });

    it('does not touch the renderers in sequence mode', () => {
      const dem = open(new SequenceMode());
      const { b, overlappedBond } = addOverlapFixture(editor);
      dem.selectDrawingEntity(b);
      const deleteBond = jest.spyOn(
        editor.renderersContainer,
        'deletePolymerBond',
      );
      const addBond = jest.spyOn(editor.renderersContainer, 'addPolymerBond');

      dem.rerenderBondsOverlappedByMonomers();

      expect(deleteBond).not.toHaveBeenCalled();
      expect(addBond).not.toHaveBeenCalled();
      expect(overlappedBond.isOverlappedByMonomer).toBe(false);
    });
  });

  describe('selection of a single entity depends on the mode', () => {
    it('adds the base and the bond to a nucleotide sugar in sequence mode', () => {
      const dem = open(new SequenceMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;

      const result = dem.getAllSelectedEntitiesForSingleEntity(node!.sugar);

      expect(result.drawingEntities.map(describeEntity)).toEqual([
        'R',
        'A',
        'bond',
      ]);
      expect(node!.monomers.map((monomer) => monomer.selected)).toEqual([
        true,
        true,
        false,
      ]);
    });

    it('returns only the entity itself in flex mode', () => {
      const dem = open(new FlexMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;

      const result = dem.getAllSelectedEntitiesForSingleEntity(node!.sugar);

      expect(result.drawingEntities).toEqual([node!.sugar]);
      expect(node!.monomers.map((monomer) => monomer.selected)).toEqual([
        true,
        false,
        false,
      ]);
    });
  });

  describe('antisense creation', () => {
    const selectNucleotide = (dem: ReturnType<typeof open>) => {
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;
      dem.selectDrawingEntities(node!.monomers);
    };

    it('reinitializes the mode after creating an antisense in sequence mode', () => {
      const dem = open(new SequenceMode());
      selectNucleotide(dem);

      const command = dem.createAntisenseChain(false);

      expect(command.operations.at(-1)).toBeInstanceOf(
        ReinitializeModeOperation,
      );
    });

    it('does not reinitialize the mode after creating an antisense in flex mode', () => {
      const dem = open(new FlexMode());
      selectNucleotide(dem);

      const command = dem.createAntisenseChain(false);

      expect(
        command.operations.some(
          (operation) => operation instanceof ReinitializeModeOperation,
        ),
      ).toBe(false);
      expect(dem.monomers.size).toBe(6);
    });

    it('reports a selected monomer that has no R2', () => {
      const dem = open(new FlexMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;
      const pyrro = addPeptide(editor, 'Pyrro', 3, 0);
      dem.createPolymerBond(
        node!.phosphate,
        pyrro,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      dem.selectDrawingEntities([...node!.monomers, pyrro]);
      const error = jest.spyOn(editor.events.error, 'dispatch');

      dem.createAntisenseChain(false);

      expect(error.mock.calls).toEqual([
        [
          'Monomer Pyrro does not have attachment point R2. Antisense was not created for this monomer.',
        ],
      ]);
    });

    it('reports a previous monomer that has no R1', () => {
      const dem = open(new FlexMode());
      const node = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0))?.node;
      const middle = addPeptide(editor, 'A', 3, 0);
      // Bua- has no R1 in the library, yet a bond can be set on it.
      const last = addPeptide(editor, 'Bua-', 6, 0);
      dem.createPolymerBond(
        node!.phosphate,
        middle,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      dem.createPolymerBond(
        middle,
        last,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      dem.selectDrawingEntities([...node!.monomers, middle, last]);
      const error = jest.spyOn(editor.events.error, 'dispatch');

      dem.createAntisenseChain(false);

      expect(error.mock.calls).toEqual([
        [
          'Monomer Bua- does not have attachment point R1. Antisense was not created for this monomer.',
        ],
      ]);
    });
  });

  describe('snake layout', () => {
    // Draws everything the way the editor does, so that the layout can move it.
    const buildSenseWithAntisenseAndMolecule = () => {
      const dem = open(new FlexMode());
      const first = Nucleotide.createOnCanvas(editor, 'A', new Vec2(0, 0));
      const second = Nucleotide.createOnCanvas(editor, 'C', new Vec2(3, 0));
      editor.renderersContainer.update(first!.modelChanges);
      editor.renderersContainer.update(second!.modelChanges);
      const bond = dem.createPolymerBond(
        first!.node.phosphate,
        second!.node.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      editor.renderersContainer.update(bond);
      dem.selectDrawingEntities([
        ...first!.node.monomers,
        ...second!.node.monomers,
      ]);
      editor.renderersContainer.update(dem.createAntisenseChain(false));
      dem.unselectAllDrawingEntities();
      editor.renderersContainer.update(
        deserializeKet(ETHANE_KET).mergeInto(dem).command,
      );

      return dem;
    };

    const positions = (dem: ReturnType<typeof open>) => [
      ...dem.monomersArray
        .filter((monomer) => !dem.molecules.includes(monomer))
        .map((monomer) => [
          monomer.label,
          monomer.position.x,
          monomer.position.y,
        ]),
      ...[...dem.atoms.values()].map((atom) => [
        `atom ${atom.label}`,
        atom.position.x,
        atom.position.y,
      ]),
    ];

    it('lays chains and molecules out by the canvas width in snake mode', () => {
      const dem = buildSenseWithAntisenseAndMolecule();

      editor.renderersContainer.update(dem.applySnakeLayout(true));

      expect(positions(dem)).toEqual([
        ['A', 1.25, 2.75],
        ['R', 1.25, 1.25],
        ['P', 2.75, 1.25],
        ['C', 4.25, 2.75],
        ['R', 4.25, 1.25],
        ['P', 5.75, 1.25],
        ['P', 5.75, 5.75],
        ['R', 4.25, 5.75],
        ['G', 4.25, 4.25],
        ['R', 1.25, 5.75],
        ['U', 1.25, 4.25],
        ['P', 2.75, 5.75],
        ['atom C', -0.125, 8.175],
        ['atom C', 0.875, 8.175],
      ]);
    });

    it('leaves positions as they were when snake mode is off', () => {
      const dem = buildSenseWithAntisenseAndMolecule();
      const before = positions(dem);

      dem.applySnakeLayout(false);

      expect(positions(dem)).toEqual(before);
    });
  });

  describe('view model on merge', () => {
    it('initializes the view model with the bonds of the target after merging into it', () => {
      const dem = open(new FlexMode());
      const initialize = jest.spyOn(editor.viewModel, 'initialize');
      const deserialized = deserializeKet(ETHANE_KET);

      const { mergedDrawingEntities } = deserialized.mergeInto(dem);

      expect(initialize).toHaveBeenCalledTimes(1);
      expect(initialize).toHaveBeenCalledWith([...dem.bonds.values()]);
      expect(dem.bonds.size).toBe(1);
      expect(mergedDrawingEntities.monomers.size).toBe(1);
      expect(mergedDrawingEntities.atoms.size).toBe(2);
      expect(mergedDrawingEntities.bonds.size).toBe(1);
    });

    it('initializes the view model with the bonds of a detached clone', () => {
      const dem = open(new FlexMode());
      deserializeKet(ETHANE_KET).mergeInto(dem);
      const a = addPeptide(editor, 'A', 0, 5);
      const b = addPeptide(editor, 'A', 3, 5);
      bondPeptides(editor, a, b);
      const clone = makeDetachedManager();
      const initialize = jest.spyOn(editor.viewModel, 'initialize');

      const { mergedDrawingEntities } = dem.mergeInto(clone);

      expect(initialize).toHaveBeenCalledTimes(1);
      expect(initialize).toHaveBeenCalledWith([...clone.bonds.values()]);
      expect(clone.bonds.size).toBe(1);
      expect(clone.monomers.size).toBe(3);
      expect(mergedDrawingEntities.monomers.size).toBe(3);
      expect(mergedDrawingEntities.polymerBonds.size).toBe(1);
    });
  });

  describe('canvas offset', () => {
    beforeEach(() => {
      open(new FlexMode());
      editor.canvasOffset = { width: 800, height: 600 } as DOMRect;
    });

    it('takes the center of the canvas from the canvas offset', () => {
      const center =
        editor.drawingEntitiesManager.getCurrentCenterPointOfCanvas();

      expect([center.x, center.y]).toEqual([400, 300]);
    });

    it('moves a detached structure to the center of the canvas', () => {
      const detached = deserializeKet(ETHANE_KET);

      centerDetached(detached, editor);

      expect(
        detached.monomersArray.map((monomer) => [
          monomer.position.x,
          monomer.position.y,
        ]),
      ).toEqual([[10, 7.5]]);
    });
  });

  describe('renderers', () => {
    let dem: ReturnType<typeof open>;

    beforeEach(() => {
      dem = open(new FlexMode());
      deserializeKet(ETHANE_KET).mergeInto(dem);
      const a = addPeptide(editor, 'A', 0, 5);
      const b = addPeptide(editor, 'A', 3, 5);
      bondPeptides(editor, a, b);
    });

    const spyOnRenderers = () => {
      const container = editor.renderersContainer;

      return {
        deleteMonomer: jest.spyOn(container, 'deleteMonomer'),
        addMonomer: jest.spyOn(container, 'addMonomer'),
        deletePolymerBond: jest.spyOn(container, 'deletePolymerBond'),
        addPolymerBond: jest.spyOn(container, 'addPolymerBond'),
        deleteAtom: jest.spyOn(container, 'deleteAtom'),
        addAtom: jest.spyOn(container, 'addAtom'),
        deleteBond: jest.spyOn(container, 'deleteBond'),
        addBond: jest.spyOn(container, 'addBond'),
      };
    };

    const counts = (spies: ReturnType<typeof spyOnRenderers>) =>
      Object.fromEntries(
        Object.entries(spies).map(([name, spy]) => [
          name,
          spy.mock.calls.length,
        ]),
      );

    it('deletes every drawn entity and clears the sequence when the canvas is cleared', () => {
      const spies = spyOnRenderers();
      const clear = jest.spyOn(SequenceRenderer, 'clear');

      dem.clearCanvas();

      expect(counts(spies)).toEqual({
        deleteMonomer: 3,
        addMonomer: 0,
        deletePolymerBond: 1,
        addPolymerBond: 0,
        deleteAtom: 2,
        addAtom: 0,
        deleteBond: 1,
        addBond: 0,
      });
      expect(clear).toHaveBeenCalledTimes(1);
    });

    it('redraws every atom and bond of molecules, deleting before adding', () => {
      const spies = spyOnRenderers();

      dem.rerenderMolecules();

      expect(counts(spies)).toEqual({
        deleteMonomer: 0,
        addMonomer: 0,
        deletePolymerBond: 0,
        addPolymerBond: 0,
        deleteAtom: 2,
        addAtom: 2,
        deleteBond: 1,
        addBond: 1,
      });
      expect(spies.deleteAtom.mock.invocationCallOrder[0]).toBeLessThan(
        spies.addAtom.mock.invocationCallOrder[0],
      );
      expect(spies.deleteBond.mock.invocationCallOrder[0]).toBeLessThan(
        spies.addBond.mock.invocationCallOrder[0],
      );
    });

    it('redraws every monomer and polymer bond when flex layout is applied', () => {
      const spies = spyOnRenderers();

      const command = dem.applyFlexLayoutMode();

      expect(command).toBeInstanceOf(Command);
      expect(counts(spies)).toEqual({
        deleteMonomer: 3,
        addMonomer: 3,
        deletePolymerBond: 1,
        addPolymerBond: 1,
        deleteAtom: 2,
        addAtom: 2,
        deleteBond: 1,
        addBond: 1,
      });
      expect(spies.deleteMonomer.mock.invocationCallOrder[0]).toBeLessThan(
        spies.addMonomer.mock.invocationCallOrder[0],
      );
      expect(spies.deletePolymerBond.mock.invocationCallOrder[0]).toBeLessThan(
        spies.addPolymerBond.mock.invocationCallOrder[0],
      );
    });
  });

  describe('after the editor is destroyed', () => {
    let dem: ReturnType<typeof open>;
    let overlappedBond: PolymerBond;

    beforeEach(() => {
      dem = open(new FlexMode());
      deserializeKet(ETHANE_KET).mergeInto(dem);
      ({ overlappedBond } = addOverlapFixture(editor));
      dem.detectBondsOverlappedByMonomers();
      editor.destroy();
    });

    it('detects overlaps as none without throwing', () => {
      expect(overlappedBond.isOverlappedByMonomer).toBe(true);

      expect(() => dem.detectBondsOverlappedByMonomers()).not.toThrow();

      expect(overlappedBond.isOverlappedByMonomer).toBe(false);
    });

    it.each([
      ['clearCanvas', () => dem.clearCanvas()],
      ['rerenderMolecules', () => dem.rerenderMolecules()],
      ['applyFlexLayoutMode', () => dem.applyFlexLayoutMode()],
      ['applySnakeLayout', () => dem.applySnakeLayout(true)],
      [
        'getCurrentCenterPointOfCanvas',
        () => dem.getCurrentCenterPointOfCanvas(),
      ],
    ])('throws from %s', (_name, call) => {
      expect(call).toThrow();
    });
  });
});
