import { Scale, Vec2 } from 'ketcher-core'
import { throttle } from 'lodash'
import Editor from '../Editor'
import RotateTool from './rotate'
import SelectTool from './select'

type RaphaelElement = {
  [key: string]: any
}

type LinkState = 'long' | 'short' | 'moveCenter' | 'moveHandle'
type CrossState = 'active' | 'inactive' | 'offset' | 'move'
type HandleState = 'hoverIn' | 'hoverOut' | 'active' | 'move'

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
  private rotateTool: RotateTool
  private originalCenter!: Vec2
  private initialHandleCenter!: Vec2
  private protractorRadius!: number
  private isRotating!: boolean

  private handle?: RaphaelElement
  private boundingRect?: RaphaelElement
  private cross?: RaphaelElement
  private link?: RaphaelElement
  private protractor?: RaphaelElement
  private rotateArc?: RaphaelElement

  constructor(editor: Editor) {
    this.editor = editor
    this.init()
    this.rotateTool = new RotateTool(this.editor, undefined, true)
  }

  private init() {
    this.originalCenter = new Vec2()
    this.initialHandleCenter = new Vec2()
    this.protractorRadius = 0
    this.isRotating = false
  }

  private get render() {
    return this.editor.render
  }

  private get paper() {
    return this.render.paper
  }

  private get center() {
    return this.originalCenter
      .scaled(this.render.options.scale)
      .add(this.render.options.offset)
  }

  rerender() {
    this.clean()
    this.init()

    const [originalCenter, visibleAtoms] = this.rotateTool.getCenter(
      this.editor
    )

    this.originalCenter = originalCenter
    this.show(visibleAtoms)
  }

  clean() {
    this.handle?.unhover(this.hoverIn, this.hoverOut)
    this.handle?.unmousedown(this.dragStart)
    this.handle?.unmouseup(this.dragEnd)
    this.handle?.undrag()

    const crossArea = this.cross?.[1]
    crossArea?.unhover(this.hoverCrossIn, this.hoverCrossOut)
    crossArea?.unmousedown(this.dragCrossStart)
    crossArea?.unmouseup(this.dragCrossEnd)
    crossArea?.undrag()

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
  }

  private show(visibleAtoms: number[]) {
    const enable =
      visibleAtoms.length > 1 && this.editor.tool() instanceof SelectTool
    if (!enable) {
      return
    }

    const rectStartY = this.drawBoundingRect(visibleAtoms)
    this.protractorRadius = this.center.y - rectStartY
    this.drawLink()
    this.drawCross()
    this.drawHandle()

    this.handle?.hover(this.hoverIn, this.hoverOut)
    this.handle?.mousedown(this.dragStart)
    this.handle?.mouseup(this.dragEnd)
    this.handle?.drag(
      this.dragMove,
      undefined,
      this.dragEnd // Fix rotation getting stuck when mouseup outside window
    )

    const crossArea = this.cross?.[1]
    crossArea?.hover(this.hoverCrossIn, this.hoverCrossOut)
    crossArea?.mousedown(this.dragCrossStart)
    crossArea?.mouseup(this.dragCrossEnd)
    crossArea?.drag(this.dragCrossMove, undefined, this.dragCrossEnd)
  }

  private drawCross(state?: CrossState) {
    switch (state) {
      case 'active': {
        this.cross?.attr({
          stroke: STYLE.ACTIVE_COLOR
        })
        break
      }

      case 'inactive': {
        this.cross?.attr({
          stroke: STYLE.INITIAL_COLOR
        })
        break
      }

      case 'move': {
        this.cross?.transform('')
        this.cross?.translate(this.center.x, this.center.y)
        break
      }

      default: {
        const cross = this.paper
          .path(`M0,0` + `h8` + `M0,0` + `h-8` + `M0,0` + `v8` + `M0,0` + `v-8`)
          // todo @yuleicul cursor
          // todo @yuleicul event stop / when cross and atom are overlapped
          // todo @yuleicul make it bigger to conviently move
          .attr({
            stroke: STYLE.INITIAL_COLOR,
            'stroke-width': 2,
            'stroke-linecap': 'round'
          })
        // HACK: increase hover/drag area
        const circle = this.paper.circle(0, 0, 10).attr({
          // fill: 'white',
          // opacity: 0,
          fill: 'red',
          opacity: 0.5
        })
        this.cross = this.paper.set()
        this.cross?.push(cross, circle)
        this.cross?.translate(this.center.x, this.center.y)

        break
      }
    }
  }

  private drawBoundingRect(visibleAtoms: number[]) {
    const RECT_RADIUS = 20
    const RECT_PADDING = 10

    const rectBox = this.render.ctab
      .getVBoxObj({ atoms: visibleAtoms })!
      .transform(Scale.obj2scaled, this.render.options)
      .translate(this.render.options.offset || new Vec2())

    const rectStartX =
      rectBox.p0.x - RECT_PADDING - this.render.options.atomSelectionPlateRadius
    const rectStartY =
      rectBox.p0.y - RECT_PADDING - this.render.options.atomSelectionPlateRadius
    const rectEndX =
      rectBox.p1.x + RECT_PADDING + this.render.options.atomSelectionPlateRadius
    const rectEndY =
      rectBox.p1.y + RECT_PADDING + this.render.options.atomSelectionPlateRadius

    this.boundingRect = this.paper
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

  private drawHandle(state: 'move', option: Vec2)
  private drawHandle(state?: HandleState)
  private drawHandle(state?: HandleState, option?: Vec2 | boolean) {
    switch (state) {
      case 'hoverIn': {
        this.handle?.attr({
          cursor: 'grab'
        })
        const circle = this.handle?.[0]
        circle.attr({
          fill: STYLE.ACTIVE_COLOR
        })
        break
      }

      case 'hoverOut': {
        const circle = this.handle?.[0]
        circle.attr({
          fill: STYLE.INITIAL_COLOR
        })
        break
      }

      case 'active': {
        this.handle?.attr({
          cursor: 'grabbing'
        })
        const arrowSet = this.handle?.[1]
        arrowSet?.attr({ fill: 'none' })
        break
      }

      case 'move': {
        const moveTo = option as Vec2
        this.handle?.transform('').translate(moveTo.x, moveTo.y).attr({
          cursor: 'grabbing' // todo@yuleicul remove?
        })
        break
      }

      default: {
        const circle = this.paper.circle(0, 0, STYLE.HANDLE_RADIUS).attr({
          fill: STYLE.INITIAL_COLOR,
          stroke: 'none'
        })

        const leftArrow = this.paper
          .path(LEFT_ARROW_PATH)
          .attr({ fill: 'white', stroke: 'none' })
        const rightArrow = this.paper
          .path(RIGHT_ARROW_PATH)
          .attr({ fill: 'white', stroke: 'none' })
        const arrowSet: RaphaelElement = this.paper.set()
        arrowSet.push(leftArrow, rightArrow)
        const { x, y, width, height } = arrowSet.getBBox()
        arrowSet.translate(-(x + width / 2), -(y + height / 2))

        this.handle = this.paper.set() as RaphaelElement
        this.handle.push(circle, arrowSet)
        this.handle.translate(
          this.initialHandleCenter.x,
          this.initialHandleCenter.y
        )
        break
      }
    }
  }

  private drawLink(state: 'moveHandle', option: Vec2)
  private drawLink(state?: LinkState)
  private drawLink(state?: LinkState, option?: Vec2) {
    switch (state) {
      case 'long': {
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${this.initialHandleCenter.x},${this.initialHandleCenter.y}`,
          stroke: STYLE.ACTIVE_COLOR
        })
        break
      }

      case 'short': {
        this.link?.attr({
          path:
            `M${this.initialHandleCenter.x},${this.initialHandleCenter.y}` +
            `l0,${STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN}`,
          stroke: STYLE.INITIAL_COLOR
        })
        break
      }

      case 'moveCenter': {
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${this.initialHandleCenter.x},${this.initialHandleCenter.y}`
        })
        break
      }

      case 'moveHandle': {
        const moveTo = option as Vec2
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` + `L${moveTo.x},${moveTo.y}`
        })
        break
      }

      default: {
        const distanceBetweenHandleAndCenter =
          this.protractorRadius + STYLE.HANDLE_MARGIN + STYLE.HANDLE_RADIUS
        this.initialHandleCenter = new Vec2(
          this.center.x,
          this.center.y - distanceBetweenHandleAndCenter
        )

        this.link = this.paper
          .path(
            `M${this.initialHandleCenter.x},${this.initialHandleCenter.y}` +
              `l0,${STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN}`
          )
          .attr({
            'stroke-dasharray': '-',
            stroke: STYLE.INITIAL_COLOR
          })
        break
      }
    }
  }

  private drawProtractor(structRotateDegree: number) {
    this.protractor?.remove()

    const DEGREE_TEXT_MARGIN = 10
    const PROTRACTOR_COLOR = '#E1E5EA'
    const DEGREE_FONT_SIZE = 12

    const circle = this.paper
      .circle(this.center.x, this.center.y, this.protractorRadius)
      .attr({
        'stroke-dasharray': '-',
        stroke: PROTRACTOR_COLOR
      })

    this.protractor = this.paper.set() as RaphaelElement
    this.protractor.push(circle)

    const degree0TextY =
      this.center.y -
      this.protractorRadius -
      STYLE.HANDLE_MARGIN -
      STYLE.HANDLE_RADIUS * 2 -
      DEGREE_TEXT_MARGIN
    const degree0Line = this.paper
      .path(
        `M${this.center.x},${this.center.y - this.protractorRadius}` +
          `v-${
            this.protractorRadius >= 65
              ? STYLE.HANDLE_MARGIN
              : STYLE.HANDLE_MARGIN / 2
          }`
      )
      .attr({
        'stroke-dasharray': '-'
      })
    let degreeLine = degree0Line
    let textPos = new Vec2(this.center.x, degree0TextY)

    const predefinedDegrees = [
      0, 30, 45, 60, 90, 120, 135, 150, 180, -150, -135, -120, -90, -60, -45,
      -30
    ]
    predefinedDegrees.reduce((previousDegree, currentDegree, currentIndex) => {
      const isDrawingDegree0 = currentIndex === 0
      const gap = currentDegree - previousDegree
      const diff = getDifference(currentDegree, structRotateDegree)

      if (!isDrawingDegree0) {
        degreeLine = degreeLine
          .clone()
          .rotate(gap, this.center.x, this.center.y)
      }

      degreeLine.attr({
        stroke: diff > 90 ? 'none' : PROTRACTOR_COLOR
      })
      this.protractor?.push(degreeLine)

      if (this.protractorRadius < 65) {
        return currentDegree
      }

      textPos = rotatePoint(this.center, textPos, (gap / 180) * Math.PI)
      const degreeText = this.paper
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

      this.protractor?.push(degreeText)

      return currentDegree
    }, -1)

    this.protractor.toBack()
  }

  private drawRotateArc(structRotateDegree: number) {
    if (!this.rotateArc) {
      const arc = this.paper.path()
      const text = this.paper.text(0, 0, '')

      this.rotateArc = this.paper.set().push(arc, text) as RaphaelElement
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

    this.drawHandle('hoverIn')
  }

  private hoverOut = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    this.drawHandle('hoverOut')
  }

  private dragStart = (event: MouseEvent) => {
    event.stopPropagation() // Avoid triggering SelectTool's mousedown

    const isLeftButtonPressed = event.buttons === 1
    if (!isLeftButtonPressed) {
      return
    }

    const isDragPaused = this.isRotating
    if (isDragPaused) {
      // Fix protractor staying after screenshot/being paused
      // see https://github.com/epam/ketcher/pull/2574#issuecomment-1539201020
      this.clean()
      return
    }

    this.isRotating = true

    this.boundingRect?.remove()
    delete this.boundingRect

    this.drawProtractor(0)
    this.drawCross('active')
    this.drawLink('long')
    this.drawHandle('active')

    this.rotateTool.mousedown(event, true)
  }

  private dragMove = throttle(
    (
      _dxFromStart: number,
      _dyFromStart: number,
      _clientX: number,
      _clientY: number,
      event: MouseEvent
    ) => {
      if (!this.isRotating) {
        return
      }

      const newHandleCenter = this.render
        .page2obj(event)
        .scaled(this.render.options.scale)
        .add(this.render.options.offset)

      this.drawLink('moveHandle', newHandleCenter)
      this.drawHandle('move', newHandleCenter)
      this.drawCross('move')

      this.rotateTool.mousemove(event)

      const newProtractorRadius =
        Vec2.dist(newHandleCenter, this.center) -
        STYLE.HANDLE_MARGIN -
        STYLE.HANDLE_RADIUS
      this.protractorRadius = newProtractorRadius >= 0 ? newProtractorRadius : 0
      this.drawRotateArc(this.rotateTool.dragCtx?.angle || 0)
      // NOTE: draw protractor last
      this.drawProtractor(this.rotateTool.dragCtx?.angle || 0)
    },
    40 // 25fps
  )

  private dragEnd = (event: MouseEvent) => {
    event.stopPropagation() // Avoid triggering SelectTool's mouseup

    this.rotateTool.mouseup()
    this.rerender()
  }

  private hoverCrossIn = (event: MouseEvent) => {
    const isMovingCenter = event.buttons !== 0
    if (isMovingCenter) {
      return
    }

    console.log('hoverCrossIn')
    this.drawCross('active')
    this.drawLink('long')
  }

  // fix @yuleicul link shanshuo
  private hoverCrossOut = (event: MouseEvent) => {
    const isMovingCenter = event.buttons !== 0
    if (isMovingCenter) {
      return
    }

    console.log('hoverCrossOut')
    this.drawCross('inactive')
    this.drawLink('short')
  }

  private dragCrossStart = (event: MouseEvent) => {
    console.log('dragCrossStart')
    event.stopPropagation()
  }

  private dragCrossMove = throttle(
    (
      _dxFromStart: number,
      _dyFromStart: number,
      _clientX: number,
      _clientY: number,
      event: MouseEvent
    ) => {
      // hack @yuleicul ???? have no idea why move triggered after end
      const isLeftButtonPressed = event.buttons !== 0
      if (!isLeftButtonPressed) {
        return
      }

      this.originalCenter = this.render.page2obj(event)

      this.drawCross('move')
      this.drawLink('moveCenter')
    },
    40
  )

  // todo @yuleicul drag out of bounding
  private dragCrossEnd = (event: MouseEvent) => {
    console.log('dragCrossEnd')

    this.originalCenter = this.render.page2obj(event)
    event.stopPropagation()
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

export const getDifference = (
  currentDegree: number,
  structRotateDegree: number
) => {
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
