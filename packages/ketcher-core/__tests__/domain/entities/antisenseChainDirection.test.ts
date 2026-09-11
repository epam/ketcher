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
});
