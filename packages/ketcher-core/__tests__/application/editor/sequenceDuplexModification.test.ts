import {
  CoreEditor,
  SequenceMode,
  MACROMOLECULES_BOND_TYPES,
} from 'application/editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { Nucleotide, Nucleoside, Vec2 } from 'domain/entities';
import { KetMonomerClass, RNA_DNA_NON_MODIFIED_PART } from 'domain/constants';
import { AttachmentPointName, Entities } from 'domain/types';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import type {
  IRnaPreset,
  LabeledNodesWithPositionInSequence,
} from 'application/editor/tools/Tool';
import { coreEditorTheme, polymerEditorTheme } from '../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

describe('sequence duplex modification', () => {
  let editor: CoreEditor;
  let mode: SequenceMode;

  beforeEach(() => {
    const canvas = createPolymerEditorCanvas();
    for (const dimension of ['width', 'height']) {
      Object.defineProperty(canvas, dimension, {
        configurable: true,
        value: { baseVal: { value: 500 } },
      });
    }
    mode = new SequenceMode();
    const theme = {
      ...polymerEditorTheme,
      monomer: {
        color: Object.fromEntries(
          ['A', 'C', 'G', 'U', 'T', 'R', 'P', 'X'].map((label) => [
            label,
            { regular: 'yellow' },
          ]),
        ),
      },
    };
    editor = new CoreEditor({
      canvas,
      mode,
      theme: { ...coreEditorTheme, ketcher: theme },
      renderersContainer: createRenderersManager(theme),
    });
  });

  afterEach(() => {
    EditorHistory.getInstance(editor).destroy();
    SequenceRenderer.clear();
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  const createPair = (oppositeSugar = RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA) => {
    const sense = Nucleotide.createOnCanvas('G', new Vec2(0, 0))!.node;
    const antisense = Nucleotide.createOnCanvas(
      'C',
      new Vec2(0, 4),
      oppositeSugar,
    )!.node;
    antisense.monomers.forEach((monomer) => {
      monomer.monomerItem = { ...monomer.monomerItem, isAntisense: true };
    });
    editor.drawingEntitiesManager.createPolymerBond(
      sense.rnaBase,
      antisense.rnaBase,
      AttachmentPointName.HYDROGEN,
      AttachmentPointName.HYDROGEN,
      MACROMOLECULES_BOND_TYPES.HYDROGEN,
    );
    mode.initialize();
    let senseNode: Nucleotide | Nucleoside = sense;
    let antisenseNode: Nucleotide | Nucleoside = antisense;
    SequenceRenderer.forEachNode(({ twoStrandedNode }) => {
      if (twoStrandedNode.senseNode?.monomer === sense.sugar) {
        senseNode = twoStrandedNode.senseNode as Nucleotide | Nucleoside;
        antisenseNode = twoStrandedNode.antisenseNode as
          Nucleotide | Nucleoside;
      }
    });
    editor.drawingEntitiesManager.selectDrawingEntities(senseNode.monomers);
    return { sense: senseNode, antisense: antisenseNode };
  };

  const preset = (base: string): IRnaPreset => ({
    name: `R(${base})P`,
    base: getRnaPartLibraryItem(editor, base, KetMonomerClass.Base),
    sugar: getRnaPartLibraryItem(editor, 'R', KetMonomerClass.Sugar),
    phosphate: getRnaPartLibraryItem(editor, 'P', KetMonomerClass.Phosphate),
  });

  const selection = (
    node: Nucleotide | Nucleoside,
  ): LabeledNodesWithPositionInSequence => {
    let result: LabeledNodesWithPositionInSequence | undefined;
    SequenceRenderer.forEachNode(({ twoStrandedNode, nodeIndexOverall }) => {
      if (
        twoStrandedNode.senseNode?.monomer === node.monomer ||
        twoStrandedNode.antisenseNode?.monomer === node.monomer
      ) {
        result = {
          type:
            node instanceof Nucleotide
              ? Entities.Nucleotide
              : Entities.Nucleoside,
          nodeIndexOverall,
          isAntisense: twoStrandedNode.antisenseNode?.monomer === node.monomer,
          hasAntisense: !!twoStrandedNode.antisenseNode,
          sugarLabel: node.sugar.label,
          baseLabel: node.rnaBase.label,
          phosphateLabel:
            node instanceof Nucleotide ? node.phosphate.label : undefined,
        };
      }
    });
    expect(result).toBeDefined();
    return result!;
  };

  const assertPaired = (base: Nucleotide['rnaBase'], expected: string) => {
    expect(base.hydrogenBonds).toHaveLength(1);
    const partner = base.hydrogenBonds[0].getAnotherMonomer(base)!;
    expect(partner.label).toBe(expected);
    expect(editor.drawingEntitiesManager.monomers.get(partner.id)).toBe(
      partner,
    );
  };

  describe.each(['library', 'builder'] as const)('%s editing', (source) => {
    const update = (node: Nucleotide | Nucleoside, base: string) => {
      if (source === 'library') {
        mode.insertPresetFromLibrary(preset(base));
      } else {
        mode.modifySequenceInRnaBuilder([
          { ...selection(node), baseLabel: base },
        ]);
      }
    };

    it.each([
      [RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA, 'U'],
      [RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA, 'T'],
    ])(
      'uses the opposite %s sugar to choose %s and preserves undo/redo',
      (sugar, complement) => {
        const { sense, antisense } = createPair(sugar);
        update(sense, 'A');
        expect(antisense.rnaBase.label).toBe(complement);
        assertPaired(antisense.rnaBase, 'A');
        expect(antisense.sugar.label).toBe(sugar);

        const history = EditorHistory.getInstance(editor);
        history.undo();
        expect(antisense.rnaBase.label).toBe('C');
        assertPaired(antisense.rnaBase, 'G');
        history.redo();
        expect(antisense.rnaBase.label).toBe(complement);
        assertPaired(antisense.rnaBase, 'A');
      },
    );

    it('does not change the opposite modified base when the natural analogue is unchanged', () => {
      const { sense, antisense } = createPair();
      editor.drawingEntitiesManager.modifyMonomerItem(antisense.rnaBase, {
        ...antisense.rnaBase.monomerItem,
        label: 'modified C',
      });
      const original = antisense.rnaBase.monomerItem;
      const replacement = preset('G');
      replacement.base = { ...replacement.base!, label: 'modified G' };
      if (source === 'library') {
        mode.insertPresetFromLibrary(replacement);
      } else {
        mode.modifySequenceInRnaBuilder([
          {
            ...selection(sense),
            rnaBaseMonomerItem: replacement.base,
          },
        ]);
      }
      expect(antisense.rnaBase.label).toBe(original.label);
      expect(antisense.rnaBase.monomerItem.props).toEqual(original.props);
      expect(antisense.rnaBase.monomerItem.struct).toBe(original.struct);
      assertPaired(antisense.rnaBase, 'modified G');
    });

    it('edits the antisense strand without modifying the sense strand in non-sync mode', () => {
      const { sense, antisense } = createPair();
      editor.drawingEntitiesManager.unselectAllDrawingEntities();
      editor.drawingEntitiesManager.selectDrawingEntities(antisense.monomers);
      mode.turnOffSyncEditMode();
      update(antisense, 'A');
      expect(sense.rnaBase.label).toBe('G');
      assertPaired(sense.rnaBase, 'A');
    });

    it('synchronizes from antisense to sense', () => {
      const { sense, antisense } = createPair();
      editor.drawingEntitiesManager.unselectAllDrawingEntities();
      editor.drawingEntitiesManager.selectDrawingEntities(antisense.monomers);
      update(antisense, 'A');
      expect(sense.rnaBase.label).toBe('U');
      assertPaired(sense.rnaBase, 'A');
    });
  });

  it('replaces both selected strands without overwriting either with a complement', () => {
    const { sense, antisense } = createPair();
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...sense.monomers,
      ...antisense.monomers,
    ]);
    mode.insertPresetFromLibrary(preset('A'));
    const bases = [...editor.drawingEntitiesManager.monomers.values()].filter(
      (monomer) =>
        monomer.monomerItem.props.MonomerClass === KetMonomerClass.Base,
    );
    expect(bases.map((base) => base.label)).toEqual(['A', 'A']);
    expect(bases[0].hydrogenBonds).toHaveLength(1);
    expect(bases[0].hydrogenBonds[0].getAnotherMonomer(bases[0])).toBe(
      bases[1],
    );
  });

  it('modifies sugars on both selected strands without changing their bases', () => {
    const { sense, antisense } = createPair();
    editor.drawingEntitiesManager.selectDrawingEntities([
      ...sense.monomers,
      ...antisense.monomers,
    ]);
    mode.modifySequenceInRnaBuilder(
      [sense, antisense].map((node) => ({
        ...selection(node),
        sugarLabel: 'dR',
      })),
    );
    expect(sense.sugar.label).toBe('dR');
    expect(antisense.sugar.label).toBe('dR');
    expect(sense.rnaBase.label).toBe('G');
    expect(antisense.rnaBase.label).toBe('C');
    assertPaired(sense.rnaBase, 'C');
  });

  it('preserves H-bonds when RNA Builder changes to an ambiguous base and back', () => {
    const { sense, antisense } = createPair();
    mode.modifySequenceInRnaBuilder([{ ...selection(sense), baseLabel: 'N' }]);
    const bases = [...editor.drawingEntitiesManager.monomers.values()].filter(
      (monomer) => monomer.hydrogenBonds.length > 0,
    );
    expect(bases).toHaveLength(2);
    expect(bases.map((base) => base.label)).toEqual(['N', 'N']);
    const history = EditorHistory.getInstance(editor);
    history.undo();
    assertPaired(antisense.rnaBase, 'G');
    expect(antisense.rnaBase.label).toBe('C');
    history.redo();
    const updatedPair = SequenceRenderer.getNodeByPointer(
      selection(sense).nodeIndexOverall,
    )!;
    const updatedSense = updatedPair.senseNode as Nucleotide | Nucleoside;
    editor.drawingEntitiesManager.selectDrawingEntities(updatedSense.monomers);
    mode.modifySequenceInRnaBuilder([
      { ...selection(updatedSense), baseLabel: 'A' },
    ]);
    const updatedBases = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((monomer) => monomer.hydrogenBonds.length > 0);
    expect(updatedBases.map((base) => base.label).sort()).toEqual(['A', 'U']);
  });

  it('synchronizes replacement with an unsplit nucleotide from the library', () => {
    const { antisense } = createPair();
    const item = getRnaPartLibraryItem(editor, '2-damdA', KetMonomerClass.RNA)!;
    expect(item.isAmbiguous).toBeFalsy();
    if (item.isAmbiguous) return;
    editor.events.openConfirmationDialog.add(({ onConfirm }) => onConfirm());
    mode.insertMonomerFromLibrary(item);
    expect(antisense.rnaBase.label).toBe('U');
    assertPaired(antisense.rnaBase, '2-damdA');
  });

  it('keeps multiple antisense replacements connected in backbone order', () => {
    const senseNodes = ['G', 'G', 'G'].map(
      (label, index) =>
        Nucleotide.createOnCanvas(label, new Vec2(index * 4, 0))!.node,
    );
    senseNodes.slice(1).forEach((node, index) => {
      editor.drawingEntitiesManager.createPolymerBond(
        senseNodes[index].phosphate,
        node.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
    });
    editor.drawingEntitiesManager.selectDrawingEntities(
      senseNodes.flatMap((node) => node.monomers),
    );
    editor.drawingEntitiesManager.createAntisenseChain(false);
    mode.initialize();
    const antisenseNodes: (Nucleotide | Nucleoside)[] = [];
    SequenceRenderer.forEachNode(({ twoStrandedNode }) => {
      if (
        twoStrandedNode.antisenseNode instanceof Nucleotide ||
        twoStrandedNode.antisenseNode instanceof Nucleoside
      ) {
        antisenseNodes.push(twoStrandedNode.antisenseNode);
      }
    });
    expect(antisenseNodes).toHaveLength(3);
    const monomersBefore = editor.drawingEntitiesManager.monomers.size;
    editor.drawingEntitiesManager.selectDrawingEntities(
      antisenseNodes.flatMap((node) => node.monomers),
    );
    mode.insertPresetFromLibrary(preset('A'));
    const chains = SequenceRenderer.chainsCollection.chains;
    expect(chains).toHaveLength(2);
    expect(
      chains
        .map((chain) =>
          chain.monomers
            .filter(
              (monomer) =>
                monomer.monomerItem.props.MonomerClass === KetMonomerClass.Base,
            )
            .map((base) => base.label)
            .join(''),
        )
        .sort(),
    ).toEqual(['AAA', 'UUU']);
    const antisenseChain = chains.find(
      (chain) => !chain.monomers.includes(senseNodes[0].rnaBase),
    )!;
    expect(
      antisenseChain.monomers
        .filter((monomer) => monomer.hydrogenBonds.length)
        .map((base) => base.hydrogenBonds[0].getAnotherMonomer(base)?.id),
    ).toEqual([...senseNodes].reverse().map((node) => node.rnaBase.id));
    // The terminal nucleoside gains the phosphate supplied by the new preset.
    expect(editor.drawingEntitiesManager.monomers.size).toBe(
      monomersBefore + 1,
    );
    EditorHistory.getInstance(editor).undo();
    expect(editor.drawingEntitiesManager.monomers.size).toBe(monomersBefore);
    senseNodes.forEach((node) => {
      expect(node.rnaBase.label).toBe('G');
      assertPaired(node.rnaBase, 'C');
    });
  });
});
