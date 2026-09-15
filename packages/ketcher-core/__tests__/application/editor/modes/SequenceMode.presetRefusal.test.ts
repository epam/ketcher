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
import { PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX } from 'domain/helpers/antisenseBaseSync';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// Task 7 of epam/ketcher#6595: clicking a preset in the library while a
// duplex selection is active used to silently no-op. This suite asserts
// the refusal is now reported, and that the canvas/history stay untouched
// (preset replacement on a duplex is explicitly out of scope). The
// duplex-fixture and gesture pattern is copied from
// SequenceMode.antisenseDuplexSync.test.ts, which already establishes it as
// the way to build a real sense/antisense pair selected together.

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

// A real gesture, copied from SequenceMode.antisenseDuplexSync.test.ts:
// enter edit mode with a first click on the sense row, then mousedown +
// mousemove ticks on the SAME position. Selection on a duplex is
// column-based, so this pulls in BOTH strands' monomers at position 0 even
// though only the sense row was dragged -- exactly the real-gesture
// duplex-selection shape the brief asks for.
const selectBothStrandsAtPositionZero = (
  mode: SequenceMode,
  senseNucleotides: Nucleotide[],
) => {
  mode.mousedownBetweenSequenceItems(
    mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
  );
  SequenceRenderer.resetTargetedStrand();

  mode.mousedown(mousedownEventFor(rendererForMonomer(senseNucleotides[0])));

  for (let tick = 0; tick < 3; tick++) {
    mode.mousemove(mousedownEventFor(rendererForMonomer(senseNucleotides[0])));
  }
};

describe('SequenceMode.insertPresetFromLibrary duplex refusal (task 7)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

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
    SequenceRenderer.resetTargetedStrand();
    canvas.remove();
  });

  it('dispatches PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX exactly once and leaves the monomers and history unchanged, for a duplex selection', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectBothStrandsAtPositionZero(mode, senseNucleotides);

    const selections = SequenceRenderer.selections;

    expect(
      selections.some((range) =>
        range.some((selection) => selection.node.antisenseNode),
      ),
    ).toBe(true);

    const senseLabelBefore = senseNucleotides[0].rnaBase.label;
    const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;
    const senseMonomerCountBefore = editor.drawingEntitiesManager.monomers.size;
    const history = EditorHistory.getInstance(editor);
    const historyLengthBefore = history.historyStack.length;
    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    mode.insertPresetFromLibrary({} as IRnaPreset);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX,
    );
    expect(senseNucleotides[0].rnaBase.label).toBe(senseLabelBefore);
    expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);
    expect(editor.drawingEntitiesManager.monomers.size).toBe(
      senseMonomerCountBefore,
    );
    expect(history.historyStack.length).toBe(historyLengthBefore);

    dispatchSpy.mockRestore();
  });
});
