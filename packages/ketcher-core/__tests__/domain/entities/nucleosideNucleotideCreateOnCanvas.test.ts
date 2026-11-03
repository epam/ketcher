import { CoreEditor } from 'application/editor';
import { provideEditorSettings } from 'application/editor/editorSettings';
import {
  getMonomerSize,
  setMonomerSize,
} from 'domain/helpers/monomerSizeState';
import { SnakeLayoutCellWidth } from 'domain/constants';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

// Pins what Nucleoside.createOnCanvas and Nucleotide.createOnCanvas do today:
// where the sugar, base and phosphate land, which bonds join them, and what is
// returned when a library part is missing. Expected positions are written as
// numbers from the layout rule: the bottom monomer sits SnakeLayoutCellWidth
// plus the measured monomer height below `position`, the phosphate
// SnakeLayoutCellWidth to the right, both divided by the canvas-to-model scale.

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

const CELL_WIDTH = 60;
const POSITION = new Vec2(2, 3);

const stubCanvasDimensions = (canvas: SVGSVGElement) => {
  Object.defineProperty(canvas, 'width', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
  Object.defineProperty(canvas, 'height', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
};

const createNucleoside = (
  ...args: Parameters<typeof Nucleoside.createOnCanvas>
) => Nucleoside.createOnCanvas(...args);
const createNucleotide = (
  ...args: Parameters<typeof Nucleotide.createOnCanvas>
) => Nucleotide.createOnCanvas(...args);

const expectPosition = (monomer: BaseMonomer, x: number, y: number) => {
  expect(monomer.position.x).toBeCloseTo(x, 6);
  expect(monomer.position.y).toBeCloseTo(y, 6);
};

const otherMonomerAt = (
  monomer: BaseMonomer,
  attachmentPoint: 'R1' | 'R2' | 'R3',
) =>
  monomer.attachmentPointsToBonds[attachmentPoint]?.getAnotherEntity(monomer);

describe('Nucleoside.createOnCanvas and Nucleotide.createOnCanvas', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  const originalScale = provideEditorSettings().macroModeScale;
  const originalMonomerSize = getMonomerSize();

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    provideEditorSettings().macroModeScale = originalScale;
    setMonomerSize(originalMonomerSize);
    canvas.remove();
  });

  // [scale, monomer height, expected bottom offset y, expected phosphate offset x]
  const layoutCases: Array<[number, number, number, number]> = [
    [40, 0, CELL_WIDTH / 40, CELL_WIDTH / 40],
    [40, 60, (CELL_WIDTH + 60) / 40, CELL_WIDTH / 40],
    [20, 0, CELL_WIDTH / 20, CELL_WIDTH / 20],
    [20, 60, (CELL_WIDTH + 60) / 20, CELL_WIDTH / 20],
  ];

  it('uses a cell width of 60 pixels, which the expected values below assume', () => {
    expect(SnakeLayoutCellWidth).toBe(CELL_WIDTH);
  });

  describe('Nucleoside', () => {
    it.each(layoutCases)(
      'adds an RNA sugar at the position and a base below it, bonded R3-R1 (scale %i, height %i)',
      (scale, height, bottomOffsetY) => {
        provideEditorSettings().macroModeScale = scale;
        setMonomerSize({ width: 0, height });

        const created = createNucleoside(editor, 'A', POSITION);

        expect(created).toBeDefined();
        const { node, modelChanges } = created as NonNullable<typeof created>;

        expect(node).toBeInstanceOf(Nucleoside);
        expect(node.sugar.monomerItem.props.MonomerName).toBe(
          RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
        );
        expect(node.rnaBase.monomerItem.props.MonomerName).toBe('A');
        expectPosition(node.sugar, POSITION.x, POSITION.y);
        expectPosition(node.rnaBase, POSITION.x, POSITION.y + bottomOffsetY);
        expect(otherMonomerAt(node.sugar, 'R3')).toBe(node.rnaBase);
        expect(otherMonomerAt(node.rnaBase, 'R1')).toBe(node.sugar);
        expect(modelChanges.operations.length).toBeGreaterThan(0);
        expect(editor.drawingEntitiesManager.monomers.size).toBe(2);
      },
    );

    it('puts the sugar at the bottom and the base at the position when isAntisense is true', () => {
      setMonomerSize({ width: 0, height: 60 });

      const created = createNucleoside(
        editor,
        'A',
        POSITION,
        RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
        true,
      );

      expect(created).toBeDefined();
      const { node } = created as NonNullable<typeof created>;

      expectPosition(node.rnaBase, POSITION.x, POSITION.y);
      expectPosition(
        node.sugar,
        POSITION.x,
        POSITION.y + (CELL_WIDTH + 60) / 40,
      );
      expect(node.sugar.monomerItem.isAntisense).toBe(true);
      expect(node.rnaBase.monomerItem.isAntisense).toBe(true);
      expect(otherMonomerAt(node.sugar, 'R3')).toBe(node.rnaBase);
    });

    it('picks the DNA sugar and resolves thymine when sugarName is the DNA sugar', () => {
      const created = createNucleoside(
        editor,
        'T',
        POSITION,
        RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA,
      );

      expect(created).toBeDefined();
      const { node } = created as NonNullable<typeof created>;

      expect(node.sugar.monomerItem.props.MonomerName).toBe(
        RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA,
      );
      expect(node.rnaBase.monomerItem.props.MonomerName).toBe('T');
    });

    it('returns undefined and adds nothing when the base is not in the library', () => {
      const monomersBefore = editor.drawingEntitiesManager.monomers.size;

      expect(createNucleoside(editor, 'NoSuchBase', POSITION)).toBeUndefined();
      expect(editor.drawingEntitiesManager.monomers.size).toBe(monomersBefore);
    });

    it('reads the monomer height when called, not when the editor was built', () => {
      setMonomerSize({ width: 0, height: 60 });
      const first = createNucleoside(editor, 'A', POSITION);

      setMonomerSize({ width: 0, height: 120 });
      const second = createNucleoside(editor, 'A', POSITION);

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expectPosition(
        (first as NonNullable<typeof first>).node.rnaBase,
        POSITION.x,
        POSITION.y + (CELL_WIDTH + 60) / 40,
      );
      expectPosition(
        (second as NonNullable<typeof second>).node.rnaBase,
        POSITION.x,
        POSITION.y + (CELL_WIDTH + 120) / 40,
      );
    });
  });

  describe('Nucleotide', () => {
    it.each(layoutCases)(
      'adds an RNA sugar at the position, a base below and a phosphate to the right (scale %i, height %i)',
      (scale, height, bottomOffsetY, phosphateOffsetX) => {
        provideEditorSettings().macroModeScale = scale;
        setMonomerSize({ width: 0, height });

        const created = createNucleotide(editor, 'C', POSITION);

        expect(created).toBeDefined();
        const { node, modelChanges } = created as NonNullable<typeof created>;

        expect(node).toBeInstanceOf(Nucleotide);
        expect(node.sugar.monomerItem.props.MonomerName).toBe(
          RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
        );
        expect(node.rnaBase.monomerItem.props.MonomerName).toBe('C');
        expect(node.phosphate.monomerItem.props.MonomerName).toBe(
          RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
        );
        expectPosition(node.sugar, POSITION.x, POSITION.y);
        expectPosition(node.rnaBase, POSITION.x, POSITION.y + bottomOffsetY);
        expectPosition(
          node.phosphate,
          POSITION.x + phosphateOffsetX,
          POSITION.y,
        );
        expect(otherMonomerAt(node.sugar, 'R2')).toBe(node.phosphate);
        expect(otherMonomerAt(node.sugar, 'R3')).toBe(node.rnaBase);
        expect(modelChanges.operations.length).toBeGreaterThan(0);
        expect(editor.drawingEntitiesManager.monomers.size).toBe(3);
      },
    );

    it('picks the DNA sugar and resolves thymine when sugarName is the DNA sugar', () => {
      const created = createNucleotide(
        editor,
        'T',
        POSITION,
        RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA,
      );

      expect(created).toBeDefined();
      const { node } = created as NonNullable<typeof created>;

      expect(node.sugar.monomerItem.props.MonomerName).toBe(
        RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA,
      );
      expect(node.rnaBase.monomerItem.props.MonomerName).toBe('T');
    });

    it('returns undefined and adds nothing when the base is not in the library', () => {
      const monomersBefore = editor.drawingEntitiesManager.monomers.size;

      expect(createNucleotide(editor, 'NoSuchBase', POSITION)).toBeUndefined();
      expect(editor.drawingEntitiesManager.monomers.size).toBe(monomersBefore);
    });

    it('reads the monomer height when called, not when the editor was built', () => {
      setMonomerSize({ width: 0, height: 60 });
      const first = createNucleotide(editor, 'G', POSITION);

      setMonomerSize({ width: 0, height: 120 });
      const second = createNucleotide(editor, 'G', POSITION);

      expect(first).toBeDefined();
      expect(second).toBeDefined();
      expectPosition(
        (first as NonNullable<typeof first>).node.rnaBase,
        POSITION.x,
        POSITION.y + (CELL_WIDTH + 60) / 40,
      );
      expectPosition(
        (second as NonNullable<typeof second>).node.rnaBase,
        POSITION.x,
        POSITION.y + (CELL_WIDTH + 120) / 40,
      );
    });
  });
});
