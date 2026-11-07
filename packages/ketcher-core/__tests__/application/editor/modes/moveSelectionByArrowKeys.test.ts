import { CoreEditor, EditorHistory } from 'application/editor';
import { FlexMode } from 'application/editor/modes/FlexMode';
import { SequenceMode } from 'application/editor/modes/SequenceMode';
import { SnakeMode } from 'application/editor/modes/SnakeMode';
import { Coordinates } from 'application/editor/shared/coordinates';
import { RxnArrowMode, Vec2 } from 'domain/entities';
import type { RxnArrow } from 'domain/entities/CoreRxnArrow';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

const pressKey = (editor: CoreEditor, key: string, shiftKey = false) =>
  editor.mode.onKeyDown(
    new KeyboardEvent('keydown', { code: key, key, shiftKey }),
  );

describe.each([
  ['flex', () => new FlexMode()],
  ['snake', () => new SnakeMode()],
])('Arrow keys move selection in %s mode', (_modeName, createMode) => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let arrow: RxnArrow;
  let startPosition: Vec2;

  const selectArrow = () => {
    editor.drawingEntitiesManager
      .selectDrawingEntity(arrow)
      .execute(editor.renderersContainer);
  };

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    history = EditorHistory.getInstance(editor);
    editor.setMode(createMode());
    editor.drawingEntitiesManager
      .addRxnArrow(RxnArrowMode.OpenAngle, [new Vec2(0, 0), new Vec2(1, 0)])
      .execute(editor.renderersContainer);
    arrow = Array.from(editor.drawingEntitiesManager.rxnArrows.values())[0];
    startPosition = new Vec2(arrow.startEndPosition[0]);
  });

  afterEach(() => {
    history.destroy();
    editor.destroy();
    canvas.remove();
  });

  it('moves selection by one canvas pixel per arrow press', async () => {
    selectArrow();

    await pressKey(editor, 'ArrowRight');

    const step = Coordinates.canvasToModel(new Vec2(1, 0));
    expect(arrow.startEndPosition[0].x).toBeCloseTo(startPosition.x + step.x);
    expect(arrow.startEndPosition[0].y).toBeCloseTo(startPosition.y);
  });

  it('moves selection by ten canvas pixels when Shift is held', async () => {
    selectArrow();

    await pressKey(editor, 'ArrowDown', true);

    const step = Coordinates.canvasToModel(new Vec2(0, 10));
    expect(arrow.startEndPosition[0].x).toBeCloseTo(startPosition.x);
    expect(arrow.startEndPosition[0].y).toBeCloseTo(startPosition.y + step.y);
  });

  it('records each press as its own undo step', async () => {
    selectArrow();

    await pressKey(editor, 'ArrowUp');
    await pressKey(editor, 'ArrowUp');
    expect(history.historyPointer).toBe(2);

    const step = Coordinates.canvasToModel(new Vec2(0, -1));
    history.undo();
    expect(arrow.startEndPosition[0].y).toBeCloseTo(startPosition.y + step.y);
    history.undo();
    expect(arrow.startEndPosition[0].y).toBeCloseTo(startPosition.y);

    history.redo();
    expect(arrow.startEndPosition[0].y).toBeCloseTo(startPosition.y + step.y);
  });

  it('does not add history or move anything without selection', async () => {
    await pressKey(editor, 'ArrowLeft');

    expect(history.historyPointer).toBe(0);
    expect(arrow.startEndPosition[0].x).toBeCloseTo(startPosition.x);
  });
});

describe('Arrow keys in sequence mode', () => {
  it('keeps arrow keys out of the macromolecule move handler', () => {
    const handlers = new SequenceMode().keyboardEventHandlers;

    expect(handlers).not.toHaveProperty('move-selection-by-arrow-keys');
    expect(handlers).toHaveProperty('move-caret-up');
  });
});
