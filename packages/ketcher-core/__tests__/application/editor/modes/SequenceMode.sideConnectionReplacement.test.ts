import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const testRenderTheme = {
  peptide: { color: {} },
  monomer: {
    color: {
      X: { regular: 'yellow' },
      R: { regular: 'yellow' },
      P: { regular: 'yellow' },
    },
  },
};

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

SVGElement.prototype.getBBox = vi
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

const requireLibraryItem = (editor: CoreEditor, label: string) => {
  const item = editor.monomersLibrary.find(
    (libraryItem) => libraryItem.label === label,
  );

  if (!item) {
    throw new Error(`Library item ${label} not found`);
  }

  return item;
};

describe('SequenceMode replacement of side-connected monomers', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let mode: SequenceMode;

  beforeEach(async () => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    mode = new SequenceMode();
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(testRenderTheme),
      mode,
    });
    await editor.ensureDefaultMonomersLibraryLoaded();
  });

  afterEach(() => {
    EditorHistory.getInstance(editor).destroy();
    canvas.remove();
  });

  // Two unsplit nucleotides (AmMC6T) joined by an R3-R3 side connection,
  // with the first one selected.
  const selectSideConnectedUnsplitNucleotide = () => {
    const drawingEntitiesManager = editor.drawingEntitiesManager;
    const [first, second] = [0, 1].map((index) =>
      drawingEntitiesManager.createMonomer(
        requireLibraryItem(editor, 'AmMC6T'),
        new Vec2(index * 3, 0),
      ),
    );

    drawingEntitiesManager.addMonomer(first.monomerItem, first.position, first);
    drawingEntitiesManager.addMonomer(
      second.monomerItem,
      second.position,
      second,
    );
    drawingEntitiesManager.createPolymerBond(
      first,
      second,
      AttachmentPointName.R3,
      AttachmentPointName.R3,
    );
    rerenderSequence(editor);
    drawingEntitiesManager.selectDrawingEntities([first]);

    return { second };
  };

  it('asks for confirmation and keeps no side connection when the library monomer is of a different type', () => {
    const { second } = selectSideConnectedUnsplitNucleotide();
    const confirmationSpy = vi.spyOn(
      editor.events.openConfirmationDialog,
      'dispatch',
    );

    // D-gGlu is a peptide with R3, but the selected monomer is an unsplit
    // nucleotide, so the side connection must not survive the replacement.
    mode.insertMonomerFromLibrary(requireLibraryItem(editor, 'D-gGlu'));

    expect(confirmationSpy).toHaveBeenCalledTimes(1);
    expect(confirmationSpy.mock.calls[0][0].confirmationText).toBe(
      'Side chain connections will be deleted during replacement. Do you want to proceed?',
    );

    confirmationSpy.mock.calls[0][0].onConfirm();

    expect(second.attachmentPointsToBonds.R3).toBeNull();

    confirmationSpy.mockRestore();
  });

  it('keeps the side connection without a dialog when the library monomer is of the same type and has the attachment point', () => {
    const { second } = selectSideConnectedUnsplitNucleotide();
    const confirmationSpy = vi.spyOn(
      editor.events.openConfirmationDialog,
      'dispatch',
    );

    mode.insertMonomerFromLibrary(requireLibraryItem(editor, 'AmMC6T'));

    expect(confirmationSpy).not.toHaveBeenCalled();
    expect(second.attachmentPointsToBonds.R3).toBeTruthy();

    confirmationSpy.mockRestore();
  });
});
