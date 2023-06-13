/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { RaphaelPaper, Element } from 'raphael'
import { HalfBond, RxnArrowMode, Vec2 } from 'domain/entities'

import Raphael from './raphael-ext'
import svgPath from 'svgpath'
import util from './util'
import { ArrowItem, RelativeBox, RenderOptions } from './render.types'
import { tfx } from 'utilities'

function rectangle(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  return paper.rect(
    tfx(Math.min(points[0].x, points[1].x)),
    tfx(Math.min(points[0].y, points[1].y)),
    tfx(Math.abs(points[1].x - points[0].x)),
    tfx(Math.abs(points[1].y - points[0].y))
  )
}

function rectangleArrowHighlightAndSelection(
  _paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  length: number,
  angle: number
) {
  const endX = start.x + length
  const [wOffset, hOffset] = [5, height || 8]

  const path =
    `M${tfx(start.x - wOffset)},${tfx(start.y)}` +
    `L${tfx(start.x - wOffset)},${tfx(start.y - hOffset)}` +
    `L${tfx(endX + wOffset)},${tfx(start.y - hOffset)}` +
    `L${tfx(endX + wOffset)},${tfx(start.y + (!height ? hOffset : 0))}` +
    `L${tfx(start.x - wOffset)},${tfx(start.y + (!height ? hOffset : 0))}Z`

  return svgPath(path).rotate(angle, start.x, start.y).toString()
}

function ellipse(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  const rad = Vec2.diff(points[1], points[0])
  const rx = rad.x / 2
  const ry = rad.y / 2
  return paper.ellipse(
    points[0].x + rx,
    points[0].y + ry,
    Math.abs(rx),
    Math.abs(ry)
  )
}

function polyline(paper: RaphaelPaper, points: Vec2[]) {
  const path = ['M', points[0].x, points[0].y]
  for (let i = 1; i < points.length; i++)
    path.push('L', points[i].x, points[i].y)
  return paper.path(path)
}

function line(paper: RaphaelPaper, points: [Vec2, Vec2]) {
  const path = ['M', points[0].x, points[0].y]
  path.push('L', points[1].x, points[1].y)
  return paper.path(path)
}

function arrow(
  paper: RaphaelPaper,
  item: ArrowItem,
  length: number,
  angle: number,
  options: RenderOptions
) {
  switch (item.mode) {
    case RxnArrowMode.OpenAngle: {
      return arrowOpenAngle(paper, item, length, angle, options)
    }
    case RxnArrowMode.FilledTriangle: {
      return arrowFilledTriangle(paper, item, length, angle, options)
    }
    case RxnArrowMode.FilledBow: {
      return arrowFilledBow(paper, item, length, angle, options)
    }
    case RxnArrowMode.DashedOpenAngle: {
      return arrowDashedOpenAngle(paper, item, length, angle, options)
    }
    case RxnArrowMode.Failed: {
      return arrowFailed(paper, item, length, angle, options)
    }
    case RxnArrowMode.BothEndsFilledTriangle: {
      return arrowBothEndsFilledTriangle(paper, item, length, angle, options)
    }
    case RxnArrowMode.EquilibriumFilledHalfBow: {
      return arrowEquilibriumFilledHalfBow(paper, item, length, angle, options)
    }
    case RxnArrowMode.EquilibriumFilledTriangle: {
      return arrowEquilibriumFilledTriangle(paper, item, length, angle, options)
    }
    case RxnArrowMode.EquilibriumOpenAngle: {
      return arrowEquilibriumOpenAngle(paper, item, length, angle, options)
    }
    case RxnArrowMode.UnbalancedEquilibriumFilledHalfBow: {
      return arrowUnbalancedEquilibriumFilledHalfBow(
        paper,
        item,
        length,
        angle,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle: {
      return arrowUnbalancedEquilibriumOpenHalfAngle(
        paper,
        item,
        length,
        angle,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow: {
      return arrowUnbalancedEquilibriumLargeFilledHalfBow(
        paper,
        item,
        length,
        angle,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle: {
      return arrowUnbalancedEquilibriumFilledHalfTriangle(
        paper,
        item,
        length,
        angle,
        options
      )
    }
    case RxnArrowMode.EllipticalArcFilledBow: {
      return arrowEllipticalArcFilledBow(paper, item, length, angle, options)
    }
    case RxnArrowMode.EllipticalArcFilledTriangle: {
      return arrowEllipticalArcFilledTriangle(
        paper,
        item,
        length,
        angle,
        options
      )
    }
    case RxnArrowMode.EllipticalArcOpenAngle: {
      return arrowEllipticalArcOpenAngle(paper, item, length, angle, options)
    }
    case RxnArrowMode.EllipticalArcOpenHalfAngle: {
      return arrowEllipticalArcOpenHalfAngle(
        paper,
        item,
        length,
        angle,
        options
      )
    }
  }
}

function arrowEllipticalArcFilledBow(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const direction = height >= 0 ? 1 : -1
  const arrowHeadLength = direction * 10
  const arrowHeadWidth = direction * 5
  const arrowHeadAttr = direction * 4

  const endX = start.x + arrowLength
  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX
    )},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadWidth)},${tfx(start.y - arrowHeadLength)}` +
    `l${tfx(arrowHeadWidth)},${tfx(arrowHeadAttr)}` +
    `l${tfx(arrowHeadWidth)},${tfx(-arrowHeadAttr)}` +
    `l${tfx(-arrowHeadWidth)},${arrowHeadLength}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr })
}

function arrowEllipticalArcFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const direction = height >= 0 ? 1 : -1
  const triangleLength = direction * 10
  const triangleWidth = direction * 5

  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX
    )},${tfx(start.y)}` +
    `L${tfx(endX - triangleWidth)},${tfx(start.y - triangleLength)}` +
    `l${tfx(triangleLength)},${tfx(0)}` +
    `l${tfx(-triangleWidth)},${tfx(triangleLength)}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr })
}

function arrowEllipticalArcOpenAngle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const direction = height >= 0 ? 1 : -1
  const width = direction * 5
  const length = direction * 7
  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0},${tfx(
      endX
    )},${tfx(start.y)}` +
    `L${tfx(endX - width)},${tfx(start.y - length)}` +
    `M${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX + width)}, ${tfx(start.y - length)}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowEllipticalArcOpenHalfAngle(
  paper: RaphaelPaper,
  { pos: [start], height }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const direction = height >= 0 ? 1 : -1
  const width = direction * 5
  const length = direction * 7
  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0}, ${tfx(
      endX
    )},${tfx(start.y)}` +
    `L${tfx(endX + width)}, ${tfx(start.y - length)}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const width = 5
  const length = 7

  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - length)},${tfx(start.y - width)}` +
    `M${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - length)}, ${tfx(start.y + width)}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const triangleLength = 10
  const triangleWidth = 5

  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - triangleLength)},${tfx(start.y + triangleWidth)}` +
    `L${tfx(endX - triangleLength)},${tfx(start.y - triangleWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}Z`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowFilledBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowHeadLength = 10
  const arrowHeadWidth = 5
  const arrowHeadAttr = 4

  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
    `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(start.y)}` +
    `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}Z`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowDashedOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const triangleLength = 10
  const triangleWidth = 5
  const dashInterval = 3.5

  const path: string[] = []

  const endX = start.x + arrowLength

  // Dashed arrow
  for (let i = 0; i < arrowLength / dashInterval; i++) {
    if (i % 2) {
      path.push(`L${tfx(start.x + i * dashInterval)},${tfx(start.y)}`)
    } else {
      path.push(`M${tfx(start.x + i * dashInterval)},${tfx(start.y)}`)
    }
  }

  // Arrowhead
  path.push(
    `M${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - triangleLength)},${tfx(start.y + triangleWidth)}` +
      `M${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - triangleLength)},${tfx(start.y - triangleWidth)}`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowFailed(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowHeadLength = 10
  const arrowHeadWidth = 5
  const arrowHeadAttr = 4
  const failSignWidth = 8

  const endX = start.x + arrowLength

  const arrowCenter = endX - (endX - start.x) / 2

  const path: string[] = []

  // Arrow with arrowhead
  path.push(
    `M${tfx(start.x)},${tfx(start.y)}` +
      `L${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
      `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
      `L${tfx(endX)},${tfx(start.y)}Z`
  )

  // Failed sign line 1
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y + failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y - failSignWidth)}`
  )

  // Failed sign line 2
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y - failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y + failSignWidth)}`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowBothEndsFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const triangleLength = 10
  const triangleWidth = 5

  const endX = start.x + arrowLength

  const path =
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `L${tfx(endX - triangleLength)},${tfx(start.y + triangleWidth)}` +
    `L${tfx(endX - triangleLength)},${tfx(start.y - triangleWidth)}` +
    `L${tfx(endX)},${tfx(start.y)}` +
    `M${tfx(start.x)},${tfx(start.y)}` +
    `L${tfx(start.x + triangleLength)},${tfx(start.y - triangleWidth)}` +
    `L${tfx(start.x + triangleLength)},${tfx(start.y + triangleWidth)}` +
    `L${tfx(start.x)},${tfx(start.y)}`

  const transformedPath = svgPath(path)
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowLen = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const arrowHeadAttr = 2

  const endX = start.x + arrowLength

  const path: string[] = []

  // Arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowLen + arrowHeadAttr)},${tfx(start.y - lineOffset)}Z`
  )

  // Arrowhead
  path.push(
    `M${tfx(endX)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowLen - arrowHeadAttr)},${start.y + lineOffset}Z`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumFilledTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowLen = 9
  const lineOffset = 3.5
  const arrowOffset = 7

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}Z`
  )

  // Second arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen)},${tfx(start.y + arrowOffset)}` +
      `L${tfx(start.x + arrowLen)},${start.y + lineOffset}Z` +
      `L${tfx(start.x + arrowLen)},${tfx(start.y)}` +
      `L${tfx(start.x + arrowLen)},${start.y + lineOffset}Z`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumOpenAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const width = 5
  const length = 7
  const arrowLen = 9
  const lineOffset = 3.5

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - length)},${tfx(start.y - width - lineOffset)}`
  )

  // Second arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen)},${tfx(start.y + lineOffset + width)}`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowUnbalancedEquilibriumFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowLen = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const arrowHeadAttr = 2
  const unbalanceVal = 15

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowLen + arrowHeadAttr)},${tfx(start.y - lineOffset)}Z`
  )

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen + unbalanceVal)},${tfx(
        start.y + arrowOffset
      )}` +
      `L${tfx(start.x + arrowLen - arrowHeadAttr + unbalanceVal)},${
        start.y + lineOffset
      }Z`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowUnbalancedEquilibriumOpenHalfAngle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const width = 5
  const length = 7
  const arrowLen = 9
  const lineOffset = 3.5
  const unbalanceVal = 15

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - length)},${tfx(start.y - width - lineOffset)}`
  )

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen + unbalanceVal)},${tfx(
        start.y + lineOffset + width
      )}`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowUnbalancedEquilibriumLargeFilledHalfBow(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowLen = 9
  const lineOffset = 3.5
  const arrowOffset = 10
  const arrowHeadAttr = 2
  const unbalanceVal = 15

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowLen + arrowHeadAttr)},${tfx(start.y - lineOffset)}Z`
  )

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen + unbalanceVal)},${tfx(
        start.y + arrowOffset
      )}` +
      `L${tfx(start.x + arrowLen - arrowHeadAttr + unbalanceVal)},${
        start.y + lineOffset
      }Z`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowUnbalancedEquilibriumFilledHalfTriangle(
  paper: RaphaelPaper,
  { pos: [start] }: ArrowItem,
  arrowLength: number,
  arrowAngle: number,
  options: RenderOptions
) {
  const arrowLen = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const unbalanceVal = 15

  const endX = start.x + arrowLength

  const path: string[] = []

  // First arrow
  path.push(
    `M${tfx(start.x)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX)},${tfx(start.y - lineOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - arrowOffset)}` +
      `L${tfx(endX - arrowLen)},${tfx(start.y - lineOffset)}Z`
  )

  // Second (Unbalanced) arrow
  path.push(
    `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(endX - unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + lineOffset)}` +
      `L${tfx(start.x + arrowLen + unbalanceVal)},${tfx(
        start.y + arrowOffset
      )}` +
      `L${tfx(start.x + arrowLen + unbalanceVal)},${start.y + lineOffset}Z`
  )

  const transformedPath = svgPath(path.join(''))
    .rotate(arrowAngle, start.x, start.y)
    .toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function plus(paper: RaphaelPaper, point: Vec2, options: RenderOptions) {
  const s = options.scale / 5
  return paper
    .path(
      'M{0},{4}L{0},{5}M{2},{1}L{3},{1}',
      tfx(point.x),
      tfx(point.y),
      tfx(point.x - s),
      tfx(point.x + s),
      tfx(point.y - s),
      tfx(point.y + s)
    )
    .attr(options.lineattr)
}

function bondSingle(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  color = '#000'
) {
  const a = halfBond1.p
  const b = halfBond2.p
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  })
}

function bondSingleUp(
  paper: RaphaelPaper,
  a: Vec2,
  b2: Vec2,
  b3: Vec2,
  options: RenderOptions,
  color = '#000'
) {
  // eslint-disable-line max-params
  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}Z',
      tfx(a.x),
      tfx(a.y),
      tfx(b2.x),
      tfx(b2.y),
      tfx(b3.x),
      tfx(b3.y)
    )
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color
    })
}

function bondSingleStereoBold(
  paper: RaphaelPaper,
  a1: Vec2,
  a2: Vec2,
  a3: Vec2,
  a4: Vec2,
  options: RenderOptions,
  color = '#000'
) {
  // eslint-disable-line max-params
  const bond = paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z',
      tfx(a1.x),
      tfx(a1.y),
      tfx(a2.x),
      tfx(a2.y),
      tfx(a3.x),
      tfx(a3.y),
      tfx(a4.x),
      tfx(a4.y)
    )
    .attr(options.lineattr)
  bond.attr({
    stroke: color,
    fill: color
  })
  return bond
}

function bondDoubleStereoBold(
  paper: RaphaelPaper,
  sgBondPath: Element,
  b1: Vec2,
  b2: Vec2,
  options: RenderOptions,
  color = '#000'
) {
  // eslint-disable-line max-params
  return paper.set([
    sgBondPath,
    paper
      .path('M{0},{1}L{2},{3}', tfx(b1.x), tfx(b1.y), tfx(b2.x), tfx(b2.y))
      .attr(options.lineattr)
      .attr({
        stroke: color,
        fill: color
      })
  ])
}

function bondSingleDown(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  d: Vec2,
  nlines: number,
  step: number,
  options: RenderOptions,
  color = '#000'
) {
  // eslint-disable-line max-params
  const a = halfBond1.p
  const n = halfBond1.norm
  const bsp = 0.7 * options.stereoBond

  let path = ''
  let p
  let q
  let r
  for (let i = 0; i < nlines; ++i) {
    r = a.addScaled(d, step * i)
    p = r.addScaled(n, (bsp * (i + 0.5)) / (nlines - 0.5))
    q = r.addScaled(n, (-bsp * (i + 0.5)) / (nlines - 0.5))
    path += makeStroke(p, q)
  }
  return paper.path(path).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  })
}

function bondSingleEither(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  d: Vec2,
  nlines: number,
  step: number,
  options: RenderOptions,
  color = '#000'
) {
  // eslint-disable-line max-params
  const a = halfBond1.p
  const n = halfBond1.norm
  const bsp = 0.7 * options.stereoBond

  let path = 'M' + tfx(a.x) + ',' + tfx(a.y)
  let r = a
  for (let i = 0; i < nlines; ++i) {
    r = a
      .addScaled(d, step * (i + 0.5))
      .addScaled(n, ((i & 1 ? -1 : +1) * bsp * (i + 0.5)) / (nlines - 0.5))
    path += 'L' + tfx(r.x) + ',' + tfx(r.y)
  }
  return paper.path(path).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  })
}

function bondDouble(
  paper: RaphaelPaper,
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  cisTrans: boolean,
  options: RenderOptions
) {
  // eslint-disable-line max-params
  return paper
    .path(
      cisTrans
        ? 'M{0},{1}L{6},{7}M{4},{5}L{2},{3}'
        : 'M{0},{1}L{2},{3}M{4},{5}L{6},{7}',
      tfx(a1.x),
      tfx(a1.y),
      tfx(b1.x),
      tfx(b1.y),
      tfx(a2.x),
      tfx(a2.y),
      tfx(b2.x),
      tfx(b2.y)
    )
    .attr(options.lineattr)
}

function bondSingleOrDouble(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  nSect: number,
  options: RenderOptions
) {
  // eslint-disable-line max-statements, max-params
  const a = halfBond1.p
  const b = halfBond2.p
  const n = halfBond1.norm
  const bsp = options.bondSpace / 2

  let path = ''
  let pi
  let pp = a
  for (let i = 1; i <= nSect; ++i) {
    pi = Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect)
    if (i & 1) {
      path += makeStroke(pp, pi)
    } else {
      path += makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp))
      path += makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp))
    }
    pp = pi
  }
  return paper.path(path).attr(options.lineattr)
}

function bondTriple(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions,
  color = '#000'
) {
  const a = halfBond1.p
  const b = halfBond2.p
  const n = halfBond1.norm
  const a2 = a.addScaled(n, options.bondSpace)
  const b2 = b.addScaled(n, options.bondSpace)
  const a3 = a.addScaled(n, -options.bondSpace)
  const b3 = b.addScaled(n, -options.bondSpace)
  return paper
    .path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3))
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color
    })
}

function bondAromatic(
  paper: RaphaelPaper,
  paths: string[],
  bondShift: number,
  options: RenderOptions
) {
  const l1 = paper.path(paths[0]).attr(options.lineattr)
  const l2 = paper.path(paths[1]).attr(options.lineattr)
  if (bondShift !== undefined && bondShift !== null) {
    ;(bondShift > 0 ? l1 : l2).attr({ 'stroke-dasharray': '- ' })
  }

  return paper.set([l1, l2])
}

function bondAny(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions
) {
  const a = halfBond1.p
  const b = halfBond2.p
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'stroke-dasharray': '- ' })
}

function bondHydrogen(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions
) {
  const a = halfBond1.p
  const b = halfBond2.p
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    'stroke-dasharray': '.',
    'stroke-linecap': 'square'
  })
}

function bondDative(
  paper: RaphaelPaper,
  halfBond1: HalfBond,
  halfBond2: HalfBond,
  options: RenderOptions
) {
  const a = halfBond1.p
  const b = halfBond2.p
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'arrow-end': 'block-midium-long' })
}

function reactingCenter(
  paper: RaphaelPaper,
  points: Vec2[],
  options: RenderOptions
) {
  let pathDesc = ''
  for (let i = 0; i < points.length / 2; ++i) {
    pathDesc += makeStroke(points[2 * i], points[2 * i + 1])
  }
  return paper.path(pathDesc).attr(options.lineattr)
}

function topologyMark(
  paper: RaphaelPaper,
  point: Vec2,
  mark: string | null,
  options: RenderOptions
) {
  const path = paper.text(point.x, point.y, mark).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: '#000'
  })
  const rbb = util.relBox(path.getBBox())
  recenterText(path, rbb)
  return path
}

function radicalCap(paper: RaphaelPaper, point1: Vec2, options: RenderOptions) {
  const s = options.lineWidth * 0.9
  const dw = s
  const dh = 2 * s
  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}',
      tfx(point1.x - dw),
      tfx(point1.y + dh),
      tfx(point1.x),
      tfx(point1.y),
      tfx(point1.x + dw),
      tfx(point1.y + dh)
    )
    .attr({
      stroke: '#000',
      'stroke-width': options.lineWidth * 0.7,
      'stroke-linecap': 'square',
      'stroke-linejoin': 'miter'
    })
}

function radicalBullet(
  paper: RaphaelPaper,
  point1: Vec2,
  options: RenderOptions
) {
  return paper.circle(tfx(point1.x), tfx(point1.y), options.lineWidth).attr({
    stroke: null,
    fill: '#000'
  })
}

function bracket(
  paper: RaphaelPaper,
  d: Vec2,
  n: Vec2,
  c: Vec2,
  bracketWidth: number,
  bracketHeight: number,
  options: RenderOptions
) {
  // eslint-disable-line max-params
  bracketWidth = bracketWidth || 0.25
  bracketHeight = bracketHeight || 1.0
  const a0 = c.addScaled(n, -0.5 * bracketHeight)
  const a1 = c.addScaled(n, 0.5 * bracketHeight)
  const b0 = a0.addScaled(d, -bracketWidth)
  const b1 = a1.addScaled(d, -bracketWidth)

  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}L{6},{7}',
      tfx(b0.x),
      tfx(b0.y),
      tfx(a0.x),
      tfx(a0.y),
      tfx(a1.x),
      tfx(a1.y),
      tfx(b1.x),
      tfx(b1.y)
    )
    .attr(options.sgroupBracketStyle)
}

function selectionRectangle(
  paper: RaphaelPaper,
  point1: Vec2,
  point2: Vec2,
  options: RenderOptions
) {
  return paper
    .rect(
      tfx(Math.min(point1.x, point2.x)),
      tfx(Math.min(point1.y, point2.y)),
      tfx(Math.abs(point2.x - point1.x)),
      tfx(Math.abs(point2.y - point1.y))
    )
    .attr(options.lassoStyle)
}

function selectionPolygon(
  paper: RaphaelPaper,
  r: Vec2[],
  options: RenderOptions
) {
  const v = r[r.length - 1]
  let pstr = 'M' + tfx(v.x) + ',' + tfx(v.y)
  for (let i = 0; i < r.length; ++i) {
    pstr += 'L' + tfx(r[i].x) + ',' + tfx(r[i].y)
  }
  return paper.path(pstr).attr(options.lassoStyle)
}

function selectionLine(
  paper: RaphaelPaper,
  point1: Vec2,
  point2: Vec2,
  options: RenderOptions
) {
  return paper.path(makeStroke(point1, point2)).attr(options.lassoStyle)
}

function makeStroke(point1: Vec2, point2: Vec2) {
  return (
    'M' +
    tfx(point1.x) +
    ',' +
    tfx(point1.y) +
    'L' +
    tfx(point2.x) +
    ',' +
    tfx(point2.y) +
    '	'
  )
}

function dashedPath(point1: Vec2, point2: Vec2, dash: number[]) {
  let t0 = 0
  const t1 = Vec2.dist(point1, point2)
  const d = Vec2.diff(point2, point1).normalized()
  let black = true
  let path = ''
  let i = 0

  while (t0 < t1) {
    const len = dash[i % dash.length]
    const t2 = t0 + Math.min(len, t1 - t0)
    if (black) {
      path +=
        'M ' +
        point1.addScaled(d, t0).coordStr() +
        ' L ' +
        point1.addScaled(d, t2).coordStr()
    }
    t0 += len
    black = !black
    i++
  }
  return path
}

function aromaticBondPaths(
  a2: Vec2,
  a3: Vec2,
  b2: Vec2,
  b3: Vec2,
  mask: number,
  dash: number[] | null
) {
  // eslint-disable-line max-params
  const l1 = dash && mask & 1 ? dashedPath(a2, b2, dash) : makeStroke(a2, b2)
  const l2 = dash && mask & 2 ? dashedPath(a3, b3, dash) : makeStroke(a3, b3)

  return [l1, l2]
}

function recenterText(path: Element, relativeBox: RelativeBox) {
  // TODO: find a better way
  if (Raphael.vml) {
    const gap = relativeBox.height * 0.16
    path.translateAbs(0, gap)
    relativeBox.y += gap
  }
}

export default {
  recenterText,
  arrow,
  plus,
  aromaticBondPaths,
  bondSingle,
  bondSingleUp,
  bondSingleStereoBold,
  bondDoubleStereoBold,
  bondSingleDown,
  bondSingleEither,
  bondDouble,
  bondSingleOrDouble,
  bondTriple,
  bondAromatic,
  bondAny,
  bondHydrogen,
  bondDative,
  reactingCenter,
  topologyMark,
  radicalCap,
  radicalBullet,
  bracket,
  selectionRectangle,
  selectionPolygon,
  selectionLine,
  ellipse,
  rectangle,
  rectangleArrowHighlightAndSelection,
  polyline,
  line
}
