import { CoreEditor, MACROMOLECULES_BOND_TYPES } from 'application/editor';
import { SequenceViewModel } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModel';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import {
  type BaseMonomer,
  BackBoneSequenceNode,
  EmptySequenceNode,
  Vec2,
} from 'domain/entities';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('SequenceViewModel phosphate alignment', () => {
  let editor: CoreEditor;

  const createNucleotide = (base: string, x: number, y: number) => {
    const created = Nucleotide.createOnCanvas(base, new Vec2(x, y));
    if (!created) throw new Error('Unable to create nucleotide fixture');
    return created.node;
  };

  beforeEach(() => {
    editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each([false, true])(
    'keeps paired bases aligned when a terminal phosphate precedes a different antisense chain (reverse antisense order: %s)',
    (reverseAntisenseOrder) => {
      const manager = editor.drawingEntitiesManager;
      const createNucleoside = (base: string, x: number, y: number) => {
        const created = Nucleoside.createOnCanvas(base, new Vec2(x, y));
        if (!created) throw new Error('Unable to create nucleoside fixture');
        return created.node;
      };
      const senseFirst = createNucleotide('A', 0, 0);
      const senseSecond = createNucleotide('A', 3, 0);
      const antisenseFirst = createNucleotide('U', 6, 5);
      const antisenseSecond = createNucleotide('U', 3, 5);
      const separateSense = createNucleoside('A', 0, -4);
      const separateAntisense = createNucleoside('U', 0, 5);

      manager.createPolymerBond(
        senseFirst.phosphate,
        senseSecond.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      manager.createPolymerBond(
        antisenseFirst.phosphate,
        antisenseSecond.sugar,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
      for (const [sense, antisense] of [
        [separateSense, antisenseFirst],
        [senseSecond, antisenseSecond],
        [senseFirst, separateAntisense],
      ]) {
        manager.createPolymerBond(
          sense.rnaBase,
          antisense.rnaBase,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
        );
      }
      for (const nucleotide of [
        antisenseFirst,
        antisenseSecond,
        separateAntisense,
      ]) {
        nucleotide.monomers.forEach((monomer) =>
          manager.markMonomerAsAntisense(monomer),
        );
      }

      const collection = ChainsCollection.fromMonomers([
        ...manager.monomers.values(),
      ]);
      collection.rearrange();
      if (reverseAntisenseOrder) {
        collection.chains = [
          ...collection.chains.filter((chain) => !chain.isAntisense),
          ...collection.chains.filter((chain) => chain.isAntisense).reverse(),
        ];
      }
      const model = new SequenceViewModel(collection);
      const nodes = model.chains.flatMap((chain) => chain.nodes);
      const firstPairIndex = nodes.findIndex((node) =>
        node.senseNode?.monomers.includes(senseFirst.rnaBase),
      );
      const secondPairIndex = nodes.findIndex((node) =>
        node.senseNode?.monomers.includes(senseSecond.rnaBase),
      );

      expect(nodes[firstPairIndex]?.antisenseNode?.monomers).toContain(
        separateAntisense.rnaBase,
      );
      expect(nodes[secondPairIndex]?.antisenseNode?.monomers).toContain(
        antisenseSecond.rnaBase,
      );
      const phosphateIndex = nodes.findIndex((node) =>
        node.antisenseNode?.monomers.includes(antisenseSecond.phosphate),
      );
      expect(phosphateIndex).toBeGreaterThan(firstPairIndex);
      expect(phosphateIndex).toBeLessThan(secondPairIndex);
      const displayedMonomers = nodes.flatMap((node) =>
        [node.senseNode, node.antisenseNode].flatMap((sequenceNode) =>
          sequenceNode instanceof BackBoneSequenceNode ||
          sequenceNode instanceof EmptySequenceNode
            ? []
            : (sequenceNode?.monomers ?? []),
        ),
      );
      expect(displayedMonomers).toHaveLength(manager.monomers.size);
      expect(new Set(displayedMonomers)).toEqual(
        new Set(manager.monomers.values()),
      );
    },
  );

  it.each([false, true])(
    'does not reserve a column for a standalone base (hydrogen bond: %s)',
    (withBareBaseBond) => {
      const manager = editor.drawingEntitiesManager;
      const senseFirst = createNucleotide('A', 0, 0);
      const senseSecond = createNucleotide('A', 3, 0);
      const antisenseFirst = createNucleotide('U', 6, 5);
      const antisenseSecond = createNucleotide('U', 3, 5);

      for (const [first, second] of [
        [senseFirst, senseSecond],
        [antisenseFirst, antisenseSecond],
      ]) {
        manager.createPolymerBond(
          first.phosphate,
          second.sugar,
          AttachmentPointName.R2,
          AttachmentPointName.R1,
        );
      }

      const libraryItem = getRnaPartLibraryItem(
        editor,
        'U',
        KetMonomerClass.Base,
      );
      if (!libraryItem)
        throw new Error('Unable to find standalone base fixture');
      const baseCommand = manager.addMonomer(libraryItem, new Vec2(0, -4));
      const bareBase = baseCommand.operations[0].monomer;
      if (!bareBase)
        throw new Error('Unable to create standalone base fixture');
      const pairs: Array<[BaseMonomer, BaseMonomer]> = [
        [senseSecond.rnaBase, antisenseSecond.rnaBase],
      ];
      if (withBareBaseBond) pairs.push([senseFirst.rnaBase, bareBase]);
      for (const [first, second] of pairs) {
        manager.createPolymerBond(
          first,
          second,
          AttachmentPointName.HYDROGEN,
          AttachmentPointName.HYDROGEN,
          MACROMOLECULES_BOND_TYPES.HYDROGEN,
        );
      }

      manager.recalculateAntisenseChains();
      expect(senseFirst.sugar.monomerItem.isAntisense).toBe(false);
      expect(antisenseFirst.sugar.monomerItem.isAntisense).toBe(true);
      expect(bareBase.monomerItem.isAntisense).toBe(false);

      const collection = ChainsCollection.fromMonomers([
        ...manager.monomers.values(),
      ]);
      collection.rearrange();
      const nodes = new SequenceViewModel(collection).chains.flatMap(
        (chain) => chain.nodes,
      );
      const firstSenseColumn = nodes.find((node) =>
        node.senseNode?.monomers.includes(senseFirst.rnaBase),
      );
      const pairedColumn = nodes.find((node) =>
        node.senseNode?.monomers.includes(senseSecond.rnaBase),
      );

      expect(firstSenseColumn?.antisenseNode?.monomers).toContain(
        antisenseSecond.phosphate,
      );
      expect(pairedColumn?.antisenseNode?.monomers).toContain(
        antisenseSecond.rnaBase,
      );
    },
  );
});
