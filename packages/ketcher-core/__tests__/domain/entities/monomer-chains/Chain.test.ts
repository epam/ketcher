import { CoreEditor, MACROMOLECULES_BOND_TYPES } from 'application/editor';
import {
  KetMonomerClass,
  RNA_DNA_NON_MODIFIED_PART,
} from 'domain/constants/monomers';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

SVGElement.prototype.getBBox = vi.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

const UNSPLIT_NUCLEOTIDE_ALIAS = '5hMedC';

describe('Chain phosphate nodes', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const addPhosphate = (x: number) => {
    const libraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );

    if (!libraryItem) {
      throw new Error('Phosphate library item not found');
    }

    return editor.drawingEntitiesManager.addMonomer(libraryItem, new Vec2(x, 0))
      .operations[0].monomer as BaseMonomer;
  };

  const addUnsplitNucleotide = (x: number) => {
    const libraryItem = editor.monomersLibrary.find(
      (item) =>
        item.label === UNSPLIT_NUCLEOTIDE_ALIAS &&
        item.props?.MonomerClass === KetMonomerClass.RNA,
    );

    if (!libraryItem) {
      throw new Error('Unsplit nucleotide library item not found');
    }

    return editor.drawingEntitiesManager.addMonomer(libraryItem, new Vec2(x, 0))
      .operations[0].monomer as BaseMonomer;
  };

  // Connects each monomer's R2 to the next monomer's R1
  const getNodes = (...monomers: BaseMonomer[]) => {
    monomers.slice(1).forEach((monomer, index) => {
      editor.drawingEntitiesManager.createPolymerBond(
        monomers[index],
        monomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      );
    });

    const { chains } = ChainsCollection.fromMonomers(monomers);

    return chains[0].nodes;
  };

  beforeEach(async () => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
    await editor.ensureDefaultMonomersLibraryLoaded();
  });

  afterEach(() => {
    canvas.remove();
  });

  it('keeps a phosphate before an unsplit nucleotide as a phosphate', () => {
    const phosphate = addPhosphate(0);
    const nodes = getNodes(phosphate, addUnsplitNucleotide(2));

    expect(nodes[0]).toBeInstanceOf(MonomerSequenceNode);
    expect(nodes[0].monomer).toBe(phosphate);
  });

  it('keeps a phosphate between unsplit nucleotides as a phosphate', () => {
    const phosphate = addPhosphate(2);
    const nodes = getNodes(
      addUnsplitNucleotide(0),
      phosphate,
      addUnsplitNucleotide(4),
    );

    expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
    expect(nodes[1].monomer).toBe(phosphate);
  });

  it('keeps a phosphate after an unsplit nucleotide as a phosphate', () => {
    const phosphate = addPhosphate(2);
    const nodes = getNodes(addUnsplitNucleotide(0), phosphate);

    expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
    expect(nodes[1].monomer).toBe(phosphate);
  });

  it('keeps a group of phosphates before an unsplit nucleotide as one linker', () => {
    const firstPhosphate = addPhosphate(0);
    const secondPhosphate = addPhosphate(2);
    const nodes = getNodes(
      firstPhosphate,
      secondPhosphate,
      addUnsplitNucleotide(4),
    );

    expect(nodes[0]).toBeInstanceOf(LinkerSequenceNode);
    expect(nodes[0].monomers).toEqual([firstPhosphate, secondPhosphate]);
    expect(nodes).toHaveLength(2);
  });

  // https://github.com/epam/ketcher/issues/6438: a phosphate hydrogen-bonded
  // to the other strand is shown as its own "p", aligned with its pair, rather
  // than merged into a group of phosphates shown as "@".
  describe('with a phosphate paired to the other strand', () => {
    const pairWithOtherStrand = (phosphate: BaseMonomer) => {
      editor.drawingEntitiesManager.createPolymerBond(
        phosphate,
        addUnsplitNucleotide(20),
        AttachmentPointName.HYDROGEN,
        AttachmentPointName.HYDROGEN,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      );
    };

    it('keeps a paired phosphate at the start of a group as its own node', () => {
      const pairedPhosphate = addPhosphate(0);
      const secondPhosphate = addPhosphate(2);
      pairWithOtherStrand(pairedPhosphate);

      const nodes = getNodes(
        pairedPhosphate,
        secondPhosphate,
        addUnsplitNucleotide(4),
      );

      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toBeInstanceOf(MonomerSequenceNode);
      expect(nodes[0].monomer).toBe(pairedPhosphate);
      // The phosphate left alone next to it follows the usual "p" rule.
      expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
      expect(nodes[1].monomer).toBe(secondPhosphate);
    });

    it('splits a paired phosphate off the end of a group', () => {
      const firstPhosphate = addPhosphate(2);
      const pairedPhosphate = addPhosphate(4);
      pairWithOtherStrand(pairedPhosphate);

      const nodes = getNodes(
        addUnsplitNucleotide(0),
        firstPhosphate,
        pairedPhosphate,
      );

      expect(nodes).toHaveLength(3);
      expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
      expect(nodes[1].monomer).toBe(firstPhosphate);
      expect(nodes[2]).toBeInstanceOf(MonomerSequenceNode);
      expect(nodes[2].monomer).toBe(pairedPhosphate);
    });

    it('keeps the other phosphates of a larger group as one linker', () => {
      const pairedPhosphate = addPhosphate(0);
      const secondPhosphate = addPhosphate(2);
      const thirdPhosphate = addPhosphate(4);
      pairWithOtherStrand(pairedPhosphate);

      const nodes = getNodes(
        pairedPhosphate,
        secondPhosphate,
        thirdPhosphate,
        addUnsplitNucleotide(6),
      );

      expect(nodes).toHaveLength(3);
      expect(nodes[0]).toBeInstanceOf(MonomerSequenceNode);
      expect(nodes[0].monomer).toBe(pairedPhosphate);
      expect(nodes[1]).toBeInstanceOf(LinkerSequenceNode);
      expect(nodes[1].monomers).toEqual([secondPhosphate, thirdPhosphate]);
    });
  });
});
