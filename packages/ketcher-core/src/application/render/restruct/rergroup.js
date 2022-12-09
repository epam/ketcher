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

import { Box2Abs, Vec2 } from 'domain/entities'

import { LayerMap } from './generalEnumTypes'
import ReObject from './reobject'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'

const BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3)
class ReRGroup extends ReObject {
  constructor(/* RGroup */ rgroup) {
    super('rgroup')
    this.labelBox = null
    this.item = rgroup
  }

  static isSelectable() {
    return false
  }

  getAtoms(render) {
    let ret = []
    this.item.frags.forEach((fid) => {
      ret = ret.concat(
        render.ctab.frags.get(fid).fragGetAtoms(render.ctab, fid)
      )
    })
    return ret
  }

  getBonds(render) {
    let ret = []
    this.item.frags.forEach((fid) => {
      ret = ret.concat(
        render.ctab.frags.get(fid).fragGetBonds(render.ctab, fid)
      )
    })
    return ret
  }

  calcBBox(render) {
    let ret = null
    this.item.frags.forEach((fid) => {
      const bbf = render.ctab.frags.get(fid).calcBBox(render.ctab, fid, render)
      if (bbf) ret = ret ? Box2Abs.union(ret, bbf) : bbf
    })

    if (ret) ret = ret.extend(BORDER_EXT, BORDER_EXT)

    return ret
  }

  // TODO need to review parameter list
  draw(render, options) {
    // eslint-disable-line max-statements
    const bb = this.calcBBox(render)

    if (!bb) {
      console.error(
        'Abnormal situation, empty fragments must be destroyed by tools'
      )
      return {}
    }

    const ret = { data: [] }
    const p0 = Scale.increaseBy(bb.p0, options)
    const p1 = Scale.increaseBy(bb.p1, options)
    const brackets = render.paper.set()

    rGroupdrawBrackets(brackets, render, bb) // eslint-disable-line new-cap

    ret.data.push(brackets)
    const key = render.ctab.rgroups.keyOf(this)
    const labelSet = render.paper.set()
    const label = render.paper
      .text(p0.x, (p0.y + p1.y) / 2, 'R' + key + '=')
      .attr({
        font: options.font,
        'font-size': options.fontRLabel,
        fill: 'black'
      })

    const labelBox = util.relBox(label.getBBox())
    label.translateAbs(-labelBox.width / 2 - options.lineWidth, 0)

    labelSet.push(label)
    const logicStyle = {
      font: options.font,
      'font-size': options.fontRLogic,
      fill: 'black'
    }

    const logic = [rLogicToString(key, this.item)]

    let shift = labelBox.height / 2 + options.lineWidth / 2
    for (let i = 0; i < logic.length; ++i) {
      const logicPath = render.paper
        .text(p0.x, (p0.y + p1.y) / 2, logic[i])
        .attr(logicStyle)
      const logicBox = util.relBox(logicPath.getBBox())
      shift += logicBox.height / 2
      logicPath.translateAbs(-logicBox.width / 2 - 6 * options.lineWidth, shift)
      shift += logicBox.height / 2 + options.lineWidth / 2
      ret.data.push(logicPath)
      labelSet.push(logicPath)
    }

    ret.data.push(label)
    this.labelBox = Box2Abs.fromRelBox(labelSet.getBBox()).transform(
      Scale.reduceBy,
      render.options
    )
    return ret
  }

  // TODO need to review parameter list
  _draw(render, rgid, attrs) {
    // eslint-disable-line no-underscore-dangle
    if (!this.getVBoxObj(render)) return null
    const bb = this.getVBoxObj(render).extend(BORDER_EXT, BORDER_EXT) // eslint-disable-line no-underscore-dangle

    if (!bb) return null

    const p0 = Scale.increaseBy(bb.p0, render.options)
    const p1 = Scale.increaseBy(bb.p1, render.options)
    return render.paper
      .rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0)
      .attr(attrs)
  }

  drawHover(render) {
    const rgid = render.ctab.rgroups.keyOf(this)

    if (!rgid) {
      console.error(
        'Abnormal situation, fragment does not belong to the render'
      )
      return null
    }

    const ret = this._draw(
      render,
      rgid,
      render.options.hoverStyle /* { 'fill' : 'red' } */
    ) // eslint-disable-line no-underscore-dangle
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret)

    this.item.frags.forEach((fnum, fid) => {
      render.ctab.frags.get(fid).drawHover(render)
    })

    return ret
  }

  show(restruct, id, options) {
    const drawing = this.draw(restruct.render, options)

    Object.keys(drawing).forEach((group) => {
      while (drawing[group].length > 0) {
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          drawing[group].shift(),
          null,
          true
        )
      }
    })
    // TODO rgroup selection & highlighting
  }
}

function rGroupdrawBrackets(set, render, bb, d) {
  d = Scale.increaseBy(d || new Vec2(1, 0), render.options)
  const bracketWidth = Math.min(0.25, bb.sz().x * 0.3)
  const bracketHeight = bb.p1.y - bb.p0.y
  const cy = 0.5 * (bb.p1.y + bb.p0.y)

  const leftBracket = draw.bracket(
    render.paper,
    d.negated(),
    d.negated().rotateSC(1, 0),
    Scale.increaseBy(new Vec2(bb.p0.x, cy), render.options),
    bracketWidth,
    bracketHeight,
    render.options
  )

  const rightBracket = draw.bracket(
    render.paper,
    d,
    d.rotateSC(1, 0),
    Scale.increaseBy(new Vec2(bb.p1.x, cy), render.options),
    bracketWidth,
    bracketHeight,
    render.options
  )

  return set.push(leftBracket, rightBracket)
}

function rLogicToString(id, rLogic) {
  const ifThen = rLogic.ifthen > 0 ? 'IF ' : ''

  const rangeExists =
    rLogic.range.startsWith('>') ||
    rLogic.range.startsWith('<') ||
    rLogic.range.startsWith('=')

  let range = null
  if (rLogic.range.length > 0) {
    range = rangeExists ? rLogic.range : '=' + rLogic.range
  } else range = '>0'

  const restH = rLogic.resth ? ' (RestH)' : ''
  const nextRg = rLogic.ifthen > 0 ? '\nTHEN R' + rLogic.ifthen.toString() : ''

  return `${ifThen}R${id.toString()}${range}${restH}${nextRg}`
}

export default ReRGroup
