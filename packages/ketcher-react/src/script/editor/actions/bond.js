/****************************************************************************
 * Copyright 2020 EPAM Systems
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

import { Atom, Bond } from 'ketcher-core'

import {
  FragmentAdd,
  AtomAdd,
  AtomAttr,
  BondAdd,
  BondAttr,
  BondDelete
} from '../operations'
import utils from '../shared/utils'
import Action from '../shared/action'

import { atomGetAttr, atomForNewBond, atomGetNeighbors } from './utils'
import {
  fromAtomMerge,
  fromStereoAtomAttrs,
  mergeFragmentsIfNeeded,
  mergeSgroups
} from './atom'

export function fromBondAddition(restruct, bond, begin, end, pos, pos2) {
  // eslint-disable-line
  if (end === undefined) {
    const atom = atomForNewBond(restruct, begin)
    end = atom.atom
    pos = atom.pos
  }
  const action = new Action()
  let mergeFragments = false

  let frid = null

  if (!(typeof begin === 'number')) {
    if (typeof end === 'number') frid = atomGetAttr(restruct, end, 'fragment')
  } else {
    frid = atomGetAttr(restruct, begin, 'fragment')
    if (typeof end === 'number') mergeFragments = true
  }

  if (frid == null)
    frid = action.addOp(new FragmentAdd().perform(restruct)).frid

  if (!(typeof begin === 'number')) {
    begin.fragment = frid
    begin = action.addOp(new AtomAdd(begin, pos).perform(restruct)).data.aid
    if (typeof end === 'number') mergeSgroups(action, restruct, [begin], end)
    pos = pos2
  } else if (atomGetAttr(restruct, begin, 'label') === '*') {
    action.addOp(new AtomAttr(begin, 'label', 'C').perform(restruct))
  }

  if (!(typeof end === 'number')) {
    end.fragment = frid
    // TODO: <op>.data.aid here is a hack, need a better way to access the id of a created atom
    end = action.addOp(new AtomAdd(end, pos).perform(restruct)).data.aid
    if (typeof begin === 'number') mergeSgroups(action, restruct, [end], begin)
  } else if (atomGetAttr(restruct, end, 'label') === '*') {
    action.addOp(new AtomAttr(end, 'label', 'C').perform(restruct))
  }

  const bid = action.addOp(new BondAdd(begin, end, bond).perform(restruct)).data
    .bid
  if (bond.stereo > 0) action.mergeWith(fromBondStereoUpdate(restruct, bid))
  action.operations.reverse()

  if (mergeFragments) mergeFragmentsIfNeeded(action, restruct, begin, end)

  return [action, begin, end, bid]
}

/**
 * @param restruct { ReStruct }
 * @param ids { Array<number>|number }
 * @param attrs { Bond }
 * @param reset? { boolean }
 */
export function fromBondsAttrs(restruct, ids, attrs, reset) {
  const action = new Action()
  const bids = Array.isArray(ids) ? ids : [ids]

  bids.forEach(bid => {
    Object.keys(Bond.attrlist).forEach(key => {
      if (!(key in attrs) && !reset) return

      const value = key in attrs ? attrs[key] : Bond.attrGetDefault(key)
      action.addOp(new BondAttr(bid, key, value).perform(restruct))
      if (key === 'stereo' && key in attrs)
        action.mergeWith(fromBondStereoUpdate(restruct, bid, true))
    })
  })

  return action
}

/**
 * @param restruct { ReStruct }
 * @param mergeMap { Map<number, number> }
 */
export function fromBondsMerge(restruct, mergeMap) {
  const struct = restruct.molecule

  const atomPairs = new Map()
  let action = new Action()

  mergeMap.forEach((dstId, srcId) => {
    const bond = struct.bonds.get(srcId)
    const bondCI = struct.bonds.get(dstId)

    const params = utils.mergeBondsParams(struct, bond, struct, bondCI)
    if (!params.merged) return

    atomPairs.set(bond.begin, !params.cross ? bondCI.begin : bondCI.end)
    atomPairs.set(bond.end, !params.cross ? bondCI.end : bondCI.begin)
  })

  atomPairs.forEach((dst, src) => {
    action = fromAtomMerge(restruct, src, dst).mergeWith(action)
  })

  return action
}

function fromBondFlipping(restruct, id) {
  const bond = restruct.molecule.bonds.get(id)

  const action = new Action()
  action.addOp(new BondDelete(id))
  action.addOp(new BondAdd(bond.end, bond.begin, bond)).data.bid = id
  // todo: swap atoms stereoLabels and stereoAtoms in fragment
  return action.perform(restruct)
}

export function fromBondStereoUpdate(restruct, bid, withReverse) {
  const struct = restruct.molecule
  let bond = struct.bonds.get(bid)
  const action = new Action()

  if (bond.stereo === Bond.PATTERN.STEREO.NONE) {
    const neigs = atomGetNeighbors(restruct, bond.begin)
    const stereoNeig = neigs.find(
      item => item.bid !== bid && struct.bonds.get(item.bid).stereo > 0
    )
    if (neigs.length < 3 || !stereoNeig) {
      action.mergeWith(
        fromStereoAtomAttrs(
          restruct,
          bond.begin,
          {
            stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
            stereoLabel: null
          },
          withReverse
        )
      )
      return action
    }
    bond = struct.bonds.get(stereoNeig.bid)
  }

  let newAtomParity = null
  switch (bond.stereo) {
    case Bond.PATTERN.STEREO.UP:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.ODD
      break
    case Bond.PATTERN.STEREO.EITHER:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EITHER
      break
    case Bond.PATTERN.STEREO.DOWN:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EVEN
      break
    default:
      return action
  }

  action.mergeWith(
    fromStereoAtomAttrs(
      restruct,
      bond.begin,
      {
        stereoParity: newAtomParity,
        stereoLabel: 'and-1'
      },
      withReverse
    )
  )
  return action
}

/**
 * @param restruct { ReStruct }
 * @param itemID - bond id in structure
 * @param bond - bond for change
 * @param bondProps - bondTool properties
 * @returns Action
 */
export function bondChangingAction(restruct, itemID, bond, bondProps) {
  if (
    bondProps.stereo !== Bond.PATTERN.STEREO.NONE && //
    bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
    bond.type === bondProps.type &&
    bond.stereo === bondProps.stereo
  )
    // if bondTool is stereo and equal to bond for change
    return fromBondFlipping(restruct, itemID)

  const loop = plainBondTypes.includes(bondProps.type) ? plainBondTypes : null
  if (
    bondProps.stereo === Bond.PATTERN.STEREO.NONE &&
    bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
    bond.stereo === Bond.PATTERN.STEREO.NONE &&
    loop
  )
    // if `Single bond` tool is chosen and bond for change in `plainBondTypes`
    bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length]

  const isFlip = bondFlipRequired(restruct.molecule, bond, bondProps)
  const action = isFlip ? fromBondFlipping(restruct, itemID) : new Action()

  return fromBondsAttrs(restruct, itemID, bondProps).mergeWith(action)
}

function bondFlipRequired(struct, bond, attrs) {
  return (
    attrs.type === Bond.PATTERN.TYPE.SINGLE &&
    bond.stereo === Bond.PATTERN.STEREO.NONE &&
    attrs.stereo !== Bond.PATTERN.STEREO.NONE &&
    struct.atoms.get(bond.begin).neighbors.length <
      struct.atoms.get(bond.end).neighbors.length
  )
}

const plainBondTypes = [
  Bond.PATTERN.TYPE.SINGLE,
  Bond.PATTERN.TYPE.DOUBLE,
  Bond.PATTERN.TYPE.TRIPLE
]
