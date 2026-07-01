import { CoreEditor, EditorHistory, ToolName } from 'application/editor';
import { ReactionArrow } from 'application/editor/tools/ReactionArrow';
import { RxnArrowResizeOperation } from 'application/editor/operations/coreRxn/rxnArrow';
import { RxnArrow } from 'domain/entities/CoreRxnArrow';
import { RxnArrowMode } from 'domain/entities/rxnArrow';
import { Vec2 } from 'domain/entities/vec2';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

describe('RxnArrowResizeOperation', () => {
  let renderersManager: ReturnType<typeof createRenderersManager>;

  beforeEach(() => {
    createPolymerEditorCanvas();
    renderersManager = createRenderersManager();
  });

  it('executes and inverts end resize', () => {
    const arrow = new RxnArrow(RxnArrowMode.OpenAngle, [
      new Vec2(0, 0),
      new Vec2(1, 0),
    ]);
    const previousPosition = new Vec2(1, 0);
    const newPosition = new Vec2(2, 1);
    const operation = new RxnArrowResizeOperation(
      arrow,
      1,
      newPosition,
      previousPosition,
    );

    operation.execute(renderersManager);
    expect(arrow.endPosition).toEqual(newPosition);

    operation.invert(renderersManager);
    expect(arrow.endPosition).toEqual(previousPosition);
  });
});

describe('DrawingEntitiesManager.resizeRxnArrow', () => {
  let editor: CoreEditor;
  let drawingEntitiesManager: DrawingEntitiesManager;

  beforeEach(() => {
    const canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    drawingEntitiesManager = editor.drawingEntitiesManager;
  });

  afterEach(() => {
    editor.destroy();
  });

  it('snaps arrow end to horizontal axis', () => {
    const addCommand = drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );
    addCommand.execute(editor.renderersContainer);
    const arrow = drawingEntitiesManager.rxnArrows.values().next().value;
    const almostHorizontalEnd = new Vec2(2, 0.05);

    const resizeCommand = drawingEntitiesManager.resizeRxnArrow(
      arrow,
      1,
      almostHorizontalEnd,
      { isSnappingEnabled: true },
    );
    resizeCommand.execute(editor.renderersContainer);

    expect(arrow.endPosition.y).toBe(0);
    expect(arrow.endPosition.x).toBeGreaterThan(1.99);
  });

  it('does not snap when snapping is disabled', () => {
    const addCommand = drawingEntitiesManager.addRxnArrow(
      RxnArrowMode.OpenAngle,
      [new Vec2(0, 0), new Vec2(1, 0)],
    );
    addCommand.execute(editor.renderersContainer);
    const arrow = drawingEntitiesManager.rxnArrows.values().next().value;
    const unsnappedEnd = new Vec2(2, 0.05);

    const resizeCommand = drawingEntitiesManager.resizeRxnArrow(
      arrow,
      1,
      unsnappedEnd,
      { isSnappingEnabled: false },
    );
    resizeCommand.execute(editor.renderersContainer);

    expect(arrow.endPosition).toEqual(unsnappedEnd);
  });
});

describe('ReactionArrow creation tool', () => {
  let editor: CoreEditor;
  let drawingEntitiesManager: DrawingEntitiesManager;

  beforeEach(() => {
    const canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    drawingEntitiesManager = editor.drawingEntitiesManager;
  });

  afterEach(() => {
    editor.destroy();
  });

  const createTool = () =>
    new ReactionArrow(editor, {
      toolName: ToolName.reactionArrow,
      mode: RxnArrowMode.OpenAngle,
    });

  const getArrows = () => [...drawingEntitiesManager.rxnArrows.values()];

  it('creates a single horizontal arrow of default length on click', () => {
    editor.lastCursorPositionOfCanvas = new Vec2(100, 100);
    const tool = createTool();

    tool.mousedown();
    tool.mouseup();

    const arrows = getArrows();
    expect(arrows).toHaveLength(1);

    const arrow = arrows[0];
    expect(arrow.endPosition.x - arrow.startPosition.x).toBeCloseTo(
      ReactionArrow.DEFAULT_LENGTH,
    );
    expect(arrow.endPosition.y).toBeCloseTo(arrow.startPosition.y);
  });

  it('does not leave a phantom arrow on sub-threshold cursor jitter', () => {
    editor.lastCursorPositionOfCanvas = new Vec2(100, 100);
    const tool = createTool();
    const history = EditorHistory.getInstance(editor);

    tool.mousedown();
    editor.lastCursorPositionOfCanvas = new Vec2(100.001, 100.001);
    tool.mousemove({ ctrlKey: false } as MouseEvent);
    tool.mouseup();

    expect(getArrows()).toHaveLength(1);
    expect(history.historyPointer).toBeGreaterThan(0);

    history.undo();
    expect(getArrows()).toHaveLength(0);
  });

  it('creates an arrow following the drag length and direction', () => {
    editor.lastCursorPositionOfCanvas = new Vec2(100, 100);
    const tool = createTool();

    tool.mousedown();
    editor.lastCursorPositionOfCanvas = new Vec2(300, 100);
    tool.mousemove({ ctrlKey: false } as MouseEvent);
    tool.mouseup();

    const arrows = getArrows();
    expect(arrows).toHaveLength(1);

    const arrow = arrows[0];
    expect(arrow.endPosition.x).toBeGreaterThan(arrow.startPosition.x);
    expect(Vec2.dist(arrow.startPosition, arrow.endPosition)).toBeGreaterThan(
      ReactionArrow.MIN_LENGTH,
    );
  });

  it('removes the in-progress arrow when the tool is destroyed mid-drag', () => {
    editor.lastCursorPositionOfCanvas = new Vec2(100, 100);
    const tool = createTool();

    tool.mousedown();
    editor.lastCursorPositionOfCanvas = new Vec2(300, 100);
    tool.mousemove({ ctrlKey: false } as MouseEvent);

    expect(getArrows()).toHaveLength(1);

    tool.destroy();

    expect(getArrows()).toHaveLength(0);
  });
});
