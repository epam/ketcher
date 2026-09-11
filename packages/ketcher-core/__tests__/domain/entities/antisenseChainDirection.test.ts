import { CoreEditor, SequenceMode } from 'application/editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { TwoStrandedNodesSelection } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import {
  getNextMonomerInChain,
  getSugarFromRnaBase,
} from 'domain/helpers/monomers';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

// A minimal render theme with an 'X' fallback color so that
// UnsplitNucleotideRenderer (used when a library replacement monomer is
// rendered by replaceSelectionsWithMonomer) does not throw regardless of
// the replacement's natural analog code. 'R' and 'P' are also supplied so
// that inverting a command that deletes-and-recreates a sugar/phosphate
// (e.g. undoing a library replacement) can render the recreated monomers.
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

const selectAllMonomers = (editor: CoreEditor) => {
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
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
// cast-through-prototype pattern already used for private-method tests in
// this codebase (see Editor.test.ts's callRescaleStructForModeTransition).
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

// SequenceMode keeps the sync toggle and the "antisense edit mode" flag
// (turned on by ordinary mouse interaction with an antisense symbol) as two
// independent private fields. They are set directly here rather than through
// turnOffSyncEditMode()/turnOnAntisenseEditMode(), because those also call
// SequenceMode#initialize, which re-renders the whole sequence and would
// discard the SequenceRenderer snapshot the assertions below rely on.
const setEditModes = (
  mode: SequenceMode,
  {
    isSyncEditMode,
    isAntisenseEditMode,
  }: { isSyncEditMode: boolean; isAntisenseEditMode: boolean },
) => {
  const modeInternals = mode as unknown as {
    _isSyncEditMode: boolean;
    _isAntisenseEditMode: boolean;
  };

  modeInternals._isSyncEditMode = isSyncEditMode;
  modeInternals._isAntisenseEditMode = isAntisenseEditMode;
};

// Builds a 4-nucleotide sense chain (positions 0..3, left to right) and
// mirrors it into an antisense duplex, then renders both strands through
// SequenceRenderer so the strand-aware lookups under test
// (getNextNodeInSameChain/getPreviousNodeInSameChain, SequenceRenderer.selections)
// operate on a real two-stranded snapshot. antisenseNucleotides[i] is the
// antisense partner displayed directly below senseNucleotides[i]; because the
// antisense chain runs opposite to display order, the chemical chain is
// antisenseNucleotides[3] -> [2] -> [1] -> [0].
const buildFourNucleotideDuplex = (editor: CoreEditor) => {
  const drawingEntitiesManager = editor.drawingEntitiesManager;
  const senseNucleotides = ['A', 'C', 'G', 'U'].map(
    (base, index) =>
      Nucleotide.createOnCanvas(base, new Vec2(index * 1.6, 0)).node,
  );

  for (let index = 0; index < senseNucleotides.length - 1; index++) {
    drawingEntitiesManager.createPolymerBond(
      senseNucleotides[index].phosphate,
      senseNucleotides[index + 1].sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
  }

  selectAllMonomers(editor);
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

  const chainsCollection = ChainsCollection.fromMonomers([
    ...drawingEntitiesManager.monomers.values(),
  ]);
  chainsCollection.rearrange();
  SequenceRenderer.show(chainsCollection);

  return { senseNucleotides, antisenseNucleotides };
};

// Walks the backbone forward via getNextMonomerInChain starting at
// `start` (a Sugar), returning every visited monomer (sugars and
// phosphates alternating) in chain order.
const walkMonomerChain = (start: BaseMonomer): BaseMonomer[] => {
  const visited: BaseMonomer[] = [start];
  let current: BaseMonomer | undefined = start;

  // Bound the walk well above any chain length used in these tests so a
  // regression that creates a cycle fails loudly instead of hanging.
  for (let guard = 0; guard < 50; guard++) {
    const next = getNextMonomerInChain(current);

    if (!next) {
      break;
    }

    visited.push(next);
    current = next;
  }

  return visited;
};

describe('antisense chain direction', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('runs an antisense chain in the opposite direction to the sense chain', () => {
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const firstNucleotide = Nucleotide.createOnCanvas('A', new Vec2(0, 0)).node;
    const secondNucleotide = Nucleotide.createOnCanvas(
      'C',
      new Vec2(1.6, 0),
    ).node;

    drawingEntitiesManager.createPolymerBond(
      firstNucleotide.phosphate,
      secondNucleotide.sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    selectAllMonomers(editor);
    drawingEntitiesManager.createAntisenseChain(false);

    const senseSugar = firstNucleotide.sugar;
    // The second sense nucleotide's paired antisense base is the chain-start
    // (5') end of the antisense strand: it is the one with a "next" neighbor,
    // whereas the antisense partner of the first sense nucleotide is the
    // chain-end (3') node with no "next" neighbor.
    const pairedSenseSugar = secondNucleotide.sugar;
    const antisenseBase = pairedSenseSugar.hydrogenBonds.length
      ? pairedSenseSugar.hydrogenBonds[0].getAnotherMonomer(pairedSenseSugar)
      : secondNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
          secondNucleotide.rnaBase,
        );
    const antisenseSugar = getSugarFromRnaBase(antisenseBase as RNABase);

    expect(antisenseSugar).toBeDefined();

    const senseNext = getNextMonomerInChain(senseSugar);
    const antisenseNext = getNextMonomerInChain(antisenseSugar as Sugar);

    // The sense strand advances to the right; the antisense strand advances
    // to the left, which is why display order and chain order disagree.
    expect(senseNext?.position.x).toBeGreaterThan(senseSugar.position.x);
    expect(antisenseNext?.position.x).toBeLessThan(
      (antisenseSugar as Sugar).position.x,
    );
  });

  it('replaces a single mid-strand antisense node and reconnects the chain', () => {
    const mode = new SequenceMode();
    const { antisenseNucleotides } = buildFourNucleotideDuplex(editor);

    // antisenseNucleotides[1] sits between antisenseNucleotides[2] (its
    // chain-previous) and antisenseNucleotides[0] (its chain-next).
    editor.drawingEntitiesManager.selectDrawingEntities(
      antisenseNucleotides[1].monomers,
    );

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(1);

    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    const visitedChain = walkMonomerChain(antisenseNucleotides[3].sugar);
    const visitedSugarIds = visitedChain
      .filter((monomer): monomer is Sugar => monomer instanceof Sugar)
      .map((sugar) => sugar.id);

    // The chain is still fully connected end to end: walking forward from
    // the untouched chain-start sugar reaches the untouched chain-end sugar.
    // (Comparing .id rather than the monomer objects themselves: Jest's
    // diff-printer chokes on BaseMonomer's internal Pool-backed fields when
    // an object equality assertion fails, obscuring the real failure.)
    expect(visitedChain[visitedChain.length - 1].id).toBe(
      antisenseNucleotides[0].sugar.id,
    );
    expect(visitedSugarIds).toEqual([
      antisenseNucleotides[3].sugar.id,
      antisenseNucleotides[2].sugar.id,
      antisenseNucleotides[0].sugar.id,
    ]);
    // No cycles or revisits.
    expect(new Set(visitedChain.map((monomer) => monomer.id)).size).toBe(
      visitedChain.length,
    );

    // The old, replaced node's monomers are gone from the model (no
    // monomer still referencing a deleted node).
    antisenseNucleotides[1].monomers.forEach((monomer) => {
      expect(editor.drawingEntitiesManager.monomers.has(monomer.id)).toBe(
        false,
      );
    });
  });

  it('replaces two adjacent mid-strand antisense nodes in one call and keeps the chain fully connected (regression for the display-order/chain-order carry)', () => {
    const mode = new SequenceMode();
    const { antisenseNucleotides } = buildFourNucleotideDuplex(editor);

    // Select antisenseNucleotides[1] and [2] together: they are adjacent in
    // display order (indices 1, 2) but visited in the OPPOSITE order by the
    // chain ([2] comes before [1] chain-wise), which is exactly the case
    // where a display-order-only carry of "previous replaced node" produces
    // a wrong link.
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...antisenseNucleotides[1].monomers,
      ...antisenseNucleotides[2].monomers,
    ]);

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(2);

    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    const visitedChain = walkMonomerChain(antisenseNucleotides[3].sugar);
    const visitedSugarIds = visitedChain
      .filter((monomer): monomer is Sugar => monomer instanceof Sugar)
      .map((sugar) => sugar.id);

    // The chain must still be fully connected end to end: walking forward
    // from the untouched chain-start sugar must reach the untouched
    // chain-end sugar, with only those two original sugars surviving in
    // between (both replaced positions are gone). (Comparing .id rather
    // than the monomer objects themselves for the same reason as above.)
    expect(visitedChain[visitedChain.length - 1].id).toBe(
      antisenseNucleotides[0].sugar.id,
    );
    expect(visitedSugarIds).toEqual([
      antisenseNucleotides[3].sugar.id,
      antisenseNucleotides[0].sugar.id,
    ]);
    // No cycles or revisits, and no dangling middle: exactly the untouched
    // start nucleotide's sugar and phosphate, the two new replacement
    // monomers, and the untouched end nucleotide's sugar.
    expect(new Set(visitedChain.map((monomer) => monomer.id)).size).toBe(
      visitedChain.length,
    );
    expect(visitedChain).toHaveLength(5);

    // Neither replaced node's monomers still exist in the model.
    [
      ...antisenseNucleotides[1].monomers,
      ...antisenseNucleotides[2].monomers,
    ].forEach((monomer) => {
      expect(editor.drawingEntitiesManager.monomers.has(monomer.id)).toBe(
        false,
      );
    });
  });

  it('mirrors the paired base onto the opposite strand when a sense node is replaced via the library, and reverts on undo (regression for #6595)', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // senseNucleotides[1] is 'C', paired (via the hydrogen bond) with
    // antisenseNucleotides[1]'s 'G'. This exercises the select-and-
    // replace-from-library path (not the direct createMirroredBaseCommand
    // call), so it also proves that replaceSelectionWithMonomer's node
    // deletion doesn't leave the mirror unable to find the partner: the
    // partner and eligibility must be captured before that deletion runs.
    editor.drawingEntitiesManager.selectDrawingEntities(
      senseNucleotides[1].monomers,
    );

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(1);
    expect(antisenseNucleotides[1].rnaBase.label).toBe('G');

    // '2-damdA' is a modified-adenine RNA-class library preset (natural
    // analogue 'A'), picked because it changes the natural analogue away
    // from 'C' and is available as a whole node-replacement item, unlike
    // the plain unmodified bases which the library only exposes as
    // standalone Base parts.
    const replacementItem = findLibraryItemByAlias(editor, '2-damdA');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // The opposite strand's base actually changed: C->A on the sense side
    // means its partner must become A's complement, U (was G).
    expect(antisenseNucleotides[1].rnaBase.label).toBe('U');

    const history = EditorHistory.getInstance(editor);
    const appliedCommand = history.previousCommand;

    appliedCommand.invert(editor.renderersContainer);

    // A single undo reverts both the library replacement and its mirror.
    expect(antisenseNucleotides[1].rnaBase.label).toBe('G');
  });

  it('mirrors every paired base when a multi-node sense range is replaced via the library in one call (regression for #6595)', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // senseNucleotides[1] ('C') and [2] ('G') are adjacent and paired with
    // antisenseNucleotides[1] ('G') and [2] ('C') respectively. Both are
    // replaced by the SAME library item in one call, so this proves the
    // mirror runs independently for every node in the range using that
    // node's own captured partner/eligibility, not just the first one (a
    // single shared/stale value would either no-op or misattribute the
    // update on the second node).
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...senseNucleotides[1].monomers,
      ...senseNucleotides[2].monomers,
    ]);

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(2);
    expect(antisenseNucleotides[1].rnaBase.label).toBe('G');
    expect(antisenseNucleotides[2].rnaBase.label).toBe('C');

    const replacementItem = findLibraryItemByAlias(editor, '2-damdA');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // Both sense nodes became 'A' (2-damdA's natural analogue), so BOTH
    // paired antisense bases must become 'U', not just the first one
    // touched in the loop.
    expect(antisenseNucleotides[1].rnaBase.label).toBe('U');
    expect(antisenseNucleotides[2].rnaBase.label).toBe('U');
  });

  // SequenceRenderer.selections starts a new range only when the PREVIOUS
  // display position was unselected; it never breaks on a strand change. So a
  // selection that covers consecutive positions but picks the sense node at
  // some of them and the antisense node at others arrives as ONE range with
  // mixed strands -- the shape produced in practice by selecting across a
  // duplex whose strands do not line up over their whole length (an siRNA
  // overhang, for instance). Resolving the strand once from element 0 then
  // applies the wrong strand to the rest of the range.
  // The antisense nodes are rebuilt with Nucleotide.fromSugar, and the one at
  // the antisense strand's chain end has no trailing phosphate, so its
  // `monomers` array carries an undefined slot.
  const nodeMonomers = (nodes: Nucleotide[]): BaseMonomer[] =>
    nodes
      .flatMap((node) => node.monomers)
      .filter((monomer): monomer is BaseMonomer => Boolean(monomer));

  const expectNodesPresent = (
    editor: CoreEditor,
    nodes: Nucleotide[],
    present: boolean,
  ) => {
    nodeMonomers(nodes).forEach((monomer) => {
      expect(editor.drawingEntitiesManager.monomers.has(monomer.id)).toBe(
        present,
      );
    });
  };

  it('replaces the actually selected node at every position of a mixed-strand range that starts on the antisense strand', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // Positions 0 and 1 select the ANTISENSE node, position 2 selects the
    // SENSE node. Every position 0..2 has something selected, so this is a
    // single contiguous range whose element 0 is antisense. (Position 3 is
    // left out: the sense strand's trailing phosphate renders as a node of
    // its own past the last nucleotide, which would only add noise here.)
    editor.drawingEntitiesManager.selectDrawingEntities(
      nodeMonomers([
        antisenseNucleotides[0],
        antisenseNucleotides[1],
        senseNucleotides[2],
      ]),
    );

    const selections = SequenceRenderer.selections;

    // The renderer really does hand this over as one mixed range -- if it
    // ever starts splitting on strand changes itself, this assertion says so
    // rather than letting the test quietly stop covering anything.
    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(3);

    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // Every selected node is gone (replaced)...
    expectNodesPresent(
      editor,
      [antisenseNucleotides[0], antisenseNucleotides[1], senseNucleotides[2]],
      false,
    );
    // ...and no unselected node was replaced in its place. Resolving the
    // whole range as ANTISENSE (element 0's strand) would have replaced
    // antisenseNucleotides[2] here and left the selected sense node
    // standing.
    expectNodesPresent(
      editor,
      [
        senseNucleotides[0],
        senseNucleotides[1],
        antisenseNucleotides[2],
        antisenseNucleotides[3],
      ],
      true,
    );
  });

  it('replaces the actually selected node at every position of a mixed-strand range that starts on the sense strand', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // The mirror image of the previous test: element 0 is sense, and the
    // antisense-only positions come later. Resolving the whole range as
    // SENSE skips the selected antisense nodes entirely and replaces the
    // unselected sense nodes above them instead.
    editor.drawingEntitiesManager.selectDrawingEntities(
      nodeMonomers([
        senseNucleotides[0],
        senseNucleotides[1],
        antisenseNucleotides[2],
        antisenseNucleotides[3],
      ]),
    );

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(4);

    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    expectNodesPresent(
      editor,
      [
        senseNucleotides[0],
        senseNucleotides[1],
        antisenseNucleotides[2],
        antisenseNucleotides[3],
      ],
      false,
    );
    expectNodesPresent(
      editor,
      [
        antisenseNucleotides[0],
        antisenseNucleotides[1],
        senseNucleotides[2],
        senseNucleotides[3],
      ],
      true,
    );
  });

  it('keeps the antisense sub-range of a mixed-strand selection connected, walking it in chain order (regression for the display-order/chain-order carry)', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // The antisense half of the mixed range is two ADJACENT antisense nodes
    // ([1] and [2]), i.e. exactly the pair whose chain order is the reverse
    // of their display order. Splitting the range by strand must hand that
    // half to the existing loop as its own range so the reversal and the
    // carried "previous replaced node" still apply to it; splitting that
    // merely relabelled positions would leave the backbone broken here.
    editor.drawingEntitiesManager.selectDrawingEntities(
      nodeMonomers([
        senseNucleotides[0],
        antisenseNucleotides[1],
        antisenseNucleotides[2],
      ]),
    );

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(3);

    const replacementItem = findLibraryItemByAlias(editor, 'Super-G');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    const visitedChain = walkMonomerChain(antisenseNucleotides[3].sugar);
    const visitedSugarIds = visitedChain
      .filter((monomer): monomer is Sugar => monomer instanceof Sugar)
      .map((sugar) => sugar.id);

    // Walking forward from the untouched antisense chain-start sugar still
    // reaches the untouched chain-end sugar, with both replaced positions
    // gone from in between and no cycles.
    expect(visitedSugarIds).toEqual([
      antisenseNucleotides[3].sugar.id,
      antisenseNucleotides[0].sugar.id,
    ]);
    expect(new Set(visitedChain.map((monomer) => monomer.id)).size).toBe(
      visitedChain.length,
    );
    expect(visitedChain).toHaveLength(5);
  });

  it('does not touch the opposite strand when sync edit mode is off, even though antisense edit mode is on', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // The exact workflow the blocked-pair error message directs users into:
    // turn sync OFF, then click into the antisense row (which is what sets
    // antisense edit mode) and replace one antisense base. Antisense edit
    // mode is independent of the sync toggle, so a mirror keyed off
    // "sync OR antisense edit mode" fires here and rewrites the sense
    // partner; rule 2.1 says non-sync mode must leave it alone. This pins
    // the CALLER's choice of condition: createMirroredBaseCommand's own
    // suppression is already covered at the helper level, but it can only
    // suppress what it is told.
    setEditModes(mode, { isSyncEditMode: false, isAntisenseEditMode: true });

    editor.drawingEntitiesManager.selectDrawingEntities(
      antisenseNucleotides[1].monomers,
    );

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(1);
    expect(senseNucleotides[1].rnaBase.label).toBe('C');

    const replacementItem = findLibraryItemByAlias(editor, '2-damdA');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // The sense partner keeps its original base: no mirror in non-sync mode.
    expect(senseNucleotides[1].rnaBase.label).toBe('C');
  });

  it('mirrors every paired base when a multi-node antisense range is replaced via the library in one call, exercising the reversed chain-order loop (regression for #6595)', () => {
    const mode = new SequenceMode();
    const { senseNucleotides, antisenseNucleotides } =
      buildFourNucleotideDuplex(editor);

    // Selecting antisenseNucleotides[1] and [2] together is the same
    // selection used by the "replaces two adjacent mid-strand antisense
    // nodes" structural test above, precisely because the antisense chain
    // runs opposite to display order: chain-wise, [2] is visited BEFORE [1]
    // by replaceSelectionsWithMonomer's reversed loop. That is exactly the
    // case Task 6 found broken for the backbone carry, so it is the case
    // most likely to expose a mirror that only works for the
    // first-visited node (chain-wise [2]) and silently skips or
    // misattributes the second (chain-wise [1]).
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...antisenseNucleotides[1].monomers,
      ...antisenseNucleotides[2].monomers,
    ]);

    const selections = SequenceRenderer.selections;

    expect(selections).toHaveLength(1);
    expect(selections[0]).toHaveLength(2);
    expect(senseNucleotides[1].rnaBase.label).toBe('C');
    expect(senseNucleotides[2].rnaBase.label).toBe('G');

    const replacementItem = findLibraryItemByAlias(editor, '2-damdA');

    callReplaceSelectionsWithMonomer(mode, selections, replacementItem);

    // Both antisense nodes became 'A', so BOTH paired sense bases must
    // become 'U' -- including senseNucleotides[1], the node visited SECOND
    // by the reversed antisense loop.
    expect(senseNucleotides[1].rnaBase.label).toBe('U');
    expect(senseNucleotides[2].rnaBase.label).toBe('U');
  });
});
