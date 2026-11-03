import { select } from 'd3';
import { mock, mockDeep } from 'jest-mock-extended';
import type { CoreEditor } from '../Editor';
import { PasteTool } from '../tools/Paste';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { Vec2 } from 'domain/entities/vec2';
import { Command } from 'domain/entities/Command';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { EditorHistory } from '../EditorHistory';
import { Coordinates } from '../shared/coordinates';
import { TransientDrawingView } from 'application/render/renderers/TransientView/TransientDrawingView';
import ZoomTool from '../tools/Zoom';
import { provideEditorInstance } from '../editorSingleton';
import { FlexMode } from '../modes/FlexMode';

jest.mock('application/render/renderers/RenderersManager', () => ({
  RenderersManager: jest.fn().mockImplementation(() => ({
    renderPreview: jest.fn(),
  })),
}));
jest.mock('../editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));

describe('flex paste placement', () => {
  const bounds = { x: 80, y: -20, width: 240, height: 120 };
  let editor: ReturnType<typeof mock<CoreEditor>>;
  let entities: DrawingEntitiesManager;
  let history: ReturnType<typeof mock<EditorHistory>>;
  let canvas: SVGGElement;

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(canvas);
    document.body.appendChild(svg);
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: jest.fn(() => bounds),
    });
    editor = mock<CoreEditor>();
    editor.drawingEntitiesManager = mockDeep<DrawingEntitiesManager>();
    editor.events = mockDeep<CoreEditor['events']>();
    editor.renderersContainer = mockDeep<RenderersManager>();
    const zoomTool = mock<ZoomTool>();
    zoomTool.canvas = select('svg > g');
    jest.spyOn(ZoomTool, 'instance', 'get').mockReturnValue(zoomTool);
    editor.zoomTool = zoomTool;
    editor.transientDrawingView = new TransientDrawingView();
    editor.lastCursorPositionOfCanvas = new Vec2(400, 300);
    editor.mode = new FlexMode();
    (provideEditorInstance as jest.Mock).mockReturnValue(editor);
    history = mock<EditorHistory>();
    jest.spyOn(EditorHistory, 'getInstance').mockReturnValue(history);
    entities = new DrawingEntitiesManager();
    jest
      .spyOn(Coordinates, 'canvasToModel')
      .mockImplementation((position) => position.scaled(1 / 40));
    jest
      .spyOn(Coordinates, 'viewToCanvas')
      .mockImplementation(() => editor.lastCursorPositionOfCanvas);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('centers the visual bounds at the cursor without changing the live model or zoom', () => {
    new PasteTool(editor, { entities });

    expect(
      canvas
        .querySelector('[data-testid="paste-preview"]')
        ?.getAttribute('transform'),
    ).toBe('translate(200, 260)');
    expect(RenderersManager).toHaveBeenCalledWith(
      { theme: editor.theme },
      expect.objectContaining({
        canvas: expect.anything(),
        viewModel: expect.anything(),
      }),
    );
    expect(editor.renderersContainer.update).not.toHaveBeenCalled();
    expect(history.update).not.toHaveBeenCalled();
    expect(editor.zoomToStructuresIfNeeded).not.toHaveBeenCalled();
  });

  it('moves the ghost and preserves its contents across transient redraws', () => {
    const tool = new PasteTool(editor, { entities });
    const preview = canvas.querySelector('[data-testid="paste-preview"]');
    preview?.appendChild(
      document.createElementNS('http://www.w3.org/2000/svg', 'path'),
    );
    editor.lastCursorPositionOfCanvas = new Vec2(500, 350);
    tool.mousemove();
    editor.transientDrawingView.update();

    expect(preview?.getAttribute('transform')).toBe('translate(300, 310)');
    expect(preview?.querySelector('path')).not.toBeNull();
    expect(canvas.contains(preview)).toBe(true);
    expect(history.update).not.toHaveBeenCalled();
  });

  it('discards the preview without creating history when the tool is destroyed', () => {
    const merge = jest.spyOn(entities, 'mergeInto');
    const tool = new PasteTool(editor, { entities });
    tool.destroy();
    editor.transientDrawingView.update();

    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
    expect(merge).not.toHaveBeenCalled();
    expect(history.update).not.toHaveBeenCalled();
  });

  it('commits at the latest cursor position as one command without relayout or zooming', () => {
    const entity = mock<DrawingEntity>();
    const merged = new DrawingEntitiesManager();
    const command = new Command();
    const antisenseCommand = new Command();
    jest.spyOn(entities, 'allEntities', 'get').mockReturnValue([[1, entity]]);
    const move = jest
      .spyOn(entities, 'moveDrawingEntityModelChange')
      .mockReturnValue(entity);
    const merge = jest.spyOn(entities, 'mergeInto').mockReturnValue({
      command,
      mergedDrawingEntities: merged,
    });
    jest
      .spyOn(editor.drawingEntitiesManager, 'recalculateAntisenseChains')
      .mockReturnValue(antisenseCommand);
    jest
      .spyOn(editor.drawingEntitiesManager, 'selectDrawingEntities')
      .mockReturnValue(new Command());
    const tool = new PasteTool(editor, { entities });
    editor.lastCursorPositionOfCanvas = new Vec2(600, 400);
    jest
      .spyOn(editor.events.selectSelectionTool, 'dispatch')
      .mockImplementation(() => {
        tool.destroy();
      });
    jest.spyOn(editor.renderersContainer, 'update').mockImplementation(() => {
      expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
    });

    tool.mousedown();

    expect(move).toHaveBeenCalledWith(entity, new Vec2(10, 9));
    expect(merge).toHaveBeenCalledWith(editor.drawingEntitiesManager);
    expect(editor.renderersContainer.update).toHaveBeenCalledWith(command);
    expect(history.update).toHaveBeenCalledTimes(1);
    expect(history.update).toHaveBeenCalledWith(command);
    expect(
      editor.drawingEntitiesManager.applySnakeLayout,
    ).not.toHaveBeenCalled();
    expect(editor.zoomToStructuresIfNeeded).not.toHaveBeenCalled();
    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
  });

  it('cleans up if preview rendering fails', () => {
    jest.mocked(RenderersManager).mockImplementationOnce(() => {
      throw new Error('Render failed');
    });
    expect(() => new PasteTool(editor, { entities })).toThrow('Render failed');
    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
    expect(history.update).not.toHaveBeenCalled();
  });

  it('returns to the selection tool when cancelled by a history action', () => {
    const tool = new PasteTool(editor, { entities });
    jest
      .spyOn(editor.events.selectSelectionTool, 'dispatch')
      .mockImplementation(() => tool.destroy());

    tool.cancel();

    expect(editor.events.selectSelectionTool.dispatch).toHaveBeenCalledTimes(1);
    expect(canvas.querySelector('[data-testid="paste-preview"]')).toBeNull();
    expect(history.update).not.toHaveBeenCalled();
  });
});
