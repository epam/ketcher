import { EditorHistory } from 'application/editor/EditorHistory';
import { CoreEditor, FlexMode } from 'application/editor';
import { Atom } from 'domain/entities/CoreAtom';
import { Vec2, type BaseMonomer } from 'domain/entities';
import { AtomLabel, SnakeLayoutCellWidth } from 'domain/constants';
import { Coordinates } from 'application/editor/shared/coordinates';
import { MONOMER_START_Y_POSITION } from 'domain/entities/DrawingEntitiesManager';
import { AttachmentPointName } from 'domain/types';
import { getStructureBbox } from 'domain/entities/structureBbox';
import { SettingsManager } from 'utilities';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

// Only browser APIs unavailable in jsdom are stubbed.
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

describe('Snake molecule row alignment (#8042)', () => {
  let editor: CoreEditor;
  let monomer: BaseMonomer;
  let previousLineLength: number;

  beforeEach(() => {
    previousLineLength = SettingsManager.editorLineLength['snake-layout-mode'];
    SettingsManager.editorLineLength = { 'snake-layout-mode': 18 };
    const canvas = createPolymerEditorCanvas();
    Object.defineProperty(canvas, 'width', {
      value: { baseVal: { value: 1600 } },
    });
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new FlexMode(),
    });
    const command = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 10),
    );
    editor.renderersContainer.update(command);
    monomer = command.operations[0].monomer as BaseMonomer;
  });

  afterEach(() => {
    SettingsManager.editorLineLength = {
      'snake-layout-mode': previousLineLength,
    };
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  const molecule = (height: number, connected = false): Atom[] => {
    const manager = editor.drawingEntitiesManager;
    const ownerCommand = manager.addMonomer(
      peptideMonomerItem,
      new Vec2(30, 30),
    );
    const owner = ownerCommand.operations[0].monomer as BaseMonomer;
    manager.monomers.delete(owner.id);
    const atoms = [new Vec2(20, 20), new Vec2(21, 20 + height)].map(
      (position, index) => {
        const command = manager.addAtom(position, owner, index, AtomLabel.C);
        editor.renderersContainer.update(command);
        return command.operations[0].atom as Atom;
      },
    );
    editor.renderersContainer.update(
      manager.addBond(atoms[0], atoms[1], 1, 0, 0),
    );
    if (connected) {
      manager.addMonomerToAtomBondChangeModel(
        monomer,
        atoms[0],
        monomer.attachmentPointsToBonds.R3
          ? AttachmentPointName.R2
          : AttachmentPointName.R3,
      );
    }
    return atoms;
  };

  const applyLayout = () => {
    const command = editor.drawingEntitiesManager.applySnakeLayout(true);
    editor.renderersContainer.update(command);
    return command;
  };

  const center = (atoms: Atom[]) => {
    const bbox = getStructureBbox(atoms);
    return (bbox.top + bbox.bottom) / 2;
  };
  const positions = (molecules: Atom[][]) =>
    molecules.flat().map(({ position }) => [position.x, position.y]);
  const expectPositions = (actual: number[][], expected: number[][]) => {
    actual.forEach((position, index) => {
      expect(position[0]).toBeCloseTo(expected[index][0], 10);
      expect(position[1]).toBeCloseTo(expected[index][1], 10);
    });
  };

  it('centers connected molecules of different heights in the same row', () => {
    const short = molecule(1, true);
    const tall = molecule(4, true);
    applyLayout();
    expect(center(short)).toBeCloseTo(center(tall), 10);
    expect(getStructureBbox(short).height).toBeCloseTo(1, 10);
    expect(getStructureBbox(tall).height).toBeCloseTo(4, 10);
  });

  it('centers unconnected molecules of different heights in the same row', () => {
    const short = molecule(1);
    const tall = molecule(4);
    applyLayout();
    expect(center(short)).toBeCloseTo(center(tall), 10);
  });

  it('uses each wrapped row tallest molecule, including zero-height molecules', () => {
    SettingsManager.editorLineLength = { 'snake-layout-mode': 4 };
    const first = molecule(1);
    const second = molecule(4);
    const third = molecule(0);
    const fourth = molecule(2);
    applyLayout();
    expect(center(first)).toBeCloseTo(center(second), 10);
    expect(center(third)).toBeCloseTo(center(fourth), 10);
    expect(center(third)).not.toBeCloseTo(center(first), 10);

    const cellHeight = Coordinates.canvasToModel(
      new Vec2(0, SnakeLayoutCellWidth),
    ).y;
    const firstRowOrigin = Coordinates.canvasToModel(
      new Vec2(0, MONOMER_START_Y_POSITION + SnakeLayoutCellWidth),
    ).y;
    // Height 4 reserves four cells; the next molecule row starts after them.
    const secondRowOrigin = firstRowOrigin + 4 * cellHeight;
    const padding = cellHeight / 4;
    expect(center(first)).toBeCloseTo(firstRowOrigin - padding + 4 / 2, 10);
    expect(center(third)).toBeCloseTo(secondRowOrigin - padding + 2 / 2, 10);
    expect(getStructureBbox(second).top).toBeCloseTo(
      firstRowOrigin - padding,
      10,
    );
    expect(getStructureBbox(fourth).top).toBeCloseTo(
      secondRowOrigin - padding,
      10,
    );
  });

  it('keeps layout stable and restores positions through movement undo/redo', () => {
    const molecules = [molecule(1), molecule(4)];
    const before = positions(molecules);
    const command = applyLayout();
    const after = positions(molecules);
    expect(after).not.toEqual(before);
    const history = EditorHistory.getInstance(editor);
    history.update(command);
    history.undo();
    expectPositions(positions(molecules), before);
    history.redo();
    expectPositions(positions(molecules), after);
    applyLayout();
    expectPositions(positions(molecules), after);
  });

  it('restores centered positions when redoing a switch from Flex to Snake', () => {
    const molecules = [molecule(1), molecule(4)];
    const before = positions(molecules);
    const history = EditorHistory.getInstance(editor);
    editor.events.selectMode.dispatch('snake-layout-mode');
    expect(history.historyPointer).toBe(1);
    expect(editor.mode.modeName).toBe('snake-layout-mode');
    const after = positions(molecules);
    expect(after).not.toEqual(before);

    history.undo();
    expect(editor.mode.modeName).toBe('flex-layout-mode');
    expectPositions(positions(molecules), before);
    history.redo();
    expect(editor.mode.modeName).toBe('snake-layout-mode');
    expectPositions(positions(molecules), after);
    expect(center(molecules[0])).toBeCloseTo(center(molecules[1]), 10);
  });
});
