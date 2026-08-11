import { Vec2 } from 'ketcher-core';
import Editor from '../Editor';
import RotateTool from './rotate';
import SelectTool from './select/select';
import RotateController, { getDifference } from './rotate-controller';

type MockRenderOptions = {
  microModeScale: number;
  offset: Vec2;
};

type MockPaper = {
  path: jest.Mock;
  circle: jest.Mock;
  set: jest.Mock;
};

type MockRender = {
  options: MockRenderOptions;
  paper?: MockPaper;
};

type PrivateRotateController = {
  rotateTool: {
    getCenter: () => Vec2 | undefined;
    dragCtx: {
      action: { operations: unknown[]; perform: () => void };
    };
  };
  originalCenter: Vec2;
  editor: { render: MockRender };
  center: Vec2;
  cross: { attr: () => void };
  show: () => void;
  dragStart: (event: { buttons: number; stopPropagation: () => void }) => void;
  drawCross: () => void;
};

function asPrivate(controller: RotateController): PrivateRotateController {
  return controller as unknown as PrivateRotateController;
}

describe('Rotate controller', () => {
  beforeAll(() => {
    global.window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
  });

  /**
   * Steps to check manually:
   * Select one atom / functional group using Select Tool
   */
  it(`hides for only one visible atom`, () => {
    const tool = () =>
      new SelectTool(undefined as unknown as Editor, 'rectangle');
    const paper = jest.fn();
    const selection = () => null;
    const visibleAtoms = [1];
    const editor = {
      selection,
      tool,
      render: {
        paper,
        ctab: {
          molecule: {
            getSelectedVisibleAtoms: () => visibleAtoms,
          },
        },
      },
    };
    const controller = new RotateController(editor as unknown as Editor);
    asPrivate(controller).rotateTool.getCenter = () => new Vec2();
    expect(tool()).toBeInstanceOf(SelectTool);
    expect(selection()).toBe(null);

    asPrivate(controller).show();
    expect(paper).toHaveBeenCalledTimes(0);

    visibleAtoms.push(2);
    asPrivate(controller).rotateTool.getCenter = () => new Vec2();
    expect(() => {
      asPrivate(controller).show();
    }).toThrow();
  });

  /**
   * Steps to check manually:
   * 1. Select at least two atoms (then controller shows)
   * 2. click Rotate Tool
   */
  it('hides when active tool is not SelectTool', () => {
    const ketcherId = '1';
    const editor = new Editor(
      ketcherId,
      document as unknown as HTMLElement,
      {},
      {},
    );
    const NonSelectTool = new RotateTool(editor, undefined);
    const paper = jest.fn();
    const visibleAtoms = [0, 1];
    const controller = new RotateController({
      selection: () => null,
      tool: () => NonSelectTool,
      render: {
        paper,
        ctab: {
          molecule: {
            getSelectedVisibleAtoms: () => visibleAtoms,
          },
        },
      },
    } as unknown as Editor);
    asPrivate(controller).rotateTool.getCenter = () => new Vec2();
    expect(visibleAtoms.length).toBeGreaterThan(1);

    asPrivate(controller).show();

    expect(paper).toHaveBeenCalledTimes(0);
  });

  /**
   * Steps to check manually:
   * Click `zoom in` or press `Ctrl+=`
   */
  it('rerenders while zooming', () => {
    const ketcherId = '1';
    const editor = new Editor(
      ketcherId,
      document as unknown as HTMLElement,
      {},
      {},
    );
    editor.rotateController.rerender = jest.fn();

    editor.zoom(2);

    expect(editor.rotateController.rerender).toHaveBeenCalledTimes(1);
  });

  /**
   * Steps to check manually:
   * Drag handle by right mouse button
   */
  it('can be only dragged by left mouse button', () => {
    const controller = new RotateController(
      { selection: () => null } as unknown as Editor,
    );
    const changeCrossColor = jest.fn();
    asPrivate(controller).cross = {
      attr: changeCrossColor,
    };

    asPrivate(controller).dragStart({
      buttons: 2, // Right button
      stopPropagation: () => null,
    });

    expect(changeCrossColor).toHaveBeenCalledTimes(0);
  });

  /**
   * Steps to check manually:
   * Select and move a big structure to edge of canvas,
   * then rotate it by the handle, see if center position is correct
   */
  test('center changes with `scale` and `offset`', () => {
    const controller = new RotateController(
      { selection: () => null } as unknown as Editor,
    );
    asPrivate(controller).originalCenter = new Vec2(1, 1);
    asPrivate(controller).editor.render = {
      options: {
        microModeScale: 2,
        offset: new Vec2(1, 1),
      },
    };

    expect(asPrivate(controller).center.x).toBe(3);
    expect(asPrivate(controller).center.y).toBe(3);
  });

  it('adds test id to rotation center handle hitbox', () => {
    const setAttribute = jest.fn();
    const cross = {
      attr: jest.fn().mockReturnThis(),
    };
    const circle = {
      attr: jest.fn().mockReturnThis(),
      node: { setAttribute },
    };
    const crossSet = {
      push: jest.fn(),
      translate: jest.fn(),
    };

    const controller = new RotateController(
      { selection: () => null } as unknown as Editor,
    );
    asPrivate(controller).originalCenter = new Vec2(1, 1);
    asPrivate(controller).editor.render = {
      paper: {
        path: jest.fn().mockReturnValue(cross),
        circle: jest.fn().mockReturnValue(circle),
        set: jest.fn().mockReturnValue(crossSet),
      },
      options: {
        microModeScale: 1,
        offset: new Vec2(),
      },
    };

    asPrivate(controller).drawCross();

    expect(setAttribute).toHaveBeenCalledWith(
      'data-testid',
      'rotation-center-handle',
    );
    expect(crossSet.push).toHaveBeenCalledWith(cross, circle);
  });

  it('shows half predefined degrees', () => {
    let structRotateDegree = 180;
    let predefinedDegree1 = 90;
    let predefinedDegree2 = -90;
    let predefinedDegree3 = 89;
    let predefinedDegree4 = -89;
    expect(
      getDifference(predefinedDegree1, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree2, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree3, structRotateDegree),
    ).toBeGreaterThan(90);
    expect(
      getDifference(predefinedDegree4, structRotateDegree),
    ).toBeGreaterThan(90);

    structRotateDegree = 135;
    predefinedDegree1 = 45;
    predefinedDegree2 = -135;
    predefinedDegree3 = 44;
    predefinedDegree4 = -134;
    expect(
      getDifference(predefinedDegree1, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree2, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree3, structRotateDegree),
    ).toBeGreaterThan(90);
    expect(
      getDifference(predefinedDegree4, structRotateDegree),
    ).toBeGreaterThan(90);

    structRotateDegree = -135;
    predefinedDegree1 = -45;
    predefinedDegree2 = 135;
    predefinedDegree3 = -44;
    predefinedDegree4 = 134;
    expect(
      getDifference(predefinedDegree1, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree2, structRotateDegree),
    ).toBeLessThanOrEqual(90);
    expect(
      getDifference(predefinedDegree3, structRotateDegree),
    ).toBeGreaterThan(90);
    expect(
      getDifference(predefinedDegree4, structRotateDegree),
    ).toBeGreaterThan(90);
  });

  /**
   * Steps to check manually:
   * 1. Press 'Escape' while rotating
   * 2. Undo
   */
  it(`cancels rotation without modifying history stack`, () => {
    const ketcherId = '1';
    const editor = new Editor(
      ketcherId,
      document as unknown as HTMLElement,
      {},
      {},
    );
    editor.render.ctab.molecule.getSelectedVisibleAtoms = () => [];
    (editor.rotateController as unknown as PrivateRotateController).rotateTool.dragCtx = {
      action: { operations: [], perform: () => undefined },
    };
    editor.rotateController.isRotating = true;
    const updateRender = jest.spyOn(editor.render, 'update');

    editor.rotateController.revert();
    const selectTool = new SelectTool(editor, 'rectangle');
    selectTool.mouseup(new PointerEvent('mouseup'));

    expect(updateRender).toHaveBeenCalled();
    expect(selectTool.isMouseDown).toBe(false);

    expect(editor.historyStack).toHaveLength(0);
  });
});
