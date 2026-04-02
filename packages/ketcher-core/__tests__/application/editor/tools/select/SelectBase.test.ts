import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

class TestSelectRectangle extends SelectRectangle {
  public setMovementState(before: Vec2, after: Vec2) {
    this.mode = 'moving';
    this.mousePositionBeforeMove = before;
    this.mousePositionAfterMove = after;
  }

  public exposedStartRotationCenterDrag(event: MouseEvent | PointerEvent) {
    this.startRotationCenterDrag(event);
  }

  public exposedUserRotationCenter() {
    return this.userRotationCenter;
  }
}

describe('SelectBase mouseup', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let selectTool: TestSelectRectangle;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    selectTool = new TestSelectRectangle(editor);
    history = EditorHistory.getInstance(editor);
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

  it('does not start rotation center drag when selection has external connections', () => {
    const event = new MouseEvent('mousedown', { bubbles: true });
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const externalConnection = { connected: true };

    editor.lastCursorPosition = new Vec2(10, 20);
    Object.defineProperty(
      editor.drawingEntitiesManager,
      'externalConnectionsToSelection',
      {
        get: () => [externalConnection],
      },
    );

    selectTool.exposedStartRotationCenterDrag(event);

    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(selectTool.mode).toBe('standby');
    expect(selectTool.exposedUserRotationCenter()).toBeNull();
  });

  it('starts rotation center drag when selection has no external connections', () => {
    const event = new MouseEvent('mousedown', { bubbles: true });
    const expectedRotationCenter = Coordinates.canvasToModel(
      Coordinates.viewToCanvas(new Vec2(10, 20)),
    );

    editor.lastCursorPosition = new Vec2(10, 20);
    Object.defineProperty(
      editor.drawingEntitiesManager,
      'externalConnectionsToSelection',
      {
        get: () => [],
      },
    );

    selectTool.exposedStartRotationCenterDrag(event);

    expect(selectTool.mode).toBe('rotating-center');
    expect(selectTool.exposedUserRotationCenter()).toEqual(
      expectedRotationCenter,
    );
  });
});
