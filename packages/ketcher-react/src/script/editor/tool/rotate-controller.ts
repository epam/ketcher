import { Scale, Vec2 } from 'ketcher-core'
import { throttle } from 'lodash'
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
  INITIAL_COLOR: '#B4B9D6',
  ACTIVE_COLOR: '#365CFF'
}

const LEFT_ARROW_PATH =
  'M12.7034 14.8189L9.39616 17.6218L9.13674 16.1892C8.12927 16.0487 7.17132 15.6644 6.34605 15.0697C5.52078 14.475 4.85314 13.6878 4.40108 12.7766C3.94903 11.8653 3.72622 10.8575 3.75201 9.84062C3.7778 8.82373 4.0514 7.8285 4.54906 6.94133L5.8121 7.65148C5.45018 8.29719 5.24246 9.01784 5.20516 9.75712C5.16786 10.4964 5.302 11.2343 5.59709 11.9132C5.89218 12.592 6.34023 13.1935 6.90624 13.6705C7.47225 14.1475 8.1409 14.4872 8.85993 14.6631L8.62297 13.3587L12.7034 14.8189Z'
const RIGHT_ARROW_PATH =
  'M15.4493 13.0588L14.1862 12.3486C14.5482 11.7029 14.7559 10.9823 14.7932 10.243C14.8305 9.50371 14.6963 8.76582 14.4012 8.08695C14.1062 7.40809 13.6581 6.80665 13.0921 6.32962C12.5261 5.85259 11.8574 5.51288 11.1384 5.33704L11.3754 6.64501L7.29492 5.18124L10.6022 2.37834L10.8616 3.81095C11.8691 3.95145 12.827 4.33573 13.6523 4.93043C14.4776 5.52513 15.1452 6.31227 15.5973 7.22353C16.0493 8.13478 16.2721 9.1426 16.2463 10.1595C16.2205 11.1764 15.9469 12.1716 15.4493 13.0588Z'

class RotateController {
  private editor: Editor

  private protractorRadius: number
  private rotateTool: RotateTool
  private center?: Vec2
  private initialHandleCenter?: Vec2

  private handle?: RaphaelElement
  private boundingRect?: RaphaelElement
  private cross?: RaphaelElement
  private link?: RaphaelElement
  private protractor?: RaphaelElement
  private rotateArc?: RaphaelElement

  constructor(editor: Editor) {
    this.editor = editor
    this.protractorRadius = 0
    this.rotateTool = new RotateTool(this.editor, undefined, true)
  }

  rerender() {
    this.clean()

    const [originalCenter, visibleAtoms] = this.rotateTool.getCenter(
      this.editor
    )

    const render = this.editor.render
    this.center = originalCenter
      .scaled(render.options.scale)
      .add(render.options.offset)

    this.show(visibleAtoms)
  }

  clean() {
    this.handle?.unhover(this.hoverIn, this.hoverOut)
    this.handle?.unmousedown(this.dragStart)
    this.handle?.unmouseup(this.dragEnd)
    this.handle?.undrag()

    this.cross?.remove()
    delete this.cross
    this.boundingRect?.remove()
    delete this.boundingRect
    this.link?.remove()
    delete this.link
    this.handle?.remove()
    delete this.handle
    this.protractor?.remove()
    delete this.protractor
    this.rotateArc?.remove()
    delete this.rotateArc

    this.protractorRadius = 0
    delete this.center
    delete this.initialHandleCenter
  }

  private show(visibleAtoms: number[]) {
    const enable =
      visibleAtoms.length > 1 && this.editor.tool() instanceof SelectTool
    if (!enable) {
      return
    }

    this.drawCross()
    const rectStartY = this.drawBoundingRect(visibleAtoms)
    this.protractorRadius = this.center!.y - rectStartY
    this.drawShortLink()
    this.drawHandle()

    this.handle?.hover(this.hoverIn, this.hoverOut)
    this.handle?.mousedown(this.dragStart)
    this.handle?.mouseup(this.dragEnd)
    this.handle?.drag(
      this.dragMove(),
      undefined,
      this.dragEnd // Fix rotation getting stuck when mouseup outside window
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

  private drawBoundingRect(visibleAtoms: number[]) {
    const render = this.editor.render
    const RECT_RADIUS = 20
    const RECT_PADDING = 10

    const rectBox = render.ctab
      .getVBoxObj({ atoms: visibleAtoms })!
      .transform(Scale.obj2scaled, render.options)
      .translate(render.options.offset || new Vec2())

    const rectStartX =
      rectBox.p0.x - RECT_PADDING - render.options.atomSelectionPlateRadius
    const rectStartY =
      rectBox.p0.y - RECT_PADDING - render.options.atomSelectionPlateRadius
    const rectEndX =
      rectBox.p1.x + RECT_PADDING + render.options.atomSelectionPlateRadius
    const rectEndY =
      rectBox.p1.y + RECT_PADDING + render.options.atomSelectionPlateRadius

    this.boundingRect = render.paper
      .rect(
        rectStartX,
        rectStartY,
        rectEndX - rectStartX,
        rectEndY - rectStartY,
        RECT_RADIUS
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

  private drawShortLink() {
    if (!this.center) {
      return
    }

    const distanceBetweenHandleAndCenter =
      this.protractorRadius + STYLE.HANDLE_MARGIN + STYLE.HANDLE_RADIUS
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

  private redrawProtractor(structRotateDegree?: number) {
    if (structRotateDegree === undefined) {
      return
    }
    this.protractor?.remove()
    this.drawProtractor(structRotateDegree)
  }

  private drawProtractor(structRotateDegree: number) {
    if (!this.center) {
      return
    }

    const paper = this.editor.render.paper
    const DEGREE_TEXT_MARGIN = 10
    const PROTRACTOR_COLOR = '#E1E5EA'
    const DEGREE_FONT_SIZE = 12

    const circle = paper
      .circle(this.center.x, this.center.y, this.protractorRadius)
      .attr({
        'stroke-dasharray': '-',
        stroke: PROTRACTOR_COLOR
      })

    this.protractor = paper.set() as RaphaelElement
    this.protractor.push(circle)

    const degree0TextY =
      this.center.y -
      this.protractorRadius -
      STYLE.HANDLE_MARGIN -
      STYLE.HANDLE_RADIUS * 2 -
      DEGREE_TEXT_MARGIN

    let degreeLine: RaphaelElement | undefined
    let textPos = new Vec2(this.center.x, degree0TextY)

    const predefinedDegrees = [
      0, 30, 45, 60, 90, 120, 135, 150, 180, -150, -135, -120, -90, -60, -45,
      -30
    ]
    predefinedDegrees.reduce((previousDegree, currentDegree, currentIndex) => {
      const isDrawingDegree0 = currentIndex === 0
      const gap = currentDegree - previousDegree
      const diff = getDifference(currentDegree, structRotateDegree)

      if (isDrawingDegree0) {
        degreeLine = paper
          .path(
            `M${this.center!.x},${this.center!.y - this.protractorRadius}` +
              `v-${
                this.protractorRadius >= 65
                  ? STYLE.HANDLE_MARGIN
                  : STYLE.HANDLE_MARGIN / 2
              }`
          )
          .attr({
            'stroke-dasharray': '-'
          })
      } else {
        degreeLine = degreeLine!
          .clone()
          .rotate(gap, this.center!.x, this.center!.y)
      }
      degreeLine!.attr({
        stroke: diff > 90 ? 'none' : PROTRACTOR_COLOR
      })
      this.protractor!.push(degreeLine)

      if (this.protractorRadius < 65) {
        return currentDegree
      }

      textPos = rotatePoint(this.center!, textPos, (gap / 180) * Math.PI)
      const degreeText = paper
        .text(textPos.x, textPos.y, `${currentDegree}°`)
        .attr({
          fill:
            diff > 90
              ? 'none'
              : currentDegree !== 0 && currentDegree === structRotateDegree
              ? STYLE.ACTIVE_COLOR
              : STYLE.INITIAL_COLOR,
          'font-size': DEGREE_FONT_SIZE
        })

      this.protractor!.push(degreeText)
      return currentDegree
    }, -1)

    this.protractor.toBack()
  }

  private initRotateArc() {
    const paper = this.editor.render.paper
    const arc = paper.path()
    const text = paper.text(0, 0, '')

    this.rotateArc = paper.set().push(arc, text)
  }

  private drawRotateArc(structRotateDegree?: number) {
    if (!this.center || !this.rotateArc || structRotateDegree === undefined) {
      return
    }

    const rotateArcStart = new Vec2(
      this.center.x,
      this.center.y - this.protractorRadius
    )
    const rotateArcEnd = rotatePoint(
      this.center,
      rotateArcStart,
      (structRotateDegree / 180) * Math.PI
    )

    const arc = this.rotateArc[0]
    const text = this.rotateArc[1]

    const TEXT_MARGIN_LEFT = 8
    const TEXT_MARGIN_BOTTOM = 12
    const TEXT_FONT_SIZE = 16
    const TEXT_COLOR = '#333333'

    // Doc: https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    arc
      .attr({
        path:
          `M${rotateArcStart.x},${rotateArcStart.y}` +
          `A${this.protractorRadius},${this.protractorRadius} ` +
          `0 0,${structRotateDegree < 0 ? '0' : '1'} ` +
          `${rotateArcEnd.x},${rotateArcEnd.y}`,
        stroke: STYLE.ACTIVE_COLOR
      })
      .toBack()

    text.attr({
      text: `${structRotateDegree}°`,
      'text-anchor': 'start',
      x: this.center.x + TEXT_MARGIN_LEFT,
      y: this.center.y - this.protractorRadius - TEXT_MARGIN_BOTTOM,
      'font-size': TEXT_FONT_SIZE,
      fill: TEXT_COLOR
    })
  }

  // NOTE: When handle is non-arrow function, `this` is element itself
  private hoverIn = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    const isDragPaused = !this.boundingRect
    this.handle?.attr({
      cursor: isDragPaused ? 'not-allowed' : 'grab'
    })
    const circle = this.handle?.[0]
    circle.attr({
      fill: isDragPaused ? STYLE.INITIAL_COLOR : STYLE.ACTIVE_COLOR
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

  private dragStart = (event: MouseEvent) => {
    event.stopPropagation() // Avoid triggering SelectTool's mousedown

    const isLeftButtonPressed = event.buttons === 1
    if (!isLeftButtonPressed) {
      return
    }

    const isDragPaused = !this.boundingRect
    if (isDragPaused) {
      // Fix protractor staying after screenshot/being paused
      // see https://github.com/epam/ketcher/pull/2574#issuecomment-1539201020
      this.clean()
      return
    }

    this.boundingRect?.remove()
    delete this.boundingRect
    this.drawProtractor(0)
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

    this.rotateTool.mousedown(event, true)
  }

  private dragMove = () => {
    let lastHandleCenter = this.initialHandleCenter
    let lastRotateAngle = utils.calcAngle(lastHandleCenter, this.center)
    this.initRotateArc()

    return throttle(
      (
        dxFromStart: number,
        dyFromStart: number,
        _clientX: number,
        _clientY: number,
        event: MouseEvent
      ) => {
        const isLeftButtonPressed = event.buttons === 1
        if (
          !lastHandleCenter ||
          !this.initialHandleCenter ||
          !this.center ||
          !isLeftButtonPressed ||
          !this.protractor // Fix `dragMove` being called without `dragStart` being called first when DnDing very fast
        ) {
          return
        }

        const render = this.editor.render
        const newHandleCenter = this.initialHandleCenter.add(
          new Vec2(dxFromStart, dyFromStart).scaled(1 / render.options.zoom) // HACK: zoom in/out
        )

        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${newHandleCenter.x},${newHandleCenter.y}`,
          stroke: STYLE.ACTIVE_COLOR
        })

        const delta = newHandleCenter.sub(lastHandleCenter)
        this.handle?.translate(delta.x, delta.y)
        this.handle?.attr({
          cursor: 'grabbing'
        })

        const newRotateAngle = utils.calcAngle(newHandleCenter, this.center)
        const rotateDegree = utils.degrees(newRotateAngle - lastRotateAngle)
        this.cross?.rotate(rotateDegree, this.center.x, this.center.y)

        this.rotateTool.mousemove(
          event,
          render.view2obj(newHandleCenter.scaled(render.options.zoom))
        )
        const newProtractorRadius =
          Vec2.dist(newHandleCenter, this.center) -
          STYLE.HANDLE_MARGIN -
          STYLE.HANDLE_RADIUS
        this.protractorRadius =
          newProtractorRadius >= 0 ? newProtractorRadius : 0
        this.drawRotateArc(this.rotateTool.dragCtx?.angle)
        // NOTE: draw protractor last
        this.redrawProtractor(this.rotateTool.dragCtx?.angle)

        lastHandleCenter = newHandleCenter
        lastRotateAngle = newRotateAngle
      },
      40 // 25fps
    )
  }

  private dragEnd = (event: MouseEvent) => {
    event.stopPropagation() // Avoid triggering SelectTool's mouseup

    this.rotateTool.mouseup()
    this.rerender()
  }
}

export default RotateController

const rotatePoint = (centerPoint: Vec2, startPoint: Vec2, angle: number) => {
  const oCenter = centerPoint
  const oStart = startPoint

  const centerStart = oStart.sub(oCenter)
  const centerEnd = centerStart.rotate(angle)

  const oEnd = oCenter.add(centerEnd)
  return oEnd
}

const getDifference = (currentDegree: number, structRotateDegree: number) => {
  let abs = 0

  // HACK: https://github.com/epam/ketcher/pull/2574#issuecomment-1539509046
  if (structRotateDegree > 90) {
    const positiveCurrentDegree =
      currentDegree < 0 ? currentDegree + 360 : currentDegree
    abs = Math.abs(positiveCurrentDegree - structRotateDegree)
  } else if (structRotateDegree < -90) {
    const negativeCurrentDegree =
      currentDegree > 0 ? currentDegree - 360 : currentDegree
    abs = Math.abs(negativeCurrentDegree - structRotateDegree)
  } else {
    abs = Math.abs(currentDegree - structRotateDegree)
  }

  return abs
}
