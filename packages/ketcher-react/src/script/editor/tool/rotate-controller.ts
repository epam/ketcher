import { Action, Scale, Vec2 } from 'ketcher-core'
import { throttle } from 'lodash'
import { FloatingToolsPayload } from 'src/script/ui/state/floatingTools'
import { memoizedDebounce } from 'src/script/ui/utils'
import Editor from '../Editor'
import { getGroupIdsFromItemArrays } from './helper/getGroupIdsFromItems'
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
  isRotating!: boolean
  private editor: Editor
  private rotateTool: RotateTool
  private originalCenter!: Vec2
  private normalizedCenterInitialHandleVec!: Vec2
  private handleCenter!: Vec2
  private initialRadius!: number
  private isMovingCenter!: boolean

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
    this.normalizedCenterInitialHandleVec = new Vec2()
    this.handleCenter = new Vec2()
    this.initialRadius = 0
    this.isRotating = false
    this.isMovingCenter = false
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

  private dispatch = memoizedDebounce((payload: FloatingToolsPayload) => {
    const handleCenterOnPage =
      payload.handlePos && this.render.view2Page(payload.handlePos)
    this.editor.event.updateFloatingTools.dispatch({
      visible: payload.visible,
      handlePos: handleCenterOnPage
    })
  })

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
    this.dispatch({
      visible: false
    })

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

  /**
   * Revert rotation by pressing "Escape" key
   */
  revert() {
    if (!this.rotateTool.dragCtx?.action || !this.isRotating) {
      return
    }

    const action: Action = this.rotateTool.dragCtx.action
    action.perform(this.render.ctab)
    this.render.update()
    this.rerender()
  }

  private isPartOfFragmentSelected() {
    const allAtoms = this.render.ctab.molecule.atoms
    const selectedAtomIds = this.editor.selection()?.atoms || []
    const selectedFragmentIdSet = new Set()

    selectedAtomIds.forEach((atomId) => {
      const fragmentId = allAtoms.get(atomId)?.fragment
      selectedFragmentIdSet.add(fragmentId)
    })

    const nonSelectedAtoms = allAtoms.filter(
      (id) => !selectedAtomIds.includes(id)
    )
    return nonSelectedAtoms.some((atom) =>
      selectedFragmentIdSet.has(atom.fragment)
    )
  }

  private show(visibleAtoms: number[]) {
    const enable =
      visibleAtoms.length > 1 && this.editor.tool() instanceof SelectTool
    if (!enable) {
      return
    }

    const rectStartY = this.drawBoundingRect(visibleAtoms)

    this.handleCenter = new Vec2(
      this.center.x,
      rectStartY - STYLE.HANDLE_MARGIN - STYLE.HANDLE_RADIUS
    )
    this.dispatch({
      handlePos: this.handleCenter,
      visible: true
    })

    this.drawLink()
    this.drawCross()
    this.drawHandle()

    this.handle?.hover(this.hoverIn, this.hoverOut)
    this.handle?.mousedown(this.dragStart)
    this.handle?.mouseup(this.dragEnd)
    this.handle?.drag(
      this.dragMove(),
      undefined,
      this.dragEnd // Fix rotation getting stuck when mouseup outside window
    )

    if (this.isPartOfFragmentSelected()) {
      return
    }

    const crossArea = this.cross?.[1]
    crossArea?.hover(this.hoverCrossIn, this.hoverCrossOut)
    crossArea?.mousedown(this.dragCrossStart)
    crossArea?.mouseup(this.dragCrossEnd)
    crossArea?.drag(
      this.dragCrossMove,
      undefined,
      this.dragCrossEndOUtOfBounding
    )
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
          .attr({
            stroke: STYLE.INITIAL_COLOR,
            'stroke-width': 2,
            'stroke-linecap': 'round'
          })
        // HACK: increase hover/drag area
        const circle = this.paper.circle(0, 0, 10).attr({
          fill: 'red',
          opacity: 0
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
      .getVBoxObj({
        atoms: visibleAtoms,
        sgroups: getGroupIdsFromItemArrays(this.render.ctab.molecule, {
          atoms: visibleAtoms
        })
      })!
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

  private drawHandle(state?: HandleState) {
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
        this.handle
          ?.transform('')
          .translate(this.handleCenter.x, this.handleCenter.y)
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
        this.handle.translate(this.handleCenter.x, this.handleCenter.y)
        break
      }
    }
  }

  private drawLink(state?: LinkState) {
    switch (state) {
      case 'long': {
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${this.handleCenter.x},${this.handleCenter.y}`,
          stroke: STYLE.ACTIVE_COLOR
        })
        break
      }

      case 'short': {
        this.link?.attr({
          path:
            `M${this.handleCenter.x},${this.handleCenter.y}` +
            `l0,${STYLE.HANDLE_RADIUS + STYLE.HANDLE_MARGIN}`,
          stroke: STYLE.INITIAL_COLOR
        })
        break
      }

      case 'moveCenter': {
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${this.handleCenter.x},${this.handleCenter.y}`
        })
        break
      }

      case 'moveHandle': {
        this.link?.attr({
          path:
            `M${this.center.x},${this.center.y}` +
            `L${this.handleCenter.x},${this.handleCenter.y}`
        })
        break
      }

      default: {
        this.link = this.paper
          .path(
            `M${this.handleCenter.x},${this.handleCenter.y}` +
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

  private drawProtractor(
    structRotateDegree: number,
    radius: number,
    degreeLine: RaphaelElement,
    textPos: Vec2
  ) {
    this.protractor?.remove()

    const PROTRACTOR_COLOR = '#E1E5EA'
    const DEGREE_FONT_SIZE = 12

    const circle = this.paper
      .circle(this.center.x, this.center.y, radius)
      .attr({
        'stroke-dasharray': '-',
        stroke: PROTRACTOR_COLOR
      })

    this.protractor = this.paper.set() as RaphaelElement
    this.protractor.push(circle)

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

      if (radius < 65) {
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
    }, 0)

    this.protractor.toBack()
  }

  private drawRotateArc(
    structRotateDegree: number,
    radius: number,
    rotateArcStart: Vec2,
    textPos: Vec2
  ) {
    if (!this.rotateArc) {
      const arc = this.paper.path()
      const text = this.paper.text(0, 0, '')

      this.rotateArc = this.paper.set().push(arc, text) as RaphaelElement
    }

    const rotateArcEnd = rotatePoint(
      this.center,
      rotateArcStart,
      (structRotateDegree / 180) * Math.PI
    )

    const arc = this.rotateArc[0]
    const text = this.rotateArc[1]

    const TEXT_FONT_SIZE = 16
    const TEXT_COLOR = '#333333'

    // Doc: https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    arc
      .attr({
        path:
          `M${rotateArcStart.x},${rotateArcStart.y}` +
          `A${radius},${radius} ` +
          `0 0,${structRotateDegree < 0 ? '0' : '1'} ` +
          `${rotateArcEnd.x},${rotateArcEnd.y}`,
        stroke: STYLE.ACTIVE_COLOR
      })
      .toBack()

    text.attr({
      text: `${structRotateDegree}°`,
      x: textPos.x,
      y: textPos.y,
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

  private getProtractorBaseInfo(radius: number) {
    const DEGREE_TEXT_MARGIN = 10

    const distBetweenDegree0TextAndCenter =
      radius +
      STYLE.HANDLE_MARGIN +
      STYLE.HANDLE_RADIUS * 2 +
      DEGREE_TEXT_MARGIN
    const centerDegree0TextVec = this.normalizedCenterInitialHandleVec.scaled(
      distBetweenDegree0TextAndCenter
    )
    const degree0TextPos = this.center.add(centerDegree0TextVec)

    const lineLength =
      radius >= 65 ? STYLE.HANDLE_MARGIN : STYLE.HANDLE_MARGIN / 2
    const centerLineStartVec =
      this.normalizedCenterInitialHandleVec.scaled(radius)
    const lineVec = this.normalizedCenterInitialHandleVec.scaled(lineLength)
    const lineStart = this.center.add(centerLineStartVec)
    const lineEnd = lineStart.add(lineVec)
    const lineEndHalf = lineStart.addScaled(lineVec, 1 / 2)
    const degree0Line = this.paper
      .path(
        `M${lineStart.x},${lineStart.y}` +
          (radius >= 65
            ? `L${lineEnd.x}, ${lineEnd.y}`
            : `L${lineEndHalf.x}, ${lineEndHalf.y}`)
      )
      .attr({
        'stroke-dasharray': '-'
      })

    const arcStartPos = this.center.add(
      this.normalizedCenterInitialHandleVec.scaled(radius)
    )

    const TEXT_MARGIN_LEFT = 20
    const l1 = centerLineStartVec.add(lineVec)
    const l2 = l1
      .rotate(Math.PI / 2)
      .normalized()
      .scaled(TEXT_MARGIN_LEFT)
    const currentDegreeMarkPos = this.center.add(l1).add(l2)

    return [
      degree0Line,
      degree0TextPos,
      arcStartPos,
      currentDegreeMarkPos
    ] as const
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
    this.dispatch({
      visible: false
    })

    this.boundingRect?.remove()
    delete this.boundingRect

    const centerHandleVec = this.handleCenter.sub(this.center)
    this.normalizedCenterInitialHandleVec = centerHandleVec.normalized()

    const newProtractorRadius =
      Vec2.dist(this.handleCenter, this.center) -
      STYLE.HANDLE_MARGIN -
      STYLE.HANDLE_RADIUS
    this.initialRadius = newProtractorRadius >= 0 ? newProtractorRadius : 0
    const [degree0Line, degree0TextPos] = this.getProtractorBaseInfo(
      this.initialRadius
    )
    this.drawProtractor(0, this.initialRadius, degree0Line, degree0TextPos)

    this.drawCross('active')
    this.drawLink('long')
    this.drawHandle('active')

    const originalHandleCenter = this.handleCenter
      .sub(this.render.options.offset)
      .scaled(1 / this.render.options.scale)
    this.rotateTool.mousedown(event, originalHandleCenter, this.originalCenter)
  }

  private dragMove = () => {
    let lastSnappingRadius: number | undefined
    return throttle(
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

        this.handleCenter = this.render
          .page2obj(event)
          .scaled(this.render.options.scale)
          .add(this.render.options.offset)

        this.drawLink('moveHandle')
        this.drawHandle('move')
        this.drawCross('move')

        this.rotateTool.mousemove(event)

        const newProtractorRadius =
          Vec2.dist(this.handleCenter, this.center) -
          STYLE.HANDLE_MARGIN -
          STYLE.HANDLE_RADIUS
        let newRadius = newProtractorRadius >= 0 ? newProtractorRadius : 0
        lastSnappingRadius = lastSnappingRadius ?? this.initialRadius
        if (
          newRadius >= lastSnappingRadius * 1.4 ||
          newRadius <= lastSnappingRadius / 1.4
        ) {
          lastSnappingRadius = newRadius
        } else {
          newRadius = lastSnappingRadius
        }

        const [degree0Line, degree0TextPos, rotateArcStart, textPos] =
          this.getProtractorBaseInfo(newRadius)
        this.drawRotateArc(
          this.rotateTool.dragCtx?.angle || 0,
          newRadius,
          rotateArcStart,
          textPos
        )
        // NOTE: draw protractor last
        this.drawProtractor(
          this.rotateTool.dragCtx?.angle || 0,
          newRadius,
          degree0Line,
          degree0TextPos
        )
      },
      40 // 25fps
    )
  }

  private dragEnd = (event: MouseEvent) => {
    event.stopPropagation() // Avoid triggering SelectTool's mouseup

    this.rotateTool.mouseup()
    this.rerender()
  }

  private hoverCrossIn = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    this.drawCross('active')
    this.drawLink('long')
  }

  private hoverCrossOut = (event: MouseEvent) => {
    const isSomeButtonPressed = event.buttons !== 0
    if (isSomeButtonPressed) {
      return
    }

    this.drawCross('inactive')
    this.drawLink('short')
  }

  private dragCrossStart = (event: MouseEvent) => {
    event.stopPropagation()
    this.isMovingCenter = true
  }

  private dragCrossMove = throttle(
    (
      _dxFromStart: number,
      _dyFromStart: number,
      _clientX: number,
      _clientY: number,
      event: MouseEvent
    ) => {
      if (!this.isMovingCenter) {
        return
      }

      this.originalCenter = this.render.page2obj(event)

      this.drawCross('move')
      this.drawLink('moveCenter')
    },
    40
  )

  private dragCrossEnd = (event: MouseEvent) => {
    event.stopPropagation()

    this.isMovingCenter = false
    this.originalCenter = this.render.page2obj(event)
  }

  private dragCrossEndOUtOfBounding = (_event: MouseEvent) => {
    this.isMovingCenter = false
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
