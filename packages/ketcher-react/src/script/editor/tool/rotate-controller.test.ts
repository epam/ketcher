/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Vec2 } from 'ketcher-core';
import Editor from '../Editor';
import RotateTool from './rotate';
import SelectTool from './select';
import RotateController, { getDifference } from './rotate-controller';

describe('Rotate controller', () => {
  /**
   * Steps to check manually:
   * Select one atom / functional group using Select Tool
   */
  it(`hides for only one visible atom`, () => {
    // @ts-ignore
    const tool = () => new SelectTool();
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
    const controller = new RotateController(editor as any);
    // @ts-ignore
    controller.rotateTool.getCenter = () => new Vec2();
    expect(tool()).toBeInstanceOf(SelectTool);
    expect(selection()).toBe(null);

    // @ts-ignore
    controller.show();
    expect(paper).toBeCalledTimes(0);

    visibleAtoms.push(2);
    // @ts-ignore
    controller.rotateTool.getCenter = () => new Vec2();
    expect(() => {
      // @ts-ignore
      controller.show();
    }).toThrow();
  });

  /**
   * Steps to check manually:
   * 1. Select at least two atoms (then controller shows)
   * 2. click Rotate Tool
   */
  it('hides when active tool is not SelectTool', () => {
    const editor = new Editor(document, {});
    const NonSelectTool = new RotateTool(editor, undefined);
    const paper = jest.fn();
    const visibleAtoms = [0, 1];
    const controller = new RotateController({
      selection: () => null,
      tool: () => NonSelectTool,
      render: {
        paper,
        ctab: {
          // @ts-ignore
          molecule: {
            getSelectedVisibleAtoms: () => visibleAtoms,
          },
        },
      },
    } as any);
    // @ts-ignore
    controller.rotateTool.getCenter = () => new Vec2();
    expect(visibleAtoms.length).toBeGreaterThan(1);

    // @ts-ignore
    controller.show();

    expect(paper).toBeCalledTimes(0);
  });

  /**
   * Steps to check manually:
   * Click `zoom in` or press `Ctrl+=`
   */
  it('rerenders while zooming', () => {
    const editor = new Editor(document, {});
    editor.rotateController.rerender = jest.fn();

    editor.zoom(2);

    expect(editor.rotateController.rerender).toBeCalledTimes(1);
  });

  /**
   * Steps to check manually:
   * Drag handle by right mouse button
   */
  it('can be only dragged by left mouse button', () => {
    const controller = new RotateController({ selection: () => null } as any);
    const changeCrossColor = jest.fn();
    // @ts-ignore
    controller.cross = {
      attr: changeCrossColor,
    };

    // @ts-ignore
    controller.dragStart({
      buttons: 2, // Right button
      stopPropagation: () => null,
    });

    expect(changeCrossColor).toBeCalledTimes(0);
  });

  /**
   * Steps to check manually:
   * Select and move a big structure to edge of canvas,
   * then rotate it by the handle, see if center position is correct
   */
  test('center changes with `scale` and `offset`', () => {
    const controller = new RotateController({ selection: () => null } as any);
    // @ts-ignore
    controller.originalCenter = new Vec2(1, 1);
    // @ts-ignore
    controller.editor.render = {
      options: {
        scale: 2,
        offset: new Vec2(1, 1),
      },
    } as any;

    // @ts-ignore
    expect(controller.center.x).toBe(3);
    // @ts-ignore
    expect(controller.center.y).toBe(3);
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
    const editor = new Editor(document, {});
    editor.render.ctab.molecule.getSelectedVisibleAtoms = () => [];
    // @ts-ignore
    editor.rotateController.rotateTool.dragCtx = {
      action: { operations: [], perform: () => undefined },
    };
    editor.rotateController.isRotating = true;
    const updateRender = jest.spyOn(editor.render, 'update');

    editor.rotateController.revert();
    const selectTool = new SelectTool(editor, 'rectangle');
    selectTool.mouseup(new MouseEvent('mouseup'));

    expect(updateRender).toBeCalled();
    expect(selectTool.isMousedDown).toBe(false);

    expect(editor.historyStack).toHaveLength(0);
  });
});
