import { CoreEditor } from 'application/editor/Editor';
import { FlexMode } from 'application/editor/modes/FlexMode';
import 'application/editor/modes/SequenceMode';
import { PasteTool } from 'application/editor/tools/Paste';
import { ToolName } from 'application/editor/tools/types';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { EditorHistory } from 'application/editor/EditorHistory';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../mock-data';
import { Vec2 } from 'domain/entities/vec2';
import type { LayoutMode } from 'application/editor/modes/types';

describe('paste lifecycle across editor transitions', () => {
  let editor: CoreEditor;
  let canvas: SVGSVGElement;
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeEach(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 40 })),
    });
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      canvas,
      theme: { ...coreEditorTheme, ...polymerEditorTheme },
      mode: new FlexMode(),
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    editor.events.selectSelectionTool.add(() => {
      editor.selectTool(ToolName.selectRectangle);
    });
    editor.selectTool(ToolName.selectRectangle);
  });

  afterEach(() => {
    editor.destroy();
    canvas.remove();
    jest.restoreAllMocks();
    if (originalGetBBox) {
      SVGElement.prototype.getBBox = originalGetBBox;
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  const showPreview = () => {
    const entities = new DrawingEntitiesManager();
    entities.addMonomer(peptideMonomerItem, new Vec2());
    editor.previewStructure(entities);
    expect(editor.selectedTool).toBeInstanceOf(PasteTool);
    expect(
      canvas.querySelector('[data-testid="paste-preview"]'),
    ).not.toBeNull();
  };

  it.each<LayoutMode>(['snake-layout-mode', 'sequence-layout-mode'])(
    'cancels the placement tool before switching to %s',
    (mode) => {
      showPreview();

      editor.events.selectMode.dispatch(mode);

      expect(editor.mode.modeName).toBe(mode);
      expect(editor.selectedTool).not.toBeInstanceOf(PasteTool);
      expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
      expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
      editor.selectedTool?.mousedown?.(new MouseEvent('mousedown'));
      expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    },
  );

  it('cancels the preview without modifying the document or history', () => {
    showPreview();
    const history = EditorHistory.getInstance(editor);
    const pointer = history.historyPointer;

    editor.cancelPaste();

    expect(editor.selectedTool).not.toBeInstanceOf(PasteTool);
    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
    expect(history.historyPointer).toBe(pointer);
  });

  it('aborts clipboard work when the selection tool is selected by Escape', () => {
    const cancelPaste = jest.spyOn(editor.mode, 'cancelPaste');

    editor.events.selectSelectionTool.dispatch();

    expect(cancelPaste).toHaveBeenCalled();
  });

  it('does not retain a destroyed tool if creating its replacement fails', () => {
    showPreview();

    expect(() => editor.selectTool(ToolName.paste)).toThrow(
      'Paste requires drawing entities',
    );

    expect(editor.selectedTool).toBeUndefined();
    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
  });

  it('lets the eraser delete the selection made with the selection tool', () => {
    const addCommand = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      new Vec2(),
    );
    editor.renderersContainer.update(addCommand);
    const [monomer] = [...editor.drawingEntitiesManager.monomers.values()];
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.selectDrawingEntities([monomer]),
    );

    editor.selectTool(ToolName.erase);

    expect(editor.drawingEntitiesManager.hasDrawingEntities).toBe(false);
  });

  it('keeps the committed structure selected after returning to the selection tool', () => {
    showPreview();

    editor.selectedTool?.mousedown?.(new MouseEvent('mousedown'));

    expect(editor.selectedTool).not.toBeInstanceOf(PasteTool);
    const monomers = [...editor.drawingEntitiesManager.monomers.values()];
    expect(monomers).toHaveLength(1);
    expect(monomers[0].selected).toBe(true);
  });

  it('keeps the newer ghost when a preview replaces another preview', () => {
    showPreview();
    showPreview();

    expect(
      canvas.querySelectorAll('[data-testid="paste-preview"]'),
    ).toHaveLength(1);
    expect(
      editor.transientDrawingView['views'].has('StructurePreviewView'),
    ).toBe(true);
  });
});
