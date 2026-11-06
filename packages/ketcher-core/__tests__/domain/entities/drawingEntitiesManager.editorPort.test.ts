import {
  CoreEditor,
  FlexMode,
  SequenceMode,
  SnakeMode,
} from 'application/editor';
import type { BaseMode } from 'application/editor/modes/BaseMode';
import { resetEditorInstance } from 'application/editor/editorSingleton';
import { BaseMonomer, Vec2 } from 'domain/entities';
import type { Command } from 'domain/entities/Command';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  type EditorPort,
  MissingEditorError,
} from 'domain/entities/EditorPort';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName } from 'domain/types';
import { Subscription } from 'subscription';
import { SettingsManager } from 'utilities';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { peptideMonomerItem } from '../../mock-data';
import { createRenderersManager } from '../../helpers/dom';
import {
  addOverlapFixture,
  addPeptide,
  createEditor,
  deserializeKet,
  ETHANE_KET,
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

const createFakePort = (overrides: Partial<EditorPort> = {}): EditorPort => ({
  events: { selectEntities: new Subscription(), error: new Subscription() },
  mode: { modeName: 'flex-layout-mode' },
  canvasWidth: 500,
  macroModeScale: 40,
  canvasOffset: { width: 800, height: 600 },
  viewModel: { initialize: jest.fn() },
  renderersContainer: createRenderersManager(),
  monomersLibrary: [],
  sequenceRenderer: { show: jest.fn(), clear: jest.fn() },
  ...overrides,
});

type Draw = (command: Command) => void;

const noDraw: Draw = () => undefined;

const addPeptideAt = (
  dem: DrawingEntitiesManager,
  x: number,
  y: number,
  draw: Draw = noDraw,
) => {
  const command = dem.addMonomer(peptideMonomerItem, new Vec2(x, y));

  draw(command);

  return command.operations[0].monomer as BaseMonomer;
};

const bondPeptides = (
  dem: DrawingEntitiesManager,
  first: BaseMonomer,
  second: BaseMonomer,
  draw: Draw = noDraw,
) => {
  const command = dem.createPolymerBond(
    first,
    second,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );

  draw(command);

  return command.operations[0].polymerBond as PolymerBond;
};

// Three peptides on one horizontal line, joined A-C. B sits 0.1 off the line,
// so it overlaps the bond A-C.
const buildOverlapFixture = (dem: DrawingEntitiesManager) => {
  const a = addPeptideAt(dem, 0, 0);
  const b = addPeptideAt(dem, 2, 0.1);
  const c = addPeptideAt(dem, 4, 0);

  return { a, b, c, bond: bondPeptides(dem, a, c) };
};

const buildChain = (dem: DrawingEntitiesManager) =>
  bondPeptides(dem, addPeptideAt(dem, 0, 0), addPeptideAt(dem, 3, 0));

const atomPositions = (dem: DrawingEntitiesManager) =>
  [...dem.atoms.values()].map((atom) => [atom.position.x, atom.position.y]);

describe('DrawingEntitiesManager takes its editor as a port', () => {
  const editors: Array<{ editor: CoreEditor; canvas: SVGSVGElement }> = [];

  const open = (mode?: BaseMode) => {
    const created = createEditor(mode);

    editors.push(created);

    return created;
  };

  beforeEach(() => {
    resetEditorInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    editors.splice(0).forEach(({ editor, canvas }) => {
      editor.destroy();
      canvas.remove();
    });
  });

  describe('with a fake port and no editor anywhere', () => {
    it('dispatches selection events on the events of the port', () => {
      const port = createFakePort();
      const dispatch = jest.spyOn(port.events.selectEntities, 'dispatch');
      const dem = new DrawingEntitiesManager({ editor: port });
      const { a, b } = buildOverlapFixture(dem);

      dem.selectAllDrawingEntities();

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0]).toEqual(expect.arrayContaining([a, b]));
    });

    it('follows the mode of the port', () => {
      const flexPort = createFakePort();
      const sequencePort = createFakePort({
        mode: { modeName: 'sequence-layout-mode' },
      });
      const rerenderCount = (port: EditorPort) => {
        const deleteBond = jest
          .spyOn(port.renderersContainer, 'deletePolymerBond')
          .mockImplementation(() => undefined);
        jest
          .spyOn(port.renderersContainer, 'addPolymerBond')
          .mockImplementation(() => undefined);
        const dem = new DrawingEntitiesManager({ editor: port });
        const { b } = buildOverlapFixture(dem);
        dem.selectDrawingEntities([b]);

        dem.rerenderBondsOverlappedByMonomers();

        return deleteBond.mock.calls.length;
      };

      expect(rerenderCount(flexPort)).toBe(1);
      expect(rerenderCount(sequencePort)).toBe(0);
    });

    it('lays molecules out by the macro mode scale of the port', () => {
      // The renderers read the last created editor, so one must exist.
      const { editor } = open(new SnakeMode());
      const layoutWith = (macroModeScale: number) => {
        const dem = new DrawingEntitiesManager({
          editor: createFakePort({ macroModeScale }),
        });
        buildChain(dem);
        editor.renderersContainer.update(
          deserializeKet(ETHANE_KET).mergeInto(dem).command,
        );
        editor.renderersContainer.update(dem.applySnakeLayout(true));

        return atomPositions(dem);
      };

      // The molecule sits a quarter of a layout cell inside its box corner:
      // 60 / 40 / 4 = 0.375 Angstroms at scale 40 and 0.75 at scale 20.
      const [[x40]] = layoutWith(40);
      const [[x20]] = layoutWith(20);

      expect(x40 - x20).toBeCloseTo(0.375);
    });

    it('derives the snake line length from the canvas width of the port', () => {
      const lineLengthFor = (canvasWidth: number) => {
        SettingsManager.editorLineLength = { 'snake-layout-mode': 0 };
        const dem = new DrawingEntitiesManager({
          editor: createFakePort({ canvasWidth }),
        });
        buildChain(dem);

        dem.applySnakeLayout(true);

        return SettingsManager.editorLineLength['snake-layout-mode'];
      };

      // (width - one 60 px cell) / 60 px, rounded down.
      expect(lineLengthFor(600)).toBe(9);
      expect(lineLengthFor(300)).toBe(4);
    });

    it('shows and clears the sequence view through the renderer of the port', () => {
      const staticShow = jest.spyOn(SequenceRenderer, 'show');
      const staticClear = jest.spyOn(SequenceRenderer, 'clear');
      const port = createFakePort();
      const dem = new DrawingEntitiesManager({ editor: port });
      addPeptideAt(dem, 0, 0);

      const chains = dem.applyMonomersSequenceLayout();
      dem.clearCanvas();

      expect(chains).toBeInstanceOf(ChainsCollection);
      expect(port.sequenceRenderer.show).toHaveBeenCalledTimes(1);
      expect(jest.mocked(port.sequenceRenderer.show).mock.calls[0][0]).toBe(
        chains,
      );
      expect(port.sequenceRenderer.clear).toHaveBeenCalledTimes(1);
      expect(staticShow).not.toHaveBeenCalled();
      expect(staticClear).not.toHaveBeenCalled();
    });
  });

  describe('with no deps and no editor anywhere', () => {
    let dem: DrawingEntitiesManager;

    beforeEach(() => {
      dem = new DrawingEntitiesManager();
      buildChain(dem);
    });

    it('still changes the selection without dispatching', () => {
      const { a, b } = buildOverlapFixture(dem);

      expect(() => dem.selectAllDrawingEntities()).not.toThrow();
      expect([a.selected, b.selected]).toEqual([true, true]);

      expect(() => dem.unselectAllDrawingEntities()).not.toThrow();
      expect([a.selected, b.selected]).toEqual([false, false]);
    });

    it('treats the mode as neither sequence nor snake', () => {
      const bare = new DrawingEntitiesManager();
      // Drawn by an editor in sequence mode that the manager must not consult.
      const { editor } = open(new SequenceMode());
      const draw: Draw = (command) => editor.renderersContainer.update(command);
      const a = addPeptideAt(bare, 0, 10, draw);
      const b = addPeptideAt(bare, 3, 10, draw);
      const bond = bondPeptides(bare, a, b, draw);
      resetEditorInstance();
      // Model (0, 10) is canvas (0, 400); the shapes cover A and the middle
      // of the bond A-B, not B.
      const topLeft = new Vec2(-20, 380);
      const bottomRight = new Vec2(80, 420);

      bare.selectIfLocatedInRectangle(topLeft, bottomRight, []);

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        true,
      ]);

      bare.unselectAllDrawingEntities();
      bare.selectIfLocatedInPolygon(
        [
          topLeft,
          new Vec2(bottomRight.x, topLeft.y),
          bottomRight,
          new Vec2(topLeft.x, bottomRight.y),
        ],
        [],
      );

      expect([a.selected, b.selected, bond.selected]).toEqual([
        true,
        false,
        true,
      ]);
      expect(
        bare.getAllSelectedEntitiesForSingleEntity(b).drawingEntities,
      ).toEqual([b]);
    });

    it('detects no overlapped bond', () => {
      const { bond } = buildOverlapFixture(dem);

      dem.detectBondsOverlappedByMonomers();

      expect(bond.isOverlappedByMonomer).toBe(false);
    });

    it.each([
      [
        'clearCanvas',
        (manager: DrawingEntitiesManager) => manager.clearCanvas(),
      ],
      [
        'rerenderMolecules',
        (manager: DrawingEntitiesManager) => manager.rerenderMolecules(),
      ],
      [
        'applyFlexLayoutMode',
        (manager: DrawingEntitiesManager) => manager.applyFlexLayoutMode(),
      ],
      [
        'applySnakeLayout',
        (manager: DrawingEntitiesManager) => manager.applySnakeLayout(true),
      ],
      [
        'createAntisenseChain',
        (manager: DrawingEntitiesManager) => manager.createAntisenseChain(true),
      ],
    ])('throws MissingEditorError that names %s', (method, call) => {
      expect(() => call(dem)).toThrow(MissingEditorError);
      expect(() => call(dem)).toThrow(method);
    });
  });

  describe('with two editors alive', () => {
    it('follows the mode of the editor that created the manager', () => {
      const editorB = open(new FlexMode()).editor;
      const editorA = open(new SequenceMode()).editor;
      const node = Nucleotide.createOnCanvas(
        editorA,
        'A',
        new Vec2(0, 0),
      )?.node;

      const inA =
        editorA.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
          node!.sugar,
        );
      const inB =
        editorB.drawingEntitiesManager.getAllSelectedEntitiesForSingleEntity(
          node!.sugar,
        );

      expect(inA.drawingEntities).toHaveLength(3);
      expect(inB.drawingEntities).toEqual([node!.sugar]);
    });

    it('draws on the renderers of the editor that created the manager', () => {
      const { editor: editorA } = open(new FlexMode());
      const { editor: editorB } = open(new FlexMode());
      addPeptide(editorA, 'A', 0, 0);
      addPeptide(editorB, 'A', 0, 0);
      const deleteInA = jest.spyOn(editorA.renderersContainer, 'deleteMonomer');
      const deleteInB = jest.spyOn(editorB.renderersContainer, 'deleteMonomer');

      editorA.drawingEntitiesManager.clearCanvas();

      expect(deleteInA).toHaveBeenCalledTimes(1);
      expect(deleteInB).not.toHaveBeenCalled();

      editorB.drawingEntitiesManager.clearCanvas();

      expect(deleteInA).toHaveBeenCalledTimes(1);
      expect(deleteInB).toHaveBeenCalledTimes(1);
    });
  });

  describe('after the editor is destroyed', () => {
    it('behaves as a manager without an editor', () => {
      const { editor } = open(new FlexMode());
      const dem = editor.drawingEntitiesManager;
      const { overlappedBond } = addOverlapFixture(editor);
      dem.detectBondsOverlappedByMonomers();
      expect(overlappedBond.isOverlappedByMonomer).toBe(true);
      const dispatch = jest.spyOn(editor.events.selectEntities, 'dispatch');
      editor.destroy();

      dem.selectAllDrawingEntities();
      dem.unselectAllDrawingEntities();
      dem.getAllSelectedEntitiesForEntities([overlappedBond]);
      dem.detectBondsOverlappedByMonomers();

      expect(dispatch).not.toHaveBeenCalled();
      expect(overlappedBond.isOverlappedByMonomer).toBe(false);
    });

    it.each([
      [
        'clearCanvas',
        (manager: DrawingEntitiesManager) => manager.clearCanvas(),
      ],
      [
        'rerenderMolecules',
        (manager: DrawingEntitiesManager) => manager.rerenderMolecules(),
      ],
      [
        'applyFlexLayoutMode',
        (manager: DrawingEntitiesManager) => manager.applyFlexLayoutMode(),
      ],
      [
        'applySnakeLayout',
        (manager: DrawingEntitiesManager) => manager.applySnakeLayout(true),
      ],
      [
        'getCurrentCenterPointOfCanvas',
        (manager: DrawingEntitiesManager) =>
          manager.getCurrentCenterPointOfCanvas(),
      ],
    ])('throws MissingEditorError from %s', (_method, call) => {
      const { editor } = open(new FlexMode());
      const dem = editor.drawingEntitiesManager;
      addPeptide(editor, 'A', 0, 0);
      editor.destroy();

      expect(() => call(dem)).toThrow(MissingEditorError);
    });
  });

  describe('managers made by a manager', () => {
    it('keeps the editor of the manager that filtered the selection', () => {
      const { editor } = open(new FlexMode());
      const monomer = addPeptide(editor, 'A', 0, 0);
      editor.drawingEntitiesManager.selectDrawingEntities([monomer]);
      const deleteMonomer = jest.spyOn(
        editor.renderersContainer,
        'deleteMonomer',
      );
      const filtered = editor.drawingEntitiesManager.filterSelection();

      filtered.applyFlexLayoutMode();

      expect(deleteMonomer).toHaveBeenCalledTimes(1);
      expect(() =>
        new DrawingEntitiesManager().filterSelection().applyFlexLayoutMode(),
      ).toThrow(MissingEditorError);
    });

    it('gives a merge result the editor of its target', () => {
      const { editor } = open(new FlexMode());
      const deleteAtom = jest.spyOn(editor.renderersContainer, 'deleteAtom');

      const { mergedDrawingEntities } = deserializeKet(ETHANE_KET).mergeInto(
        editor.drawingEntitiesManager,
      );
      mergedDrawingEntities.clearCanvas();

      expect(deleteAtom).toHaveBeenCalledTimes(2);
      expect(() =>
        deserializeKet(ETHANE_KET)
          .mergeInto(new DrawingEntitiesManager())
          .mergedDrawingEntities.clearCanvas(),
      ).toThrow(MissingEditorError);
    });

    it('initializes the view model of the editor when merging into an empty sibling', () => {
      const { editor } = open(new FlexMode());
      const initialize = jest.spyOn(editor.viewModel, 'initialize');
      deserializeKet(ETHANE_KET).mergeInto(editor.drawingEntitiesManager);
      initialize.mockClear();

      const sibling = editor.drawingEntitiesManager.createEmptySibling();
      const { mergedDrawingEntities } =
        editor.drawingEntitiesManager.mergeInto(sibling);

      expect(initialize).toHaveBeenCalledTimes(1);
      expect(initialize).toHaveBeenCalledWith([...sibling.bonds.values()]);
      expect(sibling.atoms.size).toBe(2);
      expect(mergedDrawingEntities.atoms.size).toBe(2);
    });

    it('merges into the sibling of a bare manager without touching any view model', () => {
      const { editor } = open(new FlexMode());
      const initialize = jest.spyOn(editor.viewModel, 'initialize');
      const bare = new DrawingEntitiesManager();
      deserializeKet(ETHANE_KET).mergeInto(bare);

      const sibling = bare.createEmptySibling();
      const { mergedDrawingEntities } = bare.mergeInto(sibling);

      expect(initialize).not.toHaveBeenCalled();
      expect(sibling.atoms.size).toBe(2);
      expect(mergedDrawingEntities.atoms.size).toBe(2);
    });
  });

  describe('merging into a target with no editor', () => {
    it('merges and leaves the view model of any editor alone', () => {
      const { editor } = open(new FlexMode());
      const initialize = jest.spyOn(editor.viewModel, 'initialize');
      const target = new DrawingEntitiesManager();

      const { mergedDrawingEntities } =
        deserializeKet(ETHANE_KET).mergeInto(target);

      expect(initialize).not.toHaveBeenCalled();
      expect(target.monomers.size).toBe(1);
      expect(target.atoms.size).toBe(2);
      expect(target.bonds.size).toBe(1);
      expect(mergedDrawingEntities.bonds.size).toBe(1);
    });
  });

  describe('the viewport of the caller', () => {
    it('takes the center of the canvas from the viewport that is passed', () => {
      const bare = new DrawingEntitiesManager();

      const center = bare.getCurrentCenterPointOfCanvas({
        width: 800,
        height: 600,
      });

      expect([center.x, center.y]).toEqual([400, 300]);
    });

    it('moves a bare structure to the center of the viewport that is passed', () => {
      const detached = deserializeKet(ETHANE_KET);

      detached.centerMacroStructure({ width: 800, height: 600 });

      expect(
        detached.monomersArray.map((monomer) => [
          monomer.position.x,
          monomer.position.y,
        ]),
      ).toEqual([[10, 7.5]]);
    });

    it('needs an editor when no viewport is passed to a bare manager', () => {
      const bare = new DrawingEntitiesManager();

      expect(() => bare.getCurrentCenterPointOfCanvas()).toThrow(
        MissingEditorError,
      );
      expect(() => deserializeKet(ETHANE_KET).centerMacroStructure()).toThrow(
        MissingEditorError,
      );
    });
  });
});
