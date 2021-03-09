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

import { Pile } from 'ketcher-core'

import Action from '../shared/action'
import {
  BondDelete,
  AtomDelete,
  RxnArrowDelete,
  RxnPlusDelete,
  SimpleObjectDelete
} from '../operations'
import { Atom, RGroup } from 'ketcher-core'

import { fromStereoAtomAttrs } from './atom'
import {
  fromSgroupDeletion,
  removeAtomFromSgroupIfNeeded,
  removeSgroupIfNeeded
} from './sgroup'
import { fromFragmentSplit } from './fragment'
import { atomGetDegree, atomGetNeighbors } from './utils'

export function fromOneAtomDeletion(restruct, id) {
  return fromFragmentDeletion(restruct, { atoms: [id] })
}

function fromBondDeletion(restruct, bid, skipAtoms = []) {
  let action = new Action()
  const bond = restruct.molecule.bonds.get(bid)
  const atomsToRemove = []

  action.addOp(new BondDelete(bid))

  if (
    !skipAtoms.includes(bond.begin) &&
    atomGetDegree(restruct, bond.begin) === 1
  ) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin))
      atomsToRemove.push(bond.begin)

    action.addOp(new AtomDelete(bond.begin))
  }

  if (
    !skipAtoms.includes(bond.end) &&
    atomGetDegree(restruct, bond.end) === 1
  ) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end))
      atomsToRemove.push(bond.end)

    action.addOp(new AtomDelete(bond.end))
  }

  removeSgroupIfNeeded(action, restruct, atomsToRemove)
  action = action.perform(restruct)

  if (bond.stereo) {
    action.mergeWith(
      fromStereoAtomAttrs(restruct, bond.begin, {
        stereoParity: Atom.PATTERN.STEREO_PARITY.NONE,
        stereoLabel: null
      })
    )
  }

  return action
}

export function fromOneBondDeletion(restruct, id) {
  const frid = restruct.molecule.getBondFragment(id)
  let action = fromBondDeletion(restruct, id)

  action = fromFragmentSplit(restruct, frid).mergeWith(action)

  return action
}

export function fromFragmentDeletion(restruct, selection) {
  // eslint-disable-line max-statements
  console.assert(!!selection)
  let action = new Action()
  const atomsToRemove = []
  const frids = []

  selection = {
    // TODO: refactor me
    atoms: selection.atoms || [],
    bonds: selection.bonds || [],
    rxnPluses: selection.rxnPluses || [],
    rxnArrows: selection.rxnArrows || [],
    sgroupData: selection.sgroupData || [],
    simpleObjects: selection.simpleObjects || []
  }

  const actionRemoveDataSGroups = new Action()
  restruct.molecule.sgroups.forEach((sg, id) => {
    if (
      selection.sgroupData.includes(id) ||
      new Pile(selection.atoms).isSuperset(new Pile(sg.atoms))
    )
      actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(restruct, id))
  })

  selection.atoms.forEach(aid => {
    atomGetNeighbors(restruct, aid).forEach(nei => {
      if (selection.bonds.indexOf(nei.bid) === -1)
        selection.bonds = selection.bonds.concat([nei.bid])
    })
  })

  const actionRemoveBonds = new Action()
  selection.bonds.forEach(bid => {
    const frid = restruct.molecule.getBondFragment(bid)
    if (frids.indexOf(frid) < 0) frids.push(frid)

    actionRemoveBonds.mergeWith(
      fromBondDeletion(restruct, bid, selection.atoms)
    )
  })

  selection.atoms.forEach(aid => {
    const frid3 = restruct.molecule.atoms.get(aid).fragment
    if (frids.indexOf(frid3) < 0) frids.push(frid3)

    if (removeAtomFromSgroupIfNeeded(action, restruct, aid))
      atomsToRemove.push(aid)

    action.addOp(new AtomDelete(aid))
  })

  removeSgroupIfNeeded(action, restruct, atomsToRemove)

  selection.rxnArrows.forEach(id => {
    action.addOp(new RxnArrowDelete(id))
  })

  selection.rxnPluses.forEach(id => {
    action.addOp(new RxnPlusDelete(id))
  })

  selection.simpleObjects.forEach(id => {
    action.addOp(new SimpleObjectDelete(id))
  })

  action = action.perform(restruct)
  action.mergeWith(actionRemoveBonds)

  const rgForRemove = frids.map(frid =>
    RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid)
  )
  while (frids.length > 0)
    action = fromFragmentSplit(restruct, frids.pop(), rgForRemove).mergeWith(
      action
    )

  action.mergeWith(actionRemoveDataSGroups)

  return action
}
