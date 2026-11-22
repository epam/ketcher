import { onTestFinished, vi } from 'vitest';
import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../../mock-data';

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
    const arrow = editor.drawingEntitiesManager.rxnArrows.values().next()
      .value as DrawingEntity;
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
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
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

// https://github.com/epam/ketcher/issues/4481: while selected structures are
// dragged, the canvas scrolls when the cursor nears its border, and the
// dragged structures move with the view, as in molecules mode.
describe('SelectBase auto-scroll while moving selected structures', () => {
  const CANVAS_RECT = {
    left: 0,
    top: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
  } as DOMRect;

  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let selectTool: TestSelectRectangle;
  let scrollBySpy: ReturnType<typeof vi.spyOn>;
  let arrow: DrawingEntity & { startPosition: Vec2 };

  const mouseEvent = (type: string, clientX: number, clientY: number) =>
    new MouseEvent(type, { clientX, clientY, bubbles: true });

  const moveCursorTo = (clientX: number, clientY: number) => {
    editor.lastCursorPosition = new Vec2(clientX, clientY);
    editor.lastCursorPositionOfCanvas = Coordinates.viewToCanvas(
      editor.lastCursorPosition,
    );
    selectTool.mousemove(mouseEvent('mousemove', clientX, clientY));
  };

  const nextFrames = (count: number) => {
    for (let i = 0; i < count; i++) {
      vi.advanceTimersToNextFrame();
    }
  };

  const releaseMouse = (target: EventTarget = editor.canvas) => {
    const mouseUpEvent = mouseEvent('mouseup', 0, 0);
    Object.defineProperty(mouseUpEvent, 'target', { value: target });
    selectTool.mouseup(mouseUpEvent);
  };

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    const canvasWrapperNode = editor.zoomTool.canvasWrapper.node();
    if (canvasWrapperNode) {
      vi.spyOn(canvasWrapperNode, 'getBoundingClientRect').mockReturnValue(
        CANVAS_RECT,
      );
    }
    selectTool = new TestSelectRectangle(editor);
    history = EditorHistory.getInstance(editor);
    scrollBySpy = vi.spyOn(editor.zoomTool, 'scrollBy');

    editor.drawingEntitiesManager
      .addRxnArrow(RxnArrowMode.OpenAngle, [new Vec2(0, 0), new Vec2(1, 0)])
      .execute(editor.renderersContainer);
    arrow = editor.drawingEntitiesManager.rxnArrows.values().next()
      .value as DrawingEntity & { startPosition: Vec2 };
    editor.drawingEntitiesManager
      .selectDrawingEntity(arrow)
      .execute(editor.renderersContainer);

    const start = new Vec2(400, 300);
    editor.lastCursorPosition = start;
    editor.lastCursorPositionOfCanvas = Coordinates.viewToCanvas(start);
    selectTool.setMovementState(
      editor.lastCursorPositionOfCanvas,
      editor.lastCursorPositionOfCanvas,
    );
  });

  afterEach(() => {
    scrollBySpy.mockRestore();
    history.destroy();
    editor.destroy();
    canvas.remove();
    vi.useRealTimers();
  });

  it('keeps scrolling and moving the selection while the cursor rests at the right edge', () => {
    moveCursorTo(795, 300);
    nextFrames(1);
    const arrowXAtEdge = arrow.startPosition.x;

    nextFrames(6);

    expect(scrollBySpy).toHaveBeenCalledWith(-5, 0);
    expect(scrollBySpy.mock.calls.length).toBeGreaterThanOrEqual(3);
    // The cursor did not move, but the selection followed the scrolled view.
    expect(arrow.startPosition.x).toBeGreaterThan(arrowXAtEdge);
  });

  it('scrolls along both axes near a corner', () => {
    moveCursorTo(5, 595);
    nextFrames(3);

    expect(scrollBySpy).toHaveBeenCalledWith(5, -5);
  });

  it('does not scroll while the cursor is away from the edges', () => {
    moveCursorTo(450, 320);
    nextFrames(5);

    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it('stops scrolling when the mouse is released and records one history step', () => {
    moveCursorTo(795, 595);
    nextFrames(5);
    expect(scrollBySpy).toHaveBeenCalled();

    releaseMouse();
    const callsAfterRelease = scrollBySpy.mock.calls.length;
    nextFrames(5);

    expect(scrollBySpy).toHaveBeenCalledTimes(callsAfterRelease);
    expect(selectTool.mode).toBe('standby');
    expect(history.historyPointer).toBe(1);
  });

  it('undoes the whole auto-scrolled move in one step', () => {
    const startPosition = new Vec2(arrow.startPosition);

    moveCursorTo(795, 300);
    nextFrames(6);
    releaseMouse();
    nextFrames(2);
    expect(arrow.startPosition.x).toBeGreaterThan(startPosition.x);

    history.undo();

    expect(arrow.startPosition.x).toBeCloseTo(startPosition.x, 6);
    expect(arrow.startPosition.y).toBeCloseTo(startPosition.y, 6);
  });

  it('records the last auto-scrolled monomer move even if its frame has not run yet', () => {
    // happy-dom has no SVG layout; monomer labels measure themselves with it.
    const svgElementPrototype = SVGElement.prototype as SVGElement & {
      getBBox?: () => DOMRect;
    };
    const originalGetBBox = svgElementPrototype.getBBox;
    svgElementPrototype.getBBox = () =>
      ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;
    onTestFinished(() => {
      svgElementPrototype.getBBox = originalGetBBox;
    });

    editor.drawingEntitiesManager
      .addMonomer(peptideMonomerItem, new Vec2(10, 7))
      .execute(editor.renderersContainer);
    const monomer = editor.drawingEntitiesManager.monomers.values().next()
      .value as DrawingEntity & { position: Vec2 };
    editor.drawingEntitiesManager
      .selectDrawingEntity(monomer)
      .execute(editor.renderersContainer);
    const startPosition = new Vec2(monomer.position);

    moveCursorTo(795, 300);
    nextFrames(6);
    // The last auto-scroll frame scheduled a move that has not been applied.
    releaseMouse();
    nextFrames(2);
    expect(monomer.position.x).toBeGreaterThan(startPosition.x);

    history.undo();

    expect(monomer.position.x).toBeCloseTo(startPosition.x, 6);
    expect(monomer.position.y).toBeCloseTo(startPosition.y, 6);
  });

  it('receives the mouse release outside the canvas, for example over the library', () => {
    moveCursorTo(795, 300);
    nextFrames(3);

    // The editor routes page-wide mouse events to the tool while it moves.
    expect(selectTool.isMovingSelection()).toBe(true);
    releaseMouse(document.body);
    nextFrames(3);

    expect(selectTool.isMovingSelection()).toBe(false);
    expect(history.historyPointer).toBe(1);
  });
});
