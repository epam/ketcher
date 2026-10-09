import { CoreEditor, EditorHistory, FlexMode } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import { ToolName } from 'application/editor/tools/types';
import { BaseMonomer, RxnArrowMode, Vec2 } from 'domain/entities';
import { notifyRenderComplete } from 'application/render/notifyRenderComplete';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

describe('SelectBase drag lifecycle integration', () => {
  let editor: CoreEditor;
  let canvas: SVGSVGElement;
  let tool: SelectRectangle;
  let monomer: BaseMonomer;
  let frames: Map<number, FrameRequestCallback>;
  let originalBBox: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalBBox = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      'getBBox',
    );
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    });
    frames = new Map();
    let frameId = 0;
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.set(++frameId, callback);
        return frameId;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });
    canvas = createPolymerEditorCanvas();
    Object.defineProperty(canvas, 'width', {
      value: { baseVal: { value: 1000 } },
      configurable: true,
    });
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
    });
    editor.setMode(new FlexMode());
    editor.selectTool(ToolName.selectRectangle);
    tool = editor.selectedTool as SelectRectangle;
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.addMonomer(
        peptideMonomerItem,
        new Vec2(3, 1),
      ),
    );
    monomer = editor.drawingEntitiesManager.monomersArray[0];
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.selectDrawingEntity(monomer),
    );
  });

  afterEach(() => {
    editor.destroy();
    notifyRenderComplete.cancel();
    canvas.remove();
    jest.restoreAllMocks();
    if (originalBBox)
      Object.defineProperty(SVGElement.prototype, 'getBBox', originalBBox);
    else Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
  });

  function startDrag() {
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      monomer.position,
    );
    tool.mousedown({
      target: { __data__: monomer.renderer },
    } as unknown as MouseEvent);
  }

  function moveTo(x: number) {
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      new Vec2(x, 1),
    );
    tool.mousemove(new MouseEvent('mousemove', { ctrlKey: true }));
  }

  function runFrames() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  }

  it('moves a mixed monomer and reaction arrow selection once and preserves Undo/Redo', () => {
    const manager = editor.drawingEntitiesManager;
    editor.renderersContainer.update(
      manager.addRxnArrow(RxnArrowMode.OpenAngle, [
        new Vec2(5, 1),
        new Vec2(7, 1),
      ]),
    );
    const arrow = [...manager.rxnArrows.values()][0];
    editor.renderersContainer.update(
      manager.selectDrawingEntities([monomer, arrow]),
    );
    const initial = new Vec2(arrow.startPosition);
    startDrag();
    moveTo(3.1);
    moveTo(3.2);
    expect(monomer.position.x).toBeCloseTo(3.2);
    expect(arrow.startPosition.x).toBeCloseTo(initial.x + 0.2);
    expect(frames.size).toBe(1);
    tool.mouseup(new MouseEvent('mouseup'));
    expect(frames.size).toBe(0);
    EditorHistory.getInstance(editor).undo();
    expect(monomer.position.x).toBeCloseTo(3);
    expect(arrow.startPosition.x).toBeCloseTo(initial.x);
    EditorHistory.getInstance(editor).redo();
    expect(monomer.position.x).toBeCloseTo(3.2);
    expect(arrow.startPosition.x).toBeCloseTo(initial.x + 0.2);
  });

  it('flushes before Undo of an earlier command during an active drag', () => {
    const history = EditorHistory.getInstance(editor);
    const previousMovement =
      editor.drawingEntitiesManager.moveSelectedDrawingEntities(
        new Vec2(0.1, 0),
        new Vec2(0.1, 0),
      );
    editor.renderersContainer.update(previousMovement);
    history.update(previousMovement);
    startDrag();
    moveTo(3.3);
    const draw = jest.spyOn(
      editor.renderersContainer,
      'renderAppliedDragMovement',
    );
    history.undo();
    expect(draw).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    tool.mouseup(new MouseEvent('mouseup'));
    runFrames();
    expect(draw).toHaveBeenCalledTimes(1);
    expect(monomer.position.x).toBeCloseTo(3.2);
    expect(history.historyPointer).toBe(0);
  });

  it('does not leave a stale callback after a real layout mode change', () => {
    startDrag();
    moveTo(3.2);
    editor.events.selectMode.dispatch('snake-layout-mode');
    const afterMode = new Vec2(monomer.position);
    runFrames();
    expect(monomer.position).toEqual(afterMode);
    tool.mouseup(new MouseEvent('mouseup'));
    expect(frames.size).toBe(0);
  });

  it.each(['before Undo', 'after mouseup'] as const)(
    'retains the same unrecorded active-drag offset with a frame %s',
    (frameTiming) => {
      const history = EditorHistory.getInstance(editor);
      const command = editor.drawingEntitiesManager.moveSelectedDrawingEntities(
        new Vec2(0.1, 0),
        new Vec2(0.1, 0),
      );
      editor.renderersContainer.update(command);
      history.update(command);
      expect(monomer.position).toEqual(new Vec2(3.1, 1));
      startDrag();
      moveTo(3.3);
      if (frameTiming === 'before Undo') runFrames();
      history.undo();
      tool.mouseup(new MouseEvent('mouseup'));
      runFrames();

      expect(monomer.position.x).toBeCloseTo(3.2);
      expect(monomer.position.y).toBe(1);
      expect(monomer.selected).toBe(false);
      expect(editor.drawingEntitiesManager.selectedEntitiesArr).toEqual([]);
      expect(history.historyPointer).toBe(0);
      expect(history.historyStack).toEqual([command]);
      expect(history.historyStack[0]).toBe(command);
      // The only entry is the earlier 0.1 movement. The 0.2 drag offset
      // survives both directions because release after Undo has no selection.
      history.redo();
      expect(monomer.position.x).toBeCloseTo(3.3);
      expect(history.historyPointer).toBe(1);
      expect(history.historyStack).toEqual([command]);
      history.undo();
      expect(monomer.position.x).toBeCloseTo(3.2);
      expect(history.historyPointer).toBe(0);
      expect(editor.drawingEntitiesManager.selectedEntitiesArr).toEqual([]);
      expect(history.historyStack).toEqual([command]);
    },
  );

  it('flushes and cancels when changing from selection to the hand tool', () => {
    startDrag();
    moveTo(3.2);
    const draw = jest.spyOn(
      editor.renderersContainer,
      'renderAppliedDragMovement',
    );
    editor.selectTool(ToolName.hand);
    expect(editor.isHandToolSelected).toBe(true);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    expect(monomer.position.x).toBeCloseTo(3.2);
    runFrames();
    expect(draw).toHaveBeenCalledTimes(1);
  });
});
