import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName, Entities } from 'domain/types';
import type { LabeledNodesWithPositionInSequence } from 'application/editor/tools/Tool';
import { STRAND_TYPE } from 'domain/constants';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// This suite exercises SequenceMode#countMirroredBaseChanges: how many
// unselected opposite bases an RNA Builder update would rewrite, counted
// without touching the model.

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

const requireBaseLibraryItem = (editor: CoreEditor, label: string) => {
  const item = getRnaPartLibraryItem(editor, label, KetMonomerClass.Base);

  if (!item) {
    throw new Error(`Library item ${label} not found`);
  }

  return item;
};

const entry = (
  nodeIndexOverall: number,
  strandType: STRAND_TYPE,
  baseLabel: string,
): LabeledNodesWithPositionInSequence => ({
  type: Entities.Nucleotide,
  nodeIndexOverall,
  strandType,
  baseLabel,
});

describe('SequenceMode#countMirroredBaseChanges', () => {
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
    // EditorHistory is a process-wide singleton; reset it so the next test's
    // editor is picked up.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Selects the sugar and base of each nucleotide, which is what makes up its
  // sequence position (a trailing phosphate can be a node of its own).
  const selectOnly = (nucleotides: Nucleotide[]) => {
    editor.drawingEntitiesManager.unselectAllDrawingEntities();
    editor.drawingEntitiesManager.selectDrawingEntities(
      nucleotides.flatMap((nucleotide) => [
        nucleotide.sugar,
        nucleotide.rnaBase,
      ]),
    );
  };

  it('counts the partner of a changed base', () => {
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    selectOnly([senseNucleotides[0]]);

    expect(
      mode.countMirroredBaseChanges([entry(0, STRAND_TYPE.SENSE, 'C')]),
    ).toBe(1);
  });

  it('counts a partner once per position and skips a base whose analogue is unchanged', () => {
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    selectOnly(senseNucleotides);

    expect(
      mode.countMirroredBaseChanges([
        entry(0, STRAND_TYPE.SENSE, 'G'),
        entry(1, STRAND_TYPE.SENSE, 'C'),
      ]),
    ).toBe(1);
  });

  it('counts 2 when two positions both change', () => {
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    selectOnly(senseNucleotides);

    expect(
      mode.countMirroredBaseChanges([
        entry(0, STRAND_TYPE.SENSE, 'G'),
        entry(1, STRAND_TYPE.SENSE, 'G'),
      ]),
    ).toBe(2);
  });

  it('counts 0 when the base is unchanged', () => {
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    selectOnly([senseNucleotides[0]]);

    expect(
      mode.countMirroredBaseChanges([entry(0, STRAND_TYPE.SENSE, 'A')]),
    ).toBe(0);
  });

  it('counts 0 when sync editing is off', () => {
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    (mode as unknown as { _isSyncEditMode: boolean })._isSyncEditMode = false;
    selectOnly([senseNucleotides[0]]);

    expect(
      mode.countMirroredBaseChanges([entry(0, STRAND_TYPE.SENSE, 'C')]),
    ).toBe(0);
  });

  it('counts 0 when the partner is selected too', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    selectOnly([senseNucleotides[0], antisenseNucleotides[0]]);

    expect(
      mode.countMirroredBaseChanges([entry(0, STRAND_TYPE.SENSE, 'C')]),
    ).toBe(0);
  });

  it('counts 0 when the partner already carries the complement', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    editor.drawingEntitiesManager.modifyMonomerItem(
      antisenseNucleotides[0].rnaBase,
      requireBaseLibraryItem(editor, 'G'),
    );
    selectOnly([senseNucleotides[0]]);

    expect(
      mode.countMirroredBaseChanges([entry(0, STRAND_TYPE.SENSE, 'C')]),
    ).toBe(0);
  });

  it('has no side effects on base labels or history', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const nucleotides = [...senseNucleotides, ...antisenseNucleotides];
    const labelsBefore = nucleotides.map((n) => n.rnaBase.label);
    const history = EditorHistory.getInstance(editor);
    const historyLengthBefore = history.historyStack.length;
    selectOnly(senseNucleotides);

    mode.countMirroredBaseChanges([
      entry(0, STRAND_TYPE.SENSE, 'G'),
      entry(1, STRAND_TYPE.SENSE, 'G'),
    ]);

    expect(nucleotides.map((n) => n.rnaBase.label)).toEqual(labelsBefore);
    expect(history.historyStack.length).toBe(historyLengthBefore);
  });
});
