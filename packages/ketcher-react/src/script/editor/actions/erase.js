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

import { Atom, Bond, RGroup } from 'ketcher-core'
import {
  AtomAttr,
  AtomDelete,
  BondDelete,
  CalcImplicitH,
  RxnArrowDelete,
  RxnPlusDelete,
  SimpleObjectDelete,
  TextDelete
} from '../operations'
import {
  fromSgroupDeletion,
  removeAtomFromSgroupIfNeeded,
  removeSgroupIfNeeded
} from './sgroup'

import Action from '../shared/action'
import { Pile } from 'ketcher-core'
import { atomGetDegree } from './utils'
import { fromBondStereoUpdate } from '../actions/bond'
import { fromFragmentSplit } from './fragment'
import { fromStereoAtomAttrs } from './atom'

export function fromOneAtomDeletion(ReStruct, id) {
  return fromFragmentDeletion(ReStruct, { atoms: [id] })
}

function fromBondDeletion(ReStruct, bid, skipAtoms = []) {
  let action = new Action()
  const bond = ReStruct.molecule.bonds.get(bid)
  const atomsToRemove = []

  action.addOp(new BondDelete(bid))

  if (
    !skipAtoms.includes(bond.begin) &&
    atomGetDegree(ReStruct, bond.begin) === 1
  ) {
    if (removeAtomFromSgroupIfNeeded(action, ReStruct, bond.begin))
      atomsToRemove.push(bond.begin)

    action.addOp(new AtomDelete(bond.begin))
  }

  if (
    !skipAtoms.includes(bond.end) &&
    atomGetDegree(ReStruct, bond.end) === 1
  ) {
    if (removeAtomFromSgroupIfNeeded(action, ReStruct, bond.end))
      atomsToRemove.push(bond.end)

    action.addOp(new AtomDelete(bond.end))
  }

  removeSgroupIfNeeded(action, ReStruct, atomsToRemove)
  action = action.perform(ReStruct)
  action.addOp(new CalcImplicitH([bond.begin, bond.end]).perform(ReStruct))
  action.mergeWith(fromBondStereoUpdate(ReStruct, bond, false))

  action.operations.reverse()

  return action
}

export function fromOneBondDeletion(ReStruct, id) {
  const frid = ReStruct.molecule.getBondFragment(id)
  let action = fromBondDeletion(ReStruct, id)

  action = fromFragmentSplit(ReStruct, frid).mergeWith(action)

  return action
}

export function fromFragmentDeletion(ReStruct, selection) {
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
    simpleObjects: selection.simpleObjects || [],
    texts: selection.texts || []
  }

  const actionRemoveDataSGroups = new Action()
  ReStruct.molecule.sgroups.forEach((sg, id) => {
    if (
      selection.sgroupData.includes(id) ||
      new Pile(selection.atoms).isSuperset(new Pile(sg.atoms))
    )
      actionRemoveDataSGroups.mergeWith(fromSgroupDeletion(ReStruct, id))
  })

  selection.atoms.forEach(aid => {
    ReStruct.molecule.atomGetNeighbors(aid).forEach(nei => {
      if (selection.bonds.indexOf(nei.bid) === -1) {
        selection.bonds = selection.bonds.concat([nei.bid])
      }
    })
  })

  const actionRemoveBonds = new Action()
  selection.bonds.forEach(bid => {
    const frid = ReStruct.molecule.getBondFragment(bid)
    if (frids.indexOf(frid) < 0) frids.push(frid)

    actionRemoveBonds.mergeWith(
      fromBondDeletion(ReStruct, bid, selection.atoms)
    )
  })

  selection.atoms.forEach(aid => {
    const frid3 = ReStruct.molecule.atoms.get(aid).fragment
    if (frids.indexOf(frid3) < 0) frids.push(frid3)

    if (removeAtomFromSgroupIfNeeded(action, ReStruct, aid))
      atomsToRemove.push(aid)

    action.addOp(new AtomDelete(aid))
  })

  removeSgroupIfNeeded(action, ReStruct, atomsToRemove)

  selection.rxnArrows.forEach(id => {
    action.addOp(new RxnArrowDelete(id))
  })

  selection.rxnPluses.forEach(id => {
    action.addOp(new RxnPlusDelete(id))
  })

  selection.simpleObjects.forEach(id => {
    action.addOp(new SimpleObjectDelete(id))
  })

  selection.texts.forEach(id => {
    action.addOp(new TextDelete(id))
  })

  action = action.perform(ReStruct)
  action.mergeWith(actionRemoveBonds)

  const rgForRemove = frids.map(frid =>
    RGroup.findRGroupByFragment(ReStruct.molecule.rgroups, frid)
  )
  while (frids.length > 0)
    action = fromFragmentSplit(ReStruct, frids.pop(), rgForRemove).mergeWith(
      action
    )

  action.mergeWith(actionRemoveDataSGroups)

  return action
}
