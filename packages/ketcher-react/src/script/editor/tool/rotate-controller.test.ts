/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Vec2 } from 'ketcher-core'
import Editor from '../Editor'
import RotateTool from './rotate'
import SelectTool from './select'
import RotateController, { getDifference } from './rotate-controller'

describe('Rotate controller', () => {
  /**
   * Steps to check:
   * Select one atom / functional group using Select Tool
   */
  it(`hides for only one visible atom`, () => {
    const tool = () => new SelectTool(undefined, undefined)
    const paper = jest.fn()
    const selection = () => null
    const controller = new RotateController({
      selection,
      tool,
      render: { paper }
    } as any)
    let visibleAtoms = [1]
    // @ts-ignore
    controller.rotateTool.getCenter = () => [new Vec2(), visibleAtoms]
    expect(visibleAtoms.length).toBe(1)
    expect(tool()).toBeInstanceOf(SelectTool)
    expect(selection()).toBe(null)

    controller.rerender()

    expect(paper).toBeCalledTimes(0)

    visibleAtoms = [1, 2]
    // @ts-ignore
    controller.rotateTool.getCenter = () => [new Vec2(), visibleAtoms]

    expect(controller.rerender).toThrow()
  })

  /**
   * Steps to check:
   * Select one text / rxnPlus / rxnArrow using Select Tool
   */
  it(`hides for only one text / rxnPlus, but shows for one rnxArrow`, () => {
    const tool = () => new SelectTool(undefined, undefined)
    const paper = jest.fn()
    let selection = () => ({
      texts: [1],
      rxnPlus: [] as Array<any>,
      rxnArrow: [] as Array<any>
    })
    const controller = new RotateController({
      selection,
      tool,
      render: { paper }
    } as any)
    // @ts-ignore
    controller.rotateTool.getCenter = () => [new Vec2(), []]
    expect(tool()).toBeInstanceOf(SelectTool)

    controller.rerender()

    expect(paper).toBeCalledTimes(0)

    selection = () => ({ texts: [], rxnPlus: [1], rxnArrow: [] })
    // @ts-ignore
    controller.rotateTool.getCenter = () => [new Vec2(), []]

    controller.rerender()

    expect(paper).toBeCalledTimes(0)

    selection = () => ({ texts: [1], rxnPlus: [1], rxnArrow: [] })

    expect(controller.rerender).toThrow()

    selection = () => ({ texts: [], rxnPlus: [], rxnArrow: [1] })

    expect(controller.rerender).toThrow()
  })

  /**
   * Steps to check:
   * 1. Select at least two atoms (then controller shows)
   * 2. click Rotate Tool
   */
  it('hides when active tool is not SelectTool', () => {
    const editor = new Editor(document, {})
    const NonSelectTool = new RotateTool(editor, undefined)
    const paper = jest.fn()
    const controller = new RotateController({
      selection: () => null,
      tool: () => NonSelectTool,
      render: { paper }
    } as any)
    const visibleAtoms = [0, 1]
    // @ts-ignore
    controller.rotateTool.getCenter = () => [new Vec2(), visibleAtoms]
    expect(visibleAtoms.length).toBeGreaterThan(1)

    controller.rerender()

    expect(paper).toBeCalledTimes(0)
  })

  /**
   * Steps to check:
   * Click `zoom in` or press `Ctrl+=`
   */
  it('rerenders while zooming', () => {
    const editor = new Editor(document, {})
    editor.rotateController.rerender = jest.fn()

    editor.zoom(2)

    expect(editor.rotateController.rerender).toBeCalledTimes(1)
  })

  /**
   * Steps to check:
   * Drag handle by right mouse button
   */
  it('can be only dragged by left mouse button', () => {
    const controller = new RotateController({ selection: () => null } as any)
    const changeCrossColor = jest.fn()
    // @ts-ignore
    controller.cross = {
      attr: changeCrossColor
    }

    // @ts-ignore
    controller.dragStart({
      buttons: 2, // Right button
      stopPropagation: () => null
    })

    expect(changeCrossColor).toBeCalledTimes(0)
  })

  /**
   * Steps to check:
   * Select and move a big structure to edge of canvas,
   * then rotate it by the handle, see if center position is correct
   */
  test('center changes with `scale` and `offset`', () => {
    const controller = new RotateController({ selection: () => null } as any)
    // @ts-ignore
    controller.originalCenter = new Vec2(1, 1)
    // @ts-ignore
    controller.editor.render = {
      options: {
        scale: 2,
        offset: new Vec2(1, 1)
      }
    }

    // @ts-ignore
    expect(controller.center.x).toBe(3)
    // @ts-ignore
    expect(controller.center.y).toBe(3)
  })

  it('shows half predefined degrees', () => {
    let structRotateDegree = 180
    let predefinedDegree1 = 90
    let predefinedDegree2 = -90
    let predefinedDegree3 = 89
    let predefinedDegree4 = -89
    expect(
      getDifference(predefinedDegree1, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree2, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree3, structRotateDegree)
    ).toBeGreaterThan(90)
    expect(
      getDifference(predefinedDegree4, structRotateDegree)
    ).toBeGreaterThan(90)

    structRotateDegree = 135
    predefinedDegree1 = 45
    predefinedDegree2 = -135
    predefinedDegree3 = 44
    predefinedDegree4 = -134
    expect(
      getDifference(predefinedDegree1, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree2, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree3, structRotateDegree)
    ).toBeGreaterThan(90)
    expect(
      getDifference(predefinedDegree4, structRotateDegree)
    ).toBeGreaterThan(90)

    structRotateDegree = -135
    predefinedDegree1 = -45
    predefinedDegree2 = 135
    predefinedDegree3 = -44
    predefinedDegree4 = 134
    expect(
      getDifference(predefinedDegree1, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree2, structRotateDegree)
    ).toBeLessThanOrEqual(90)
    expect(
      getDifference(predefinedDegree3, structRotateDegree)
    ).toBeGreaterThan(90)
    expect(
      getDifference(predefinedDegree4, structRotateDegree)
    ).toBeGreaterThan(90)
  })
})
