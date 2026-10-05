import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import type { TwoStrandedNodesSelection } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import type { RNABase } from 'domain/entities/RNABase';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Sugar } from 'domain/entities/Sugar';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { AttachmentPointName } from 'domain/types';
import type { IRnaPreset } from 'application/editor/tools/Tool';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// This suite exercises library replacement of a position whose both strands
// are selected: each strand is visited as its own run, so the antisense
// monomer is replaced along with the sense one.

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

const getLibraryItem = (
  editor: CoreEditor,
  label: string,
  monomerClass: KetMonomerClass,
) => {
  const item = getRnaPartLibraryItem(editor, label, monomerClass);

  if (!item) {
    throw new Error(`Library item ${label} not found`);
  }

  return item;
};

const buildPreset = (editor: CoreEditor, baseLabel: string): IRnaPreset => ({
  name: baseLabel,
  sugar: getLibraryItem(editor, 'R', KetMonomerClass.Sugar),
  phosphate: getLibraryItem(editor, 'P', KetMonomerClass.Phosphate),
  base: getLibraryItem(editor, baseLabel, KetMonomerClass.Base),
});

// Private methods are called through the prototype (see
// SequenceMode.antisenseDuplexSync.test.ts).
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

const callSelectionsContainLinkerNode = (
  mode: SequenceMode,
  selections: TwoStrandedNodesSelection,
) => {
  const { selectionsContainLinkerNode } = SequenceMode.prototype as unknown as {
    selectionsContainLinkerNode: (
      this: SequenceMode,
      selections: TwoStrandedNodesSelection,
    ) => boolean;
  };

  return selectionsContainLinkerNode.call(mode, selections);
};

describe('SequenceMode library replacement visits each strand separately', () => {
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
    // Sync editing off: the monomer replacements below must not mirror bases.
    (mode as unknown as { _isSyncEditMode: boolean })._isSyncEditMode = false;
  });

  afterEach(() => {
    // EditorHistory is a process-wide singleton (see EditorHistory
    // .getInstance); reset it so the next test's editor is picked up.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Selects the sugar and base of each nucleotide, which is what makes up its
  // sequence position. The fixture's trailing phosphates are left out: a
  // phosphate that does not belong to a nucleotide node is a sequence node of
  // its own, and selecting it would add a position to the selection.
  const selectOnly = (nucleotides: Nucleotide[]) => {
    editor.drawingEntitiesManager.unselectAllDrawingEntities();
    editor.drawingEntitiesManager.selectDrawingEntities(
      nucleotides.flatMap((nucleotide) => [
        nucleotide.sugar,
        nucleotide.rnaBase,
      ]),
    );
  };

  const monomerIds = () => [...editor.drawingEntitiesManager.monomers.keys()];

  const newMonomersOf = (originalIds: Set<number>, label: string) =>
    [...editor.drawingEntitiesManager.monomers.values()].filter(
      (monomer) => !originalIds.has(monomer.id) && monomer.label === label,
    );

  const isBondedR2ToR1 = (first: BaseMonomer, second: BaseMonomer) =>
    [...editor.drawingEntitiesManager.polymerBonds.values()].some(
      (bond) =>
        bond.firstMonomer === first &&
        bond.secondMonomer === second &&
        first.getAttachmentPointByBond(bond) === AttachmentPointName.R2 &&
        second.getAttachmentPointByBond(bond) === AttachmentPointName.R1,
    );

  const originalIdsOf = (nucleotides: Nucleotide[]) =>
    nucleotides
      .flatMap((n) => n.monomers)
      .filter(Boolean)
      .map((m) => m.id);

  const replaceBothStrandsWithSugar = (
    senseNucleotides: Nucleotide[],
    antisenseNucleotides: Nucleotide[],
  ) => {
    selectOnly([...senseNucleotides, ...antisenseNucleotides]);

    callReplaceSelectionsWithMonomer(
      mode,
      SequenceRenderer.selections,
      getLibraryItem(editor, 'R', KetMonomerClass.Sugar),
    );
  };

  it('replaces the sense and the antisense monomers of both selected positions', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const originalIds = new Set(monomerIds());
    const replacedIds = [...senseNucleotides, ...antisenseNucleotides].flatMap(
      (nucleotide) => [nucleotide.sugar.id, nucleotide.rnaBase.id],
    );

    replaceBothStrandsWithSugar(senseNucleotides, antisenseNucleotides);

    const currentIds = new Set(monomerIds());
    replacedIds.forEach((id) => {
      expect(currentIds.has(id)).toBe(false);
    });

    const newSugars = newMonomersOf(originalIds, 'R');
    expect(newSugars).toHaveLength(4);
  });

  it('keeps each strand a backbone-bonded chain of the new monomers', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const originalIds = new Set(monomerIds());

    replaceBothStrandsWithSugar(senseNucleotides, antisenseNucleotides);

    const newSugars = newMonomersOf(originalIds, 'R');
    const bondedPairs = newSugars.flatMap((first) =>
      newSugars
        .filter((second) => isBondedR2ToR1(first, second))
        .map((second) => [first, second]),
    );

    // One R2->R1 bond per strand.
    expect(bondedPairs).toHaveLength(2);
  });

  it('undoes a both-strands replacement in one step, restoring monomers, backbones and the hydrogen bond', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const originalIds = [...monomerIds()];
    const history = EditorHistory.getInstance(editor);
    const historyPointerBefore = history.historyPointer;

    replaceBothStrandsWithSugar(senseNucleotides, antisenseNucleotides);
    expect(history.historyPointer).toBe(historyPointerBefore + 1);

    history.undo();

    expect(history.historyPointer).toBe(historyPointerBefore);
    const currentIds = new Set(monomerIds());
    originalIds.forEach((id) => {
      expect(currentIds.has(id)).toBe(true);
    });
    senseNucleotides.forEach((senseNucleotide, index) => {
      expect(
        senseNucleotide.rnaBase.hydrogenBonds[0].getAnotherMonomer(
          senseNucleotide.rnaBase,
        ),
      ).toBe(antisenseNucleotides[index].rnaBase);
    });
    // Both backbones are back: sense P0->S1 and the antisense counterpart.
    expect(
      isBondedR2ToR1(senseNucleotides[0].phosphate, senseNucleotides[1].sugar),
    ).toBe(true);
    expect(
      isBondedR2ToR1(
        antisenseNucleotides[1].phosphate,
        antisenseNucleotides[0].sugar,
      ),
    ).toBe(true);
  });

  it('replaces both strands of one position through a preset, leaving the other position alone', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const untouchedIds = originalIdsOf([
      senseNucleotides[1],
      antisenseNucleotides[1],
    ]);
    const replacedIds = originalIdsOf([
      senseNucleotides[0],
      antisenseNucleotides[0],
    ]);
    const originalIds = new Set(monomerIds());

    selectOnly([senseNucleotides[0], antisenseNucleotides[0]]);
    callReplaceSelectionsWithPreset(
      mode,
      SequenceRenderer.selections,
      buildPreset(editor, 'A'),
    );

    const currentIds = new Set(monomerIds());
    replacedIds.forEach((id) => {
      expect(currentIds.has(id)).toBe(false);
    });
    untouchedIds.forEach((id) => {
      expect(currentIds.has(id)).toBe(true);
    });

    const newBases = newMonomersOf(originalIds, 'A');
    expect(newBases).toHaveLength(2);
    expect(newBases[0].hydrogenBonds[0]?.getAnotherMonomer(newBases[0])).toBe(
      newBases[1],
    );
  });

  it('replaces an antisense overhang position and every other selected position exactly once', () => {
    const { senseNucleotides, antisenseNucleotides } =
      buildTwoPositionDuplex(editor);
    const originalIds = new Set(monomerIds());

    // Sense position 1 loses its antisense partner and becomes an overhang.
    antisenseNucleotides[1].monomers.filter(Boolean).forEach((monomer) => {
      editor.drawingEntitiesManager.deleteMonomer(monomer);
    });
    rerenderSequence(editor);

    selectOnly([...senseNucleotides, antisenseNucleotides[0]]);
    callReplaceSelectionsWithMonomer(
      mode,
      SequenceRenderer.selections,
      getLibraryItem(editor, 'R', KetMonomerClass.Sugar),
    );

    expect(newMonomersOf(originalIds, 'R')).toHaveLength(3);
  });

  it('finds a linker on the antisense node of a both-strands position', () => {
    const linkerNode = Object.assign(
      Object.create(LinkerSequenceNode.prototype),
      { monomer: { selected: true } },
    ) as LinkerSequenceNode;
    const { senseNucleotides } = buildTwoPositionDuplex(editor);

    selectOnly([senseNucleotides[0]]);
    const selections = [
      [
        {
          node: { senseNode: senseNucleotides[0], antisenseNode: linkerNode },
          nodeIndexOverall: 0,
        },
      ],
    ] as unknown as TwoStrandedNodesSelection;

    expect(callSelectionsContainLinkerNode(mode, selections)).toBe(true);
  });
});
