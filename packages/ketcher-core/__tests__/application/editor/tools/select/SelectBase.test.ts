import { CoreEditor, EditorHistory } from 'application/editor';
import { SelectRectangle } from 'application/editor/tools/select';
import { Coordinates } from 'application/editor/shared/coordinates';
import {
  Atom,
  Bond,
  RxnArrowMode,
  SGroup,
  SGroupBracketType,
  Struct,
  Vec2,
} from 'domain/entities';
import type { DrawingEntity } from 'domain/entities/DrawingEntity';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
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

  public exposedStartRotation(event: MouseEvent) {
    this.startRotation(event);
  }
}

function createMacroBracketFixture(editor: CoreEditor) {
  const struct = new Struct();
  const firstAtom = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtom = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  struct.bonds.add(new Bond({ begin: firstAtom, end: secondAtom, type: 1 }));
  const group = new SGroup(SGroup.TYPES.MUL);
  group.id = struct.sgroups.add(group);
  struct.atomAddToSGroup(group.id, firstAtom);
  struct.atomAddToSGroup(group.id, secondAtom);
  const brackets = {
    opening: {
      type: SGroupBracketType.Round,
      position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
    },
    closing: {
      type: SGroupBracketType.Round,
      position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
    },
  };
  group.data.brackets = brackets;
  struct.markFragments();
  const { modelChanges } =
    MacromoleculesConverter.convertStructToDrawingEntities(
      struct,
      editor.drawingEntitiesManager,
    );
  editor.renderersContainer.update(modelChanges);
  return {
    brackets,
    group: [...editor.drawingEntitiesManager.sgroups.values()][0].sgroup,
    atoms: [...editor.drawingEntitiesManager.atoms.values()],
  };
}

describe('SelectBase mouseup', () => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  let canvas: SVGSVGElement;
  let editor: CoreEditor;
  let history: EditorHistory;
  let selectTool: TestSelectRectangle;

  beforeEach(() => {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    });
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
    jest.restoreAllMocks();
    history.destroy();
    editor.destroy();
    canvas.remove();
    if (originalGetBBox) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', {
        configurable: true,
        value: originalGetBBox,
      });
    } else {
      Reflect.deleteProperty(SVGElement.prototype, 'getBBox');
    }
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

  it('keeps S-group overlays beneath member atoms after redraws', () => {
    const { atoms } = createMacroBracketFixture(editor);
    const assertLayerOrder = () => {
      const drawnStructures = canvas.querySelector('.drawn-structures');
      if (!drawnStructures) {
        throw new Error('Expected the drawn structures canvas');
      }
      const children = [...drawnStructures.children];
      const groupIndex = children.findIndex(
        (element) => element.getAttribute('data-testid') === 's-group',
      );
      const atomIndices = children.flatMap((element, index) =>
        element.getAttribute('data-testid') === 'atom' ? [index] : [],
      );
      expect(groupIndex).toBeGreaterThanOrEqual(0);
      expect(atomIndices).toHaveLength(2);
      atomIndices.forEach((index) => expect(index).toBeGreaterThan(groupIndex));
    };

    assertLayerOrder();
    editor.renderersContainer.rerenderSGroups();
    assertLayerOrder();
    editor.renderersContainer.redrawDrawingEntity(atoms[0]);
    assertLayerOrder();
  });

  it('restores bracket positions after undoing an interactive atom drag', () => {
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms[0].turnOnSelection();
    selectTool.setMovementState(new Vec2(0, 0), new Vec2(0, 0));
    editor.lastCursorPositionOfCanvas = new Vec2(50, 0);

    selectTool.mousemove(new MouseEvent('mousemove'));
    expect(group.data.brackets?.opening.position).toBeUndefined();
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });
    selectTool.mouseup(mouseUpEvent);
    history.undo();
    expect(group.data.brackets).toEqual(brackets);
    history.redo();
    expect(group.data.brackets?.closing.position).toBeUndefined();
  });

  it('records a drag when mouseup occurs before its animation frame', () => {
    const callbacks: FrameRequestCallback[] = [];
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callbacks.push(callback);
        return callbacks.length;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms[0].turnOnSelection();
    const initialPosition = new Vec2(atoms[0].position);
    selectTool.setMovementState(new Vec2(0, 0), new Vec2(0, 0));
    editor.lastCursorPositionOfCanvas = new Vec2(50, 0);

    selectTool.mousemove(new MouseEvent('mousemove'));
    const mouseUpEvent = new MouseEvent('mouseup');
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });
    selectTool.mouseup(mouseUpEvent);
    const movedPosition = new Vec2(atoms[0].position);
    callbacks.forEach((callback) => callback(0));

    expect(movedPosition).not.toEqual(initialPosition);
    expect(atoms[0].position).toEqual(movedPosition);
    expect(group.data.brackets?.opening.position).toBeUndefined();
    expect(history.historyPointer).toBe(1);
    history.undo();
    expect(atoms[0].position).toEqual(initialPosition);
    expect(group.data.brackets).toEqual(brackets);
    history.redo();
    expect(atoms[0].position).toEqual(movedPosition);
    expect(group.data.brackets?.closing.position).toBeUndefined();
  });

  it('restores positions when queued drag updates return to the start', () => {
    const callbacks: FrameRequestCallback[] = [];
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callbacks.push(callback);
        return callbacks.length;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms[0].turnOnSelection();
    const initialPosition = new Vec2(atoms[0].position);
    selectTool.setMovementState(new Vec2(0, 0), new Vec2(0, 0));
    editor.lastCursorPositionOfCanvas = new Vec2(50, 0);
    selectTool.mousemove(new MouseEvent('mousemove'));
    editor.lastCursorPositionOfCanvas = new Vec2(0, 0);
    selectTool.mousemove(new MouseEvent('mousemove'));
    const mouseUpEvent = new MouseEvent('mouseup');
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });

    selectTool.mouseup(mouseUpEvent);
    callbacks.forEach((callback) => callback(0));
    expect(atoms[0].position).toEqual(initialPosition);
    expect(group.data.brackets).toEqual(brackets);
    expect(history.historyPointer).toBe(0);
  });

  it.each(['stopMovement', 'destroy'] as const)(
    'records a queued drag when %s interrupts the gesture',
    (interrupt) => {
      const callbacks: FrameRequestCallback[] = [];
      jest
        .spyOn(globalThis, 'cancelAnimationFrame')
        .mockImplementation(() => {});
      jest
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation((callback) => {
          callbacks.push(callback);
          return callbacks.length;
        });
      const { group, atoms, brackets } = createMacroBracketFixture(editor);
      atoms[0].turnOnSelection();
      const initialPosition = new Vec2(atoms[0].position);
      selectTool.setMovementState(new Vec2(0, 0), new Vec2(0, 0));
      editor.lastCursorPositionOfCanvas = new Vec2(50, 0);
      selectTool.mousemove(new MouseEvent('mousemove'));

      selectTool[interrupt]();
      const movedPosition = new Vec2(atoms[0].position);
      callbacks.forEach((callback) => callback(0));
      expect(movedPosition).not.toEqual(initialPosition);
      expect(atoms[0].position).toEqual(movedPosition);
      expect(group.data.brackets?.opening.position).toBeUndefined();
      expect(history.historyPointer).toBe(1);
      history.undo();
      expect(atoms[0].position).toEqual(initialPosition);
      expect(group.data.brackets).toEqual(brackets);
      history.redo();
      expect(atoms[0].position).toEqual(movedPosition);
      expect(group.data.brackets?.closing.position).toBeUndefined();
    },
  );

  it('restores bracket positions after an atom drag returns to its start', () => {
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms[0].turnOnSelection();
    selectTool.setMovementState(new Vec2(0, 0), new Vec2(0, 0));
    editor.lastCursorPositionOfCanvas = new Vec2(50, 0);
    selectTool.mousemove(new MouseEvent('mousemove'));
    editor.lastCursorPositionOfCanvas = new Vec2(0, 0);
    selectTool.mousemove(new MouseEvent('mousemove'));
    const mouseUpEvent = new MouseEvent('mouseup');
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });

    selectTool.mouseup(mouseUpEvent);
    expect(group.data.brackets).toEqual(brackets);
    expect(history.historyPointer).toBe(0);
  });

  it('restores bracket positions after undoing an interactive rotation', () => {
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms.forEach((atom) => atom.turnOnSelection());
    const center = editor.drawingEntitiesManager.getSelectedEntitiesCenter();
    if (!center) {
      throw new Error('Expected a rotation center for the selected atoms');
    }
    const canvasCenter = Coordinates.modelToCanvas(center);
    editor.lastCursorPositionOfCanvas = Vec2.sum(
      canvasCenter,
      new Vec2(100, 0),
    );
    selectTool.exposedStartRotation(new MouseEvent('mousedown'));
    editor.lastCursorPositionOfCanvas = Vec2.sum(
      canvasCenter,
      new Vec2(0, 100),
    );

    selectTool.mousemove(new MouseEvent('mousemove'));
    expect(group.data.brackets?.opening.position).toBeUndefined();
    const mouseUpEvent = new MouseEvent('mouseup');
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });
    selectTool.mouseup(mouseUpEvent);
    history.undo();
    expect(group.data.brackets).toEqual(brackets);
    history.redo();
    expect(group.data.brackets?.closing.position).toBeUndefined();
  });

  it('records queued rotation frames in order before mouseup', () => {
    const callbacks: FrameRequestCallback[] = [];
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
    jest
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callbacks.push(callback);
        return callbacks.length;
      });
    const { group, atoms, brackets } = createMacroBracketFixture(editor);
    atoms.forEach((atom) => atom.turnOnSelection());
    const initialPositions = atoms.map((atom) => new Vec2(atom.position));
    const center = editor.drawingEntitiesManager.getSelectedEntitiesCenter();
    if (!center) {
      throw new Error('Expected a rotation center for the selected atoms');
    }
    const canvasCenter = Coordinates.modelToCanvas(center);
    editor.lastCursorPositionOfCanvas = Vec2.sum(
      canvasCenter,
      new Vec2(100, 0),
    );
    selectTool.exposedStartRotation(new MouseEvent('mousedown'));
    editor.lastCursorPositionOfCanvas = Vec2.sum(
      canvasCenter,
      new Vec2(100, 100),
    );
    selectTool.mousemove(new MouseEvent('mousemove'));
    editor.lastCursorPositionOfCanvas = Vec2.sum(
      canvasCenter,
      new Vec2(0, 100),
    );
    selectTool.mousemove(new MouseEvent('mousemove'));
    const mouseUpEvent = new MouseEvent('mouseup');
    Object.defineProperty(mouseUpEvent, 'target', { value: editor.canvas });

    selectTool.mouseup(mouseUpEvent);
    const rotatedPositions = atoms.map((atom) => new Vec2(atom.position));
    callbacks.forEach((callback) => callback(0));
    atoms.forEach((atom, index) => {
      const expected = initialPositions[index].rotateAroundOrigin(90, center);
      expect(atom.position.x).toBeCloseTo(expected.x, 3);
      expect(atom.position.y).toBeCloseTo(expected.y, 3);
    });
    expect(group.data.brackets?.opening.position).toBeUndefined();
    expect(history.historyPointer).toBe(1);
    history.undo();
    atoms.forEach((atom, index) => {
      expect(atom.position.x).toBeCloseTo(initialPositions[index].x, 3);
      expect(atom.position.y).toBeCloseTo(initialPositions[index].y, 3);
    });
    expect(group.data.brackets).toEqual(brackets);
    history.redo();
    atoms.forEach((atom, index) => {
      expect(atom.position.x).toBeCloseTo(rotatedPositions[index].x, 3);
      expect(atom.position.y).toBeCloseTo(rotatedPositions[index].y, 3);
    });
    expect(group.data.brackets?.closing.position).toBeUndefined();
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
