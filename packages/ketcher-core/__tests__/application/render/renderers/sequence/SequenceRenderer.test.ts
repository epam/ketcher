import {
  CoreEditor,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
} from 'application/editor';
import { ClearTool } from 'application/editor/tools/Clear';
import { SequenceRenderer } from 'application/render/renderers/sequence/SequenceRenderer';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import { peptideMonomerItem, polymerEditorTheme } from '../../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

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
      theme: polymerEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new SequenceMode(),
    });
  });

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
    // eslint-disable-next-line no-new
    // @ts-expect-error TS6133.
    const _ = new ClearTool(editor);

    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    expect(getSequenceBondPaths()).toHaveLength(0);
  });
});
