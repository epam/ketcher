import { CoreEditor } from 'application/editor';
import { SimpleObjectTool } from 'application/editor/tools/SimpleObject';
import { ToolName } from 'application/editor/tools/types';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

function createEditor() {
  return new CoreEditor({
    canvas: createPolymerEditorCanvas(),
    theme: {},
    renderersContainer: createRenderersManager(),
  });
}

function drag(
  tool: SimpleObjectTool,
  editor: CoreEditor,
  end: Vec2,
  shiftKey = false,
) {
  tool.mousemove(new MouseEvent('mousemove', { shiftKey }));
  editor.lastCursorPositionOfCanvas = end;
  tool.mousemove(new MouseEvent('mousemove', { shiftKey }));
  tool.mouseup(new MouseEvent('mouseup', { shiftKey }));
}

describe('SimpleObjectTool', () => {
  it('creates one rectangle from a drag and returns to the select tool', () => {
    const editor = createEditor();
    const dispatch = vi.spyOn(editor.events.selectTool, 'dispatch');
    const tool = new SimpleObjectTool(editor, {
      toolName: ToolName.shapeRectangle,
    });
    editor.lastCursorPositionOfCanvas = new Vec2(10, 10);
    tool.mousedown();

    editor.lastCursorPositionOfCanvas = new Vec2(50, 30);
    tool.mousemove(new MouseEvent('mousemove'));
    expect(
      document.querySelector('g[stroke-dasharray="4 2"] rect'),
    ).toBeTruthy();

    tool.mouseup(new MouseEvent('mouseup'));

    const [created] = editor.drawingEntitiesManager.simpleObjects.values();
    expect(editor.drawingEntitiesManager.simpleObjects.size).toBe(1);
    expect(created.mode).toBe(SimpleObjectMode.rectangle);
    expect(
      document.querySelector('[data-testid="simple-object"] rect'),
    ).toBeTruthy();
    expect(document.querySelector('g[stroke-dasharray="4 2"]')).toBeFalsy();
    expect(dispatch).toHaveBeenLastCalledWith([ToolName.selectRectangle]);
  });

  it('draws an ellipse for the ellipse tool', () => {
    const editor = createEditor();
    const tool = new SimpleObjectTool(editor, {
      toolName: ToolName.shapeEllipse,
    });
    editor.lastCursorPositionOfCanvas = new Vec2(10, 10);
    tool.mousedown();

    drag(tool, editor, new Vec2(40, 20));

    const [created] = editor.drawingEntitiesManager.simpleObjects.values();
    expect(created.mode).toBe(SimpleObjectMode.ellipse);
  });

  it('makes a square when Shift is held for a rectangle', () => {
    const editor = createEditor();
    const tool = new SimpleObjectTool(editor, {
      toolName: ToolName.shapeRectangle,
    });
    editor.lastCursorPositionOfCanvas = new Vec2(10, 10);
    tool.mousedown();

    drag(tool, editor, new Vec2(50, 20), true);

    const [created] = editor.drawingEntitiesManager.simpleObjects.values();
    const width = Math.abs(created.pos[1].x - created.pos[0].x);
    const height = Math.abs(created.pos[1].y - created.pos[0].y);
    expect(width).toBeCloseTo(height);
  });

  it('creates nothing for a click without a drag', () => {
    const editor = createEditor();
    const tool = new SimpleObjectTool(editor, {
      toolName: ToolName.shapeLine,
    });
    editor.lastCursorPositionOfCanvas = new Vec2(10, 10);
    tool.mousedown();

    tool.mouseup(new MouseEvent('mouseup'));

    expect(editor.drawingEntitiesManager.simpleObjects.size).toBe(0);
  });
});
