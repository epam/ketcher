import { CoreEditor, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { getPeptideLibraryItem } from 'domain/helpers/rna';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import type { SequenceNode } from 'domain/entities/monomer-chains/types';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

// Covers SequenceMode#handleRnaDnaNodeAddition, which decides whether a newly
// typed RNA unit is a Nucleotide (sugar + base + phosphate) or a Nucleoside.
// A unit sitting between two peptides is an inner position and must carry a
// phosphate, so it is created as a Nucleotide.

const testRenderTheme = {
  monomer: {
    color: {
      X: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
      E: { regular: 'yellow' },
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

const createPeptide = (
  editor: CoreEditor,
  symbol: string,
  position: Vec2,
): BaseMonomer => {
  const libraryItem = getPeptideLibraryItem(editor, symbol);

  if (!libraryItem) {
    throw new Error(`Fixture setup failed: peptide ${symbol} not found`);
  }

  const command = editor.drawingEntitiesManager.addMonomer(
    libraryItem,
    position,
  );

  return command.operations[0].monomer as BaseMonomer;
};

// Calls the private SequenceMode#handleRnaDnaNodeAddition, following the
// cast-through-prototype pattern used for private-method tests in this suite.
const callHandleRnaDnaNodeAddition = (
  mode: SequenceMode,
  enteredSymbol: string,
  newNodePosition: Vec2,
  nextNodeToConnect?: SequenceNode | null,
  previousNodeToConnect?: SequenceNode,
) => {
  const { handleRnaDnaNodeAddition } = SequenceMode.prototype as unknown as {
    handleRnaDnaNodeAddition: (
      this: SequenceMode,
      enteredSymbol: string,
      newNodePosition: Vec2,
      nextNodeToConnect?: SequenceNode | null,
      previousNodeToConnect?: SequenceNode,
    ) => { node: SequenceNode } | undefined;
  };

  return handleRnaDnaNodeAddition.call(
    mode,
    enteredSymbol,
    newNodePosition,
    nextNodeToConnect,
    previousNodeToConnect,
  );
};

describe('SequenceMode RNA insertion between peptides', () => {
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

  it('creates a Nucleotide whose phosphate links to the following peptide', () => {
    const mode = new SequenceMode();
    const previousPeptide = createPeptide(editor, 'E', new Vec2(0, 0));
    const nextPeptide = createPeptide(editor, 'E', new Vec2(3, 0));
    editor.drawingEntitiesManager.createPolymerBond(
      previousPeptide,
      nextPeptide,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    rerenderSequence(editor);

    const result = callHandleRnaDnaNodeAddition(
      mode,
      'A',
      new Vec2(1.5, 0),
      new MonomerSequenceNode(nextPeptide),
      new MonomerSequenceNode(previousPeptide),
    );

    expect(result?.node).toBeInstanceOf(Nucleotide);

    const nucleotide = result?.node as Nucleotide;

    expect(
      nucleotide.phosphate.attachmentPointsToBonds.R2?.getAnotherEntity(
        nucleotide.phosphate,
      ),
    ).toBe(nextPeptide);
    expect(
      nucleotide.sugar.attachmentPointsToBonds.R1?.getAnotherEntity(
        nucleotide.sugar,
      ),
    ).toBe(previousPeptide);
  });

  it('keeps creating a Nucleoside when the inserted unit ends the chain', () => {
    const mode = new SequenceMode();
    const previousPeptide = createPeptide(editor, 'E', new Vec2(0, 0));
    rerenderSequence(editor);

    const result = callHandleRnaDnaNodeAddition(
      mode,
      'A',
      new Vec2(1.5, 0),
      null,
      new MonomerSequenceNode(previousPeptide),
    );

    expect(result?.node).toBeInstanceOf(Nucleoside);
    expect(result?.node).not.toBeInstanceOf(Nucleotide);
  });
});
