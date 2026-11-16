import { CoreEditor } from 'application/editor';
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

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
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
});
