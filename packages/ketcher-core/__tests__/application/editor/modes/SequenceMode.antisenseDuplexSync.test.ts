import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { TwoStrandedNodesSelection } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { Entities } from 'domain/types';
import type { LabeledNodesWithPositionInSequence } from 'application/editor/tools/Tool';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { STRAND_TYPE } from 'domain/constants';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { BASE_MODIFICATION_DISABLED_IN_SYNC_MODE } from 'domain/helpers/antisenseBaseSync';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// This suite exercises base replacement propagating to the hydrogen-bonded
// partner on a real duplex, and the both-strands block firing (or not) on
// what is actually selected. A one-strand selection is made the way a
// view-mode drag makes it: by selecting only that strand's monomers.

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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

SVGElement.prototype.getBBox = vi
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

// Calls the private SequenceMode#replaceSelectionsWithMonomer, following the
// cast-through-prototype pattern used elsewhere (see
// antisenseChainDirection.test.ts).
const callReplaceSelectionsWithMonomer = (
  mode: SequenceMode,
  selections: TwoStrandedNodesSelection,
  monomerItem: ReturnType<typeof getRnaPartLibraryItem>,
) => {
  const { replaceSelectionsWithMonomer } =
    SequenceMode.prototype as unknown as {
      replaceSelectionsWithMonomer: (
        this: SequenceMode,
        selections: TwoStrandedNodesSelection,
        monomerItem: NonNullable<ReturnType<typeof getRnaPartLibraryItem>>,
      ) => void;
    };

  return replaceSelectionsWithMonomer.call(
    mode,
    selections,
    monomerItem as NonNullable<ReturnType<typeof getRnaPartLibraryItem>>,
  );
};

const requireBaseLibraryItem = (editor: CoreEditor, label: string) => {
  const item = getRnaPartLibraryItem(editor, label, KetMonomerClass.Base);

  if (!item) {
    throw new Error(`Base library item ${label} not found`);
  }

  return item;
};

describe('SequenceMode antisense duplex sync (task 6 re-scoped block)', () => {
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
    // editor it ever saw (see EditorHistory.getInstance): without an
    // explicit reset here, a later test's getInstance(newEditor) call would
    // keep returning this test's instance, still pointed at this test's
    // (by-then-removed) editor and renderersContainer.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Enters edit mode via a first click on the sense row.
  const enterEditMode = (editorInstance: CoreEditor) => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editorInstance);

    mode.mousedownBetweenSequenceItems(
      mousedownEventFor(rendererForMonomer(senseNucleotides[0])),
    );

    return { senseNucleotides, antisenseNucleotides };
  };

  // A view-mode drag over one row selects exactly the symbols it covers.
  const selectOnly = (nucleotides: Nucleotide[]) => {
    editor.drawingEntitiesManager.unselectAllDrawingEntities();
    editor.drawingEntitiesManager.selectDrawingEntities(
      // A chain-terminal nucleotide has no phosphate, hence the filter.
      nucleotides.flatMap((nucleotide) => nucleotide.monomers).filter(Boolean),
    );
  };

  // An edit-mode drag: mousedown, then mousemove ticks select the caret
  // range, which -- per the "columns select both strands" behavior at the
  // heart of #6595 -- pulls in BOTH strands' monomers at every touched
  // position even though only one row was dragged.
  //
  // `endNode` is re-resolved to a fresh renderer on every tick, not passed
  // as a pre-fetched renderer: mousedown/mousemove can rebuild the sequence
  // view model and destroy prior renderer instances, so a renderer captured
  // before the loop can go stale partway through it.
  const dragAcrossBothPositions = (
    startNode: Nucleotide,
    endNode: Nucleotide,
  ) => {
    mode.mousedown(mousedownEventFor(rendererForMonomer(startNode)));

    for (let tick = 0; tick < 3; tick++) {
      mode.mousemove(mousedownEventFor(rendererForMonomer(endNode)));
    }
  };

  describe('Step 3: a one-strand gesture propagates the complement (main behavior is reachable)', () => {
    it('propagates sense -> antisense through replaceSelectionsWithMonomer, for a selection that only holds the sense row', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      selectOnly(senseNucleotides);

      // Sanity: the antisense row is not selected, so the propagation below
      // is keyed on the selection, not on a gesture record.
      expect(senseNucleotides[0].rnaBase.selected).toBe(true);
      expect(antisenseNucleotides[0].rnaBase.selected).toBe(false);

      const selections = SequenceRenderer.selections;
      const newBaseItem = requireBaseLibraryItem(editor, 'C');

      callReplaceSelectionsWithMonomer(mode, selections, newBaseItem);

      // Position 0: sense A -> C, so its antisense partner (U) must mirror
      // to G -- the behavior the issue title asks for, exercised through a
      // real gesture and a real duplex for the first time.
      expect(antisenseNucleotides[0].rnaBase.label).toBe('G');
    });

    it('propagates antisense -> sense through modifySequenceInRnaBuilder, for a selection that only holds the antisense row', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      selectOnly(antisenseNucleotides);
      expect(senseNucleotides[0].rnaBase.selected).toBe(false);
      expect(antisenseNucleotides[0].rnaBase.selected).toBe(true);

      // modifySequenceInRnaBuilder is driven by the RNA Builder's own
      // payload shape (LabeledNodesWithPositionInSequence), not directly by
      // SequenceRenderer.selections, but nodeIndexOverall must still come
      // from a real selection made by the real gesture above -- not an
      // index guessed by the test.
      const nodeIndexOverall = SequenceRenderer.selections
        .flat()
        .find(
          (selection) => selection.nodeIndexOverall === 0,
        )?.nodeIndexOverall;

      if (nodeIndexOverall === undefined) {
        throw new Error('Fixture setup failed: position 0 was not selected');
      }

      const updatedSelection: LabeledNodesWithPositionInSequence[] = [
        {
          type: Entities.Nucleotide,
          nodeIndexOverall,
          strandType: STRAND_TYPE.ANTISENSE,
          baseLabel: 'A',
        },
      ];

      mode.modifySequenceInRnaBuilder(updatedSelection);

      // Position 0: antisense U -> A, so its sense partner (A) must mirror
      // to U -- the antisense-to-sense direction, through the RNA Builder's
      // own write-back path.
      expect(senseNucleotides[0].rnaBase.label).toBe('U');
    });

    // The spec (design Decision behind #6595's sync propagation) says the
    // mirrored edit and the original edit "are applied as a single undo
    // step". Nothing exercised that until now: this drives a real
    // propagating replacement through a single sense symbol, then proves ONE
    // undo() reverts BOTH bases and moves the history pointer back by exactly
    // one -- not two separate steps.
    it('undoes a propagating replacement as a single history step, restoring both bases; redo reapplies both', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
      const senseLabelBefore = senseNucleotides[0].rnaBase.label;
      const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;
      const originalSenseBaseId = senseNucleotides[0].rnaBase.id;

      selectOnly([senseNucleotides[0]]);

      const selections = SequenceRenderer.selections
        .map((range) =>
          range.filter((selection) => selection.nodeIndexOverall === 0),
        )
        .filter((range) => range.length > 0);
      const newBaseItem = requireBaseLibraryItem(editor, 'C');

      const history = EditorHistory.getInstance(editor);
      const historyPointerBefore = history.historyPointer;

      // The directly-targeted (sense) node is deleted and recreated as a
      // bare Base monomer by replaceSelectionWithMonomer -- so
      // senseNucleotides[0].rnaBase, fixed at construction, goes stale the
      // moment the replacement runs. The new sense base monomer is found by
      // diffing the monomer map before/after instead. The mirrored
      // (antisense) side, by contrast, is mutated in place by
      // createMirroredBaseCommand's modifyMonomerItem call, so
      // antisenseNucleotides[0].rnaBase -- same object throughout -- keeps
      // reflecting its current label directly.
      const monomerIdsBeforeReplace = new Set(
        editor.drawingEntitiesManager.monomers.keys(),
      );

      callReplaceSelectionsWithMonomer(mode, selections, newBaseItem);

      // One command was pushed for the propagating pair, not two.
      expect(history.historyPointer).toBe(historyPointerBefore + 1);

      const newSenseMonomerId = [
        ...editor.drawingEntitiesManager.monomers.keys(),
      ].find((id) => !monomerIdsBeforeReplace.has(id));

      if (newSenseMonomerId === undefined) {
        throw new Error(
          'Fixture setup failed: no new sense monomer found after replace',
        );
      }

      const newSenseLabel = () =>
        (
          editor.drawingEntitiesManager.monomers.get(newSenseMonomerId) as
            { label?: string } | undefined
        )?.label;

      // Position 0: sense A -> C, antisense (mirrored) U -> G.
      expect(newSenseLabel()).toBe('C');
      expect(antisenseNucleotides[0].rnaBase.label).toBe('G');

      history.undo();

      // A single undo() restores BOTH bases and moves the pointer back by
      // exactly one -- proof the mirrored pair was one undo step, not two.
      expect(history.historyPointer).toBe(historyPointerBefore);
      expect(
        editor.drawingEntitiesManager.monomers.has(newSenseMonomerId),
      ).toBe(false);
      expect(
        editor.drawingEntitiesManager.monomers.has(originalSenseBaseId),
      ).toBe(true);
      expect(senseNucleotides[0].rnaBase.label).toBe(senseLabelBefore);
      expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);

      history.redo();

      expect(history.historyPointer).toBe(historyPointerBefore + 1);
      expect(newSenseLabel()).toBe('C');
      expect(antisenseNucleotides[0].rnaBase.label).toBe('G');
    });
  });

  describe('Step 4: the both-strands block still fires', () => {
    // Selects both strands at position 0 directly and asserts the refusal
    // path.
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

      const selections: TwoStrandedNodesSelection = SequenceRenderer.selections
        .map((range) =>
          range.filter((selection) => selection.nodeIndexOverall === 0),
        )
        .filter((range) => range.length > 0);

      return selections;
    };

    it('refuses base replacement with the mandated message and leaves the canvas unchanged, when sync is on and both strands are selected', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
      const senseLabelBefore = senseNucleotides[0].rnaBase.label;
      const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;

      expect(mode.isSyncEditMode).toBe(true);

      selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);
      const newBaseItem = requireBaseLibraryItem(editor, 'C');
      const dispatchSpy = vi.spyOn(editor.events.error, 'dispatch');

      mode.insertMonomerFromLibrary(newBaseItem);

      expect(dispatchSpy).toHaveBeenCalledWith(
        BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
      );
      expect(senseNucleotides[0].rnaBase.label).toBe(senseLabelBefore);
      expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);

      dispatchSpy.mockRestore();
    });

    it('does NOT block base replacement for a both-strands selection when sync editing is OFF', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);

      // Cast-through-prototype flag flip, same pattern used for
      // _isAntisenseEditMode elsewhere in these suites:
      // avoids the initialize() re-render that turnOffSyncEditMode()
      // would trigger, which would tear down the renderers this test
      // already captured references for.
      (mode as unknown as { _isSyncEditMode: boolean })._isSyncEditMode = false;
      expect(mode.isSyncEditMode).toBe(false);

      // Position 0's fixture carries a real backbone bond forward to
      // position 1 (sense[0].phosphate R2 -> sense[1].sugar R1). Routing
      // through the real insertMonomerFromLibrary entry point (required to
      // exercise the sync gate for real, see the comment below) also runs
      // the generic "would this monomer still hold the chain together"
      // pre-check ahead of the sync gate, and a lone base item has no R2 of
      // its own to satisfy it -- a legitimate check, unrelated to sync
      // editing. Dropping the forward backbone bond here makes position 0
      // chain-terminal, same as any node the sync gate would actually be
      // exercised on in isolation.
      const backboneBondToNextSenseNode =
        senseNucleotides[0].phosphate.attachmentPointsToBonds.R2;
      if (backboneBondToNextSenseNode instanceof PolymerBond) {
        editor.drawingEntitiesManager.deletePolymerBond(
          backboneBondToNextSenseNode,
        );
      }

      // Sets up the both-strands selection state that
      // insertMonomerFromLibrary reads from SequenceRenderer.
      selectBothStrandsAtPositionZero(senseNucleotides, antisenseNucleotides);
      const newBaseItem = requireBaseLibraryItem(editor, 'C');
      const dispatchSpy = vi.spyOn(editor.events.error, 'dispatch');

      mode.insertMonomerFromLibrary(newBaseItem);

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
      );
      // Sense side was replaced: the block did not fire, so the ordinary
      // replacement went through.
      expect(
        editor.drawingEntitiesManager.monomers.has(
          senseNucleotides[0].sugar.id,
        ),
      ).toBe(false);

      dispatchSpy.mockRestore();
    });
  });

  describe('selection decides, per pair', () => {
    it('treats an edit-mode drag as a both-strands selection and refuses base replacement', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
      dragAcrossBothPositions(senseNucleotides[0], antisenseNucleotides[1]);
      const dispatchSpy = vi.spyOn(editor.events.error, 'dispatch');

      mode.insertMonomerFromLibrary(requireBaseLibraryItem(editor, 'C'));

      expect(dispatchSpy).toHaveBeenCalledWith(
        BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
      );
      expect(senseNucleotides[0].rnaBase.label).toBe('A');
      expect(antisenseNucleotides[0].rnaBase.label).toBe('U');
      dispatchSpy.mockRestore();
    });

    it('mirrors each selected base to its own partner when unpaired symbols on both rows are selected', () => {
      const { senseNucleotides, antisenseNucleotides } =
        buildTwoPositionDuplex(editor);
      // sense position 0 (A, partner U) and antisense position 1 (G, partner C)
      selectOnly([senseNucleotides[0], antisenseNucleotides[1]]);
      const dispatchSpy = vi.spyOn(editor.events.error, 'dispatch');

      callReplaceSelectionsWithMonomer(
        mode,
        SequenceRenderer.selections,
        requireBaseLibraryItem(editor, 'U'),
      );

      expect(dispatchSpy).not.toHaveBeenCalled();
      // sense A -> U mirrors its partner U -> A
      expect(antisenseNucleotides[0].rnaBase.label).toBe('A');
      // antisense G -> U mirrors its partner C -> A (ribose)
      expect(senseNucleotides[1].rnaBase.label).toBe('A');
      dispatchSpy.mockRestore();
    });

    it('refuses the whole base edit when one pair is fully selected among one-strand positions', () => {
      const { senseNucleotides, antisenseNucleotides } =
        buildTwoPositionDuplex(editor);
      selectOnly([
        senseNucleotides[0],
        antisenseNucleotides[0],
        senseNucleotides[1],
      ]);
      const dispatchSpy = vi.spyOn(editor.events.error, 'dispatch');

      mode.insertMonomerFromLibrary(requireBaseLibraryItem(editor, 'U'));

      expect(dispatchSpy).toHaveBeenCalledWith(
        BASE_MODIFICATION_DISABLED_IN_SYNC_MODE,
      );
      expect(senseNucleotides[1].rnaBase.label).toBe('C');
      expect(antisenseNucleotides[1].rnaBase.label).toBe('G');
      dispatchSpy.mockRestore();
    });
  });

  describe('Step 5: nothing empty reaches history', () => {
    it('grows the history stack by exactly one entry when a sense replacement preserves the natural analogue, and leaves the antisense partner untouched', () => {
      const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
      const antisenseLabelBefore = antisenseNucleotides[0].rnaBase.label;
      const antisenseMonomerBefore = antisenseNucleotides[0].rnaBase;

      selectOnly([senseNucleotides[0]]);

      const selections = SequenceRenderer.selections
        .map((range) =>
          range.filter((selection) => selection.nodeIndexOverall === 0),
        )
        .filter((range) => range.length > 0);

      // Sense position 0 is 'A'; replacing it with 'A' again preserves the
      // natural analogue, so createMirroredBaseCommand must return
      // undefined and nothing must be merged into modelChanges for the
      // antisense side.
      const sameBaseItem = requireBaseLibraryItem(editor, 'A');

      const history = EditorHistory.getInstance(editor);
      const historyLengthBefore = history.historyStack.length;

      callReplaceSelectionsWithMonomer(mode, selections, sameBaseItem);

      expect(history.historyStack.length).toBe(historyLengthBefore + 1);
      // The antisense monomer was never touched by the mirror: same object,
      // same label.
      expect(antisenseNucleotides[0].rnaBase).toBe(antisenseMonomerBefore);
      expect(antisenseNucleotides[0].rnaBase.label).toBe(antisenseLabelBefore);
    });
  });
});
