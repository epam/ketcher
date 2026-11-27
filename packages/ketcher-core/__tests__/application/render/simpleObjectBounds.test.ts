import { CoreEditor } from 'application/editor';
import { toolsMap } from 'application/editor/tools';
import { ToolName } from 'application/editor/tools/types';
import { Coordinates } from 'application/editor/shared/coordinates';
import { getRenderedStructuresBbox } from 'application/render/renderers/utils';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

function createEditor() {
  return new CoreEditor({
    theme: {},
    canvas: createPolymerEditorCanvas(),
    renderersContainer: createRenderersManager(),
  });
}

describe('static objects in macro canvas bounds and clearing', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('includes a static object in the rendered bounds of a static-only canvas', () => {
    const editor = createEditor();
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addSimpleObject(
        SimpleObjectMode.rectangle,
        new Vec2(0, 0),
        new Vec2(4, 3),
      ),
    );
    const start = Coordinates.modelToCanvas(new Vec2(0, 0));
    const end = Coordinates.modelToCanvas(new Vec2(4, 3));

    const bbox = getRenderedStructuresBbox();

    expect(bbox.left).toBeLessThanOrEqual(Math.min(start.x, end.x));
    expect(bbox.right).toBeGreaterThanOrEqual(Math.max(start.x, end.x));
    expect(bbox.top).toBeLessThanOrEqual(Math.min(start.y, end.y));
    expect(bbox.bottom).toBeGreaterThanOrEqual(Math.max(start.y, end.y));
  });

  it('clear removes static objects from the model and the canvas', () => {
    const editor = createEditor();
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addSimpleObject(
        SimpleObjectMode.line,
        new Vec2(0, 0),
        new Vec2(2, 0),
      ),
    );

    new toolsMap[ToolName.clear](editor);

    expect(editor.drawingEntitiesManager.simpleObjects.size).toBe(0);
    expect(document.querySelector('[data-testid="simple-object"]')).toBeFalsy();
  });
});
