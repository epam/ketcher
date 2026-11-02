import { CoreEditor, EditorHistory } from 'application/editor';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { MacromoleculesConverter } from 'domain/helpers/MacromoleculesConverter';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';
import { SnakeLayoutCellWidth } from 'domain/constants';
import {
  MONOMER_START_X_POSITION,
  MONOMER_START_Y_POSITION,
} from 'domain/entities/DrawingEntitiesManager';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import type { Sugar } from 'domain/entities/Sugar';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { AttachmentPointName } from 'domain/types';
import { SettingsManager } from 'utilities';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

// Pins the positions that DrawingEntitiesManager.applySnakeLayout produces for
// antisense chains and for molecules. Positions are model coordinates
// (angstroms): canvas pixels divided by editorSettings.macroModeScale.
// Numbers marked "pinned from the code at cf8b6cc8ff" have no stated rule; they
// record the behavior of that commit.

const testRenderTheme = {
  monomer: {
    color: {
      X: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
    },
  },
};

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

const DEFAULT_MACRO_MODE_SCALE = 40;
const LINE_LENGTH = 8;

const createNucleotideNode = (
  editor: CoreEditor,
  base: string,
  position: Vec2,
) => {
  const created = Nucleotide.createOnCanvas(editor, base, position);

  if (!created) {
    throw new Error(`Fixture setup failed: nucleotide ${base} not created`);
  }

  return created.node;
};

// Sense A-C chain with an antisense chain joined to it by hydrogen bonds.
const buildDuplex = (editor: CoreEditor) => {
  const drawingEntitiesManager = editor.drawingEntitiesManager;
  const sense = ['A', 'C'].map((base, index) =>
    createNucleotideNode(editor, base, new Vec2(index * 1.6, 0)),
  );

  drawingEntitiesManager.createPolymerBond(
    sense[0].phosphate,
    sense[1].sugar,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );
  drawingEntitiesManager.selectDrawingEntities([
    ...drawingEntitiesManager.monomers.values(),
  ]);
  drawingEntitiesManager.createAntisenseChain(false);
  drawingEntitiesManager.unselectAllDrawingEntities();

  const antisense = sense.map((senseNucleotide) => {
    const antisenseBase =
      senseNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        senseNucleotide.rnaBase,
      ) as RNABase;

    return Nucleotide.fromSugar(
      getSugarFromRnaBase(antisenseBase) as Sugar,
      false,
    );
  });

  return { sense, antisense };
};

// Two molecules of two bonded atoms each, one angstrom wide. Their coordinates
// are non-zero on purpose: getStructureBbox treats a 0 coordinate as unset.
const addTwoMolecules = (editor: CoreEditor) => {
  const struct = new Struct();
  const addMolecule = (origin: Vec2) => {
    const first = struct.atoms.add(new Atom({ label: 'C', pp: origin }));
    const second = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(origin.x + 1, origin.y) }),
    );

    struct.bonds.add(
      new Bond({ begin: first, end: second, type: Bond.PATTERN.TYPE.SINGLE }),
    );
  };

  addMolecule(new Vec2(3, 2));
  addMolecule(new Vec2(10, 12));
  struct.markFragments();
  MacromoleculesConverter.convertStructToDrawingEntities(
    struct,
    editor.drawingEntitiesManager,
  );

  const atoms = [...editor.drawingEntitiesManager.atoms.values()];

  return {
    firstMolecule: atoms.slice(0, 2),
    secondMolecule: atoms.slice(2, 4),
  };
};

describe('DrawingEntitiesManager.applySnakeLayout', () => {
  const initialMacroModeScale = provideEditorSettings().macroModeScale;
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const layoutAtScale = (macroModeScale: number) => {
    provideEditorSettings().macroModeScale = macroModeScale;

    const command = editor.drawingEntitiesManager.applySnakeLayout(true);

    // Atoms move through operations. Executing them changes the model only.
    command.operations.forEach((operation) =>
      operation.execute(editor.renderersContainer),
    );
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    Object.defineProperty(canvas, 'width', {
      configurable: true,
      value: { baseVal: { value: 500 } },
    });
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
    });
    jest
      .spyOn(SettingsManager, 'editorLineLength', 'get')
      .mockReturnValue({ 'snake-layout-mode': LINE_LENGTH } as never);
  });

  afterEach(() => {
    provideEditorSettings().macroModeScale = initialMacroModeScale;
    jest.restoreAllMocks();
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  describe('antisense chain', () => {
    it.each([DEFAULT_MACRO_MODE_SCALE, 20])(
      'puts each antisense monomer in the column of its sense partner, below it, at macroModeScale %s',
      (macroModeScale) => {
        const { sense, antisense } = buildDuplex(editor);
        const cell = SnakeLayoutCellWidth / macroModeScale;

        layoutAtScale(macroModeScale);

        sense.forEach((senseNucleotide, index) => {
          const antisenseNucleotide = antisense[index];

          expect(antisenseNucleotide.rnaBase.position.x).toBeCloseTo(
            senseNucleotide.rnaBase.position.x,
          );
          expect(antisenseNucleotide.sugar.position.x).toBeCloseTo(
            senseNucleotide.sugar.position.x,
          );
          // The antisense base sits one row (one cell) under the sense base.
          expect(
            antisenseNucleotide.rnaBase.position.y -
              senseNucleotide.rnaBase.position.y,
          ).toBeCloseTo(cell);
          // The antisense sugar is drawn three cells under the sense sugar.
          expect(
            antisenseNucleotide.sugar.position.y -
              senseNucleotide.sugar.position.y,
          ).toBeCloseTo(3 * cell);
        });
        // A nucleotide fills two cells (sugar and phosphate), so the second
        // column is two cells to the right of the first.
        expect(
          sense[1].sugar.position.x - sense[0].sugar.position.x,
        ).toBeCloseTo(2 * cell);
        // The first sense sugar sits in the start cell of the canvas.
        expect(sense[0].sugar.position.x).toBeCloseTo(
          MONOMER_START_X_POSITION / macroModeScale,
        );
        expect(sense[0].sugar.position.y).toBeCloseTo(
          MONOMER_START_Y_POSITION / macroModeScale,
        );
      },
    );

    it('records the exact positions at the default macroModeScale', () => {
      const { sense, antisense } = buildDuplex(editor);

      layoutAtScale(DEFAULT_MACRO_MODE_SCALE);

      const positionsOf = (nucleotide: Nucleotide) => ({
        sugar: nucleotide.sugar.position,
        base: nucleotide.rnaBase.position,
        phosphate: nucleotide.phosphate?.position,
      });
      const round = (nucleotide: Nucleotide) => {
        const { sugar, base, phosphate } = positionsOf(nucleotide);
        const xy = (position?: Vec2) =>
          position && [position.x, position.y].map((n) => Math.round(n * 1000));

        return { sugar: xy(sugar), base: xy(base), phosphate: xy(phosphate) };
      };

      // x and y times 1000, pinned from the code at cf8b6cc8ff
      expect(sense.map(round)).toEqual([
        { sugar: [1250, 1250], base: [1250, 2750], phosphate: [2750, 1250] },
        { sugar: [4250, 1250], base: [4250, 2750], phosphate: [5750, 1250] },
      ]);
      expect(antisense.map(round)).toEqual([
        { sugar: [1250, 5750], base: [1250, 4250], phosphate: undefined },
        { sugar: [4250, 5750], base: [4250, 4250], phosphate: [2750, 5750] },
      ]);
    });
  });

  describe('molecule below the chains', () => {
    it.each([
      // cells = ceil((width + cell / 2) / cell), width = 1 angstrom, cell = 60 / scale
      // 40: cell 1.5, ceil(1.75 / 1.5) = 2 cells. 20: cell 3, ceil(2.5 / 3) = 1 cell.
      { macroModeScale: DEFAULT_MACRO_MODE_SCALE, firstMoleculeCells: 2 },
      { macroModeScale: 20, firstMoleculeCells: 1 },
    ])(
      'places molecules by cell size at macroModeScale $macroModeScale',
      ({ macroModeScale, firstMoleculeCells }) => {
        buildDuplex(editor);
        const { firstMolecule, secondMolecule } = addTwoMolecules(editor);
        const cell = SnakeLayoutCellWidth / macroModeScale;

        layoutAtScale(macroModeScale);

        // The first molecule starts in the first cell of its row; its top left
        // atom sits a quarter of a cell before the cell corner.
        expect(firstMolecule[0].position.x).toBeCloseTo(
          MONOMER_START_X_POSITION / macroModeScale - cell / 4,
        );
        // The second molecule starts after the cells the first one needs.
        expect(secondMolecule[0].position.x).toBeCloseTo(
          (MONOMER_START_X_POSITION +
            firstMoleculeCells * SnakeLayoutCellWidth) /
            macroModeScale -
            cell / 4,
        );
        // Both molecules are in the same row, and keep their shape.
        expect(secondMolecule[0].position.y).toBeCloseTo(
          firstMolecule[0].position.y,
        );
        [firstMolecule, secondMolecule].forEach((molecule) => {
          expect(molecule[1].position.x - molecule[0].position.x).toBeCloseTo(
            1,
          );
          expect(molecule[1].position.y).toBeCloseTo(molecule[0].position.y);
        });
      },
    );

    it.each([
      {
        macroModeScale: DEFAULT_MACRO_MODE_SCALE,
        // x and y of the first atom of each molecule, pinned from the code at cf8b6cc8ff
        first: [0.875, 8.175],
        second: [3.875, 8.175],
      },
      {
        macroModeScale: 20,
        first: [1.75, 16.35],
        second: [4.75, 16.35],
      },
    ])(
      'records the exact molecule positions at macroModeScale $macroModeScale',
      ({ macroModeScale, first, second }) => {
        buildDuplex(editor);
        const { firstMolecule, secondMolecule } = addTwoMolecules(editor);

        layoutAtScale(macroModeScale);

        expect(firstMolecule[0].position.x).toBeCloseTo(first[0]);
        expect(firstMolecule[0].position.y).toBeCloseTo(first[1]);
        expect(secondMolecule[0].position.x).toBeCloseTo(second[0]);
        expect(secondMolecule[0].position.y).toBeCloseTo(second[1]);
      },
    );
  });
});
