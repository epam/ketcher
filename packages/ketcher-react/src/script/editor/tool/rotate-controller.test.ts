/* eslint-disable @typescript-eslint/ban-ts-comment */
import RotateTool from './rotate'
import RotateController from './rotate-controller'
import Editor from '../Editor'

describe('Rotate controller', () => {
  /**
   * Steps to check:
   * Select one atom/functional group using Select Tool
   */
  it(`hides for one visible atom`, () => {
    const paper = jest.fn()
    const controller = new RotateController({
      selection: () => null,
      render: {
        paper
      }
    } as any)

    const visibleAtoms = [0]
    // @ts-ignore
    controller.show(visibleAtoms)

    expect(visibleAtoms.length).toBe(1)
    expect(paper).toBeCalledTimes(0)
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
    controller.show(visibleAtoms)

    expect(visibleAtoms.length).toBeGreaterThan(1)
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
})
