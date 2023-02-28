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

import {
  Atom,
  Bond,
  FunctionalGroup,
  HalfBond,
  Struct,
  Vec2
} from 'domain/entities'
import { LayerMap, StereoColoringType } from './generalEnumTypes'
import ReAtom, { getColorFromStereoLabel } from './reatom'

import ReObject from './reobject'
import ReStruct from './restruct'
import { Render } from '../raphaelRender'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'

class ReBond extends ReObject {
  b: Bond
  doubleBondShift: number
  path: any
  neihbid1 = -1
  neihbid2 = -1
  boldStereo?: boolean
  rbb?: { x: number; y: number; width: number; height: number }

  constructor(bond: Bond) {
    super('bond')
    this.b = bond // TODO rename b to item
    this.doubleBondShift = 0
  }

  static isSelectable() {
    return true
  }

  drawHover(render: Render) {
    const ret = this.makeHoverPlate(render)
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret)
    return ret
  }

  makeHoverPlate(render: Render) {
    const options = render.options
    bondRecalc(this, render.ctab, options)
    const bond = this.b
    const sgroups = render.ctab.sgroups
    const functionalGroups = render.ctab.molecule.functionalGroups
    if (
      FunctionalGroup.isBondInContractedFunctionalGroup(
        bond,
        sgroups,
        functionalGroups
      )
    ) {
      return null
    }

    const c = Scale.obj2scaled(this.b.center, options)
    return render.paper
      .circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
      .attr(options.hoverStyle)
  }

  makeSelectionPlate(restruct: ReStruct, paper: any, options: any) {
    bondRecalc(this, restruct, options)
    const bond = this.b
    const sgroups = restruct.render.ctab.sgroups
    const functionalGroups = restruct.render.ctab.molecule.functionalGroups
    if (
      FunctionalGroup.isBondInContractedFunctionalGroup(
        bond,
        sgroups,
        functionalGroups
      )
    ) {
      return null
    }

    const c = Scale.obj2scaled(this.b.center, options)
    return paper
      .circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
      .attr(options.selectionStyle)
  }

  show(restruct: ReStruct, bid: number, options: any): void {
    // eslint-disable-line max-statements
    const render = restruct.render
    const struct = restruct.molecule
    const bond = restruct.molecule.bonds.get(bid)
    const sgroups = restruct.molecule.sgroups
    const functionalGroups = restruct.molecule.functionalGroups
    if (
      bond &&
      FunctionalGroup.isBondInContractedFunctionalGroup(
        bond,
        sgroups,
        functionalGroups
      )
    ) {
      return
    }

    const paper = render.paper
    const hb1 =
      this.b.hb1 !== undefined ? struct.halfBonds.get(this.b.hb1) : null
    const hb2 =
      this.b.hb2 !== undefined ? struct.halfBonds.get(this.b.hb2) : null

    checkStereoBold(bid, this, restruct)
    bondRecalc(this, restruct, options)
    setDoubleBondShift(this, struct)
    if (!hb1 || !hb2) return
    this.path = getBondPath(restruct, this, hb1, hb2)
    this.rbb = util.relBox(this.path.getBBox())
    restruct.addReObjectPath(LayerMap.data, this.visel, this.path, null, true)
    const reactingCenter: any = {}
    reactingCenter.path = getReactingCenterPath(render, this, hb1, hb2)
    if (reactingCenter.path) {
      reactingCenter.rbb = util.relBox(reactingCenter.path.getBBox())
      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        reactingCenter.path,
        null,
        true
      )
    }
    const topology: any = {}
    topology.path = getTopologyMark(render, this, hb1, hb2)
    if (topology.path) {
      topology.rbb = util.relBox(topology.path.getBBox())
      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        topology.path,
        null,
        true
      )
    }
    this.setHover(this.hover, render)

    let ipath = null
    const bondIdxOff = options.subFontSize * 0.6
    if (options.showBondIds) {
      ipath = getIdsPath(bid, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb1.norm)
      restruct.addReObjectPath(LayerMap.indices, this.visel, ipath)
    }
    if (options.showHalfBondIds) {
      ipath = getIdsPath(
        this.b.hb1!,
        paper,
        hb1,
        hb2,
        bondIdxOff,
        0.8,
        0.2,
        hb1.norm
      )
      restruct.addReObjectPath(LayerMap.indices, this.visel, ipath)
      ipath = getIdsPath(
        this.b.hb2!,
        paper,
        hb1,
        hb2,
        bondIdxOff,
        0.2,
        0.8,
        hb2.norm
      )
      restruct.addReObjectPath(LayerMap.indices, this.visel, ipath)
    }
    if (options.showLoopIds && !options.showBondIds) {
      ipath = getIdsPath(
        hb1.loop,
        paper,
        hb1,
        hb2,
        bondIdxOff,
        0.5,
        0.5,
        hb2.norm
      )
      restruct.addReObjectPath(LayerMap.indices, this.visel, ipath)
      ipath = getIdsPath(
        hb2.loop,
        paper,
        hb1,
        hb2,
        bondIdxOff,
        0.5,
        0.5,
        hb1.norm
      )
      restruct.addReObjectPath(LayerMap.indices, this.visel, ipath)
    }

    // Checking whether bond is highlighted and what is the last color
    const highlights = restruct.molecule.highlights
    let isHighlighted = false
    let highlightColor = ''
    highlights.forEach((highlight) => {
      const hasCurrentHighlight = highlight.bonds?.includes(bid)
      isHighlighted = isHighlighted || hasCurrentHighlight
      if (hasCurrentHighlight) {
        highlightColor = highlight.color
      }
    })

    // Drawing highlight
    if (isHighlighted) {
      const style = {
        fill: highlightColor,
        stroke: highlightColor,
        'stroke-width': options.lineattr['stroke-width'] * 7,
        'stroke-linecap': 'round'
      }

      const c = Scale.obj2scaled(this.b.center, restruct.render.options)

      const highlightPath = getHighlightPath(restruct, hb1, hb2)
      highlightPath.attr(style)

      restruct.addReObjectPath(
        LayerMap.hovering,
        this.visel,
        highlightPath,
        c,
        true
      )
    }
  }
}

function getHighlightPath(restruct: ReStruct, hb1: HalfBond, hb2: HalfBond) {
  const beginning = { x: hb1.p.x, y: hb1.p.y }
  const end = { x: hb2.p.x, y: hb2.p.y }

  const paper = restruct.render.paper

  const pathString = `M${beginning.x},${beginning.y} L${end.x},${end.y}`

  const path = paper.path(pathString)

  return path
}

function findIncomingStereoUpBond(
  atom: Atom,
  bid0: number,
  includeBoldStereoBond: boolean,
  restruct: ReStruct
): number {
  return atom.neighbors.findIndex((hbid) => {
    const hb = restruct.molecule.halfBonds.get(hbid)

    if (!hb || hb.bid === bid0) return false

    const neibond = restruct.bonds.get(hb.bid)

    if (!neibond) return false
    const singleUp =
      neibond.b.type === Bond.PATTERN.TYPE.SINGLE &&
      neibond.b.stereo === Bond.PATTERN.STEREO.UP

    if (singleUp) {
      return (
        neibond.b.end === hb.begin ||
        (neibond.boldStereo && includeBoldStereoBond)
      )
    }

    return !!(
      neibond.b.type === Bond.PATTERN.TYPE.DOUBLE &&
      neibond.b.stereo === Bond.PATTERN.STEREO.NONE &&
      includeBoldStereoBond &&
      neibond.boldStereo
    )
  })
}

function findIncomingUpBonds(
  bid0: number,
  bond: ReBond,
  restruct: ReStruct
): void {
  const halfbonds = [bond.b.begin, bond.b.end].map((aid) => {
    const atom = restruct.molecule.atoms.get(aid)
    if (!atom) return -1
    const pos = findIncomingStereoUpBond(atom, bid0, true, restruct)
    return pos < 0 ? -1 : atom.neighbors[pos]
  })

  bond.neihbid1 = restruct.atoms.get(bond.b.begin)?.showLabel
    ? -1
    : halfbonds[0]
  bond.neihbid2 = restruct.atoms.get(bond.b.end)?.showLabel ? -1 : halfbonds[1]
}

function checkStereoBold(bid0, bond, restruct) {
  const halfbonds = [bond.b.begin, bond.b.end].map((aid) => {
    const atom = restruct.molecule.atoms.get(aid)
    const pos = findIncomingStereoUpBond(atom, bid0, false, restruct)
    return pos < 0 ? -1 : atom.neighbors[pos]
  })
  bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0
}

function getBondPath(
  restruct: ReStruct,
  bond: ReBond,
  hb1: HalfBond,
  hb2: HalfBond
) {
  let path = null
  const render = restruct.render
  const struct = restruct.molecule
  const shiftA = !restruct.atoms.get(hb1.begin)?.showLabel
  const shiftB = !restruct.atoms.get(hb2.begin)?.showLabel

  switch (bond.b.type) {
    case Bond.PATTERN.TYPE.SINGLE:
      switch (bond.b.stereo) {
        case Bond.PATTERN.STEREO.UP:
          findIncomingUpBonds(hb1.bid, bond, restruct)
          if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
            path = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct)
          } else path = getBondSingleUpPath(render, hb1, hb2, bond, struct)
          break
        case Bond.PATTERN.STEREO.DOWN:
          path = getBondSingleDownPath(render, hb1, hb2, bond, struct)
          break
        case Bond.PATTERN.STEREO.EITHER:
          path = getBondSingleEitherPath(render, hb1, hb2, bond, struct)
          break
        default:
          path = draw.bondSingle(
            render.paper,
            hb1,
            hb2,
            render.options,
            getStereoBondColor(render.options, bond, struct)
          )
          break
      }
      break
    case Bond.PATTERN.TYPE.DOUBLE:
      findIncomingUpBonds(hb1.bid, bond, restruct)
      if (
        bond.b.stereo === Bond.PATTERN.STEREO.NONE &&
        bond.boldStereo &&
        bond.neihbid1 >= 0 &&
        bond.neihbid2 >= 0
      ) {
        path = getBondDoubleStereoBoldPath(
          render,
          hb1,
          hb2,
          bond,
          struct,
          shiftA,
          shiftB
        )
      } else path = getBondDoublePath(render, hb1, hb2, bond, shiftA, shiftB)
      break
    case Bond.PATTERN.TYPE.TRIPLE:
      path = draw.bondTriple(render.paper, hb1, hb2, render.options)
      break
    case Bond.PATTERN.TYPE.AROMATIC: {
      const inAromaticLoop =
        (hb1.loop >= 0 && struct.loops.get(hb1.loop)?.aromatic) ||
        (hb2.loop >= 0 && struct.loops.get(hb2.loop)?.aromatic)
      path = inAromaticLoop
        ? draw.bondSingle(render.paper, hb1, hb2, render.options)
        : getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB)
      break
    }
    case Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE:
      path = getSingleOrDoublePath(render, hb1, hb2)
      break
    case Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC:
      path = getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB)
      break
    case Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC:
      path = getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB)
      break
    case Bond.PATTERN.TYPE.ANY:
      path = draw.bondAny(render.paper, hb1, hb2, render.options)
      break
    case Bond.PATTERN.TYPE.HYDROGEN:
      path = draw.bondHydrogen(render.paper, hb1, hb2, render.options)
      break
    case Bond.PATTERN.TYPE.DATIVE:
      path = draw.bondDative(render.paper, hb1, hb2, render.options)
      break
    default:
      throw new Error('Bond type ' + bond.b.type + ' not supported')
  }
  return path
}

/* Get Path */
function getBondSingleUpPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  struct: Struct
) {
  // eslint-disable-line max-params
  const a = hb1.p
  const b = hb2.p
  const n = hb1.norm
  const options = render.options
  const bsp = 0.7 * options.stereoBond
  let b2 = b.addScaled(n, bsp)
  let b3 = b.addScaled(n, -bsp)
  if (bond.neihbid2 >= 0) {
    // if the end is shared with another up-bond heading this way
    const coords = stereoUpBondGetCoordinates(
      hb2,
      bond.neihbid2,
      options.stereoBond,
      struct
    )
    b2 = coords[0]
    b3 = coords[1]
  }
  return draw.bondSingleUp(
    render.paper,
    a,
    b2,
    b3,
    options,
    getStereoBondColor(options, bond, struct)
  )
}

function getStereoBondColor(
  options: any,
  bond: ReBond,
  struct: Struct
): string {
  const defaultColor = '#000'

  if (bond.b.stereo === 0) return defaultColor

  const beginAtomStereoLabel = struct.atoms.get(bond.b.begin)?.stereoLabel
  const endAtomStereoLabel = struct.atoms.get(bond.b.end)?.stereoLabel

  let stereoLabel = ''
  if (beginAtomStereoLabel && !endAtomStereoLabel) {
    stereoLabel = beginAtomStereoLabel
  } else if (!beginAtomStereoLabel && endAtomStereoLabel) {
    stereoLabel = endAtomStereoLabel
  }

  if (
    // if no stereolabel presents or presents in both then use default color
    !stereoLabel ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.LabelsOnly
  ) {
    return defaultColor
  }

  return getColorFromStereoLabel(options, stereoLabel)
}

function getBondSingleStereoBoldPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  struct: Struct
) {
  // eslint-disable-line max-params
  const options = render.options
  const coords1 = stereoUpBondGetCoordinates(
    hb1,
    bond.neihbid1,
    options.stereoBond,
    struct
  )
  const coords2 = stereoUpBondGetCoordinates(
    hb2,
    bond.neihbid2,
    options.stereoBond,
    struct
  )
  const a1 = coords1[0]
  const a2 = coords1[1]
  const a3 = coords2[0]
  const a4 = coords2[1]
  return draw.bondSingleStereoBold(
    render.paper,
    a1,
    a2,
    a3,
    a4,
    options,
    getStereoBondColor(options, bond, struct)
  )
}

function getBondDoubleStereoBoldPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  struct: Struct,
  shiftA: boolean,
  shiftB: boolean
) {
  // eslint-disable-line max-params
  const a = hb1.p
  const b = hb2.p
  const n = hb1.norm
  const shift = bond.doubleBondShift
  const bsp = 1.5 * render.options.stereoBond
  let b1 = a.addScaled(n, bsp * shift)
  let b2 = b.addScaled(n, bsp * shift)
  if (shift > 0) {
    if (shiftA) {
      b1 = b1.addScaled(
        hb1.dir,
        bsp * getBondLineShift(hb1.rightCos, hb1.rightSin)
      )
    }
    if (shiftB) {
      b2 = b2.addScaled(
        hb1.dir,
        -bsp * getBondLineShift(hb2.leftCos, hb2.leftSin)
      )
    }
  } else if (shift < 0) {
    if (shiftA) {
      b1 = b1.addScaled(
        hb1.dir,
        bsp * getBondLineShift(hb1.leftCos, hb1.leftSin)
      )
    }
    if (shiftB) {
      b2 = b2.addScaled(
        hb1.dir,
        -bsp * getBondLineShift(hb2.rightCos, hb2.rightSin)
      )
    }
  }
  const sgBondPath = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct)
  return draw.bondDoubleStereoBold(
    render.paper,
    sgBondPath,
    b1,
    b2,
    render.options,
    getStereoBondColor(render.options, bond, struct)
  )
}

function getBondLineShift(cos: number, sin: number): number {
  if (sin < 0 || Math.abs(cos) > 0.9) return 0
  return sin / (1 - cos)
}

function stereoUpBondGetCoordinates(
  hb: HalfBond,
  neihbid: number,
  bondSpace: any,
  struct: Struct
): [Vec2, Vec2] {
  const neihb = struct.halfBonds.get(neihbid)
  const cos = Vec2.dot(hb.dir, neihb!.dir)
  const sin = Vec2.cross(hb.dir, neihb!.dir)
  const cosHalf = Math.sqrt(0.5 * (1 - cos))
  const biss = neihb!.dir.rotateSC(
    (sin >= 0 ? -1 : 1) * cosHalf,
    Math.sqrt(0.5 * (1 + cos))
  )

  const denomAdd = 0.3
  const scale = 0.7
  const a1 = hb.p.addScaled(biss, (scale * bondSpace) / (cosHalf + denomAdd))
  const a2 = hb.p.addScaled(
    biss.negated(),
    (scale * bondSpace) / (cosHalf + denomAdd)
  )
  return sin > 0 ? [a1, a2] : [a2, a1]
}

function getBondSingleDownPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  struct: Struct
) {
  const a = hb1.p
  const b = hb2.p
  const options = render.options
  let d = b.sub(a)
  const len = d.length() + 0.2
  d = d.normalized()
  const interval = 1.2 * options.lineWidth
  const nlines =
    Math.max(
      Math.floor((len - options.lineWidth) / (options.lineWidth + interval)),
      0
    ) + 2
  const step = len / (nlines - 1)
  return draw.bondSingleDown(
    render.paper,
    hb1,
    d,
    nlines,
    step,
    options,
    getStereoBondColor(options, bond, struct)
  )
}

function getBondSingleEitherPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  struct: Struct
) {
  const a = hb1.p
  const b = hb2.p
  const options = render.options
  let d = b.sub(a)
  const len = d.length()
  d = d.normalized()
  const interval = 0.6 * options.lineWidth
  const nlines =
    Math.max(
      Math.floor((len - options.lineWidth) / (options.lineWidth + interval)),
      0
    ) + 2
  const step = len / (nlines - 0.5)
  return draw.bondSingleEither(
    render.paper,
    hb1,
    d,
    nlines,
    step,
    options,
    getStereoBondColor(options, bond, struct)
  )
}

function getBondDoublePath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  shiftA: boolean,
  shiftB: boolean
) {
  // eslint-disable-line max-params, max-statements
  const cisTrans = bond.b.stereo === Bond.PATTERN.STEREO.CIS_TRANS

  const a = hb1.p
  const b = hb2.p
  const n = hb1.norm
  const shift = cisTrans ? 0 : bond.doubleBondShift

  const options = render.options
  const bsp = options.bondSpace / 2
  const s1 = bsp + shift * bsp
  const s2 = -bsp + shift * bsp

  let a1 = a.addScaled(n, s1)
  let b1 = b.addScaled(n, s1)
  let a2 = a.addScaled(n, s2)
  let b2 = b.addScaled(n, s2)

  if (shift > 0) {
    if (shiftA) {
      a1 = a1.addScaled(
        hb1.dir,
        options.bondSpace * getBondLineShift(hb1.rightCos, hb1.rightSin)
      )
    }
    if (shiftB) {
      b1 = b1.addScaled(
        hb1.dir,
        -options.bondSpace * getBondLineShift(hb2.leftCos, hb2.leftSin)
      )
    }
  } else if (shift < 0) {
    if (shiftA) {
      a2 = a2.addScaled(
        hb1.dir,
        options.bondSpace * getBondLineShift(hb1.leftCos, hb1.leftSin)
      )
    }
    if (shiftB) {
      b2 = b2.addScaled(
        hb1.dir,
        -options.bondSpace * getBondLineShift(hb2.rightCos, hb2.rightSin)
      )
    }
  }

  return draw.bondDouble(render.paper, a1, a2, b1, b2, cisTrans, options)
}

function getSingleOrDoublePath(render: Render, hb1: HalfBond, hb2: HalfBond) {
  const a = hb1.p
  const b = hb2.p
  const options = render.options

  let nSect =
    Vec2.dist(a, b) / Number((options.bondSpace + options.lineWidth).toFixed())
  if (!(nSect & 1)) nSect += 1
  return draw.bondSingleOrDouble(render.paper, hb1, hb2, nSect, options)
}

function getBondAromaticPath(
  render: Render,
  hb1: HalfBond,
  hb2: HalfBond,
  bond: ReBond,
  shiftA: boolean,
  shiftB: boolean
) {
  // eslint-disable-line max-params
  const dashdotPattern = [0.125, 0.125, 0.005, 0.125]
  let mark: number | null = null
  let dash: number[] | null = null
  const options = render.options
  const bondShift = bond.doubleBondShift

  if (bond.b.type === Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC) {
    mark = bondShift > 0 ? 1 : 2
    dash = dashdotPattern.map((v) => v * options.scale)
  }
  if (bond.b.type === Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC) {
    mark = 3
    dash = dashdotPattern.map((v) => v * options.scale)
  }
  const paths = getAromaticBondPaths(
    hb1,
    hb2,
    bondShift,
    shiftA,
    shiftB,
    options.bondSpace,
    mark,
    dash
  )
  return draw.bondAromatic(render.paper, paths, bondShift, options)
}

function getAromaticBondPaths(
  hb1: HalfBond,
  hb2: HalfBond,
  shift: number,
  shiftA: boolean,
  shiftB: boolean,
  bondSpace: number,
  mask: number | null,
  dash: number[] | null
) {
  // eslint-disable-line max-params, max-statements
  const a = hb1.p
  const b = hb2.p
  const n = hb1.norm
  const bsp = bondSpace / 2
  const s1 = bsp + shift * bsp
  const s2 = -bsp + shift * bsp
  let a2 = a.addScaled(n, s1)
  let b2 = b.addScaled(n, s1)
  let a3 = a.addScaled(n, s2)
  let b3 = b.addScaled(n, s2)
  if (shift > 0) {
    if (shiftA) {
      a2 = a2.addScaled(
        hb1.dir,
        bondSpace * getBondLineShift(hb1.rightCos, hb1.rightSin)
      )
    }
    if (shiftB) {
      b2 = b2.addScaled(
        hb1.dir,
        -bondSpace * getBondLineShift(hb2.leftCos, hb2.leftSin)
      )
    }
  } else if (shift < 0) {
    if (shiftA) {
      a3 = a3.addScaled(
        hb1.dir,
        bondSpace * getBondLineShift(hb1.leftCos, hb1.leftSin)
      )
    }
    if (shiftB) {
      b3 = b3.addScaled(
        hb1.dir,
        -bondSpace * getBondLineShift(hb2.rightCos, hb2.rightSin)
      )
    }
  }
  return draw.aromaticBondPaths(a2, a3, b2, b3, mask, dash)
}

function getReactingCenterPath(
  render: Render,
  bond: ReBond,
  hb1: HalfBond,
  hb2: HalfBond
) {
  // eslint-disable-line max-statements
  const a = hb1.p
  const b = hb2.p
  const c = b.add(a).scaled(0.5)
  const d = b.sub(a).normalized()
  const n = d.rotateSC(1, 0)

  const p: Array<Vec2> = []

  const lw = render.options.lineWidth
  const bs = render.options.bondSpace / 2
  const alongIntRc = lw // half interval along for CENTER
  const alongIntMadeBroken = 2 * lw // half interval between along for MADE_OR_BROKEN
  const alongSz = 1.5 * bs // half size along for CENTER
  const acrossInt = 1.5 * bs // half interval across for CENTER
  const acrossSz = 3.0 * bs // half size across for all
  const tiltTan = 0.2 // tangent of the tilt angle

  switch (bond.b.reactingCenterStatus) {
    case Bond.PATTERN.REACTING_CENTER.NOT_CENTER: // X
      p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz))
      p.push(c.addScaled(n, acrossSz).addScaled(d, -tiltTan * acrossSz))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, tiltTan * acrossSz))
      break
    case Bond.PATTERN.REACTING_CENTER.CENTER: // #
      p.push(
        c
          .addScaled(n, acrossSz)
          .addScaled(d, tiltTan * acrossSz)
          .addScaled(d, alongIntRc)
      )
      p.push(
        c
          .addScaled(n, -acrossSz)
          .addScaled(d, -tiltTan * acrossSz)
          .addScaled(d, alongIntRc)
      )
      p.push(
        c
          .addScaled(n, acrossSz)
          .addScaled(d, tiltTan * acrossSz)
          .addScaled(d, -alongIntRc)
      )
      p.push(
        c
          .addScaled(n, -acrossSz)
          .addScaled(d, -tiltTan * acrossSz)
          .addScaled(d, -alongIntRc)
      )
      p.push(c.addScaled(d, alongSz).addScaled(n, acrossInt))
      p.push(c.addScaled(d, -alongSz).addScaled(n, acrossInt))
      p.push(c.addScaled(d, alongSz).addScaled(n, -acrossInt))
      p.push(c.addScaled(d, -alongSz).addScaled(n, -acrossInt))
      break
    // case Bond.PATTERN.REACTING_CENTER.UNCHANGED: draw a circle
    case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN:
      p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken))
      p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken))
      break
    case Bond.PATTERN.REACTING_CENTER.ORDER_CHANGED:
      p.push(c.addScaled(n, acrossSz))
      p.push(c.addScaled(n, -acrossSz))
      break
    case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
      p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken))
      p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken))
      p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken))
      p.push(c.addScaled(n, acrossSz))
      p.push(c.addScaled(n, -acrossSz))
      break
    default:
      return null
  }
  return draw.reactingCenter(render.paper, p, render.options)
}

function getTopologyMark(
  render: Render,
  bond: ReBond,
  hb1: HalfBond,
  hb2: HalfBond
) {
  // eslint-disable-line max-statements
  const options = render.options
  let mark: string | null = null

  if (bond.b.topology === Bond.PATTERN.TOPOLOGY.RING) mark = 'rng'
  else if (bond.b.topology === Bond.PATTERN.TOPOLOGY.CHAIN) mark = 'chn'
  else return null

  const a = hb1.p
  const b = hb2.p
  const c = b.add(a).scaled(0.5)
  const d = b.sub(a).normalized()
  let n = d.rotateSC(1, 0)
  let fixed = options.lineWidth
  if (bond.doubleBondShift > 0) n = n.scaled(-bond.doubleBondShift)
  else if (bond.doubleBondShift === 0) fixed += options.bondSpace / 2

  const s = new Vec2(2, 1).scaled(options.bondSpace)
  if (bond.b.type === Bond.PATTERN.TYPE.TRIPLE) fixed += options.bondSpace
  const p = c.add(new Vec2(n.x * (s.x + fixed), n.y * (s.y + fixed)))

  return draw.topologyMark(render.paper, p, mark, options)
}

function getIdsPath(
  bid: number,
  paper: any,
  hb1: HalfBond,
  hb2: HalfBond,
  bondIdxOff: number,
  param1: number,
  param2: number,
  norm: Vec2
) {
  // eslint-disable-line max-params
  const pb = Vec2.lc(hb1.p, param1, hb2.p, param2, norm, bondIdxOff)
  const ipath = paper.text(pb.x, pb.y, bid.toString())
  const irbb = util.relBox(ipath.getBBox())
  draw.recenterText(ipath, irbb)
  return ipath
}
/* ----- */

function setDoubleBondShift(bond: ReBond, struct: Struct): void {
  const hb1 = bond.b.hb1
  const hb2 = bond.b.hb2

  if ((!hb1 && hb1 !== 0) || (!hb2 && hb2 !== 0)) {
    bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond)
    return
  }

  const loop1 = struct.halfBonds.get(hb1)!.loop
  const loop2 = struct.halfBonds.get(hb2)!.loop
  if (loop1 >= 0 && loop2 >= 0) {
    const d1 = struct.loops.get(loop1)!.dblBonds
    const d2 = struct.loops.get(loop2)!.dblBonds
    const n1 = struct.loops.get(loop1)!.hbs.length
    const n2 = struct.loops.get(loop2)!.hbs.length
    bond.doubleBondShift = selectDoubleBondShift(n1, n2, d1, d2)
  } else if (loop1 >= 0) {
    bond.doubleBondShift = -1
  } else if (loop2 >= 0) {
    bond.doubleBondShift = 1
  } else {
    bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond)
  }
}

function bondRecalc(bond: ReBond, restruct: ReStruct, options: any): void {
  const render = restruct.render
  const atom1 = restruct.atoms.get(bond.b.begin)
  const atom2 = restruct.atoms.get(bond.b.end)

  if (
    !atom1 ||
    !atom2 ||
    bond.b.hb1 === undefined ||
    bond.b.hb2 === undefined
  ) {
    return
  }

  const p1 = Scale.obj2scaled(atom1.a.pp, render.options)
  const p2 = Scale.obj2scaled(atom2.a.pp, render.options)
  const hb1 = restruct.molecule.halfBonds.get(bond.b.hb1)
  const hb2 = restruct.molecule.halfBonds.get(bond.b.hb2)

  if (!hb1?.dir || !hb2?.dir) return

  hb1.p = shiftBondEnd(atom1, p1, hb1.dir, 2 * options.lineWidth)
  hb2.p = shiftBondEnd(atom2, p2, hb2.dir, 2 * options.lineWidth)
  bond.b.center = Vec2.lc2(atom1.a.pp, 0.5, atom2.a.pp, 0.5)
  bond.b.len = Vec2.dist(p1, p2)
  bond.b.sb = options.lineWidth * 5
  /* eslint-disable no-mixed-operators */
  bond.b.sa = Math.max(bond.b.sb, bond.b.len / 2 - options.lineWidth * 2)
  /* eslint-enable no-mixed-operators */
  bond.b.angle = (Math.atan2(hb1.dir.y, hb1.dir.x) * 180) / Math.PI
}

function shiftBondEnd(
  atom: ReAtom,
  pos0: Vec2,
  dir: Vec2,
  margin: number
): Vec2 {
  let t = 0
  const visel = atom.visel
  for (let k = 0; k < visel.exts.length; ++k) {
    const box = visel.exts[k].translate(pos0)
    t = Math.max(t, util.shiftRayBox(pos0, dir, box))
  }
  if (t > 0) pos0 = pos0.addScaled(dir, t + margin)
  return pos0
}

function selectDoubleBondShift(
  n1: number,
  n2: number,
  d1: number,
  d2: number
): number {
  if (n1 === 6 && n2 !== 6 && (d1 > 1 || d2 === 1)) return -1
  if (n2 === 6 && n1 !== 6 && (d2 > 1 || d1 === 1)) return 1
  if (n2 * d1 > n1 * d2) return -1
  if (n2 * d1 < n1 * d2) return 1
  if (n2 > n1) return -1
  return 1
}

function selectDoubleBondShiftChain(struct: Struct, bond: ReBond): number {
  if ((!bond.b.hb1 && bond.b.hb1 !== 0) || (!bond.b.hb2 && bond.b.hb2 !== 0)) {
    return 0
  }

  const hb1 = struct.halfBonds.get(bond.b.hb1)
  const hb2 = struct.halfBonds.get(bond.b.hb2)
  if (!hb1 || !hb2) return 0
  const nLeft = (hb1.leftSin > 0.3 ? 1 : 0) + (hb2.rightSin > 0.3 ? 1 : 0)
  const nRight = (hb2.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0)
  if (nLeft > nRight) return -1
  if (nLeft < nRight) return 1
  if ((hb1.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0) === 1) return 1
  return 0
}

export default ReBond
