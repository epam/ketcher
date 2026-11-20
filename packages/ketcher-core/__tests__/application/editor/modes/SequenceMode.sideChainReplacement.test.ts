import { CoreEditor, EditorHistory, SequenceMode } from 'application/editor';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AttachmentPointName } from 'domain/types';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const SIDE_CHAIN_CONFIRMATION_TEXT =
  'Side chain connections will be deleted during replacement. Do you want to proceed?';

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

// HELM: RNA1{[AmMC6T].[AmMC6T].[AmMC6T]}|RNA2{[AmMC6T].[AmMC6T].[AmMC6T]}
// $RNA2,RNA1,2:R3-2:R3|RNA2,RNA1,3:R3-3:R3|RNA2,RNA1,1:R3-1:R3$$$V2.0
const buildTwoSideConnectedAmMC6TChains = (editor: CoreEditor) => {
  const manager = editor.drawingEntitiesManager;
  const item = requireLibraryItem(editor, 'AmMC6T');

  const buildChain = (row: number) => {
    const monomers = [0, 1, 2].map(
      (index) =>
        manager.addMonomer(item, new Vec2(index * 1.6, row * 4)).operations[0]
          .monomer as BaseMonomer,
    );

    manager.createPolymerBond(
      monomers[0],
      monomers[1],
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    manager.createPolymerBond(
      monomers[1],
      monomers[2],
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    return monomers;
  };

  const first = buildChain(0);
  const second = buildChain(1);

  first.forEach((monomer, index) => {
    manager.createPolymerBond(
      monomer,
      second[index],
      AttachmentPointName.R3,
      AttachmentPointName.R3,
    );
  });

  rerenderSequence(editor);

  return { first, second };
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

  it.each(['aMePhe', 'D-gGlu'])(
    'asks for confirmation before replacing a side-connected monomer with %s, and keeps the canvas unchanged until confirmed',
    (label) => {
      const { first, second } = buildTwoSideConnectedAmMC6TChains(editor);

      editor.drawingEntitiesManager.selectDrawingEntities([first[0]]);

      const confirmationSpy = vi.spyOn(
        editor.events.openConfirmationDialog,
        'dispatch',
      );
      const monomerCountBefore = editor.drawingEntitiesManager.monomers.size;

      mode.insertMonomerFromLibrary(requireLibraryItem(editor, label));

      expect(confirmationSpy).toHaveBeenCalledTimes(1);
      expect(confirmationSpy.mock.calls[0][0].confirmationText).toBe(
        SIDE_CHAIN_CONFIRMATION_TEXT,
      );
      expect(editor.drawingEntitiesManager.monomers.size).toBe(
        monomerCountBefore,
      );
      expect(editor.drawingEntitiesManager.monomers.has(first[0].id)).toBe(
        true,
      );
      expect(second[0].attachmentPointsToBonds.R3).not.toBeNull();

      confirmationSpy.mockRestore();
    },
  );

  it.each(['aMePhe', 'D-gGlu'])(
    'deletes the side chain connection when the replacement with %s is confirmed',
    (label) => {
      const { first, second } = buildTwoSideConnectedAmMC6TChains(editor);

      editor.drawingEntitiesManager.selectDrawingEntities([first[0]]);

      const confirmationSpy = vi
        .spyOn(editor.events.openConfirmationDialog, 'dispatch')
        .mockImplementation(({ onConfirm }) => onConfirm?.());

      mode.insertMonomerFromLibrary(requireLibraryItem(editor, label));

      expect(editor.drawingEntitiesManager.monomers.has(first[0].id)).toBe(
        false,
      );
      expect(second[0].attachmentPointsToBonds.R3).toBeNull();

      const replacement = [
        ...editor.drawingEntitiesManager.monomers.values(),
      ].find((monomer) => monomer.monomerItem.label === label);

      expect(replacement).toBeDefined();
      expect(replacement?.sideConnections).toHaveLength(0);
      // The untouched neighbours keep their own side connections.
      expect(second[1].attachmentPointsToBonds.R3).not.toBeNull();
      expect(second[2].attachmentPointsToBonds.R3).not.toBeNull();

      confirmationSpy.mockRestore();
    },
  );

  it('replaces a monomer without side connections without any dialog', () => {
    const { first } = buildTwoSideConnectedAmMC6TChains(editor);
    const manager = editor.drawingEntitiesManager;

    manager.deleteDrawingEntity(first[0].attachmentPointsToBonds.R3 as never);
    rerenderSequence(editor);
    manager.selectDrawingEntities([first[0]]);

    const confirmationSpy = vi.spyOn(
      editor.events.openConfirmationDialog,
      'dispatch',
    );

    mode.insertMonomerFromLibrary(requireLibraryItem(editor, 'D-gGlu'));

    expect(confirmationSpy).not.toHaveBeenCalled();
    expect(manager.monomers.has(first[0].id)).toBe(false);

    confirmationSpy.mockRestore();
  });
});
