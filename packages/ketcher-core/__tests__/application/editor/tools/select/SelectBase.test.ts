import { CoreEditor, EditorHistory } from 'application/editor';
import { Coordinates } from 'application/editor/shared/coordinates';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../../../helpers/dom';

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
    editor = new CoreEditor({ theme: {}, canvas });
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

  it('selects the whole reaction arrow when rectangle selection covers its end point', () => {
    const addArrowCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );
    addArrowCommand.execute(editor.renderersContainer);
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next().value;

    const arrowEnd = Coordinates.modelToCanvas(arrow.endPosition);
    const rectangleTopLeft = new Vec2(arrowEnd.x - 5, arrowEnd.y - 5);
    const rectangleBottomRight = new Vec2(arrowEnd.x + 5, arrowEnd.y + 5);

    const wasSelectionChanged = arrow.selectIfLocatedInRectangle(
      rectangleTopLeft,
      rectangleBottomRight,
    );

    expect(wasSelectionChanged).toBe(true);
    expect(arrow.selected).toBe(true);
  });

  it('resizes a reaction arrow from its end point and stores the result in history', () => {
    const addArrowCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );
    addArrowCommand.execute(editor.renderersContainer);
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next().value;
    const arrowPath = canvas.querySelector('[data-testid="rxn-arrow"]');

    expect(arrowPath).not.toBeNull();

    const initialEndPosition = new Vec2(arrow.endPosition);
    const initialEndCanvasPosition =
      Coordinates.modelToCanvas(initialEndPosition);
    const resizedEndPosition = new Vec2(2, 1);
    const resizedEndCanvasPosition =
      Coordinates.modelToCanvas(resizedEndPosition);

    editor.lastCursorPositionOfCanvas = initialEndCanvasPosition;
    editor.lastCursorPosition = Coordinates.canvasToView(
      initialEndCanvasPosition,
    );

    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(mouseDownEvent, 'target', {
      value: arrowPath,
      writable: false,
    });

    selectTool.mousedown(mouseDownEvent);

    editor.lastCursorPositionOfCanvas = resizedEndCanvasPosition;
    editor.lastCursorPosition = Coordinates.canvasToView(
      resizedEndCanvasPosition,
    );

    selectTool.mousemove(new MouseEvent('mousemove', { bubbles: true }));

    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    Object.defineProperty(mouseUpEvent, 'target', {
      value: arrowPath,
      writable: false,
    });

    selectTool.mouseup(mouseUpEvent);

    expect(arrow.selected).toBe(true);
    expect(arrow.endPosition.x).toBeCloseTo(resizedEndPosition.x, 2);
    expect(arrow.endPosition.y).toBeCloseTo(resizedEndPosition.y, 2);
    expect(history.historyPointer).toBe(1);

    history.undo();

    expect(arrow.endPosition.x).toBeCloseTo(initialEndPosition.x, 2);
    expect(arrow.endPosition.y).toBeCloseTo(initialEndPosition.y, 2);
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
