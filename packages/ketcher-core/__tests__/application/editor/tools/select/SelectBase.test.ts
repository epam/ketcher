import { CoreEditor, EditorHistory, FlexMode } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { SelectBase } from 'application/editor/tools/select/SelectBase';
import { Peptide } from 'domain/entities/Peptide';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { Coordinates } from 'application/editor/shared/coordinates';
import { BaseMonomer, RxnArrowMode, Vec2 } from 'domain/entities';
import {
  MACROMOLECULES_BOND_TYPES,
  ToolName,
} from 'application/editor/tools/types';
import { AttachmentPointName } from 'domain/types';
import {
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../../mock-data';
import { notifyRenderComplete } from 'application/render/notifyRenderComplete';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../../helpers/dom';

class TestSelectRectangle extends SelectRectangle {
  public snap(event: MouseEvent, delta: Vec2) {
    return (
      this as unknown as {
        tryToSnap(event: MouseEvent, delta: Vec2): unknown;
      }
    ).tryToSnap(event, delta);
  }
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

describe('SelectBase event-local bond sorting', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let tool: TestSelectRectangle;
  let hub: Peptide;
  let leaves: Peptide[];
  let bonds: HydrogenBond[];

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: {},
      canvas,
      renderersContainer: createRenderersManager(),
    });
    editor.setMode(new FlexMode());
    tool = new TestSelectRectangle(editor);
    hub = new Peptide(peptideMonomerItem, new Vec2(0, 0));
    // Exact cardinal coordinates exercise stable sorting of equal lengths.
    const cardinal = [
      [1.5, 0],
      [0, 1.5],
      [-1.5, 0],
      [0, -1.5],
    ];
    leaves = Array.from({ length: 84 }, (_, index) => {
      const [x, y] = cardinal[index % 4];
      const scale = index < 4 ? 1 : 2 + index / 84;
      return new Peptide(peptideMonomerItem, new Vec2(x * scale, y * scale));
    });
    bonds = leaves.map((leaf, index) => {
      const bond =
        index % 2 ? new HydrogenBond(leaf, hub) : new HydrogenBond(hub, leaf);
      hub.hydrogenBonds.push(bond);
      leaf.hydrogenBonds.push(bond);
      return bond;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tool.destroy();
    editor.destroy();
    canvas.remove();
  });

  function select(monomer: Peptide) {
    jest
      .spyOn(editor.drawingEntitiesManager, 'selectedMonomers', 'get')
      .mockReturnValue([monomer]);
    jest
      .spyOn(
        editor.drawingEntitiesManager,
        'externalConnectionsToSelection',
        'get',
      )
      .mockReturnValue(
        monomer.hydrogenBonds.map((bond) => ({
          monomerFromSelection: monomer,
          monomerConnectedToSelection: bond.getAnotherMonomer(monomer)!,
          bond,
        })),
      );
  }

  it('sorts each visited monomer at most once per invocation', () => {
    select(hub);
    const sorts = [hub, ...leaves].map((monomer) =>
      jest.spyOn(monomer, 'bondsSortedByLength', 'get'),
    );
    tool.snap(new MouseEvent('mousemove'), new Vec2(0.02, 0.01));
    expect(sorts[0]).toHaveBeenCalledTimes(1);
    sorts.forEach((sort) =>
      expect(sort.mock.calls.length).toBeLessThanOrEqual(1),
    );
  });

  it('recomputes sorting on the next invocation after positions change', () => {
    select(hub);
    const sort = jest.spyOn(hub, 'polymerBondsSortedByLength', 'get');
    tool.snap(new MouseEvent('mousemove'), new Vec2(0, 0));
    expect(sort).toHaveBeenCalledTimes(1);
    expect(sort.mock.results[0].value.slice(0, 4)).toEqual(bonds.slice(0, 4));
    leaves[0].moveAbsolute(new Vec2(5, 0));
    tool.snap(new MouseEvent('mousemove'), new Vec2(0, 0));
    expect(sort).toHaveBeenCalledTimes(2);
    expect(sort.mock.results[1].value.slice(0, 3)).toEqual(bonds.slice(1, 4));
  });

  it.each(['hub', 'leaf'] as const)(
    'matches uncached snapping outputs and equal-length ordering for a %s',
    (selection) => {
      select(selection === 'hub' ? hub : leaves[0]);
      const original = SelectBase.calculateDistanceSnap;
      for (const delta of [
        new Vec2(0, 0),
        new Vec2(0.02, 0.01),
        new Vec2(0.2, -0.1),
        new Vec2(0.5, 0.2),
      ]) {
        const cached = tool.snap(new MouseEvent('mousemove'), delta);
        // Omit the event cache while running the same production calculations.
        const uncached = jest
          .spyOn(SelectBase, 'calculateDistanceSnap')
          .mockImplementation((position, initial, connected) =>
            original(position, initial, connected),
          );
        expect(tool.snap(new MouseEvent('mousemove'), delta)).toEqual(cached);
        uncached.mockRestore();
      }
      expect(hub.polymerBondsSortedByLength.slice(0, 4)).toEqual(
        bonds.slice(0, 4),
      );
    },
  );
});

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

describe('SelectBase batched drag rendering', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let tool: SelectRectangle;
  let monomer: BaseMonomer;
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;
  let originalBBox: PropertyDescriptor | undefined;
  let editorDestroyed: boolean;

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
    editorDestroyed = false;
    nextFrameId = 0;
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.set(++nextFrameId, callback);
        return nextFrameId;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });
    canvas = createPolymerEditorCanvas();
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
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      monomer.position,
    );
    tool.mousedown({
      target: { __data__: monomer.renderer },
    } as unknown as MouseEvent);
  });

  afterEach(() => {
    if (!editorDestroyed) editor.destroy();
    notifyRenderComplete.cancel();
    canvas.remove();
    jest.restoreAllMocks();
    if (originalBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', originalBBox);
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
  });

  function moveTo(x: number) {
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      new Vec2(x, 1),
    );
    tool.mousemove(new MouseEvent('mousemove', { ctrlKey: true }));
  }

  function runFrame() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  }

  it('updates the model between mousemoves and draws only the latest state once', () => {
    const draw = jest.spyOn(editor.renderersContainer, 'moveDrawingEntity');
    const overlays = jest.spyOn(editor.transientDrawingView, 'clear');
    const reinitialize = jest.spyOn(
      editor.renderersContainer,
      'reinitializeViewModel',
    );
    const postRender = jest.spyOn(
      editor.renderersContainer,
      'runPostRenderMethods',
    );
    moveTo(3.1);
    expect(monomer.position.x).toBeCloseTo(3.1);
    moveTo(3.2);
    expect(monomer.position.x).toBeCloseTo(3.2);
    expect(frames.size).toBe(1);
    expect(draw).not.toHaveBeenCalled();
    expect(overlays).not.toHaveBeenCalled();

    runFrame();
    expect(monomer.position.x).toBeCloseTo(3.2);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledWith(monomer);
    expect(overlays).toHaveBeenCalledTimes(1);
    expect(reinitialize).toHaveBeenCalledTimes(1);
    expect(postRender).toHaveBeenCalledTimes(1);
    const notify = jest.spyOn(window, 'dispatchEvent');
    notifyRenderComplete.flush();
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'renderComplete' }),
    );
  });

  it('updates hydrogen bond geometry immediately and retains only the latest snap overlay', () => {
    const manager = editor.drawingEntitiesManager;
    editor.renderersContainer.update(
      manager.addMonomer(peptideMonomerItem, new Vec2(1.5, 1)),
    );
    const connected = manager.monomersArray[1];
    editor.renderersContainer.update(
      manager.createPolymerBond(
        monomer,
        connected,
        AttachmentPointName.R1,
        AttachmentPointName.R1,
        MACROMOLECULES_BOND_TYPES.HYDROGEN,
      ),
    );
    editor.renderersContainer.update(manager.selectDrawingEntity(monomer));
    const bond = manager.polymerBondsArray[0];
    const drawBond = jest.spyOn(
      editor.renderersContainer,
      'redrawDrawingEntity',
    );
    const showSnap = jest.spyOn(editor.transientDrawingView, 'showBondSnap');
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      new Vec2(3.1, 1),
    );
    tool.mousemove(new MouseEvent('mousemove'));
    expect(monomer.position.x).toBeCloseTo(3);
    editor.lastCursorPositionOfCanvas = Coordinates.modelToCanvas(
      new Vec2(3.5, 1),
    );
    tool.mousemove(new MouseEvent('mousemove'));
    expect(monomer.position.x).toBeCloseTo(3.5);
    expect(bond.startPosition.x).toBeCloseTo(3.5);
    expect(drawBond).not.toHaveBeenCalled();
    expect(frames.size).toBe(1);
    runFrame();
    expect(drawBond).toHaveBeenCalledTimes(1);
    expect(drawBond).toHaveBeenCalledWith(bond);
    expect(showSnap).not.toHaveBeenCalled();
    expect(monomer.position.x).toBeCloseTo(3.5);
  });

  it('flushes on mouseup without moving twice and preserves Undo/Redo', () => {
    const draw = jest.spyOn(editor.renderersContainer, 'moveDrawingEntity');
    moveTo(3.1);
    moveTo(3.2);
    tool.mouseup(new MouseEvent('mouseup'));
    expect(frames.size).toBe(0);
    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(monomer.position.x).toBeCloseTo(3.2);
    const history = EditorHistory.getInstance(editor);
    expect(history.historyPointer).toBe(1);
    const flush = jest.spyOn(editor, 'flushPendingDragRender');
    history.undo();
    expect(monomer.position.x).toBeCloseTo(3);
    history.redo();
    expect(flush).toHaveBeenCalledTimes(2);
    expect(monomer.position.x).toBeCloseTo(3.2);
    runFrame();
    expect(monomer.position.x).toBeCloseTo(3.2);
  });

  it.each(['tool', 'editor', 'stop', 'blur', 'hidden'] as const)(
    'flushes and cancels pending rendering during %s cleanup',
    (cleanup) => {
      const draw = jest.spyOn(editor.renderersContainer, 'moveDrawingEntity');
      moveTo(3.2);
      if (cleanup === 'tool') {
        editor.selectTool(ToolName.selectRectangle);
      } else if (cleanup === 'editor') {
        editor.destroy();
        editorDestroyed = true;
      } else if (cleanup === 'blur') {
        window.dispatchEvent(new Event('blur'));
      } else if (cleanup === 'hidden') {
        jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
        document.dispatchEvent(new Event('visibilitychange'));
      } else {
        tool.stopMovement();
      }
      expect(frames.size).toBe(0);
      expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
      expect(draw).toHaveBeenCalledTimes(1);
      expect(monomer.position.x).toBeCloseTo(3.2);
      runFrame();
      expect(draw).toHaveBeenCalledTimes(1);
    },
  );
});
