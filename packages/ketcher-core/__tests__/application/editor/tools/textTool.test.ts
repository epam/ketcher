import { CoreEditor } from 'application/editor';
import { TextTool } from 'application/editor/tools/Text';
import { TextRenderer } from 'application/render/renderers/TextRenderer';
import { CoreText } from 'domain/entities/CoreText';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const CONTENT = '{"root":{"children":[],"type":"root"}}';

function createEditor() {
  return new CoreEditor({
    theme: {},
    canvas: createPolymerEditorCanvas(),
    renderersContainer: createRenderersManager(),
  });
}

describe('TextTool', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('asks for a new text at the clicked model position', () => {
    const editor = createEditor();
    const request = vi.spyOn(editor.events.openTextEditor, 'dispatch');
    const tool = new TextTool(editor);
    editor.lastCursorPositionOfCanvas = new Vec2(40, 80);

    tool.click();

    expect(request).toHaveBeenCalledWith({
      position: expect.objectContaining({ x: expect.any(Number) }),
    });
    const [payload] = request.mock.calls[0];
    expect(payload.text).toBeUndefined();
  });

  it('asks to edit an existing text on double click', () => {
    const editor = createEditor();
    const request = vi.spyOn(editor.events.openTextEditor, 'dispatch');
    const text = new CoreText(CONTENT, new Vec2(3, 4));
    const renderer = new TextRenderer(text);
    renderer.show();
    const group = document.querySelector('[data-testid="text"]');
    const target = group?.querySelector('text') ?? group;
    const event = new MouseEvent('dblclick');
    Object.defineProperty(event, 'target', { value: target });

    new TextTool(editor).dblclick(event);

    expect(request).toHaveBeenCalledWith({
      position: text.position,
      text,
    });
  });
});
