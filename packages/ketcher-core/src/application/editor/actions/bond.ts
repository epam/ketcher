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
  Vec2,
  AtomAttributes,
  BondAttributes,
  FunctionalGroup
} from 'domain/entities'
import {
  AtomAdd,
  AtomAttr,
  BondAdd,
  BondAttr,
  BondDelete,
  CalcImplicitH,
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
  reStruct: ReStruct,
  bond: Partial<BondAttributes>,
  begin: number | AtomAttributes,
  end: number | AtomAttributes,
  beginAtomPos?: Vec2,
  endAtomPos?: Vec2
): [Action, number, number, number] {
  const action = new Action()
  const struct = reStruct.molecule

  const mouseDownNothingAndUpNothing = (
    beginAtomAttr: AtomAttributes,
    endAtomAttr: AtomAttributes
  ) => {
    const newFragmentId = (
      action.addOp(new FragmentAdd().perform(reStruct)) as FragmentAdd
    ).frid

    const newBeginAtomId: number = (
      action.addOp(
        new AtomAdd(
          { ...beginAtomAttr, fragment: newFragmentId },
          beginAtomPos
        ).perform(reStruct)
      ) as AtomAdd
    ).data.aid

    const newEndAtomId: number = (
      action.addOp(
        new AtomAdd(
          { ...endAtomAttr, fragment: newFragmentId },
          endAtomPos
        ).perform(reStruct)
      ) as AtomAdd
    ).data.aid

    return [newBeginAtomId, newEndAtomId] as const
  }

  const mouseDownNothingAndUpAtom = (
    beginAtomAttr: AtomAttributes,
    endAtomId: number
  ) => {
    const fragmentId = atomGetAttr(reStruct, endAtomId, 'fragment')

    const newBeginAtomId: number = (
      action.addOp(
        new AtomAdd(
          { ...beginAtomAttr, fragment: fragmentId },
          beginAtomPos
        ).perform(reStruct)
      ) as AtomAdd
    ).data.aid

    const endAtom = struct.atoms.get(endAtomId)
    if (
      endAtom &&
      !FunctionalGroup.isAtomInContractedFunctionalGroup(
        endAtom,
        struct.sgroups,
        struct.functionalGroups,
        false
      )
    ) {
      mergeSgroups(action, reStruct, [newBeginAtomId], endAtomId)
    }
    return [newBeginAtomId, endAtomId] as const
  }

  const mouseDownAtomAndUpNothing = (
    beginAtomId: number,
    endAtomAttr: AtomAttributes
  ) => {
    const fragmentId = atomGetAttr(reStruct, beginAtomId, 'fragment')

    const newEndAtomId: number = (
      action.addOp(
        new AtomAdd(
          {
            ...endAtomAttr,
            fragment: fragmentId
          },
          endAtomPos ?? atomForNewBond(reStruct, begin, bond).pos
        ).perform(reStruct)
      ) as AtomAdd
    ).data.aid

    const beginAtom = struct.atoms.get(beginAtomId)
    if (
      beginAtom &&
      !FunctionalGroup.isAtomInContractedFunctionalGroup(
        beginAtom,
        struct.sgroups,
        struct.functionalGroups,
        false
      )
    ) {
      mergeSgroups(action, reStruct, [newEndAtomId], beginAtomId)
    }

    return [beginAtomId, newEndAtomId] as const
  }

  let beginAtomId: number, endAtomId: number

  const startsOnAtom = typeof begin === 'number'
  const endsOnAtom = typeof end === 'number'

  if (!startsOnAtom && !endsOnAtom) {
    ;[beginAtomId, endAtomId] = mouseDownNothingAndUpNothing(begin, end)
  } else if (!startsOnAtom && endsOnAtom) {
    ;[beginAtomId, endAtomId] = mouseDownNothingAndUpAtom(begin, end)
  } else if (startsOnAtom && !endsOnAtom) {
    ;[beginAtomId, endAtomId] = mouseDownAtomAndUpNothing(begin, end)
  } else {
    ;[beginAtomId, endAtomId] = [begin as number, end as number]
  }

  if (atomGetAttr(reStruct, beginAtomId, 'label') === '*') {
    action.addOp(new AtomAttr(beginAtomId, 'label', 'C').perform(reStruct))
  }

  if (atomGetAttr(reStruct, endAtomId, 'label') === '*') {
    action.addOp(new AtomAttr(endAtomId, 'label', 'C').perform(reStruct))
  }

  const newBondId = (
    action.addOp(
      new BondAdd(beginAtomId, endAtomId, bond).perform(reStruct)
    ) as BondAdd
  ).data.bid
  const newBond = struct.bonds.get(newBondId)
  if (newBond) {
    action.addOp(
      new CalcImplicitH([newBond.begin, newBond.end]).perform(reStruct)
    )
    action.mergeWith(fromBondStereoUpdate(reStruct, newBond))
  }

  action.operations.reverse()

  const mergedFragmentId = mergeFragmentsIfNeeded(
    action,
    reStruct,
    beginAtomId,
    endAtomId
  )
  if (struct.frags.get(mergedFragmentId || 0)?.stereoAtoms && !bond.stereo) {
    action.addOp(
      new FragmentStereoFlag(mergedFragmentId || 0).perform(reStruct)
    )
  }

  return [action, beginAtomId, endAtomId, newBondId]
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
            new CalcImplicitH([bond.begin, bond.end]).perform(restruct)
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

const plainBondTypes = [
  Bond.PATTERN.TYPE.SINGLE,
  Bond.PATTERN.TYPE.DOUBLE,
  Bond.PATTERN.TYPE.TRIPLE
]

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
