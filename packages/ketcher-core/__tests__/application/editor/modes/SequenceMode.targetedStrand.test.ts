import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { hotkeysConfiguration } from 'application/editor/editorEvents';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { STRAND_TYPE } from 'domain/constants';
import { KetMonomerClass } from 'domain/constants/monomers';
import type { MonomerItemType } from 'domain/types';
import type { TwoStrandedNodesSelection } from 'application/render/renderers/sequence/SequenceRenderer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// A minimal render theme with an 'X' fallback color so that
// UnsplitNucleotideRenderer (used when a library replacement monomer is
// rendered by replaceSelectionsWithMonomer) does not throw regardless of
// the replacement's natural analog code. Modeled on antisenseChainDirection
// .test.ts's testRenderTheme.
const testRenderTheme = {
  monomer: {
    color: {
      X: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
    },
  },
};

const findLibraryItemByAlias = (editor: CoreEditor, alias: string) => {
  const libraryItem = editor.monomersLibrary.find(
    (item) =>
      !('isAmbiguous' in item && item.isAmbiguous) &&
      item.label === alias &&
      item.props?.MonomerClass === KetMonomerClass.RNA,
  );

  if (!libraryItem) {
    throw new Error(`Library item ${alias} not found`);
  }

  return libraryItem;
};

// Calls the private SequenceMode#replaceSelectionsWithMonomer, following the
// cast-through-prototype pattern used for private-method tests elsewhere in
// this codebase (see antisenseChainDirection.test.ts).
const callReplaceSelectionsWithMonomer = (
  mode: SequenceMode,
  selections: TwoStrandedNodesSelection,
  monomerItem: MonomerItemType,
) => {
  const { replaceSelectionsWithMonomer } =
    SequenceMode.prototype as unknown as {
      replaceSelectionsWithMonomer: (
        this: SequenceMode,
        selections: TwoStrandedNodesSelection,
        monomerItem: MonomerItemType,
      ) => void;
    };

  return replaceSelectionsWithMonomer.call(mode, selections, monomerItem);
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

// Builds a 2-nucleotide sense chain and mirrors it into an antisense duplex,
// then renders both strands through SequenceRenderer. Modeled on
// buildTwoPositionDuplex in SelectBase.targetedStrand.test.ts. Returns the
// underlying monomers (not renderers) because `SequenceMode.initialize` --
// invoked by `turnOnEditMode`/`setAntisenseEditMode` -- rebuilds the
// sequence view model and destroys the previous renderer instances; a
// fresh renderer must be looked up via `SequenceRenderer.getRendererByMonomer`
// after any such call.
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

describe('SequenceMode targeted strand recording', () => {
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
      renderersContainer: createRenderersManager(),
      mode,
    });
  });

  afterEach(() => {
    SequenceRenderer.resetTargetedStrand();
    canvas.remove();
  });

  describe('mousedownBetweenSequenceItems (entering edit mode)', () => {
    it('records sense when entering edit mode on a sense symbol', () => {
      const { senseNucleotides } = buildTwoPositionDuplex(editor);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records antisense when entering edit mode on an antisense symbol', () => {
      const { antisenseNucleotides } = buildTwoPositionDuplex(editor);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('mousedown drag inside edit mode', () => {
    // Enters edit mode via a first click (on the sense row). Returns the
    // underlying nucleotide nodes rather than renderers: every call that
    // goes through `setAntisenseEditMode` (including `mousedown` itself)
    // calls `SequenceMode#initialize`, which rebuilds the sequence view
    // model and destroys the previous renderer instances. A fresh renderer
    // must therefore be looked up via `rendererForMonomer` immediately
    // before each simulated event, never cached across such a call.
    const enterEditMode = (editorInstance: CoreEditor) => {
      const { senseNucleotides, antisenseNucleotides } =
        buildTwoPositionDuplex(editorInstance);

      mode.mousedownBetweenSequenceItems(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );
      SequenceRenderer.resetTargetedStrand();

      return { senseNucleotides, antisenseNucleotides };
    };

    it('records the row a drag starts on, after the unselect that begins the gesture (mousedown, sense row)', () => {
      const { senseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records the row a drag starts on, after the unselect that begins the gesture (mousedown, antisense row)', () => {
      const { antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });

    // This is the case flagged as most likely to be wrong: `mousemove`
    // clears the record via `unselectAllEntities()` on every tick before
    // re-selecting the whole caret range (which spans both strands via
    // `getMonomersByCaretPositionRange`). A record written once at
    // mousedown does NOT survive the first tick -- the write must be
    // re-applied inside `mousemove`, after that clear, every time.
    it('re-applies the drag row on every mousemove tick, surviving the unselect that resets the record', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
      );
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

      // mousemove's selection-changing branch only runs once
      // `mousemoveCounter > 1`, i.e. from the 3rd call onward -- the first
      // two calls only increment the counter. Each call re-fetches the
      // renderer fresh (see `enterEditMode`'s comment).
      for (let tick = 0; tick < 3; tick++) {
        mode.mousemove(
          mousedownEventFor(rendererForMonomer(antisenseNucleotides[1])),
        );
      }

      // Sanity check that this tick really did select both strands (the
      // range helper selects both, per brief Step 2) -- so the assertion
      // below is only meaningful because of the explicit record, not
      // because the resolver's selection-derived fallback happens to agree.
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.some(
          (entity) =>
            'monomerItem' in entity &&
            (entity as unknown as { monomerItem: { isAntisense?: boolean } })
              .monomerItem.isAntisense,
        ),
      ).toBe(true);

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('re-applies the antisense drag row on every mousemove tick', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      mode.mousedown(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
      );
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

      for (let tick = 0; tick < 3; tick++) {
        mode.mousemove(
          mousedownEventFor(rendererForMonomer(senseNucleotides[1])),
        );
      }

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('shiftArrowSelectionInEditMode', () => {
    // Sets the caret-location flag directly, mirroring the pattern used in
    // antisenseChainDirection.test.ts's setEditModes: going through
    // setAntisenseEditMode()/turnOnAntisenseEditMode() would call
    // SequenceMode#initialize and rebuild the renderers this test already
    // captured monomer references for (moot here, but kept consistent).
    const setAntisenseEditModeFlag = (value: boolean) => {
      (
        mode as unknown as { _isAntisenseEditMode: boolean }
      )._isAntisenseEditMode = value;
    };

    const arrowRightEvent = { code: 'ArrowRight' } as KeyboardEvent;

    it('records sense when the caret is on the sense row', () => {
      buildTwoPositionDuplex(editor);
      SequenceRenderer.setCaretPosition(0);
      setAntisenseEditModeFlag(false);

      SequenceRenderer.shiftArrowSelectionInEditMode(arrowRightEvent);

      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
    });

    it('records antisense when the caret is on the antisense row, even though both strands get selected', () => {
      buildTwoPositionDuplex(editor);
      SequenceRenderer.setCaretPosition(0);
      setAntisenseEditModeFlag(true);

      SequenceRenderer.shiftArrowSelectionInEditMode(arrowRightEvent);

      // getShiftArrowChanges selects both the sense and antisense monomer
      // of the touched column, so without the explicit record the resolver
      // would derive 'both' from selection state.
      expect(
        editor.drawingEntitiesManager.selectedEntitiesArr.length,
      ).toBeGreaterThan(1);
      expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);
    });
  });

  describe('select-all', () => {
    it('records both strands', () => {
      buildTwoPositionDuplex(editor);

      hotkeysConfiguration['select-all'].handler(editor);

      expect(SequenceRenderer.targetedStrand).toBe('both');
    });
  });
});

// getSelectedStrandType (SequenceMode.ts) is the function this describe
// block exercises: it used to read `senseNode?.monomer.selected` directly,
// which on a duplex is always true (both strands of a touched column are
// always selected), so it always answered SENSE -- the root cause of #6595.
// It now answers from SequenceRenderer.targetedStrand instead. These tests
// drive it through a real drag gesture (mousedown + mousemove, exactly like
// the "mousedown drag inside edit mode" tests above) so the selection shape
// is the real one: both strands selected, sense always among them. Library
// replacement is used as the observable proxy for getSelectedStrandType's
// answer, since the function itself is module-private.
describe('getSelectedStrandType resolves the targeted strand, not just selection state', () => {
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

  // Enters edit mode via a first click on the sense row, exactly like the
  // "mousedown drag inside edit mode" tests above.
  const enterEditMode = (editorInstance: CoreEditor) => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editorInstance);

    mode.mousedownBetweenSequenceItems(
      mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
    );
    SequenceRenderer.resetTargetedStrand();

    return { senseNucleotides, antisenseNucleotides };
  };

  it('replaces the ANTISENSE monomer and leaves the SENSE monomer untouched for a drag that targeted the antisense row, even though both strands are selected', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    // A real antisense-row drag: mousedown on the antisense symbol records
    // ANTISENSE, then mousemove ticks select the caret range, which pulls
    // in BOTH strands' monomers at every touched position (per the "columns
    // select both strands" behavior described at the top of this file).
    mode.mousedown(
      mousedownEventFor(rendererForMonomer(antisenseNucleotides[0])),
    );
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    for (let tick = 0; tick < 3; tick++) {
      mode.mousemove(
        mousedownEventFor(rendererForMonomer(senseNucleotides[1])),
      );
    }

    // Sanity check, and proof of the override the amended controller
    // ruling requires: position 0's OWN sense monomer really is selected
    // too (per-position resolution alone would answer SENSE here), so the
    // ANTISENSE result below is only possible because the explicit record
    // overrides that node's own selection state, not because sense was
    // somehow left unselected.
    expect(senseNucleotides[0].rnaBase.selected).toBe(true);
    expect(antisenseNucleotides[0].rnaBase.selected).toBe(true);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    const selections = SequenceRenderer.selections;
    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // The defect this task fixes: before routing getSelectedStrandType
    // through the record, this call always resolved to SENSE regardless of
    // which row the gesture targeted, so it rewrote the sense strand
    // instead of the antisense strand the user actually selected.
    expect(
      editor.drawingEntitiesManager.monomers.has(
        antisenseNucleotides[0].sugar.id,
      ),
    ).toBe(false);
    expect(
      editor.drawingEntitiesManager.monomers.has(senseNucleotides[0].sugar.id),
    ).toBe(true);
  });

  it('replaces the SENSE monomer and leaves the ANTISENSE monomer untouched for a drag that targeted the sense row', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    mode.mousedown(mousedownEventFor(rendererForMonomer(senseNucleotides[0])));
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    for (let tick = 0; tick < 3; tick++) {
      mode.mousemove(
        mousedownEventFor(rendererForMonomer(antisenseNucleotides[1])),
      );
    }

    expect(senseNucleotides[0].rnaBase.selected).toBe(true);
    expect(antisenseNucleotides[0].rnaBase.selected).toBe(true);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);

    const selections = SequenceRenderer.selections;
    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    expect(
      editor.drawingEntitiesManager.monomers.has(senseNucleotides[0].sugar.id),
    ).toBe(false);
    expect(
      editor.drawingEntitiesManager.monomers.has(
        antisenseNucleotides[0].sugar.id,
      ),
    ).toBe(true);
  });

  // select-all writes an explicit 'both' record. getSelectedStrandType
  // resolves that per position from each node's own selection state (per
  // the amended controller ruling): since select-all selects both strands
  // at every column, the sense node is selected at every position, so this
  // honestly (not hard-codedly) resolves to SENSE everywhere -- the same
  // outcome the earlier hard-coded 'both' branch produced, but now derived
  // rather than assumed, which matters because the same per-position
  // branch also has to handle the no-record rectangle-selection case
  // correctly (see the antisenseChainDirection.test.ts mixed-strand
  // regression tests for that case).
  it('resolves a "both" record to SENSE per position, since select-all selects the sense node at every column', () => {
    const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

    hotkeysConfiguration['select-all'].handler(editor);
    expect(SequenceRenderer.targetedStrand).toBe('both');

    const selections = SequenceRenderer.selections;
    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    expect(
      editor.drawingEntitiesManager.monomers.has(senseNucleotides[0].sugar.id),
    ).toBe(false);
    expect(
      editor.drawingEntitiesManager.monomers.has(
        antisenseNucleotides[0].sugar.id,
      ),
    ).toBe(true);
  });
});

// Finding 1 of the whole-branch review: EditorHistory.undo()/redo() call
// drawingEntitiesManager.unselectAllDrawingEntities() directly, bypassing
// SequenceMode.unselectAllEntities() -- the place that pairs an unselect
// with SequenceRenderer.resetTargetedStrand(). Without the paired reset in
// EditorHistory itself, a record written by the gesture that produced the
// undone/redone command survives the selection clear and can steer the next
// edit at the wrong strand. These tests prove the record is reset, not just
// that selection is cleared, by using an ANTISENSE record: since
// targetedStrand's selection-derived fallback defaults to SENSE when
// nothing is selected (see the getter in SequenceRenderer.ts), a stale
// ANTISENSE record and a properly-reset one are observably different --
// unlike a SENSE record, which would coincide with the fallback and prove
// nothing.
describe('EditorHistory undo/redo reset the targeted-strand record', () => {
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
    // explicit reset here, the next test's getInstance(newEditor) call
    // would keep returning the previous test's instance, still pointed at
    // the previous test's (by-then-removed) editor and renderersContainer.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Produces a real history entry, then plants a stale ANTISENSE record on
  // top -- standing in for a gesture's record that outlives the command it
  // accompanied, exactly what a shift-extended rectangle drag can leave
  // behind per the review finding. The command itself only needs to be real
  // enough for undo()/redo() to run past their early-return guards (a select
  // command, like drawingEntitiesManager.selectDrawingEntities produces,
  // does that): what this test is proving is that EditorHistory resets the
  // record, not what particular edit triggered it.
  const makeHistoryEntryAndStaleAntisenseRecord = (
    editorInstance: CoreEditor,
  ) => {
    const { senseNucleotides } = buildTwoPositionDuplex(editorInstance);

    const selectCommand =
      editorInstance.drawingEntitiesManager.selectDrawingEntities([
        senseNucleotides[0].rnaBase,
      ]);
    EditorHistory.getInstance(editorInstance).update(selectCommand);

    SequenceRenderer.setTargetedStrand(STRAND_TYPE.ANTISENSE);
  };

  it('undo clears the record so targetedStrand falls back to derivation, not the stale record', () => {
    makeHistoryEntryAndStaleAntisenseRecord(editor);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    const history = EditorHistory.getInstance(editor);
    history.undo();

    // No selection survives the undo (unselectAllDrawingEntities), so the
    // derived fallback is SENSE. Getting SENSE here -- not the ANTISENSE
    // that was explicitly recorded -- is only possible if undo() reset the
    // record; without the fix this assertion fails and returns ANTISENSE.
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });

  it('redo clears the record so targetedStrand falls back to derivation, not the stale record', () => {
    makeHistoryEntryAndStaleAntisenseRecord(editor);
    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.ANTISENSE);

    const history = EditorHistory.getInstance(editor);
    history.undo();
    SequenceRenderer.setTargetedStrand(STRAND_TYPE.ANTISENSE);
    history.redo();

    expect(SequenceRenderer.targetedStrand).toBe(STRAND_TYPE.SENSE);
  });
});
