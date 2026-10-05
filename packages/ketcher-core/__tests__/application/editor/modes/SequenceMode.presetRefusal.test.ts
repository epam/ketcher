import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { BASE_MODIFICATION_DISABLED_IN_SYNC_MODE } from 'domain/helpers/antisenseBaseSync';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// Task 3 of epam/ketcher#6595's preset-duplex-replacement change: clicking a
// preset in the library used to refuse outright on any selection with an
// antisense partner in it, which left issue items 1.1/1.2 unimplemented for
// this gesture and also refused a plain sense-only selection in non-sync
// mode, against item 2.1. The blanket guard is gone; the preset entry point
// now goes through the same shared refusal (rule 1.3) as the other library
// entry point, and only refuses when the selection actually holds both
// strands of a pair. The duplex fixture is copied from
// SequenceMode.antisenseDuplexSync.test.ts.

const testRenderTheme = {
  monomer: {
    color: {
      X: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
    },
  },
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

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

const rerenderSequence = (editor: CoreEditor) => {
  const chainsCollection = ChainsCollection.fromMonomers([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);

  chainsCollection.rearrange();
  SequenceRenderer.show(chainsCollection);
};

// Builds a 2-position sense/antisense duplex: sense 'A','C' paired (via
// hydrogen bonds) with antisense 'U','G' respectively.
const buildTwoPositionDuplex = (editor: CoreEditor) => {
  const drawingEntitiesManager = editor.drawingEntitiesManager;
  const senseNucleotides = ['A', 'C'].map(
    (base, index) =>
      Nucleotide.createOnCanvas(base, new Vec2(index * 1.6, 0)).node,
  );

  drawingEntitiesManager.createPolymerBond(
    senseNucleotides[0].phosphate,
    senseNucleotides[1].sugar,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );

  drawingEntitiesManager.selectDrawingEntities([
    ...drawingEntitiesManager.monomers.values(),
  ]);
  drawingEntitiesManager.createAntisenseChain(false);
  drawingEntitiesManager.unselectAllDrawingEntities();

  const antisenseNucleotides = senseNucleotides.map((senseNucleotide) => {
    const antisenseBase =
      senseNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
        senseNucleotide.rnaBase,
      ) as RNABase;
    const antisenseSugar = getSugarFromRnaBase(antisenseBase) as Sugar;

    return Nucleotide.fromSugar(antisenseSugar, false);
  });

  rerenderSequence(editor);

  return { senseNucleotides, antisenseNucleotides };
};

const rendererForMonomer = (nucleotide: Nucleotide) => {
  const renderer = nucleotide.rnaBase.renderer as unknown as
    BaseSequenceItemRenderer | undefined;

  if (!renderer) {
    throw new Error('Fixture setup failed: renderer not found for monomer');
  }

  return renderer;
};

const mousedownEventFor = (renderer: BaseSequenceItemRenderer) =>
  ({ target: { __data__: renderer } }) as unknown as MouseEvent;

const buildPreset = (
  editor: CoreEditor,
  baseLabel: string | undefined,
): IRnaPreset => {
  const sugar = getRnaPartLibraryItem(editor, 'R', KetMonomerClass.Sugar);
  const phosphate = getRnaPartLibraryItem(
    editor,
    'P',
    KetMonomerClass.Phosphate,
  );
  const base = baseLabel
    ? getRnaPartLibraryItem(editor, baseLabel, KetMonomerClass.Base)
    : undefined;

  if (!sugar || !phosphate || (baseLabel && !base)) {
    throw new Error('Fixture setup failed: preset parts not found');
  }

  return { name: baseLabel ?? 'R-P', sugar, phosphate, base };
};

// Enters edit mode with a first click on the sense row, then selects only
// the sense symbol at position 0, the way a view-mode drag over one row does.
const selectSenseRowAtPositionZero = (
  editor: CoreEditor,
  mode: SequenceMode,
  senseNucleotides: Nucleotide[],
) => {
  mode.mousedownBetweenSequenceItems(
    mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
  );

  editor.drawingEntitiesManager.unselectAllDrawingEntities();
  editor.drawingEntitiesManager.selectDrawingEntities(
    senseNucleotides[0].monomers.filter(Boolean),
  );
};

describe('SequenceMode.insertPresetFromLibrary duplex refusal (task 3)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  // Selects both strands at position 0.
  const selectBothStrandsAtPositionZero = (
    senseNucleotides: Nucleotide[],
    antisenseNucleotides: Nucleotide[],
  ) => {
    editor.drawingEntitiesManager.selectDrawingEntities(
      [
        ...senseNucleotides[0].monomers,
        ...antisenseNucleotides[0].monomers,
      ].filter(Boolean),
    );
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    mode = new SequenceMode();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
      mode,
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('replaces the sense nucleotides and reports nothing, for a one-strand selection on a duplex', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectSenseRowAtPositionZero(editor, mode, senseNucleotides);
    expect(antisenseNucleotides[0].rnaBase.selected).toBe(false);

    const antisenseMonomerIds = antisenseNucleotides[0].monomers
      .filter(Boolean)
      .map((monomer) => monomer.id);
    const originalSenseBaseId = senseNucleotides[0].rnaBase.id;
    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    mode.insertPresetFromLibrary(buildPreset(editor, 'C'));

    // No refusal, and the sense base really was replaced.
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(
      editor.drawingEntitiesManager.monomers.has(originalSenseBaseId),
    ).toBe(false);
    // The antisense monomers at that column are still the same objects:
    // the preset went to the targeted strand only.
    antisenseMonomerIds.forEach((id) => {
      expect(editor.drawingEntitiesManager.monomers.has(id)).toBe(true);
    });

    dispatchSpy.mockRestore();
  });

  it('refuses a preset with the mandated message when both strands are selected', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);

    const senseLabelBefore = senseNucleotides[0].rnaBase.label;
    const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;
    const monomerCountBefore = editor.drawingEntitiesManager.monomers.size;
    const history = EditorHistory.getInstance(editor);
    const historyLengthBefore = history.historyStack.length;
    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    mode.insertPresetFromLibrary(buildPreset(editor, 'C'));

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
    );
    expect(senseNucleotides[0].rnaBase.label).toBe(senseLabelBefore);
    expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);
    expect(editor.drawingEntitiesManager.monomers.size).toBe(
      monomerCountBefore,
    );
    expect(history.historyStack.length).toBe(historyLengthBefore);

    dispatchSpy.mockRestore();
  });
});
