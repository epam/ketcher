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
  Neighbor,
  StereoLabel,
  Struct,
  Vec2
} from 'domain/entities'
import {
  AtomAdd,
  AtomAttr,
  BondAdd,
  BondAttr,
  BondDelete,
  CalcImplicitHydrogen,
  FragmentAdd,
  FragmentStereoFlag
} from '../operations'
import { atomForNewBond, atomGetAttr } from './utils'
import {
  fromAtomMerge,
  fromStereoAtomAttrs,
  mergeFragmentsIfNeeded,
  mergeSgroups
} from './atom'

import { Action } from './action'
import { ReStruct } from '../../render'
import { StereoValidator } from 'domain/helpers'
import utils from '../shared/utils'

export function fromBondAddition(
  restruct: ReStruct,
  bond: any,
  begin: any,
  end: any,
  pos?: Vec2,
  pos2?: Vec2
): [Action, number, number, number] {
  // eslint-disable-line
  if (end === undefined) {
    const atom = atomForNewBond(restruct, begin, bond)
    end = atom.atom
    pos = atom.pos
  }
  const action = new Action()
  const struct = restruct.molecule
  let mergeFragments = false

  let frid = null

  if (!(typeof begin === 'number')) {
    if (typeof end === 'number') frid = atomGetAttr(restruct, end, 'fragment')
  } else {
    frid = atomGetAttr(restruct, begin, 'fragment')
    if (typeof end === 'number') mergeFragments = true
  }

  if (frid == null) {
    frid = (action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd)
      .frid
  }

  if (!(typeof begin === 'number')) {
    begin.fragment = frid
    begin = (action.addOp(new AtomAdd(begin, pos).perform(restruct)) as AtomAdd)
      .data.aid
    if (typeof end === 'number') mergeSgroups(action, restruct, [begin], end)
    pos = pos2
  } else if (atomGetAttr(restruct, begin, 'label') === '*') {
    action.addOp(new AtomAttr(begin, 'label', 'C').perform(restruct))
  }

  if (!(typeof end === 'number')) {
    end.fragment = frid
    // TODO: <op>.data.aid here is a hack, need a better way to access the id of a created atom
    end = (action.addOp(new AtomAdd(end, pos).perform(restruct)) as AtomAdd)
      .data.aid
    if (typeof begin === 'number') mergeSgroups(action, restruct, [end], begin)
  } else if (atomGetAttr(restruct, end, 'label') === '*') {
    action.addOp(new AtomAttr(end, 'label', 'C').perform(restruct))
  }

  const bid = (
    action.addOp(new BondAdd(begin, end, bond).perform(restruct)) as BondAdd
  ).data.bid

  const bnd = struct.bonds.get(bid)

  if (bnd) {
    action.addOp(
      new CalcImplicitHydrogen([bnd.begin, bnd.end]).perform(restruct)
    )
    action.mergeWith(fromBondStereoUpdate(restruct, bnd))
  }

  action.operations.reverse()

  if (mergeFragments) mergeFragmentsIfNeeded(action, restruct, begin, end)

  if (struct.frags.get(frid || 0)?.stereoAtoms && !bond.stereo) {
    action.addOp(new FragmentStereoFlag(frid || 0).perform(restruct))
  }

  return [action, begin, end, bid]
}

export function fromBondsAttrs(
  restruct: ReStruct,
  ids: Array<number> | number,
  attrs: Bond,
  reset?: boolean
): Action {
  const struct = restruct.molecule
  const action = new Action()
  const bids = Array.isArray(ids) ? ids : [ids]

  bids.forEach((bid) => {
    Object.keys(Bond.attrlist).forEach((key) => {
      if (!(key in attrs) && !reset) return

      const value = key in attrs ? attrs[key] : Bond.attrGetDefault(key)

      action.addOp(new BondAttr(bid, key, value).perform(restruct))
      if (key === 'stereo' && key in attrs) {
        const bond = struct.bonds.get(bid)
        if (bond) {
          action.addOp(
            new CalcImplicitHydrogen([bond.begin, bond.end]).perform(restruct)
          )
          action.mergeWith(fromBondStereoUpdate(restruct, bond))
        }
      }
    })
  })

  return action
}

export function fromBondsMerge(
  restruct: ReStruct,
  mergeMap: Map<number, number>
): Action {
  const struct = restruct.molecule

  const atomPairs = new Map()
  let action = new Action()

  mergeMap.forEach((dstId, srcId) => {
    const bond = struct.bonds.get(srcId)
    const bondCI = struct.bonds.get(dstId)
    if (!bond || !bondCI) return
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

function fromBondFlipping(restruct: ReStruct, id: number): Action {
  const bond = restruct.molecule.bonds.get(id)

  const action = new Action()
  action.addOp(new BondDelete(id).perform(restruct))

  // TODO: find better way to avoid problem with bond.begin = 0
  if (Number.isInteger(bond?.end) && Number.isInteger(bond?.begin)) {
    action.addOp(new BondAdd(bond?.end, bond?.begin, bond).perform(restruct))
  }

  // todo: swap atoms stereoLabels and stereoAtoms in fragment

  return action
}

export function fromBondStereoUpdate(
  restruct: ReStruct,
  bond: Bond,
  withReverse?: boolean
): Action {
  const action = new Action()
  const struct = restruct.molecule

  const beginFrId = struct.atoms.get(bond?.begin)?.fragment
  const endFrId = struct.atoms.get(bond?.end)?.fragment

  const fragmentStereoBonds: Array<Bond> = []

  struct.bonds.forEach((bond) => {
    if (struct.atoms.get(bond.begin)?.fragment === beginFrId) {
      fragmentStereoBonds.push(bond)
    }

    if (
      beginFrId !== endFrId &&
      struct.atoms.get(bond.begin)?.fragment === endFrId
    ) {
      fragmentStereoBonds.push(bond)
    }
  })

  const stereoAtomsMap = getStereoAtomsMap(struct, fragmentStereoBonds, bond)

  stereoAtomsMap.forEach((stereoProp, aId) => {
    if (struct.atoms.get(aId)?.stereoLabel !== stereoProp.stereoLabel) {
      action.mergeWith(
        fromStereoAtomAttrs(restruct, aId, stereoProp, withReverse)
      )
    }
  })

  return action
}

export function getStereoAtomsMap(
  struct: Struct,
  bonds: Array<Bond>,
  bond?: Bond
) {
  const stereoAtomsMap = new Map()
  const correctAtomIds: Array<number> = []

  bonds.forEach((bond: Bond | undefined) => {
    if (bond) {
      const beginNeighs: Array<Neighbor> | undefined = struct.atomGetNeighbors(
        bond.begin
      )
      const endNeighs: Array<Neighbor> | undefined = struct.atomGetNeighbors(
        bond.end
      )

      if (
        StereoValidator.isCorrectStereoCenter(
          bond,
          beginNeighs,
          endNeighs,
          struct
        )
      ) {
        const stereoLabel = struct.atoms.get(bond.begin)?.stereoLabel
        if (
          stereoLabel == null ||
          stereoAtomsMap.get(bond.begin)?.stereoLabel == null
        ) {
          stereoAtomsMap.set(bond.begin, {
            stereoParity: getStereoParity(bond.stereo),
            stereoLabel: stereoLabel || `${StereoLabel.Abs}`
          })
        }
        correctAtomIds.push(bond.begin)
      } else {
        if (!correctAtomIds.includes(bond.begin)) {
          stereoAtomsMap.set(bond.begin, {
            stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
            stereoLabel: null
          })
        }
        if (!correctAtomIds.includes(bond.end)) {
          stereoAtomsMap.set(bond.end, {
            stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
            stereoLabel: null
          })
        }
      }
    }
  })

  // in case the stereo band is flipped, changed or removed
  // TODO the duplication of the code below should be fixed, mayby by function
  if (bond) {
    if (!correctAtomIds.includes(bond.begin)) {
      stereoAtomsMap.set(bond.begin, {
        stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
        stereoLabel: null
      })
    }
    if (!correctAtomIds.includes(bond.end)) {
      stereoAtomsMap.set(bond.end, {
        stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
        stereoLabel: null
      })
    }
  }

  return stereoAtomsMap
}

function getStereoParity(stereo: number): number | null {
  let newAtomParity: number | null = null
  switch (stereo) {
    case Bond.PATTERN.STEREO.UP:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.ODD
      break
    case Bond.PATTERN.STEREO.EITHER:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EITHER
      break
    case Bond.PATTERN.STEREO.DOWN:
      newAtomParity = Atom.PATTERN.STEREO_PARITY.EVEN
      break
  }
  return newAtomParity
}

export function bondChangingAction(
  restruct: ReStruct,
  itemID: number,
  bond: Bond,
  bondProps: any
): Action {
  const action = new Action()
  let newItemId = itemID
  if (
    ((bondProps.stereo !== Bond.PATTERN.STEREO.NONE && //
      bondProps.type === Bond.PATTERN.TYPE.SINGLE) ||
      bond.type === Bond.PATTERN.TYPE.DATIVE) &&
    bond.type === bondProps.type &&
    bond.stereo === bondProps.stereo
  ) {
    action.mergeWith(fromBondFlipping(restruct, itemID))
    newItemId = (action.operations[1] as BondAdd).data.bid
  }
  // if bondTool is stereo and equal to bond for change

  const loop = plainBondTypes.includes(bondProps.type) ? plainBondTypes : null
  if (
    bondProps.stereo === Bond.PATTERN.STEREO.NONE &&
    bondProps.type === Bond.PATTERN.TYPE.SINGLE &&
    bond.stereo === Bond.PATTERN.STEREO.NONE &&
    loop
  ) {
    // if `Single bond` tool is chosen and bond for change in `plainBondTypes`
    bondProps.type = loop[(loop.indexOf(bond.type) + 1) % loop.length]
  }

  return fromBondsAttrs(restruct, newItemId, bondProps).mergeWith(action)
}

const plainBondTypes = [
  Bond.PATTERN.TYPE.SINGLE,
  Bond.PATTERN.TYPE.DOUBLE,
  Bond.PATTERN.TYPE.TRIPLE
]
