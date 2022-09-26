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

import { Bond, Vec2 } from 'domain/entities'

import { LayerMap } from './generalEnumTypes'
import ReObject from './reobject'
import { Scale } from 'domain/helpers'
import util from '../util'

const tfx = util.tfx

class ReLoop extends ReObject {
  constructor(loop) {
    super('loop')
    this.loop = loop
    this.centre = new Vec2()
    this.radius = new Vec2()
  }

  static isSelectable() {
    return false
  }

  show(restruct, rlid, options) {
    // eslint-disable-line max-statements
    const render = restruct.render
    const paper = render.paper
    const molecule = restruct.molecule
    const loop = this.loop
    this.centre = new Vec2()
    loop.hbs.forEach((hbid) => {
      const hb = molecule.halfBonds.get(hbid)
      const bond = restruct.bonds.get(hb.bid)
      const apos = Scale.obj2scaled(restruct.atoms.get(hb.begin).a.pp, options)
      if (bond.b.type !== Bond.PATTERN.TYPE.AROMATIC) loop.aromatic = false
      this.centre.add_(apos) // eslint-disable-line no-underscore-dangle
    })
    loop.convex = true
    for (let k = 0; k < this.loop.hbs.length; ++k) {
      const hba = molecule.halfBonds.get(loop.hbs[k])
      const hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length])
      const angle = Math.atan2(
        Vec2.cross(hba.dir, hbb.dir),
        Vec2.dot(hba.dir, hbb.dir)
      )
      if (angle > 0) loop.convex = false
    }

    this.centre = this.centre.scaled(1.0 / loop.hbs.length)
    this.radius = -1
    loop.hbs.forEach((hbid) => {
      const hb = molecule.halfBonds.get(hbid)
      const apos = Scale.obj2scaled(restruct.atoms.get(hb.begin).a.pp, options)
      const bpos = Scale.obj2scaled(restruct.atoms.get(hb.end).a.pp, options)
      const n = Vec2.diff(bpos, apos).rotateSC(1, 0).normalized()
      const dist = Vec2.dot(Vec2.diff(apos, this.centre), n)
      this.radius = this.radius < 0 ? dist : Math.min(this.radius, dist)
    })
    this.radius *= 0.7
    if (!loop.aromatic) return
    let path = null
    if (loop.convex && options.aromaticCircle) {
      path = paper.circle(this.centre.x, this.centre.y, this.radius).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width']
      })
    } else {
      let pathStr = ''
      for (k = 0; k < loop.hbs.length; ++k) {
        hba = molecule.halfBonds.get(loop.hbs[k])
        hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length])
        angle = Math.atan2(
          Vec2.cross(hba.dir, hbb.dir),
          Vec2.dot(hba.dir, hbb.dir)
        )
        const halfAngle = (Math.PI - angle) / 2
        const dir = hbb.dir.rotate(halfAngle)
        const pi = Scale.obj2scaled(restruct.atoms.get(hbb.begin).a.pp, options)
        let sin = Math.sin(halfAngle)
        const minSin = 0.1
        if (Math.abs(sin) < minSin) sin = (sin * minSin) / Math.abs(sin)
        const offset = options.bondSpace / sin
        const qi = pi.addScaled(dir, -offset)
        pathStr += k === 0 ? 'M' : 'L'
        pathStr += tfx(qi.x) + ',' + tfx(qi.y)
      }
      pathStr += 'Z'
      path = paper.path(pathStr).attr({
        stroke: '#000',
        'stroke-width': options.lineattr['stroke-width'],
        'stroke-dasharray': '- '
      })
    }
    restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true)
  }

  isValid(struct, rlid) {
    const halfBonds = struct.halfBonds
    return this.loop.hbs.every(
      (hbid) => halfBonds.has(hbid) && halfBonds.get(hbid).loop === rlid
    )
  }
}

export default ReLoop
