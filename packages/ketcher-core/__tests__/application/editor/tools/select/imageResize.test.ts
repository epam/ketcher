import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

describe('image resize with the select tool', () => {
  let editor: CoreEditor;
  let tool: SelectRectangle;
  let history: EditorHistory;

  beforeEach(() => {
    document.body.innerHTML = '';
    editor = new CoreEditor({
      theme: {},
      canvas: createPolymerEditorCanvas(),
      renderersContainer: createRenderersManager(),
    });
    tool = new SelectRectangle(editor);
    history = EditorHistory.getInstance(editor);
  });

  afterEach(() => {
    history.destroy();
  });

  it('drags the bottom-right corner to resize a selected image and undo restores it', () => {
    const addCommand = editor.drawingEntitiesManager.addImage(
      'data:image/png;base64,AAAA',
      new Vec2(5, 5),
      new Vec2(2, 2),
    );
    editor.renderersContainer.update(addCommand);
    history.update(addCommand);
    const [image] = editor.drawingEntitiesManager.images.values();
    image.turnOnSelection();
    image.baseRenderer?.drawSelection();

    const handle = document.querySelector('[data-point-index="1"]');
    const mouseDown = new MouseEvent('mousedown');
    Object.defineProperty(mouseDown, 'target', { value: handle });
    tool.mousedown(mouseDown);

    const target = Coordinates.modelToCanvas(new Vec2(9, 8));
    editor.lastCursorPositionOfCanvas = target;
    tool.mousemove(new MouseEvent('mousemove'));
    tool.mouseup(new MouseEvent('mouseup'));

    const expected = Coordinates.canvasToModel(target);
    expect(image.bottomRight.x).toBeCloseTo(expected.x);
    expect(image.bottomRight.y).toBeCloseTo(expected.y);
    expect(image.position.x).toBeCloseTo(3);

    history.undo();

    expect(image.getState().center).toEqual(new Vec2(5, 5));
    expect(image.getState().halfSize).toEqual(new Vec2(2, 2));
  });
});
