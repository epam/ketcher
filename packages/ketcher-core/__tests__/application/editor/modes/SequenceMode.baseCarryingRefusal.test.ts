import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { BASE_MODIFICATION_DISABLED_IN_SYNC_MODE } from 'domain/helpers/antisenseBaseSync';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const createNucleotideNode = (base: string, position: Vec2) => {
  const created = Nucleotide.createOnCanvas(base, position);

  if (!created) {
    throw new Error(`Fixture setup failed: nucleotide ${base} not created`);
  }

  return created.node;
};

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
  const senseNucleotides = ['A', 'C'].map((base, index) =>
    createNucleotideNode(base, new Vec2(index * 1.6, 0)),
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

const requireLibraryItem = (editor: CoreEditor, label: string) => {
  const item = editor.monomersLibrary.find(
    (libraryItem) => libraryItem.label === label,
  );

  if (!item) {
    throw new Error(`Library item ${label} not found`);
  }

  return item;
};

describe('SequenceMode base-carrying refusal (task 19.1-19.4)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  beforeEach(async () => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    mode = new SequenceMode();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
      mode,
    });
    await editor.ensureDefaultMonomersLibraryLoaded();
  });

  afterEach(() => {
    // EditorHistory is a process-wide singleton keyed only by the first
    // editor it ever saw; without this reset a later test keeps getting
    // this test's instance, pointed at this test's removed editor.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

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

  it('refuses an unsplit nucleotide with the mandated message, instead of rewriting the sense base and leaving its partner stale', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);

    expect(mode.isSyncEditMode).toBe(true);

    const senseLabelBefore = senseNucleotides[0].rnaBase.label;
    const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;
    const monomerCountBefore = editor.drawingEntitiesManager.monomers.size;
    // '5hMedC' is an unsplit nucleotide (MonomerClass 'RNA') whose natural
    // analogue is 'C' -- different from the sense base 'A' at position 0,
    // so before this change it rewrote the sense base and left the
    // antisense 'U' stale, with no message at all.
    const unsplitNucleotide = requireLibraryItem(editor, '5hMedC');
    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    mode.insertMonomerFromLibrary(unsplitNucleotide);

    expect(dispatchSpy).toHaveBeenCalledWith(
      BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
    );
    expect(senseNucleotides[0].rnaBase.label).toBe(senseLabelBefore);
    expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);
    expect(editor.drawingEntitiesManager.monomers.size).toBe(
      monomerCountBefore,
    );

    dispatchSpy.mockRestore();
  });

  it('reports the refusal without raising a confirmation dialog first', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);

    const errorSpy = jest.spyOn(editor.events.error, 'dispatch');
    const confirmationSpy = jest.spyOn(
      editor.events.openConfirmationDialog,
      'dispatch',
    );

    mode.insertMonomerFromLibrary(requireLibraryItem(editor, '5hMedC'));

    expect(errorSpy).toHaveBeenCalledWith(
      BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
    );
    expect(confirmationSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    confirmationSpy.mockRestore();
  });

  it('does not refuse when there is no hydrogen-bonded pair, even with a both-strands selection', () => {
    // A single-stranded chain: no antisense partner anywhere, so the rule's
    // structural condition is absent even if both strands were selected.
    const nucleotides = ['A', 'C'].map((base, index) =>
      createNucleotideNode(base, new Vec2(index * 1.6, 0)),
    );

    editor.drawingEntitiesManager.createPolymerBond(
      nucleotides[0].phosphate,
      nucleotides[1].sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    rerenderSequence(editor);

    editor.drawingEntitiesManager.selectDrawingEntities([
      ...nucleotides[0].monomers.filter(Boolean),
    ]);

    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    mode.insertMonomerFromLibrary(requireLibraryItem(editor, '5hMedC'));

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
    );

    dispatchSpy.mockRestore();
  });

  it('does not refuse an item that sets no base, even on a both-strands duplex selection', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);

    selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);

    const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

    // 'R' is a sugar: replacing a node with it destroys that node either
    // way and gives it no base, so rule 1.3 has nothing to be ambiguous
    // about and must not fire.
    mode.insertMonomerFromLibrary(requireLibraryItem(editor, 'R'));

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
    );

    dispatchSpy.mockRestore();
  });
});
