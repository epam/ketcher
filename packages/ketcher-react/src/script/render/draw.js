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

import { RxnArrowMode, Vec2 } from 'ketcher-core'

import Raphael from '../raphael-ext'
import svgPath from 'svgpath'
import { useWith } from 'lodash/fp'
import util from './util'

const tfx = util.tfx

function rectangle(paper, pos, options) {
  return paper.rect(
    tfx(Math.min(pos[0].x, pos[1].x)),
    tfx(Math.min(pos[0].y, pos[1].y)),
    tfx(Math.abs(pos[1].x - pos[0].x)),
    tfx(Math.abs(pos[1].y - pos[0].y))
  )
}

function rectangleWithAngle(paper, a, b, length, angle, options) {
  const wOffset = 5
  const hOffset = 8

  const b0x = a.x + length

  const path =
    `M${tfx(a.x - wOffset)},${tfx(a.y)}` +
    `L${tfx(a.x - wOffset)},${tfx(a.y + hOffset)}` +
    `L${tfx(b0x + wOffset)},${tfx(a.y + hOffset)}` +
    `L${tfx(b0x + wOffset)},${tfx(a.y - hOffset)}` +
    `L${tfx(a.x - wOffset)},${tfx(a.y - hOffset)}Z`

  const transformedPath = svgPath(path).rotate(angle, a.x, a.y).toString()

  return transformedPath
}

function ellipse(paper, pos, options) {
  const rad = Vec2.diff(pos[1], pos[0])
  const rx = rad.x / 2
  const ry = rad.y / 2
  return paper.ellipse(pos[0].x + rx, pos[0].y + ry, Math.abs(rx), Math.abs(ry))
}

function polyline(paper, pos, options) {
  let path = ['M', pos[0].x, pos[0].y]
  for (let i = 1; i < pos.length; i++) path.push('L', pos[i].x, pos[i].y)
  return paper.path(path)
}

function line(paper, pos, options) {
  let path = ['M', pos[0].x, pos[0].y]
  path.push('L', pos[1].x, pos[1].y)
  return paper.path(path)
}

function arrow(paper, startPoint, endPoint, length, angle, options, type) {
  switch (type) {
    case RxnArrowMode.OpenAngle: {
      return arrowOpenAngle(paper, startPoint, endPoint, length, angle, options)
    }
    case RxnArrowMode.FilledTriangle: {
      return arrowFilledTriangle(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.FilledBow: {
      return arrowFilledBow(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.DashedOpenAngle: {
      return arrowDashedOpenAngle(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.Failed: {
      return arrowFailed(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.BothEndsFilledTriangle: {
      return arrowBothEndsFilledTriangle(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.EquilibriumFilledHalfBow: {
      return arrowEquilibriumFilledHalfBow(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.EquilibriumFilledTriangle: {
      return arrowEquilibriumFilledTriangle(
        paper,
        startPoint,
        endPoint,
        options
      )
    }
    case RxnArrowMode.EquilibriumOpenAngle: {
      return arrowEquilibriumOpenAngle(paper, startPoint, endPoint, options)
    }
    case RxnArrowMode.UnbalancedEquilibriumFilledHalfBow: {
      return arrowUnbalancedEquilibriumFilledHalfBow(
        paper,
        startPoint,
        endPoint,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle: {
      return arrowUnbalancedEquilibriumOpenHalfAngle(
        paper,
        startPoint,
        endPoint,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow: {
      return arrowUnbalancedEquilibriumLargeFilledHalfBow(
        paper,
        startPoint,
        endPoint,
        options
      )
    }
    case RxnArrowMode.UnbalancedEquilibriumFilleHalfTriangle: {
      return arrowUnbalancedEquilibriumFilleHalfTriangle(
        paper,
        startPoint,
        endPoint,
        options
      )
    }
  }
}

function arrowOpenAngle(paper, a, b, arrowLength, arrowAngle, options) {
  const width = 5
  const length = 7

  const b0x = a.x + arrowLength

  const path =
    `M${tfx(a.x)},${tfx(a.y)}` +
    `L${tfx(b0x)},${tfx(a.y)}` +
    `L${tfx(b0x - length)},${tfx(a.y - width)}` +
    `M${tfx(b0x)},${tfx(a.y)}` +
    `L${tfx(b0x - length)}, ${tfx(a.y + width)}`

  const transformedPath = svgPath(path).rotate(arrowAngle, a.x, a.y).toString()

  return paper.path(transformedPath).attr(options.lineattr)
}

function arrowFilledTriangle(paper, a, b, options) {
  const triangleLength = 10
  const triangleWidth = 5
  return paper
    .path(
      `M${tfx(a.x)},${tfx(a.y)}` +
        `L${tfx(b.x)},${tfx(b.y)}` +
        `L${tfx(b.x - triangleLength)},${tfx(b.y + triangleWidth)}` +
        `L${tfx(b.x - triangleLength)},${tfx(a.y - triangleWidth)}` +
        `L${tfx(b.x)},${tfx(a.y)}Z`
    )
    .attr({ ...options.lineattr, fill: '#000' })
}

function arrowFilledBow(paper, a, b, options) {
  const bowLength = 10
  const bowWidth = 5
  const bowAttr = 4
  return paper
    .path(
      `M${tfx(a.x)},${tfx(a.y)}` +
        `L${tfx(b.x)},${tfx(b.y)}` +
        `L${tfx(b.x - bowLength)},${tfx(b.y + bowWidth)}` +
        `L${tfx(b.x - bowLength + bowAttr)},${tfx(b.y)}` +
        `L${tfx(b.x - bowLength)},${tfx(a.y - bowWidth)}` +
        `L${tfx(b.x)},${tfx(a.y)}Z`
    )
    .attr({ ...options.lineattr, fill: '#000' })
}

function arrowDashedOpenAngle(paper, a, b, options) {
  const triangleLength = 10
  const triangleWidth = 5
  const dashSpace = 5

  const path = []

  //? refactor needed
  path.push(
    `M${tfx(a.x)},${tfx(a.y)}` +
      `L${tfx(a.x + 1 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 2 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 3 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 4 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 5 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 6 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 7 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 8 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 9 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 10 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 11 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 12 * dashSpace)},${tfx(a.y)}` +
      `L${tfx(a.x + 13 * dashSpace)},${tfx(a.y)}` +
      `M${tfx(a.x + 14 * dashSpace)},${tfx(a.y)}`
  )
  path.push(
    `M${tfx(b.x)},${tfx(b.y)}` +
      `L${tfx(b.x - triangleLength)},${tfx(b.y + triangleWidth)}` +
      `M${tfx(b.x)},${tfx(b.y)}` +
      `L${tfx(b.x - triangleLength)},${tfx(a.y - triangleWidth)}`
  )

  const transformedPath = svgPath(path.join('')).rotate(45, a.x, a.y).toString()

  return paper.path(transformedPath).attr({ ...options.lineattr, fill: '#000' })
}

function arrowFailed(paper, a, b, options) {
  const bowLength = 10
  const bowWidth = 5
  const bowAttr = 4
  const failSignWidth = 10
  const arrowCenter = b.x - (b.x - a.x) / 2

  const path = []

  path.push(
    `M${tfx(a.x)},${tfx(a.y)}` +
      `L${tfx(b.x)},${tfx(b.y)}` +
      `L${tfx(b.x - bowLength)},${tfx(b.y + bowWidth)}` +
      `L${tfx(b.x - bowLength + bowAttr)},${tfx(b.y)}` +
      `L${tfx(b.x - bowLength)},${tfx(a.y - bowWidth)}` +
      `L${tfx(b.x)},${tfx(a.y)}Z`
  )
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(a.y + failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(a.y - failSignWidth)}`
  )
  path.push(
    `M${tfx(arrowCenter + failSignWidth)},${tfx(a.y - failSignWidth)}` +
      `L${tfx(arrowCenter - failSignWidth)},${tfx(a.y + failSignWidth)}`
  )
  return paper.path(path).attr(options.lineattr)
}

function arrowBothEndsFilledTriangle(paper, a, b, options) {
  const triangleLength = 10
  const triangleWidth = 5
  return paper
    .path(
      `M${tfx(a.x)},${tfx(a.y)}` +
        `L${tfx(b.x)},${tfx(b.y)}` +
        `L${tfx(b.x - triangleLength)},${tfx(b.y + triangleWidth)}` +
        `L${tfx(b.x - triangleLength)},${tfx(a.y - triangleWidth)}` +
        `L${tfx(b.x)},${tfx(a.y)}` +
        `M${tfx(a.x)},${tfx(a.y)}` +
        `L${tfx(a.x + triangleLength)},${tfx(a.y - triangleWidth)}` +
        `L${tfx(a.x + triangleLength)},${tfx(a.y + triangleWidth)}` +
        `L${tfx(a.x)},${tfx(a.y)}`
    )
    .attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumFilledHalfBow(paper, a, b, options) {
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const bowAttr = 2

  const path = []
  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y - arrowOffset)}` +
      `L${tfx(b.x - arrowLength + bowAttr)},${tfx(a.y - lineOffset)}Z`
  )
  path.push(
    `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength)},${tfx(a.y + arrowOffset)}` +
      `L${tfx(a.x + arrowLength - bowAttr)},${a.y + lineOffset}Z`
  )
  return paper.path(path).attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumFilledTriangle(paper, a, b, options) {
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7

  const path = []
  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y - arrowOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y)}` +
      `L${tfx(b.x)},${tfx(a.y - lineOffset)}Z`
  )
  path.push(
    `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength)},${tfx(a.y + arrowOffset)}` +
      `L${tfx(a.x + arrowLength)},${a.y + lineOffset}Z` +
      `L${tfx(a.x + arrowLength)},${tfx(a.y)}` +
      `L${tfx(a.x + arrowLength)},${a.y + lineOffset}Z`
  )
  return paper.path(path).attr({ ...options.lineattr, fill: '#000' })
}

function arrowEquilibriumOpenAngle(paper, a, b, options) {
  const width = 5
  const length = 7
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7

  const path = []

  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - length)},${tfx(b.y - width - lineOffset)}`
  )

  path.push(
    `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength)},${tfx(b.y + lineOffset + width)}`
  )

  return paper.path(path).attr(options.lineattr)
}

function arrowUnbalancedEquilibriumFilledHalfBow(paper, a, b, options) {
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const bowAttr = 2
  const unbalanceVal = 15

  const path = []
  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y - arrowOffset)}` +
      `L${tfx(b.x - arrowLength + bowAttr)},${tfx(a.y - lineOffset)}Z`
  )
  path.push(
    `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x - unbalanceVal)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength + unbalanceVal)},${tfx(a.y + arrowOffset)}` +
      `L${tfx(a.x + arrowLength - bowAttr + unbalanceVal)},${a.y + lineOffset}Z`
  )
  return paper.path(path).attr({ ...options.lineattr, fill: '#000' })
}

function arrowUnbalancedEquilibriumOpenHalfAngle(paper, a, b, options) {
  const width = 5
  const length = 7
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const unbalanceVal = 15

  const path = []

  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - length)},${tfx(b.y - width - lineOffset)}`
  )

  path.push(
    `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x - unbalanceVal)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength + unbalanceVal)},${tfx(
        b.y + lineOffset + width
      )}`
  )

  return paper.path(path).attr(options.lineattr)
}

function arrowUnbalancedEquilibriumLargeFilledHalfBow(paper, a, b, options) {
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const bowAttr = 2
  const unbalanceVal = 15

  const path = []
  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y - arrowOffset)}` +
      `L${tfx(b.x - arrowLength + bowAttr)},${tfx(a.y - lineOffset)}Z`
  )
  path.push(
    `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x - unbalanceVal)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength + unbalanceVal)},${tfx(a.y + arrowOffset)}` +
      `L${tfx(a.x + arrowLength - bowAttr + unbalanceVal)},${a.y + lineOffset}Z`
  )
  return paper.path(path).attr({ ...options.lineattr, fill: '#000' })
}

function arrowUnbalancedEquilibriumFilleHalfTriangle(paper, a, b, options) {
  const arrowLength = 9
  const lineOffset = 3.5
  const arrowOffset = 7
  const unbalanceVal = 15

  const path = []
  path.push(
    `M${tfx(a.x)},${tfx(a.y - lineOffset)}` +
      `L${tfx(b.x)},${tfx(b.y - lineOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(b.y - arrowOffset)}` +
      `L${tfx(b.x - arrowLength)},${tfx(a.y - lineOffset)}Z`
  )
  path.push(
    `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(b.x - unbalanceVal)},${tfx(b.y + lineOffset)}` +
      `M${tfx(a.x + unbalanceVal)},${tfx(a.y + lineOffset)}` +
      `L${tfx(a.x + arrowLength + unbalanceVal)},${tfx(a.y + arrowOffset)}` +
      `L${tfx(a.x + arrowLength + unbalanceVal)},${a.y + lineOffset}Z`
  )
  return paper.path(path).attr({ ...options.lineattr, fill: '#000' })
}

function plus(paper, c, options) {
  var s = options.scale / 5
  return paper
    .path(
      'M{0},{4}L{0},{5}M{2},{1}L{3},{1}',
      tfx(c.x),
      tfx(c.y),
      tfx(c.x - s),
      tfx(c.x + s),
      tfx(c.y - s),
      tfx(c.y + s)
    )
    .attr(options.lineattr)
}

function bondSingle(paper, hb1, hb2, options, color = '#000') {
  var a = hb1.p,
    b = hb2.p
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    fill: color,
    stroke: color
  })
}

function bondSingleUp(paper, a, b2, b3, options, color = '#000') {
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

function bondSingleStereoBold(paper, a1, a2, a3, a4, options, color = '#000') {
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
  paper,
  sgBondPath,
  b1,
  b2,
  options,
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

function bondSingleDown(paper, hb1, d, nlines, step, options, color = '#000') {
  // eslint-disable-line max-params
  var a = hb1.p,
    n = hb1.norm
  var bsp = 0.7 * options.stereoBond

  var path = '',
    p,
    q,
    r
  for (var i = 0; i < nlines; ++i) {
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
  paper,
  hb1,
  d,
  nlines,
  step,
  options,
  color = '#000'
) {
  // eslint-disable-line max-params
  var a = hb1.p,
    n = hb1.norm
  var bsp = 0.7 * options.stereoBond

  var path = 'M' + tfx(a.x) + ',' + tfx(a.y),
    r = a
  for (var i = 0; i < nlines; ++i) {
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

function bondDouble(paper, a1, a2, b1, b2, cisTrans, options) {
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

function bondSingleOrDouble(paper, hb1, hb2, nSect, options) {
  // eslint-disable-line max-statements, max-params
  var a = hb1.p,
    b = hb2.p,
    n = hb1.norm
  var bsp = options.bondSpace / 2

  var path = '',
    pi,
    pp = a
  for (var i = 1; i <= nSect; ++i) {
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

function bondTriple(paper, hb1, hb2, options, color = '#000') {
  var a = hb1.p,
    b = hb2.p,
    n = hb1.norm
  var a2 = a.addScaled(n, options.bondSpace)
  var b2 = b.addScaled(n, options.bondSpace)
  var a3 = a.addScaled(n, -options.bondSpace)
  var b3 = b.addScaled(n, -options.bondSpace)
  return paper
    .path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3))
    .attr(options.lineattr)
    .attr({
      fill: color,
      stroke: color
    })
}

function bondAromatic(paper, paths, bondShift, options) {
  var l1 = paper.path(paths[0]).attr(options.lineattr)
  var l2 = paper.path(paths[1]).attr(options.lineattr)
  if (bondShift !== undefined && bondShift !== null)
    (bondShift > 0 ? l1 : l2).attr({ 'stroke-dasharray': '- ' })

  return paper.set([l1, l2])
}

function bondAny(paper, hb1, hb2, options) {
  var a = hb1.p,
    b = hb2.p
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'stroke-dasharray': '- ' })
}

function bondHydrogen(paper, hb1, hb2, options) {
  var a = hb1.p,
    b = hb2.p
  return paper.path(makeStroke(a, b)).attr(options.lineattr).attr({
    'stroke-dasharray': '.',
    'stroke-linecap': 'square'
  })
}

function bondDative(paper, hb1, hb2, options) {
  var a = hb1.p,
    b = hb2.p
  return paper
    .path(makeStroke(a, b))
    .attr(options.lineattr)
    .attr({ 'arrow-end': 'block-midium-long' })
}

function reactingCenter(paper, p, options) {
  var pathdesc = ''
  for (var i = 0; i < p.length / 2; ++i)
    pathdesc += makeStroke(p[2 * i], p[2 * i + 1])
  return paper.path(pathdesc).attr(options.lineattr)
}

function topologyMark(paper, p, mark, options) {
  var path = paper.text(p.x, p.y, mark).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: '#000'
  })
  var rbb = util.relBox(path.getBBox())
  recenterText(path, rbb)
  return path
}

function radicalCap(paper, p, options) {
  var s = options.lineWidth * 0.9
  var dw = s,
    dh = 2 * s
  return paper
    .path(
      'M{0},{1}L{2},{3}L{4},{5}',
      tfx(p.x - dw),
      tfx(p.y + dh),
      tfx(p.x),
      tfx(p.y),
      tfx(p.x + dw),
      tfx(p.y + dh)
    )
    .attr({
      stroke: '#000',
      'stroke-width': options.lineWidth * 0.7,
      'stroke-linecap': 'square',
      'stroke-linejoin': 'miter'
    })
}

function radicalBullet(paper, p, options) {
  return paper.circle(tfx(p.x), tfx(p.y), options.lineWidth).attr({
    stroke: null,
    fill: '#000'
  })
}

function bracket(paper, d, n, c, bracketWidth, bracketHeight, options) {
  // eslint-disable-line max-params
  bracketWidth = bracketWidth || 0.25
  bracketHeight = bracketHeight || 1.0
  var a0 = c.addScaled(n, -0.5 * bracketHeight)
  var a1 = c.addScaled(n, 0.5 * bracketHeight)
  var b0 = a0.addScaled(d, -bracketWidth)
  var b1 = a1.addScaled(d, -bracketWidth)

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

function selectionRectangle(paper, p0, p1, options) {
  return paper
    .rect(
      tfx(Math.min(p0.x, p1.x)),
      tfx(Math.min(p0.y, p1.y)),
      tfx(Math.abs(p1.x - p0.x)),
      tfx(Math.abs(p1.y - p0.y))
    )
    .attr(options.lassoStyle)
}

function selectionPolygon(paper, r, options) {
  var v = r[r.length - 1]
  var pstr = 'M' + tfx(v.x) + ',' + tfx(v.y)
  for (var i = 0; i < r.length; ++i)
    pstr += 'L' + tfx(r[i].x) + ',' + tfx(r[i].y)
  return paper.path(pstr).attr(options.lassoStyle)
}

function selectionLine(paper, p0, p1, options) {
  return paper.path(makeStroke(p0, p1)).attr(options.lassoStyle)
}

function makeStroke(a, b) {
  return 'M' + tfx(a.x) + ',' + tfx(a.y) + 'L' + tfx(b.x) + ',' + tfx(b.y) + '	'
}

function dashedPath(p0, p1, dash) {
  var t0 = 0
  var t1 = Vec2.dist(p0, p1)
  var d = Vec2.diff(p1, p0).normalized()
  var black = true
  var path = ''
  var i = 0

  while (t0 < t1) {
    var len = dash[i % dash.length]
    var t2 = t0 + Math.min(len, t1 - t0)
    if (black)
      path +=
        'M ' +
        p0.addScaled(d, t0).coordStr() +
        ' L ' +
        p0.addScaled(d, t2).coordStr()
    t0 += len
    black = !black
    i++
  }
  return path
}

function aromaticBondPaths(a2, a3, b2, b3, mask, dash) {
  // eslint-disable-line max-params
  var l1 = dash && mask & 1 ? dashedPath(a2, b2, dash) : makeStroke(a2, b2)
  var l2 = dash && mask & 2 ? dashedPath(a3, b3, dash) : makeStroke(a3, b3)

  return [l1, l2]
}

function recenterText(path, rbb) {
  // TODO: find a better way
  if (Raphael.vml) {
    // dirty hack
    console.assert(null, "Souldn't go here!")
    var gap = rbb.height * 0.16
    path.translateAbs(0, gap)
    rbb.y += gap
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
  rectangleWithAngle,
  polyline,
  line
}
