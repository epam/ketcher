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
  Bond,
  RxnArrow,
  RxnPlus,
  Struct,
  Vec2,
  RGroup,
  Fragment
} from 'domain/entities'

function paddedNum(number, width, precision) {
  number = parseFloat(number)

  const numStr = number.toFixed(precision || 0).replace(',', '.') // Really need to replace?
  if (numStr.length > width) throw new Error('number does not fit')

  return numStr.padStart(width)
}

function parseDecimalInt(str) {
  /* reader */
  const val = parseInt(str, 10)

  return isNaN(val) ? 0 : val // eslint-disable-line
}

function partitionLine(
  /* string */ str,
  /* array of int */ parts,
  /* bool */ withspace
) {
  /* reader */
  const res = []
  for (let i = 0, shift = 0; i < parts.length; ++i) {
    res.push(str.slice(shift, shift + parts[i]))
    if (withspace) shift++
    shift += parts[i]
  }
  return res
}

function partitionLineFixed(
  /* string */ str,
  /* int */ itemLength,
  /* bool */ withspace
) {
  /* reader */
  const res = []
  for (let shift = 0; shift < str.length; shift += itemLength) {
    res.push(str.slice(shift, shift + itemLength))
    if (withspace) shift++
  }
  return res
}

const fmtInfo = {
  bondTypeMap: {
    1: Bond.PATTERN.TYPE.SINGLE,
    2: Bond.PATTERN.TYPE.DOUBLE,
    3: Bond.PATTERN.TYPE.TRIPLE,
    4: Bond.PATTERN.TYPE.AROMATIC,
    5: Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
    6: Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
    7: Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
    8: Bond.PATTERN.TYPE.ANY,
    9: Bond.PATTERN.TYPE.DATIVE,
    10: Bond.PATTERN.TYPE.HYDROGEN
  },
  bondStereoMap: {
    0: Bond.PATTERN.STEREO.NONE,
    1: Bond.PATTERN.STEREO.UP,
    4: Bond.PATTERN.STEREO.EITHER,
    6: Bond.PATTERN.STEREO.DOWN,
    3: Bond.PATTERN.STEREO.CIS_TRANS
  },
  v30bondStereoMap: {
    0: Bond.PATTERN.STEREO.NONE,
    1: Bond.PATTERN.STEREO.UP,
    2: Bond.PATTERN.STEREO.EITHER,
    3: Bond.PATTERN.STEREO.DOWN
  },
  bondTopologyMap: {
    0: Bond.PATTERN.TOPOLOGY.EITHER,
    1: Bond.PATTERN.TOPOLOGY.RING,
    2: Bond.PATTERN.TOPOLOGY.CHAIN
  },
  countsLinePartition: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
  atomLinePartition: [10, 10, 10, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  bondLinePartition: [3, 3, 3, 3, 3, 3, 3],
  atomListHeaderPartition: [3, 1, 1, 4, 1, 1],
  atomListHeaderLength: 11, // = atomListHeaderPartition.reduce(function(a,b) { return a + b; }, 0)
  atomListHeaderItemLength: 4,
  chargeMap: [0, +3, +2, +1, 0, -1, -2, -3],
  valenceMap: [undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
  implicitHydrogenMap: [undefined, 0, 1, 2, 3, 4],
  v30atomPropMap: {
    CHG: 'charge',
    RAD: 'radical',
    MASS: 'isotope',
    VAL: 'explicitValence',
    HCOUNT: 'hCount',
    INVRET: 'invRet',
    SUBST: 'substitutionCount',
    UNSAT: 'unsaturatedAtom',
    RBCNT: 'ringBondCount'
  },
  rxnItemsPartition: [3, 3, 3]
}

const FRAGMENT = {
  NONE: 0,
  REACTANT: 1,
  PRODUCT: 2,
  AGENT: 3
}

const SHOULD_RESCALE_MOLECULES = true

function rxnMerge(
  mols,
  nReactants,
  nProducts,
  nAgents,
  shouldReactionRelayout
) /* Struct */ {
  // eslint-disable-line max-statements
  /* reader */
  const ret = new Struct()
  const bbReact = []
  const bbAgent = []
  const bbProd = []
  const molReact = []
  const molAgent = []
  const molProd = []
  let j
  const bondLengthData = { cnt: 0, totalLength: 0 }
  for (j = 0; j < mols.length; ++j) {
    var mol = mols[j]
    const bondLengthDataMol = mol.getBondLengthData()
    bondLengthData.cnt += bondLengthDataMol.cnt
    bondLengthData.totalLength += bondLengthDataMol.totalLength
  }
  if (SHOULD_RESCALE_MOLECULES) {
    const avgBondLength =
      1 /
      (bondLengthData.cnt === 0
        ? 1
        : bondLengthData.totalLength / bondLengthData.cnt)
    for (j = 0; j < mols.length; ++j) {
      mol = mols[j]
      mol.scale(avgBondLength)
    }
  }

  for (j = 0; j < mols.length; ++j) {
    mol = mols[j]
    const bb = mol.getCoordBoundingBoxObj()
    if (!bb) continue // eslint-disable-line no-continue

    var fragmentType =
      j < nReactants
        ? FRAGMENT.REACTANT // eslint-disable-line no-nested-ternary
        : j < nReactants + nProducts
        ? FRAGMENT.PRODUCT
        : FRAGMENT.AGENT
    if (fragmentType === FRAGMENT.REACTANT) {
      bbReact.push(bb)
      molReact.push(mol)
    } else if (fragmentType === FRAGMENT.AGENT) {
      bbAgent.push(bb)
      molAgent.push(mol)
    } else if (fragmentType === FRAGMENT.PRODUCT) {
      bbProd.push(bb)
      molProd.push(mol)
    }

    mol.atoms.forEach((atom) => {
      atom.rxnFragmentType = fragmentType
    })
  }

  function shiftMol(ret, mol, bb, xorig, over) {
    // eslint-disable-line max-params
    const d = new Vec2(
      xorig - bb.min.x,
      over ? 1 - bb.min.y : -(bb.min.y + bb.max.y) / 2
    )
    mol.atoms.forEach((atom) => {
      atom.pp.add_(d) // eslint-disable-line no-underscore-dangle
    })

    mol.sgroups.forEach((item) => {
      if (item.pp) item.pp.add_(d) // eslint-disable-line no-underscore-dangle
    })
    bb.min.add_(d) // eslint-disable-line no-underscore-dangle
    bb.max.add_(d) // eslint-disable-line no-underscore-dangle
    mol.mergeInto(ret)
    return bb.max.x - bb.min.x
  }

  if (shouldReactionRelayout) {
    // reaction fragment layout
    let xorig = 0
    for (j = 0; j < molReact.length; ++j) {
      xorig += shiftMol(ret, molReact[j], bbReact[j], xorig, false) + 2.0
    }
    xorig += 2.0
    for (j = 0; j < molAgent.length; ++j) {
      xorig += shiftMol(ret, molAgent[j], bbAgent[j], xorig, true) + 2.0
    }
    xorig += 2.0

    for (j = 0; j < molProd.length; ++j) {
      xorig += shiftMol(ret, molProd[j], bbProd[j], xorig, false) + 2.0
    }
  } else {
    for (j = 0; j < molReact.length; ++j) molReact[j].mergeInto(ret)
    for (j = 0; j < molAgent.length; ++j) molAgent[j].mergeInto(ret)
    for (j = 0; j < molProd.length; ++j) molProd[j].mergeInto(ret)
  }

  let bb1
  let bb2
  let x
  let y
  let bbReactAll = null
  let bbProdAll = null
  for (j = 0; j < bbReact.length - 1; ++j) {
    bb1 = bbReact[j]
    bb2 = bbReact[j + 1]

    x = (bb1.max.x + bb2.min.x) / 2
    y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4

    ret.rxnPluses.add(new RxnPlus({ pp: new Vec2(x, y) }))
  }
  for (j = 0; j < bbReact.length; ++j) {
    if (j === 0) {
      bbReactAll = {}
      bbReactAll.max = new Vec2(bbReact[j].max)
      bbReactAll.min = new Vec2(bbReact[j].min)
    } else {
      bbReactAll.max = Vec2.max(bbReactAll.max, bbReact[j].max)
      bbReactAll.min = Vec2.min(bbReactAll.min, bbReact[j].min)
    }
  }
  for (j = 0; j < bbProd.length - 1; ++j) {
    bb1 = bbProd[j]
    bb2 = bbProd[j + 1]

    x = (bb1.max.x + bb2.min.x) / 2
    y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4

    ret.rxnPluses.add(new RxnPlus({ pp: new Vec2(x, y) }))
  }
  for (j = 0; j < bbProd.length; ++j) {
    if (j === 0) {
      bbProdAll = {}
      bbProdAll.max = new Vec2(bbProd[j].max)
      bbProdAll.min = new Vec2(bbProd[j].min)
    } else {
      bbProdAll.max = Vec2.max(bbProdAll.max, bbProd[j].max)
      bbProdAll.min = Vec2.min(bbProdAll.min, bbProd[j].min)
    }
  }
  bb1 = bbReactAll
  bb2 = bbProdAll
  const defaultArrowLength = 2

  if (!bb1 && !bb2) {
    ret.rxnArrows.add(
      new RxnArrow({
        mode: 'open-angle',
        pos: [new Vec2(0, 0), new Vec2(defaultArrowLength, 0)]
      })
    )
  } else {
    let v1 = bb1 ? new Vec2(bb1.max.x, (bb1.max.y + bb1.min.y) / 2) : null
    let v2 = bb2 ? new Vec2(bb2.min.x, (bb2.max.y + bb2.min.y) / 2) : null
    const defaultOffset = 3
    if (!v1) v1 = new Vec2(v2.x - defaultOffset, v2.y)
    if (!v2) v2 = new Vec2(v1.x + defaultOffset, v1.y)
    const arrowCenter = Vec2.lc2(v1, 0.5, v2, 0.5)
    const arrowStart = new Vec2(
      arrowCenter.x - 0.5 * defaultArrowLength,
      arrowCenter.y,
      arrowCenter.z
    )
    const arrowEnd = new Vec2(
      arrowCenter.x + 0.5 * defaultArrowLength,
      arrowCenter.y,
      arrowCenter.z
    )
    ret.rxnArrows.add(
      new RxnArrow({
        mode: 'open-angle',
        pos: [arrowStart, arrowEnd]
      })
    )
  }
  ret.isReaction = true
  return ret
}

function rgMerge(scaffold, rgroups) /* Struct */ {
  /* reader */
  const ret = new Struct()

  scaffold.mergeInto(ret, null, null, false, true)

  Object.keys(rgroups).forEach((id) => {
    const rgid = parseInt(id, 10)

    for (let j = 0; j < rgroups[rgid].length; ++j) {
      const ctab = rgroups[rgid][j]
      ctab.rgroups.set(rgid, new RGroup())
      const frag = new Fragment()
      const frid = ctab.frags.add(frag)
      ctab.rgroups.get(rgid).frags.add(frid)
      ctab.atoms.forEach((atom) => {
        atom.fragment = frid
      })
      ctab.mergeInto(ret)
    }
  })

  return ret
}

export default {
  fmtInfo,
  paddedNum,
  parseDecimalInt,
  partitionLine,
  partitionLineFixed,
  rxnMerge,
  rgMerge
}
