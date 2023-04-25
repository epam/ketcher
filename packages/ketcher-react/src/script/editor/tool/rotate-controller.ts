import { Scale, Vec2 } from 'ketcher-core'
import { FC } from 'react'
import TransFormRotateIcon from 'src/icons/files/transform-rotate-handle.svg'
import Editor from '../Editor'
import utils from '../shared/utils'
import RotateTool from './rotate'
import SelectTool from './select'

// todo @yuleicul tfx to check if rotate use tfx... try to keep consistent
type RaphaelElement = {
  [key: string]: any
}

const STYLE = {
  HANDLE_MARGIN: 15,
  HANDLE_RADIUS: 10,
  RECT_RADIUS: 20,
  RECT_PADDING: 10,
  INITIAL_COLOR: '#B4B9D6',
  ACTIVE_COLOR: '#365CFF'
}

class RotateController {
  private editor: Editor
  private center?: Vec2
  private initialHandleCenter?: Vec2
  private rotateTool?: RotateTool

  private handle?: RaphaelElement
  private rectangle?: RaphaelElement
  private cross?: RaphaelElement
  private link?: RaphaelElement

  constructor(editor: Editor) {
    this.editor = editor
  }

  rerender() {
    this.hide()
    this.show()
  }

  hide() {
    this.handle?.unhover(this.hoverInHandle, this.hoverOutHandle)
    this.handle?.unmousedown(this.mouseDownHandle)
    this.handle?.undrag()

    this.cross?.hide()
    this.rectangle?.hide()
    this.handle?.hide()
    this.link?.hide()
  }

  private show() {
    const selection = this.editor.selection()
    const enable =
      selection?.atoms &&
      selection.atoms.length >= 1 &&
      this.editor.tool() instanceof SelectTool
    if (!enable) {
      return
    }

    const render = this.editor.render
    const originalCenter = RotateTool.getCenter(this.editor)
    this.center = originalCenter
      .scaled(render.options.scale)
      .add(render.options.offset)

    this.drawCross()
    const rectStartY = this.drawRectangle()
    this.drawLink(rectStartY)
    this.drawHandle()

    // NOTE: remember to remove all listeners before calling `hide()`
    this.handle?.hover(this.hoverInHandle, this.hoverOutHandle)
    this.handle?.mousedown(this.mouseDownHandle)
    this.handle?.drag(this.dragHandleOnMove())
  }

  private drawCross() {
    const moveToCenter = `M${this.center?.x}, ${this.center?.y}`
    this.cross = this.editor.render.paper
      .path(
        `${moveToCenter}h8${moveToCenter}h-8${moveToCenter}v8${moveToCenter}v-8`
      )
      .attr({
        stroke: STYLE.INITIAL_COLOR,
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
  }

  private drawRectangle() {
    const selection = this.editor.selection()
    const render = this.editor.render

    const rectBox = render.ctab
      .getVBoxObj(selection)!
      .transform(Scale.obj2scaled, render.options)
      .translate(render.options.offset || new Vec2())

    const rectStartX =
      rectBox.p0.x -
      STYLE.RECT_PADDING -
      render.options.atomSelectionPlateRadius
    const rectStartY =
      rectBox.p0.y -
      STYLE.RECT_PADDING -
      render.options.atomSelectionPlateRadius
    const rectEndX =
      rectBox.p1.x +
      STYLE.RECT_PADDING +
      render.options.atomSelectionPlateRadius
    const rectEndY =
      rectBox.p1.y +
      STYLE.RECT_PADDING +
      render.options.atomSelectionPlateRadius

    this.rectangle = render.paper
      .rect(
        rectStartX,
        rectStartY,
        rectEndX - rectStartX,
        rectEndY - rectStartY,
        STYLE.RECT_RADIUS
      )
      .attr({
        'stroke-dasharray': '-',
        stroke: STYLE.INITIAL_COLOR
      })

    return rectStartY
  }

  private drawHandle() {
    const paper = this.editor.render.paper

    const circle = paper.circle(0, 0, STYLE.HANDLE_RADIUS).attr({
      fill: STYLE.INITIAL_COLOR,
      stroke: 'none'
    })

    const iconPaths = (TransFormRotateIcon as unknown as FC)({})?.props.children
    const leftArrowPath: string = iconPaths[1].props.d
    const rightArrowPath: string = iconPaths[2].props.d
    const leftArrow = paper
      .path(leftArrowPath)
      .attr({ fill: 'white', stroke: 'none' })
    const rightArrow = paper
      .path(rightArrowPath)
      .attr({ fill: 'white', stroke: 'none' })
    const arrowSet: RaphaelElement = paper.set()
    arrowSet.push(leftArrow, rightArrow)
    const { x, y, width, height } = arrowSet.getBBox()
    arrowSet.translate(-(x + width / 2), -(y + height / 2))

    this.handle = paper.set() as RaphaelElement
    this.handle.push(circle, arrowSet)
    this.handle.translate(
      this.initialHandleCenter?.x,
      this.initialHandleCenter?.y
    )
  }

  private drawLink(rectStartY: number) {
    if (!this.center) {
      return
    }

    const distanceBetweenHandleAndCenter =
      this.center.y - rectStartY + STYLE.HANDLE_MARGIN + STYLE.HANDLE_RADIUS
    this.initialHandleCenter = new Vec2(
      this.center.x,
      this.center.y - distanceBetweenHandleAndCenter
    )

    this.link = this.editor.render.paper
      .path(
        `M${this.initialHandleCenter.x},${this.initialHandleCenter.y}l0,${
          STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN
        }`
      )
      .attr({
        'stroke-dasharray': '-',
        stroke: STYLE.INITIAL_COLOR
      })
  }

  // NOTE: When handle is non-arrow function, `this` is element itself
  private hoverInHandle = () => {
    const handleBackground = this.handle?.[0]
    handleBackground.attr({
      fill: STYLE.ACTIVE_COLOR
    })
  }

  private hoverOutHandle = () => {
    const handleBackground = this.handle?.[0]
    handleBackground.attr({
      fill: STYLE.INITIAL_COLOR
    })
  }

  private mouseDownHandle = (event: MouseEvent) => {
    event.stopPropagation()

    const isLeftButtonPressed = event.buttons === 1
    if (!isLeftButtonPressed) {
      return
    }

    this.cross?.attr({
      stroke: STYLE.ACTIVE_COLOR
    })
    const paper = this.editor.render.paper
    this.link?.remove()
    this.link = paper
      .path(
        `M${this.center?.x},${this.center?.y}L${this.initialHandleCenter?.x},${this.initialHandleCenter?.y}`
      )
      .attr({
        'stroke-dasharray': '-',
        stroke: STYLE.ACTIVE_COLOR
      })
    // FIXME: @yuleicul overlay link

    this.rotateTool = new RotateTool(this.editor, undefined)
    this.rotateTool?.mousedown(event)
  }

  private dragHandleOnMove = () => {
    let lastHandleCenter = this.initialHandleCenter
    let lastRotateAngle = utils.calcAngle(lastHandleCenter, this.center)

    return (
      dxFromStart: number,
      dyFromStart: number,
      _clientX: number,
      _clientY: number,
      event: MouseEvent
    ) => {
      const isLeftButtonPressed = event.buttons === 1
      if (!lastHandleCenter || !isLeftButtonPressed) {
        return
      }

      const options = this.editor.render.options
      const newHandleCenter = this.initialHandleCenter?.add(
        new Vec2(dxFromStart, dyFromStart).scaled(1 / options.zoom) // HACK: zoom in/out
      )

      const delta = newHandleCenter?.sub(lastHandleCenter)
      this.handle?.translate(delta?.x, delta?.y)
      this.link?.remove()
      this.link = this.editor.render.paper
        .path(
          `M${this.center?.x},${this.center?.y}L${newHandleCenter?.x},${newHandleCenter?.y}`
        )
        .attr({
          'stroke-dasharray': '-',
          stroke: STYLE.ACTIVE_COLOR
        })

      const newRotateAngle = utils.calcAngle(newHandleCenter, this.center)
      const rotateDegree = utils.degrees(newRotateAngle - lastRotateAngle)
      this.cross?.rotate(rotateDegree, this.center?.x, this.center?.y)
      this.rectangle?.rotate(rotateDegree, this.center?.x, this.center?.y)

      lastHandleCenter = newHandleCenter
      lastRotateAngle = newRotateAngle

      this.rotateTool?.mousemove(event)
    }
  }
}

export default RotateController
