import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

describe('simple object resize with the select tool', () => {
  let editor: CoreEditor;
  let tool: SelectRectangle;
  let history: EditorHistory;

  beforeEach(() => {
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

  it('drags a reference point to resize a selected object and undo restores it', () => {
    const addCommand = editor.drawingEntitiesManager.addSimpleObject(
      SimpleObjectMode.rectangle,
      new Vec2(0, 0),
      new Vec2(2, 2),
    );
    editor.renderersContainer.update(addCommand);
    history.update(addCommand);
    const [simpleObject] = editor.drawingEntitiesManager.simpleObjects.values();
    simpleObject.turnOnSelection();
    simpleObject.baseRenderer?.drawSelection();

    const handle = document.querySelector('[data-point-index="1"]');
    const mouseDown = new MouseEvent('mousedown');
    Object.defineProperty(mouseDown, 'target', { value: handle });
    tool.mousedown(mouseDown);

    const target = Coordinates.modelToCanvas(new Vec2(6, 5));
    editor.lastCursorPositionOfCanvas = target;
    tool.mousemove(new MouseEvent('mousemove'));
    tool.mouseup(new MouseEvent('mouseup'));

    const expected = Coordinates.canvasToModel(target);
    expect(simpleObject.pos[1].x).toBeCloseTo(expected.x);
    expect(simpleObject.pos[1].y).toBeCloseTo(expected.y);
    expect(simpleObject.pos[0]).toEqual(new Vec2(0, 0));

    history.undo();

    expect(simpleObject.pos[1]).toEqual(new Vec2(2, 2));
  });
});
