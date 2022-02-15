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

import ReObject from './reobject'
import { Scale } from 'domain/helpers'

class ReFrag extends ReObject {
  constructor(/* Struct.Fragment */ frag) {
    super('frag')
    this.item = frag
  }
  static isSelectable() {
    return false
  }
  fragGetAtoms(restruct, fid) {
    return Array.from(restruct.atoms.keys()).filter(
      aid => restruct.atoms.get(aid).a.fragment === fid
    )
  }
  fragGetBonds(restruct, fid) {
    return Array.from(restruct.bonds.keys()).filter(bid => {
      const bond = restruct.bonds.get(bid).b

      const firstFrag = restruct.atoms.get(bond.begin).a.fragment
      const secondFrag = restruct.atoms.get(bond.end).a.fragment

      return firstFrag === fid && secondFrag === fid
    })
  }
  calcBBox(restruct, fid, render) {
    // TODO need to review parameter list
    var ret
    restruct.atoms.forEach(atom => {
      if (atom.a.fragment !== fid) return

      // TODO ReObject.calcBBox to be used instead
      let bba = atom.visel.boundingBox
      if (!bba) {
        bba = new Box2Abs(atom.a.pp, atom.a.pp)
        const ext = new Vec2(0.05 * 3, 0.05 * 3)
        bba = bba.extend(ext, ext)
      } else {
        if (!render) render = global._ui_editor.render // eslint-disable-line
        bba = bba
          .translate((render.options.offset || new Vec2()).negated())
          .transform(Scale.scaled2obj, render.options)
      }
      ret = ret ? Box2Abs.union(ret, bba) : bba
    })

    return ret
  }
  // TODO need to review parameter list
  _draw(render, fid, attrs) {
    // eslint-disable-line no-underscore-dangle
    const bb = this.calcBBox(render.ctab, fid, render)

    if (bb) {
      const p0 = Scale.obj2scaled(new Vec2(bb.p0.x, bb.p0.y), render.options)
      const p1 = Scale.obj2scaled(new Vec2(bb.p1.x, bb.p1.y), render.options)
      return render.paper
        .rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0)
        .attr(attrs)
    }

    // TODO abnormal situation, empty fragments must be destroyed by tools
    return
  }
  draw(render) {
    // eslint-disable-line no-unused-vars
    return null // this._draw(render, fid, { 'stroke' : 'lightgray' }); // [RB] for debugging only
  }

  drawHover(render) {
    // eslint-disable-line no-unused-vars
    // Do nothing. This method shouldn't actually be called.
  }

  setHover(hover, render) {
    let fid = render.ctab.frags.keyOf(this)

    if (!fid && fid !== 0) {
      console.warn('Fragment does not belong to the render')
      return
    }

    fid = parseInt(fid, 10)

    render.ctab.atoms.forEach(atom => {
      if (atom.a.fragment === fid) atom.setHover(hover, render)
    })

    render.ctab.bonds.forEach(bond => {
      if (render.ctab.atoms.get(bond.b.begin).a.fragment === fid) {
        bond.setHover(hover, render)
      }
    })
  }
}
export default ReFrag
