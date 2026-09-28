import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { TwoStrandedNodesSelection } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { STRAND_TYPE } from 'domain/constants';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// This suite exercises Task 2 of epam/ketcher#6595's preset-duplex-replacement
// change: replaceSelectionsWithPreset becoming strand-aware in the same way
// replaceSelectionsWithMonomer already is. The fixtures and gesture-
// simulation pattern (buildTwoPositionDuplex, mousedown + mousemove ticks,
// callReplaceSelectionsWithPreset) are copied from
// SequenceMode.antisenseDuplexSync.test.ts, which already establishes them
// as the way to drive a real one-strand vs. both-strands selection gesture.

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
// hydrogen bonds) with antisense 'U','G' respectively. Copied from
// SequenceMode.antisenseDuplexSync.test.ts.
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

// Calls the private SequenceMode#replaceSelectionsWithPreset, following the
// cast-through-prototype pattern used in SequenceMode.antisenseDuplexSync
// .test.ts.
const callReplaceSelectionsWithPreset = (
  mode: SequenceMode,
  selections: TwoStrandedNodesSelection,
  preset: IRnaPreset,
) => {
  const { replaceSelectionsWithPreset } = SequenceMode.prototype as unknown as {
    replaceSelectionsWithPreset: (
      this: SequenceMode,
      selections: TwoStrandedNodesSelection,
      preset: IRnaPreset,
    ) => void;
  };

  return replaceSelectionsWithPreset.call(mode, selections, preset);
};

describe('SequenceMode preset replacement strand awareness (task 2)', () => {
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
    // EditorHistory is a process-wide singleton keyed only by the first
    // editor it ever saw (see EditorHistory.getInstance): without an
    // explicit reset here, a later test's getInstance(newEditor) call would
    // keep returning this test's instance, still pointed at this test's
    // (by-then-removed) editor and renderersContainer.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Enters edit mode via a first click on the sense row, exactly like
  // SequenceMode.antisenseDuplexSync.test.ts.
  const enterEditMode = (editorInstance: CoreEditor) => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editorInstance);

    mode.mousedownBetweenSequenceItems(
      mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
    );
    SequenceRenderer.resetTargetedStrand();

    return { senseNucleotides, antisenseNucleotides };
  };

  // A real one-strand drag: mousedown on the given row records that row,
  // then mousemove ticks select the caret range, which -- per the "columns
  // select both strands" behavior at the heart of #6595 -- pulls in BOTH
  // strands' monomers at every touched position even though only one row
  // was dragged.
  const dragAcrossBothPositions = (
    startNode: Nucleotide,
    endNode: Nucleotide,
  ) => {
    mode.mousedown(mousedownEventFor(rendererForMonomer(startNode)));

    for (let tick = 0; tick < 3; tick++) {
      mode.mousemove(mousedownEventFor(rendererForMonomer(endNode)));
    }
  };

  it('replaces the antisense node when the gesture targeted the antisense row, leaving the sense node alone', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    dragAcrossBothPositions(antisenseNucleotides[0], senseNucleotides[1]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    // Sanity: the drag selected both strands at every touched column, so
    // the assertion below is meaningful only because the record says
    // ANTISENSE -- not because the sense row was left unselected.
    expect(senseNucleotides[0].rnaBase.selected).toBe(true);
    expect(antisenseNucleotides[0].rnaBase.selected).toBe(true);

    const senseBaseIdsBefore = new Set(
      senseNucleotides.flatMap((nucleotide) =>
        nucleotide.monomers.filter(Boolean).map((monomer) => monomer.id),
      ),
    );
    const selections = SequenceRenderer.selections;

    callReplaceSelectionsWithPreset(mode, selections, buildPreset(editor, 'C'));

    // Every sense monomer survives untouched (same node identity): the
    // preset went to the antisense strand, not the sense one.
    senseBaseIdsBefore.forEach((id) => {
      expect(editor.drawingEntitiesManager.monomers.has(id)).toBe(true);
    });
    // Their base LABELS do change, though (Task 4): this is a genuine
    // single-strand (ANTISENSE) gesture, so rule 1.1 mirrors the preset's
    // base onto each touched position's hydrogen-bonded partner. Position 0:
    // antisense U -> C, so partner sense A mirrors to complement(C) = G.
    // Position 1: antisense G -> C, so partner sense C mirrors to G too.
    expect(senseNucleotides[0].rnaBase.label).toBe('G');
    expect(senseNucleotides[1].rnaBase.label).toBe('G');
  });

  it('splits a range that mixes strands, replacing only what is selected at each position', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    // A geometric, rectangle-style selection: the sense node at position 0
    // and the antisense node at position 1, no record written. This is the
    // shape SelectRectangle produces on a duplex whose strands do not line
    // up column for column, and SequenceRenderer.selections returns it as
    // ONE contiguous range because it breaks only on an unselected
    // position, never on a strand change.
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...senseNucleotides[0].monomers.filter(Boolean),
      ...antisenseNucleotides[1].monomers.filter(Boolean),
    ]);
    SequenceRenderer.resetTargetedStrand();
    expect(SequenceRenderer.targetedStrand).toBe('both');

    const untouchedIds = [
      ...senseNucleotides[1].monomers.filter(Boolean),
      ...antisenseNucleotides[0].monomers.filter(Boolean),
    ].map((monomer) => monomer.id);

    callReplaceSelectionsWithPreset(
      mode,
      SequenceRenderer.selections,
      buildPreset(editor, 'C'),
    );

    // The two nodes nobody selected are still there. Before the split, the
    // loop resolved one strand for the whole range and replaced monomers
    // at positions where they were never selected.
    untouchedIds.forEach((id) => {
      expect(editor.drawingEntitiesManager.monomers.has(id)).toBe(true);
    });
  });

  it('keeps the antisense strand one chain and carries its hydrogen bond onto the preset base', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    // Replace the antisense node in the MIDDLE of its range, so the seed
    // for `previousReplacedNode` has to come from the chain-first end of
    // the range rather than from selectionRange[0].
    dragAcrossBothPositions(antisenseNucleotides[0], antisenseNucleotides[1]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    const chainCountBefore = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]).chains.length;

    callReplaceSelectionsWithPreset(
      mode,
      SequenceRenderer.selections,
      buildPreset(editor, 'C'),
    );

    // The strand did not fragment: a backbone rebuilt in the wrong
    // direction leaves extra chains behind.
    expect(
      ChainsCollection.fromMonomers([
        ...editor.drawingEntitiesManager.monomers.values(),
      ]).chains.length,
    ).toBe(chainCountBefore);
    // The pairing survived the replacement: replaceSelectionWithPreset
    // re-creates the preserved hydrogen bond on the new preset's base, so
    // the untouched sense base still has exactly one.
    expect(senseNucleotides[0].rnaBase.hydrogenBonds.length).toBe(1);
    expect(senseNucleotides[1].rnaBase.hydrogenBonds.length).toBe(1);
  });

  it('rewrites the hydrogen-bonded partner when the preset changes the natural analogue', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    // A one-strand drag along the sense row: both strands end up selected
    // at every touched column, but the record says SENSE.
    dragAcrossBothPositions(senseNucleotides[0], senseNucleotides[0]);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    const selections = SequenceRenderer.selections
      .map((range) =>
        range.filter((selection) => selection.nodeIndexOverall === 0),
      )
      .filter((range) => range.length > 0);

    callReplaceSelectionsWithPreset(mode, selections, buildPreset(editor, 'C'));

    // Position 0: sense A -> C via the preset's base, so its partner U must
    // mirror to G. The partner is mutated in place by modifyMonomerItem,
    // so this reference stays valid.
    expect(antisenseNucleotides[0].rnaBase.label).toBe('G');
  });

  it('leaves the partner alone when the preset keeps the natural analogue', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    dragAcrossBothPositions(senseNucleotides[0], senseNucleotides[0]);

    const selections = SequenceRenderer.selections
      .map((range) =>
        range.filter((selection) => selection.nodeIndexOverall === 0),
      )
      .filter((range) => range.length > 0);

    // The sense base at position 0 is already 'A'.
    callReplaceSelectionsWithPreset(mode, selections, buildPreset(editor, 'A'));

    expect(antisenseNucleotides[0].rnaBase.label).toBe('U');
  });

  it('leaves the partner alone in non-sync mode', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    dragAcrossBothPositions(senseNucleotides[0], senseNucleotides[0]);

    // Set the field directly: turnOffSyncEditMode() calls initialize(),
    // which re-lays-out the canvas and destroys the selection under test.
    (mode as unknown as { _isSyncEditMode: boolean })._isSyncEditMode = false;
    expect(mode.isSyncEditMode).toBe(false);

    const selections = SequenceRenderer.selections
      .map((range) =>
        range.filter((selection) => selection.nodeIndexOverall === 0),
      )
      .filter((range) => range.length > 0);

    callReplaceSelectionsWithPreset(mode, selections, buildPreset(editor, 'C'));

    expect(antisenseNucleotides[0].rnaBase.label).toBe('U');
  });

  it('undoes a propagating preset replacement as a single history step', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
    const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;

    dragAcrossBothPositions(senseNucleotides[0], senseNucleotides[0]);

    const selections = SequenceRenderer.selections
      .map((range) =>
        range.filter((selection) => selection.nodeIndexOverall === 0),
      )
      .filter((range) => range.length > 0);
    const history = EditorHistory.getInstance(editor);
    const historyPointerBefore = history.historyPointer;

    callReplaceSelectionsWithPreset(mode, selections, buildPreset(editor, 'C'));

    expect(history.historyPointer).toBe(historyPointerBefore + 1);
    expect(antisenseNucleotides[0].rnaBase.label).toBe('G');

    history.undo();

    expect(history.historyPointer).toBe(historyPointerBefore);
    expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);
  });

  it("replaces the targeted strand and drops that column's hydrogen bond, for a preset with no base", () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
    const antisensePartner = antisenseNucleotides[0].rnaBase;

    dragAcrossBothPositions(senseNucleotides[0], senseNucleotides[0]);

    const selections = SequenceRenderer.selections
      .map((range) =>
        range.filter((selection) => selection.nodeIndexOverall === 0),
      )
      .filter((range) => range.length > 0);

    callReplaceSelectionsWithPreset(
      mode,
      selections,
      buildPreset(editor, undefined),
    );

    // Nothing to mirror from, so the partner keeps its own base -- and the
    // pairing at that column is gone, because the new node has no base for
    // the hydrogen bond to re-attach to. Same as on a single strand today.
    expect(antisensePartner.label).toBe('U');
    expect(antisensePartner.hydrogenBonds.length).toBe(0);
  });
});
