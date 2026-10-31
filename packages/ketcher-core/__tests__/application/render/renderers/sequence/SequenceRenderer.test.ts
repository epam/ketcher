import {
  CoreEditor,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
} from 'application/editor';
import { ClearTool } from 'application/editor/tools/Clear';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { getSvgFromDrawnStructures } from '../../../../../src/utilities/getSvgFromDrawnStructures';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

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

describe('SequenceRenderer', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  const getSequenceBondPaths = () =>
    Array.from(
      canvas.querySelectorAll<SVGPathElement>(
        '.drawn-structures > g > path[stroke="black"][fill="none"]',
      ),
    );

  const showCurrentMonomersInSequenceLayout = () => {
    editor.drawingEntitiesManager.clearCanvas();
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);

    chainsCollection.rearrange();
    SequenceRenderer.show(chainsCollection);
  };

  // Adds two peptide monomers connected by two R2->R1 polymer bonds (forming a
  // cycle) and renders them in sequence layout. This reproduces the minimal
  // structural shape from the original bug report (a cyclic chain that draws
  // a single sequence-level bond path above the row).
  const setupCyclicTwoPeptideStructure = () => {
    const addFirstMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(0, 0),
    );
    const addSecondMonomerCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(10, 0),
    );
    editor.renderersContainer.update(addFirstMonomerCommand);
    editor.renderersContainer.update(addSecondMonomerCommand);

    const [firstMonomer, secondMonomer] = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ];

    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        firstMonomer,
        secondMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        // The argument order is intentionally swapped relative to the call
        // above: this second bond closes the cycle (second -> first).
        secondMonomer, // NOSONAR
        firstMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );

    showCurrentMonomersInSequenceLayout();
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new SequenceMode(),
    });
  });

  it.each([
    ['below the canvas', 723, -25],
    ['above the canvas', 40, 14],
    ['inside the canvas', 400, 0],
  ])(
    'keeps the new sequence caret visible when it is %s',
    (_, caretTop, expectedOffset) => {
      showCurrentMonomersInSequenceLayout();
      const mode = editor.mode;
      expect(mode).toBeInstanceOf(SequenceMode);
      if (!(mode instanceof SequenceMode)) {
        throw new Error('Expected Sequence mode');
      }
      const scroll = jest
        .spyOn(editor.zoomTool, 'scrollBy')
        .mockImplementation();
      const bounds = jest
        .spyOn(SVGElement.prototype, 'getBoundingClientRect')
        .mockImplementation(function (this: SVGElement) {
          if (this === canvas) {
            return new DOMRect(50, 54, 952, 666);
          }
          return new DOMRect(88.5, caretTop, 0, 22);
        });

      mode.startNewSequence();

      const caret = canvas.querySelector('[data-testid="sequence-caret"]');
      expect(caret).not.toBeNull();
      if (expectedOffset === 0) {
        expect(scroll).not.toHaveBeenCalled();
      } else {
        expect(scroll).toHaveBeenCalledTimes(1);
        expect(scroll).toHaveBeenCalledWith(0, expectedOffset);
      }
      bounds.mockRestore();
      scroll.mockRestore();
    },
  );

  afterEach(() => {
    SequenceRenderer.clear();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('does not duplicate sequence bond paths when re-rendering via startNewSequence', () => {
    setupCyclicTwoPeptideStructure();

    expect(getSequenceBondPaths()).toHaveLength(1);

    SequenceRenderer.startNewSequence(0);

    expect(getSequenceBondPaths()).toHaveLength(1);
  });

  it('removes sequence bond paths created across multiple renders when ClearTool runs', () => {
    setupCyclicTwoPeptideStructure();
    SequenceRenderer.startNewSequence(0);

    expect(getSequenceBondPaths()).toHaveLength(1);

    // ClearTool performs all of its work in the constructor as a side effect.
    // Instantiating it is how the tool is "run",
    // so the constructed instance is intentionally discarded.

    // @ts-expect-error TS6133.
    const _ = new ClearTool(editor);

    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    expect(getSequenceBondPaths()).toHaveLength(0);
  });

  it('keeps the caret and the chain start arrow out of the exported SVG (#4669)', () => {
    setupCyclicTwoPeptideStructure();
    // In text-editing mode the first symbol of a chain carries the start arrow
    (editor.mode as SequenceMode).isEditMode = true;
    showCurrentMonomersInSequenceLayout();
    const [monomer] = [...editor.drawingEntitiesManager.monomers.values()];
    (monomer.renderer as BaseSequenceItemRenderer).showCaret();

    const caret = canvas.querySelector('.blinking');
    const arrow = canvas.querySelector('[data-testid="sequence-start-arrow"]');
    expect(caret).not.toBeNull();
    expect(arrow).not.toBeNull();

    const svg = getSvgFromDrawnStructures(canvas, 'file');

    expect(svg).not.toContain('blinking');
    expect(svg).not.toContain('sequence-start-arrow');
  });
});
