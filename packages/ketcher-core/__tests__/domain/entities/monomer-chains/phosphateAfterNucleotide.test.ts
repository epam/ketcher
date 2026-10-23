import { CoreEditor } from 'application/editor';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import {
  type BaseMonomer,
  LinkerSequenceNode,
  MonomerSequenceNode,
  Phosphate,
  Vec2,
} from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { AttachmentPointName } from 'domain/types';
import {
  KetMonomerClass,
  RNA_DNA_NON_MODIFIED_PART,
} from 'domain/constants/monomers';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

const testRenderTheme = {
  monomer: {
    color: {
      A: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
    },
  },
};

describe('Phosphate following a nucleotide in sequence chain', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  const addNucleotide = (position: Vec2) => {
    const created = Nucleotide.createOnCanvas('A', position);

    if (!created) {
      throw new Error('Fixture setup failed: nucleotide not created');
    }

    return created.node;
  };

  const addPhosphate = (position: Vec2): BaseMonomer => {
    const phosphateLibraryItem = getRnaPartLibraryItem(
      editor,
      RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
      KetMonomerClass.Phosphate,
    );

    if (!phosphateLibraryItem) {
      throw new Error('Fixture setup failed: phosphate library item missing');
    }

    const command = editor.drawingEntitiesManager.addMonomer(
      phosphateLibraryItem,
      position,
    );

    return command.operations[0].monomer as BaseMonomer;
  };

  const connect = (previous: BaseMonomer, next: BaseMonomer) => {
    editor.drawingEntitiesManager.createPolymerBond(
      previous,
      next,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
  };

  const getNodes = () => {
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);

    expect(chainsCollection.chains).toHaveLength(1);

    return chainsCollection.chains[0].nodes;
  };

  it('shows a terminal phosphate after a nucleotide as a separate phosphate', () => {
    // R(A)P.P
    const nucleotide = addNucleotide(new Vec2(0, 0));
    const phosphate = addPhosphate(new Vec2(3, 0));
    connect(nucleotide.phosphate, phosphate);

    const nodes = getNodes();

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toBeInstanceOf(Nucleotide);
    expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
    expect(nodes[1].monomer).toBe(phosphate);
    expect(nodes[1].monomer).toBeInstanceOf(Phosphate);
  });

  it('keeps several phosphates after a nucleotide as a linker', () => {
    // R(A)P.P.P
    const nucleotide = addNucleotide(new Vec2(0, 0));
    const firstPhosphate = addPhosphate(new Vec2(3, 0));
    const secondPhosphate = addPhosphate(new Vec2(4.5, 0));
    connect(nucleotide.phosphate, firstPhosphate);
    connect(firstPhosphate, secondPhosphate);

    const nodes = getNodes();

    expect(nodes[0]).toBeInstanceOf(Nucleotide);
    expect(nodes[1]).toBeInstanceOf(LinkerSequenceNode);
    expect(nodes[1].monomers).toEqual([firstPhosphate, secondPhosphate]);
  });

  it('shows a terminal phosphate of a nucleoside as a separate phosphate', () => {
    // R(A)P
    const nucleotide = addNucleotide(new Vec2(0, 0));

    const nodes = getNodes();

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toBeInstanceOf(Nucleoside);
    expect(nodes[1]).toBeInstanceOf(MonomerSequenceNode);
    expect(nodes[1].monomer).toBe(nucleotide.phosphate);
  });
});
