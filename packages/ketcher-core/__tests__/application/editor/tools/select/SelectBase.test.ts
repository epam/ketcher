import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../../../helpers/dom';

describe('SelectBase mouseup', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let selectTool: SelectRectangle;
  const setMovementState = (
    tool: SelectRectangle,
    before: Vec2,
    after: Vec2,
  ) => {
    const toolState = tool as unknown as {
      mode: 'moving' | 'selecting' | 'standby';
      mousePositionBeforeMove: Vec2;
      mousePositionAfterMove: Vec2;
    };

    toolState.mode = 'moving';
    toolState.mousePositionBeforeMove = before;
    toolState.mousePositionAfterMove = after;
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({ theme: {}, canvas });
    selectTool = new SelectRectangle(editor);
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

    setMovementState(selectTool, new Vec2(0, 0), new Vec2(10, 0));

    selectTool.mouseup({ target: editor.canvas } as unknown as MouseEvent);

    expect(history.historyPointer).toBe(1);
  });
});
