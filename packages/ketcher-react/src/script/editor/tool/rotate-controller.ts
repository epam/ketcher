import { Scale, Vec2 } from 'ketcher-core'
import Editor, { Selection } from '../Editor'
import utils from '../shared/utils'
import RotateTool from './rotate'

type RaphaelElement = {
  [key: string]: any
}

const STYLE = {
  HANDLE_MARGIN: 15,
  HANDLE_RADIUS: 10
}

class RotateController {
  private editor: Editor
  private center?: Vec2
  private initialHandleCenter?: Vec2
  private rotateTool?: RotateTool

  // @yuleicul rethink names, more professional
  /** Raphaël elements */
  private handle?: RaphaelElement
  private rectangle?: RaphaelElement
  private cross?: RaphaelElement
  private link?: RaphaelElement

  constructor(editor: Editor) {
    this.editor = editor
  }

  show() {
    // FIXME: context menu doesn't work
    this.hide()

    // FIXME: @yuleicul when to show? what's fragment/structure
    const selection = this.editor.selection()
    const disable = !selection?.atoms || selection.atoms.length <= 1
    if (disable) {
      return
    }

    // FIXME: @yuleicul zoom in/out
    const render = this.editor.render
    const originalCenter = RotateTool.getCenter(this.editor)
    this.center = originalCenter
      .scaled(render.options.scale)
      .add(render.options.offset)

    this.drawCross()
    const rectStartY = this.drawRectangle()
    this.drawHandle(rectStartY)
    this.drawLink()

    // NOTE: remember to remove all listeners before calling `hide()`
    this.handle?.hover(this.hoverInHandle, this.hoverOutHandle)
    this.handle?.mousedown(this.mouseDownHandle)
    this.handle?.drag(this.dragHandleOnMove(), undefined, this.dragHandleOnEnd)
  }

  private drawCross() {
    const moveToCenter = `M${this.center?.x}, ${this.center?.y}`
    this.cross = this.editor.render.paper
      .path(
        `${moveToCenter}h8${moveToCenter}h-8${moveToCenter}v8${moveToCenter}v-8`
      )
      .attr({
        stroke: '#B4B9D6',
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

    const rectStartX = rectBox.p0.x
    const rectStartY = rectBox.p0.y
    const rectEndX = rectBox.p1.x
    const rectEndY = rectBox.p1.y

    this.rectangle = render.paper.rect(
      rectStartX,
      rectStartY,
      rectEndX - rectStartX,
      rectEndY - rectStartY
    )

    return rectStartY
  }

  private drawHandle(rectStartY: number) {
    if (!this.center) {
      return
    }

    const distanceBetweenHandleAndCenter =
      this.center.y - rectStartY + STYLE.HANDLE_MARGIN + STYLE.HANDLE_RADIUS
    this.initialHandleCenter = new Vec2(
      this.center.x,
      this.center.y - distanceBetweenHandleAndCenter
    )
    this.handle = this.editor.render.paper
      .circle(
        // todo @yuleicul replace with icon
        this.initialHandleCenter.x,
        this.initialHandleCenter.y,
        STYLE.HANDLE_RADIUS
      )
      .attr({
        fill: '#B4B9D6'
      })
  }

  private drawLink() {
    this.link = this.editor.render.paper.path(
      `M${this.initialHandleCenter?.x},${this.initialHandleCenter?.y}l0,${
        STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN
      }`
    )
  }

  // NOTE: When handle is non-arrow function, `this` is element itself
  private hoverInHandle = () => {
    this.handle?.attr({
      fill: '#365CFF'
    })
  }

  private hoverOutHandle = () => {
    this.handle?.attr({
      fill: '#B4B9D6'
    })
  }

  private mouseDownHandle = (event: MouseEvent) => {
    event.stopPropagation()

    this.cross?.attr({
      stroke: '#365CFF'
    })
    const paper = this.editor.render.paper
    this.link?.remove()
    this.link = paper.path(
      `M${this.center?.x},${this.center?.y}L${this.initialHandleCenter?.x},${this.initialHandleCenter?.y}`
    )

    this.rotateTool = new RotateTool(this.editor, undefined)
    this.rotateTool?.mousedown(event)
  }

  private dragHandleOnMove = () => {
    // @yuleicul prevent right button

    let lastHandleCenter = this.initialHandleCenter
    let lastRotateAngle = utils.calcAngle(lastHandleCenter, this.center)

    return (
      dxFromStart: number,
      dyFromStart: number,
      _clientX: number,
      _clientY: number,
      event: MouseEvent
    ) => {
      if (!lastHandleCenter) {
        return
      }

      const newHandleCenter = this.initialHandleCenter?.add(
        new Vec2(dxFromStart, dyFromStart)
      )

      const delta = newHandleCenter?.sub(lastHandleCenter)
      this.handle?.translate(delta?.x, delta?.y)
      this.link?.remove()
      this.link = this.editor.render.paper.path(
        `M${this.center?.x},${this.center?.y}L${newHandleCenter?.x},${newHandleCenter?.y}`
      )

      const newRotateAngle = utils.calcAngle(newHandleCenter, this.center)
      const rotateDegree = utils.degrees(newRotateAngle - lastRotateAngle)
      this.cross?.rotate(rotateDegree, this.center?.x, this.center?.y)
      this.rectangle?.rotate(rotateDegree, this.center?.x, this.center?.y)

      lastHandleCenter = newHandleCenter
      lastRotateAngle = newRotateAngle

      this.rotateTool?.mousemove(event)
    }
  }

  private dragHandleOnEnd = () => {
    this.rotateTool?.mouseup()
    this.hide()
  }

  private hide() {
    // @yuleicul after switching to Rotate Tool, hide handle
    this.handle?.unhover(this.hoverInHandle, this.hoverOutHandle)
    this.handle?.unmousedown(this.mouseDownHandle)
    this.handle?.undrag()

    this.cross?.hide()
    this.rectangle?.hide()
    this.handle?.hide()
    this.link?.hide()
  }

  onSelectChange(selection: Selection | null) {
    const disable = !selection?.atoms
    if (disable) {
      this.hide()
    }
  }
}

export default RotateController
