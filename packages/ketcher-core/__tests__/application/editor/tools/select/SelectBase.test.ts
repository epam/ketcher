import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../../../helpers/dom';

class TestSelectRectangle extends SelectRectangle {
  public setMovementState(before: Vec2, after: Vec2) {
    this.mode = 'moving';
    this.mousePositionBeforeMove = before;
    this.mousePositionAfterMove = after;
  }
}

describe('SelectBase mouseup', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let selectTool: TestSelectRectangle;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({ theme: {}, canvas });
    selectTool = new TestSelectRectangle(editor);
    history = new EditorHistory(editor);
  });

  afterEach(() => {
    history.destroy();
    editor.destroy();
    canvas.remove();
  });

  it('stores movement in history even when mouseup target is not selected entity', () => {
    const addArrowCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );
    addArrowCommand.execute(editor.renderersContainer);
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next().value;
    const selectCommand =
      editor.drawingEntitiesManager.selectDrawingEntity(arrow);
    selectCommand.execute(editor.renderersContainer);

    selectTool.setMovementState(new Vec2(0, 0), new Vec2(10, 0));

    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    Object.defineProperty(mouseUpEvent, 'target', {
      value: editor.canvas,
      writable: false,
    });

    selectTool.mouseup(mouseUpEvent);

    expect(history.historyPointer).toBe(1);
  });
});
