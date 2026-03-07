import { CoreEditor, EditorHistory } from 'application/editor';
import { Coordinates } from 'application/editor/shared/coordinates';
import { SelectRectangle } from 'application/editor/tools/select';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import { createPolymerEditorCanvas } from '../../../../helpers/dom';

class TestSelectRectangle extends SelectRectangle {
  public setMovementState(before: Vec2, after: Vec2) {
    this.mode = 'moving';
    this.mousePositionBeforeMove = before;
    this.mousePositionAfterMove = after;
  }

  public startRotationPublic(event: MouseEvent | PointerEvent) {
    this.startRotation(event);
  }

  public handleRotationMovePublic(event: MouseEvent) {
    this.handleRotationMove(event);
  }

  public finishRotationPublic() {
    this.finishRotation();
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

  it('snaps arrow rotation on macromolecules canvas and preserves undo/redo', () => {
    const requestAnimationFrameSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      });
    const addArrowCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(10, 0)],
    );
    addArrowCommand.execute(editor.renderersContainer);
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next().value;
    editor.drawingEntitiesManager
      .selectDrawingEntity(arrow)
      .execute(editor.renderersContainer);

    const center = Coordinates.modelToCanvas(arrow.center);
    editor.lastCursorPositionOfCanvas = new Vec2(center.x + 100, center.y);
    selectTool.startRotationPublic({
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as MouseEvent);

    const snappedAngle = (14 * Math.PI) / 180;
    editor.lastCursorPositionOfCanvas = new Vec2(
      center.x + Math.cos(snappedAngle) * 100,
      center.y + Math.sin(snappedAngle) * 100,
    );

    selectTool.handleRotationMovePublic({
      ctrlKey: false,
    } as MouseEvent);

    const currentAngle =
      (Math.atan2(
        arrow.endPosition.y - arrow.startPosition.y,
        arrow.endPosition.x - arrow.startPosition.x,
      ) *
        180) /
      Math.PI;
    expect(currentAngle).toBeCloseTo(15, 5);

    selectTool.finishRotationPublic();
    expect(history.historyPointer).toBe(1);

    history.undo();
    expect(arrow.startPosition.x).toBeCloseTo(0, 5);
    expect(arrow.startPosition.y).toBeCloseTo(0, 5);
    expect(arrow.endPosition.x).toBeCloseTo(10, 5);
    expect(arrow.endPosition.y).toBeCloseTo(0, 5);

    history.redo();
    const redoneAngle =
      (Math.atan2(
        arrow.endPosition.y - arrow.startPosition.y,
        arrow.endPosition.x - arrow.startPosition.x,
      ) *
        180) /
      Math.PI;
    expect(redoneAngle).toBeCloseTo(15, 5);
    requestAnimationFrameSpy.mockRestore();
  });

  it('does not snap arrow rotation when ctrl is pressed', () => {
    const requestAnimationFrameSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      });
    const addArrowCommand = editor.drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(10, 0)],
    );
    addArrowCommand.execute(editor.renderersContainer);
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next().value;
    editor.drawingEntitiesManager
      .selectDrawingEntity(arrow)
      .execute(editor.renderersContainer);

    const center = Coordinates.modelToCanvas(arrow.center);
    editor.lastCursorPositionOfCanvas = new Vec2(center.x + 100, center.y);
    selectTool.startRotationPublic({
      stopPropagation: jest.fn(),
      preventDefault: jest.fn(),
    } as unknown as MouseEvent);

    const unsnappedAngle = (14 * Math.PI) / 180;
    editor.lastCursorPositionOfCanvas = new Vec2(
      center.x + Math.cos(unsnappedAngle) * 100,
      center.y + Math.sin(unsnappedAngle) * 100,
    );

    selectTool.handleRotationMovePublic({
      ctrlKey: true,
    } as MouseEvent);

    const currentAngle =
      (Math.atan2(
        arrow.endPosition.y - arrow.startPosition.y,
        arrow.endPosition.x - arrow.startPosition.x,
      ) *
        180) /
      Math.PI;
    expect(currentAngle).toBeCloseTo(14, 5);
    requestAnimationFrameSpy.mockRestore();
  });
});
