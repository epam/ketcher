import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Phosphate } from 'domain/entities/Phosphate';
import { Sugar } from 'domain/entities/Sugar';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

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

const addLibraryMonomer = (
  editor: CoreEditor,
  label: string,
  position: Vec2,
) => {
  const item = editor.monomersLibrary.find(
    (libraryItem) => libraryItem.label === label,
  );

  if (!item) {
    throw new Error(`Library item ${label} not found`);
  }

  return editor.drawingEntitiesManager.addMonomer(item, position).operations[0]
    .monomer as BaseMonomer;
};

const createNucleotideNode = (base: string, position: Vec2) => {
  const created = Nucleotide.createOnCanvas(base, position);

  if (!created) {
    throw new Error(`Fixture setup failed: nucleotide ${base} not created`);
  }

  return created.node;
};

const bondR2ToR1 = (
  editor: CoreEditor,
  first: BaseMonomer,
  second: BaseMonomer,
) => {
  editor.drawingEntitiesManager.createPolymerBond(
    first,
    second,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );
};

const getR2Neighbour = (monomer: BaseMonomer) => {
  const bond = monomer.attachmentPointsToBonds.R2;

  return bond && 'getAnotherEntity' in bond
    ? (bond.getAnotherEntity(monomer) as BaseMonomer)
    : undefined;
};

describe('SequenceMode RNA insertion before a peptide (#6470)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  const typeABefore = (monomer: BaseMonomer) => {
    const monomersBefore = [...editor.drawingEntitiesManager.monomers.values()];

    mode.turnOnEditMode();
    SequenceRenderer.setCaretPositionByMonomer(monomer);
    mode.keyboardEventHandlers['add-sequence-item'].handler({
      code: 'KeyA',
    } as KeyboardEvent);

    const inserted = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((insertedMonomer) => !monomersBefore.includes(insertedMonomer));

    return {
      inserted,
      sugar: inserted.find(
        (insertedMonomer) => insertedMonomer instanceof Sugar,
      ),
      phosphate: inserted.find(
        (insertedMonomer) => insertedMonomer instanceof Phosphate,
      ),
    };
  };

  const buildTwoMonomerChain = (previousLabel: string, nextLabel: string) => {
    const previous = addLibraryMonomer(editor, previousLabel, new Vec2(0, 0));
    const next = addLibraryMonomer(editor, nextLabel, new Vec2(1.5, 0));

    bondR2ToR1(editor, previous, next);
    rerenderSequence(editor);

    return { previous, next };
  };

  const buildTwoNucleotideChain = () => {
    const [first, second] = ['A', 'C'].map((base, index) =>
      createNucleotideNode(base, new Vec2(index * 1.6, 0)),
    );

    bondR2ToR1(editor, first.phosphate, second.sugar);
    rerenderSequence(editor);

    return { previous: first.phosphate, next: second.sugar };
  };

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
    // EditorHistory is a process-wide singleton keyed by the first editor it
    // saw; reset it so the next test does not reuse this test's instance.
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  it.each([
    ['between two peptides', () => buildTwoMonomerChain('E', 'E')],
    ['between two nucleotides', buildTwoNucleotideChain],
  ])(
    'inserts a nucleotide %s, bridged to the next monomer by its phosphate',
    (_, buildChain) => {
      const { previous, next } = buildChain();
      const { inserted, sugar, phosphate } = typeABefore(next);

      expect(inserted).toHaveLength(3);
      expect(getR2Neighbour(previous)).toBe(sugar);
      expect(sugar && getR2Neighbour(sugar)).toBe(phosphate);
      expect(phosphate && getR2Neighbour(phosphate)).toBe(next);
    },
  );

  it.each([
    ['before a CHEM', 'SMPEG2'],
    ['before a phosphate', 'P'],
  ])('keeps inserting a nucleoside %s', (_, nextLabel) => {
    const { previous, next } = buildTwoMonomerChain('E', nextLabel);
    const { inserted, sugar, phosphate } = typeABefore(next);

    expect(inserted).toHaveLength(2);
    expect(phosphate).toBeUndefined();
    expect(getR2Neighbour(previous)).toBe(sugar);
    expect(sugar && getR2Neighbour(sugar)).toBe(next);
  });
});
