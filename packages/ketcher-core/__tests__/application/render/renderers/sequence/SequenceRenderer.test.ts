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

  it('removes sequence bond renderers created before starting a new sequence when clearing canvas', () => {
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
        secondMonomer,
        firstMonomer,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );

    showCurrentMonomersInSequenceLayout();

    expect(getSequenceBondPaths()).toHaveLength(1);

    SequenceRenderer.startNewSequence(0);

    expect(getSequenceBondPaths()).toHaveLength(1);

    const clearTool = new ClearTool(editor);

    expect(clearTool).toBeInstanceOf(ClearTool);
    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    expect(getSequenceBondPaths()).toHaveLength(0);
  });
});
