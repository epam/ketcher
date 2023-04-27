import { Scale, Vec2 } from 'ketcher-core'
import Editor from '../Editor'
import utils from '../shared/utils'
import RotateTool from './rotate'
import SelectTool from './select'

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

const LEFT_ARROW_PATH =
  'M12.7034 14.8189L9.39616 17.6218L9.13674 16.1892C8.12927 16.0487 7.17132 15.6644 6.34605 15.0697C5.52078 14.475 4.85314 13.6878 4.40108 12.7766C3.94903 11.8653 3.72622 10.8575 3.75201 9.84062C3.7778 8.82373 4.0514 7.8285 4.54906 6.94133L5.8121 7.65148C5.45018 8.29719 5.24246 9.01784 5.20516 9.75712C5.16786 10.4964 5.302 11.2343 5.59709 11.9132C5.89218 12.592 6.34023 13.1935 6.90624 13.6705C7.47225 14.1475 8.1409 14.4872 8.85993 14.6631L8.62297 13.3587L12.7034 14.8189Z'
const RIGHT_ARROW_PATH =
  'M15.4493 13.0588L14.1862 12.3486C14.5482 11.7029 14.7559 10.9823 14.7932 10.243C14.8305 9.50371 14.6963 8.76582 14.4012 8.08695C14.1062 7.40809 13.6581 6.80665 13.0921 6.32962C12.5261 5.85259 11.8574 5.51288 11.1384 5.33704L11.3754 6.64501L7.29492 5.18124L10.6022 2.37834L10.8616 3.81095C11.8691 3.95145 12.827 4.33573 13.6523 4.93043C14.4776 5.52513 15.1452 6.31227 15.5973 7.22353C16.0493 8.13478 16.2721 9.1426 16.2463 10.1595C16.2205 11.1764 15.9469 12.1716 15.4493 13.0588Z'

class RotateController {
  private editor: Editor
  private center?: Vec2
  private initialHandleCenter?: Vec2
  private rotateTool?: RotateTool

  private handle?: RaphaelElement // [circle, arrowSet]
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
    this.handle?.unhover(this.hoverIn, this.hoverOut)
    this.handle?.unmousedown(this.mouseDown)
    this.handle?.unmouseup(this.mouseUp)
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
      selection.atoms.length > 1 &&
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
    this.handle?.hover(this.hoverIn, this.hoverOut)
    this.handle?.mousedown(this.mouseDown)
    this.handle?.mouseup(this.mouseUp)
    this.handle?.drag(
      this.dragMove(),
      undefined,
      this.mouseUp // Fix rotation getting stuck when mouseup outside window
    )
  }

  private drawCross() {
    const moveToCenter = `M${this.center?.x}, ${this.center?.y}`
    this.cross = this.editor.render.paper
      .path(
        moveToCenter +
          `h8` +
          moveToCenter +
          `h-8` +
          moveToCenter +
          `v8` +
          moveToCenter +
          `v-8`
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

    const leftArrow = paper
      .path(LEFT_ARROW_PATH)
      .attr({ fill: 'white', stroke: 'none' })
    const rightArrow = paper
      .path(RIGHT_ARROW_PATH)
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
        `M${this.initialHandleCenter.x},${this.initialHandleCenter.y}` +
          `l0,${STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN}`
      )
      .attr({
        'stroke-dasharray': '-',
        stroke: STYLE.INITIAL_COLOR
      })
  }

  // NOTE: When handle is non-arrow function, `this` is element itself
  private hoverIn = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    this.handle?.attr({
      cursor: 'grab'
    })
    const circle = this.handle?.[0]
    circle.attr({
      fill: STYLE.ACTIVE_COLOR
    })
  }

  private hoverOut = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    const circle = this.handle?.[0]
    circle.attr({
      fill: STYLE.INITIAL_COLOR
    })
  }

  private mouseDown = (event: MouseEvent) => {
    event.stopPropagation() // avoid triggering SelectTool's mousedown

    const isLeftButtonPressed = event.buttons === 1
    if (!isLeftButtonPressed) {
      return
    }

    this.cross?.attr({
      stroke: STYLE.ACTIVE_COLOR
    })
    this.link?.attr({
      path:
        `M${this.center?.x},${this.center?.y}` +
        `L${this.initialHandleCenter?.x},${this.initialHandleCenter?.y}`,
      stroke: STYLE.ACTIVE_COLOR
    })
    this.handle?.attr({
      cursor: 'grabbing'
    })
    const arrowSet = this.handle?.[1]
    arrowSet?.attr({ fill: 'none' })

    this.rotateTool = new RotateTool(this.editor, undefined)
    this.rotateTool?.mousedown(event)
  }

  private dragMove = () => {
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
      this.handle?.attr({
        cursor: 'grabbing'
      })
      this.link?.attr({
        path:
          `M${this.center?.x},${this.center?.y}` +
          `L${newHandleCenter?.x},${newHandleCenter?.y}`,
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

  // FIXME @yuleicul position change when window move
  // TODO @yuleicul add unit tests according commit messages
  private mouseUp = (event: MouseEvent) => {
    event.stopPropagation() // avoid triggering SelectTool's mouseup

    this.rotateTool?.mouseup()
    this.rerender()
  }
}

export default RotateController
