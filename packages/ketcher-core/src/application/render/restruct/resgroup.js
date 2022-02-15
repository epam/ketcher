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

import { Box2Abs, FunctionalGroup, Pile, SGroup, Vec2 } from 'domain/entities'

import { LayerMap } from './generalEnumTypes'
import ReDataSGroupData from './redatasgroupdata'
import ReObject from './reobject'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'

const tfx = util.tfx

class ReSGroup extends ReObject {
  constructor(sgroup) {
    super('sgroup')
    this.item = sgroup
  }
  static isSelectable() {
    return false
  }
  draw(remol, sgroup) {
    this.render = remol.render
    let set = this.render.paper.set()
    const atomSet = new Pile(sgroup.atoms)
    const crossBonds = SGroup.getCrossBonds(remol.molecule, atomSet)
    SGroup.bracketPos(sgroup, remol.molecule, crossBonds)
    const bracketBox = sgroup.bracketBox
    const d = sgroup.bracketDir
    sgroup.areas = [bracketBox]
    const functionalGroups = remol.molecule.functionalGroups
    if (
      FunctionalGroup.isContractedFunctionalGroup(sgroup.id, functionalGroups)
    ) {
      sgroup.firstSgroupAtom = remol.molecule.atoms.get(sgroup.atoms[0])
      sgroup.functionalGroup = true
    } else {
      switch (sgroup.type) {
        case 'MUL':
          SGroupdrawBrackets(
            set,
            this.render,
            sgroup,
            crossBonds,
            atomSet,
            bracketBox,
            d,
            sgroup.data.mul
          )
          break
        case 'SRU':
          let connectivity = sgroup.data.connectivity || 'eu'
          if (connectivity === 'ht') connectivity = ''
          const subscript = sgroup.data.subscript || 'n'
          SGroupdrawBrackets(
            set,
            this.render,
            sgroup,
            crossBonds,
            atomSet,
            bracketBox,
            d,
            subscript,
            connectivity
          )
          break
        case 'SUP':
          SGroupdrawBrackets(
            set,
            this.render,
            sgroup,
            crossBonds,
            atomSet,
            bracketBox,
            d,
            sgroup.data.name,
            null,
            { 'font-style': 'italic' }
          )
          break
        case 'GEN':
          SGroupdrawBrackets(
            set,
            this.render,
            sgroup,
            crossBonds,
            atomSet,
            bracketBox,
            d
          )
          break
        case 'DAT':
          set = drawGroupDat(remol, sgroup)
          break
        default:
          break
      }
    }
    return set
  }
  makeSelectionPlate(restruct, paper, options) {
    const sgroup = this.item
    const { startX, startY, size } = getHighlighPathInfo(sgroup, options)
    const functionalGroups = restruct.molecule.functionalGroups
    if (
      FunctionalGroup.isContractedFunctionalGroup(sgroup.id, functionalGroups)
    ) {
      return paper.rect(startX, startY, size, size).attr(options.selectionStyle)
    }
  }

  drawHover(render) {
    // eslint-disable-line max-statements
    var options = render.options
    var paper = render.paper
    var sGroupItem = this.item
    const { a0, a1, b0, b1 } = getHighlighPathInfo(sGroupItem, options)

    const functionalGroups = render.ctab.molecule.functionalGroups
    var set = paper.set()
    if (
      FunctionalGroup.isContractedFunctionalGroup(
        sGroupItem.id,
        functionalGroups
      )
    ) {
      const { startX, startY, size } = getHighlighPathInfo(sGroupItem, options)
      sGroupItem.hovering = paper
        .rect(startX, startY, size, size)
        .attr(options.hoverStyle)
    } else {
      sGroupItem.hovering = paper
        .path(
          'M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}',
          tfx(a0.x),
          tfx(a0.y),
          tfx(a1.x),
          tfx(a1.y),
          tfx(b1.x),
          tfx(b1.y),
          tfx(b0.x),
          tfx(b0.y)
        )
        .attr(options.hoverStyle)
    }
    set.push(sGroupItem.hovering)

    SGroup.getAtoms(render.ctab.molecule, sGroupItem).forEach(aid => {
      set.push(render.ctab.atoms.get(aid).makeHoverPlate(render))
    }, this)
    SGroup.getBonds(render.ctab.molecule, sGroupItem).forEach(bid => {
      set.push(render.ctab.bonds.get(bid).makeHoverPlate(render))
    }, this)
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, set)
  }
  show(restruct) {
    var render = restruct.render
    var sgroup = this.item
    if (sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      var remol = render.ctab
      var path = this.draw(remol, sgroup)
      restruct.addReObjectPath(LayerMap.data, this.visel, path, null, true)
      this.setHover(this.hover, render) // TODO: fix this
    }
  }
}

function SGroupdrawBrackets(
  set,
  render,
  sg,
  crossBonds,
  atomSet,
  bracketBox,
  d,
  lowerIndexText,
  upperIndexText,
  indexAttribute
) {
  // eslint-disable-line max-params
  var brackets = getBracketParameters(
    render.ctab.molecule,
    crossBonds,
    atomSet,
    bracketBox,
    d,
    render,
    sg.id
  )
  var ir = -1
  for (var i = 0; i < brackets.length; ++i) {
    var bracket = brackets[i]
    var path = draw.bracket(
      render.paper,
      Scale.obj2scaled(bracket.d, render.options),
      Scale.obj2scaled(bracket.n, render.options),
      Scale.obj2scaled(bracket.c, render.options),
      bracket.w,
      bracket.h,
      render.options
    )
    set.push(path)
    if (
      ir < 0 ||
      brackets[ir].d.x < bracket.d.x ||
      (brackets[ir].d.x === bracket.d.x && brackets[ir].d.y > bracket.d.y)
    )
      ir = i
  }
  var bracketR = brackets[ir]
  function renderIndex(text, shift) {
    var indexPos = Scale.obj2scaled(
      bracketR.c.addScaled(bracketR.n, shift * bracketR.h),
      render.options
    )
    var indexPath = render.paper.text(indexPos.x, indexPos.y, text).attr({
      font: render.options.font,
      'font-size': render.options.fontszsub
    })
    if (indexAttribute) indexPath.attr(indexAttribute)
    var indexBox = Box2Abs.fromRelBox(util.relBox(indexPath.getBBox()))
    var t =
      Math.max(util.shiftRayBox(indexPos, bracketR.d.negated(), indexBox), 3) +
      2
    indexPath.translateAbs(t * bracketR.d.x, t * bracketR.d.y)
    set.push(indexPath)
  }
  if (lowerIndexText) renderIndex(lowerIndexText, 0.5)
  if (upperIndexText) renderIndex(upperIndexText, -0.5)
}

function showValue(paper, pos, sg, options) {
  var text = paper.text(pos.x, pos.y, sg.data.fieldValue).attr({
    font: options.font,
    'font-size': options.fontsz
  })
  var box = text.getBBox()
  var rect = paper.rect(
    box.x - 1,
    box.y - 1,
    box.width + 2,
    box.height + 2,
    3,
    3
  )
  rect = sg.selected
    ? rect.attr(options.selectionStyle)
    : rect.attr({ fill: '#fff', stroke: '#fff' })
  var st = paper.set()
  st.push(rect, text.toFront())
  return st
}

function drawGroupDat(restruct, sgroup) {
  sgroup.areas = sgroup.bracketBox ? [sgroup.bracketBox] : []

  if (sgroup.pp === null) sgroup.calculatePP(restruct.molecule)

  return sgroup.data.attached
    ? drawAttachedDat(restruct, sgroup)
    : drawAbsoluteDat(restruct, sgroup)
}

function drawAbsoluteDat(restruct, sgroup) {
  const render = restruct.render
  const options = render.options
  const paper = render.paper
  const set = paper.set()

  const ps = sgroup.pp.scaled(options.scale)
  const name = showValue(paper, ps, sgroup, options)
  const box = util.relBox(name.getBBox())

  name.translateAbs(0.5 * box.width, -0.5 * box.height)
  set.push(name)

  const sbox = Box2Abs.fromRelBox(util.relBox(name.getBBox()))
  sgroup.dataArea = sbox.transform(Scale.scaled2obj, render.options)

  if (!restruct.sgroupData.has(sgroup.id))
    restruct.sgroupData.set(sgroup.id, new ReDataSGroupData(sgroup))

  return set
}

function drawAttachedDat(restruct, sgroup) {
  const render = restruct.render
  const options = render.options
  const paper = render.paper
  const set = paper.set()

  SGroup.getAtoms(restruct, sgroup).forEach(aid => {
    const atom = restruct.atoms.get(aid)
    const p = Scale.obj2scaled(atom.a.pp, options)
    const bb = atom.visel.boundingBox

    if (bb !== null) p.x = Math.max(p.x, bb.p1.x)

    p.x += options.lineWidth // shift a bit to the right

    const nameI = showValue(paper, p, sgroup, options)
    const boxI = util.relBox(nameI.getBBox())

    nameI.translateAbs(0.5 * boxI.width, -0.3 * boxI.height)
    set.push(nameI)

    let sboxI = Box2Abs.fromRelBox(util.relBox(nameI.getBBox()))
    sboxI = sboxI.transform(Scale.scaled2obj, render.options)
    sgroup.areas.push(sboxI)
  })

  return set
}

function getBracketParameters(
  mol,
  crossBonds,
  atomSet,
  bracketBox,
  d,
  render,
  id
) {
  // eslint-disable-line max-params
  function BracketParams(c, d, w, h) {
    this.c = c
    this.d = d
    this.n = d.rotateSC(1, 0)
    this.w = w
    this.h = h
  }
  var brackets = []
  var n = d.rotateSC(1, 0)

  const crossBondsPerAtom = Object.values(crossBonds)
  const crossBondsValues = crossBondsPerAtom.flat()
  if (crossBondsValues.length < 2) {
    ;(function () {
      d = d || new Vec2(1, 0)
      n = n || d.rotateSC(1, 0)
      var bracketWidth = Math.min(0.25, bracketBox.sz().x * 0.3)
      var cl = Vec2.lc2(
        d,
        bracketBox.p0.x,
        n,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y)
      )
      var cr = Vec2.lc2(
        d,
        bracketBox.p1.x,
        n,
        0.5 * (bracketBox.p0.y + bracketBox.p1.y)
      )
      var bracketHeight = bracketBox.sz().y

      brackets.push(
        new BracketParams(cl, d.negated(), bracketWidth, bracketHeight),
        new BracketParams(cr, d, bracketWidth, bracketHeight)
      )
    })()
  } else if (crossBondsValues.length === 2 && crossBondsPerAtom.length === 2) {
    ;(function () {
      // eslint-disable-line max-statements
      var b1 = mol.bonds.get(crossBondsValues[0])
      var b2 = mol.bonds.get(crossBondsValues[1])
      var cl0 = b1.getCenter(mol)
      var cr0 = b2.getCenter(mol)
      var tl = -1
      var tr = -1
      var tt = -1
      var tb = -1
      var cc = Vec2.centre(cl0, cr0)
      var dr = Vec2.diff(cr0, cl0).normalized()
      var dl = dr.negated()
      var dt = dr.rotateSC(1, 0)
      var db = dt.negated()

      mol.sGroupForest.children.get(id).forEach(sgid => {
        var bba = render.ctab.sgroups.get(sgid).visel.boundingBox
        bba = bba
          .translate((render.options.offset || new Vec2()).negated())
          .transform(Scale.scaled2obj, render.options)
        tl = Math.max(tl, util.shiftRayBox(cl0, dl, bba))
        tr = Math.max(tr, util.shiftRayBox(cr0, dr, bba))
        tt = Math.max(tt, util.shiftRayBox(cc, dt, bba))
        tb = Math.max(tb, util.shiftRayBox(cc, db, bba))
      }, this)
      tl = Math.max(tl + 0.2, 0)
      tr = Math.max(tr + 0.2, 0)
      tt = Math.max(Math.max(tt, tb) + 0.1, 0)
      var bracketWidth = 0.25
      var bracketHeight = 1.5 + tt
      brackets.push(
        new BracketParams(
          cl0.addScaled(dl, tl),
          dl,
          bracketWidth,
          bracketHeight
        ),
        new BracketParams(
          cr0.addScaled(dr, tr),
          dr,
          bracketWidth,
          bracketHeight
        )
      )
    })()
  } else {
    ;(function () {
      for (var i = 0; i < crossBondsValues.length; ++i) {
        var b = mol.bonds.get(crossBondsValues[i])
        var c = b.getCenter(mol)
        var d = atomSet.has(b.begin) ? b.getDir(mol) : b.getDir(mol).negated()
        brackets.push(new BracketParams(c, d, 0.2, 1.0))
      }
    })()
  }
  return brackets
}

function getHighlighPathInfo(sgroup, options) {
  let bracketBox = sgroup.bracketBox.transform(Scale.obj2scaled, options)
  const lineWidth = options.lineWidth
  const vext = new Vec2(lineWidth * 4, lineWidth * 6)
  bracketBox = bracketBox.extend(vext, vext)
  const d = sgroup.bracketDir,
    n = d.rotateSC(1, 0)
  const a0 = Vec2.lc2(d, bracketBox.p0.x, n, bracketBox.p0.y)
  const a1 = Vec2.lc2(d, bracketBox.p0.x, n, bracketBox.p1.y)
  const b0 = Vec2.lc2(d, bracketBox.p1.x, n, bracketBox.p0.y)
  const b1 = Vec2.lc2(d, bracketBox.p1.x, n, bracketBox.p1.y)
  const size = options.contractedFunctionalGroupSize
  let startX = (b0.x + a0.x) / 2 - size / 2
  let startY = (a1.y + a0.y) / 2 - size / 2
  if (sgroup.firstSgroupAtom) {
    const shift = new Vec2(size / 2, size / 2, 0)
    const hoverPp = Vec2.diff(sgroup.firstSgroupAtom.pp.scaled(40), shift)
    startX = hoverPp.x
    startY = hoverPp.y
  }
  return {
    a0,
    a1,
    b0,
    b1,
    startX,
    startY,
    size
  }
}

export default ReSGroup
