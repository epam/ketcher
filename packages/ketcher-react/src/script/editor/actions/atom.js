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
  AtomAdd,
  AtomAttr,
  AtomDelete,
  BondAdd,
  BondAttr,
  BondDelete,
  CalcImplicitH,
  FragmentAdd,
  FragmentAddStereoAtom,
  FragmentDelete,
  FragmentDeleteStereoAtom,
  SGroupAtomAdd
} from '../operations'
import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils'
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup'
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup'

import Action from '../shared/action'
import { fromBondStereoUpdate } from './bond'
import { without } from 'lodash/fp'

export function fromAtomAddition(ReStruct, pos, atom) {
  atom = Object.assign({}, atom)
  const action = new Action()
  atom.fragment = action.addOp(new FragmentAdd().perform(ReStruct)).frid

  const aid = action.addOp(new AtomAdd(atom, pos).perform(ReStruct)).data.aid
  action.addOp(new CalcImplicitH([aid]).perform(ReStruct))

  return action
}

/**
 * @param ReStruct { ReStruct }
 * @param ids { Array<number>|number }
 * @param attrs { object }
 * @param reset { boolean? }
 */
export function fromAtomsAttrs(ReStruct, ids, attrs, reset) {
  const action = new Action()
  const aids = Array.isArray(ids) ? ids : [ids]

  aids.forEach(aid => {
    Object.keys(Atom.attrlist).forEach(key => {
      if (key === 'attpnt' && !(key in attrs)) return
      if (!(key in attrs) && !reset) return

      const value = key in attrs ? attrs[key] : Atom.attrGetDefault(key)

      switch (key) {
        case 'stereoLabel':
          if (key in attrs && value)
            action.addOp(new AtomAttr(aid, key, value).perform(ReStruct))
          break
        case 'stereoParity':
          if (key in attrs && value)
            action.addOp(new AtomAttr(aid, key, value).perform(ReStruct))
          break
        default:
          action.addOp(new AtomAttr(aid, key, value).perform(ReStruct))
          break
      }
    })

    if (
      !reset &&
      'label' in attrs &&
      attrs.label !== null &&
      attrs.label !== 'L#' &&
      !attrs['atomList']
    )
      action.addOp(new AtomAttr(aid, 'atomList', null).perform(ReStruct))

    action.addOp(new CalcImplicitH([aid]).perform(ReStruct))

    const atomNeighbors = ReStruct.molecule.atomGetNeighbors(aid)
    const bond = ReStruct.molecule.bonds.get(atomNeighbors[0]?.bid)
    if (bond) {
      action.mergeWith(fromBondStereoUpdate(ReStruct, bond))
    }
  })

  return action
}

export function fromStereoAtomAttrs(ReStruct, aid, attrs, withReverse) {
  const action = new Action()
  const atom = ReStruct.molecule.atoms.get(aid)
  if (atom) {
    const frid = atom.fragment

    if ('stereoParity' in attrs)
      action.addOp(
        new AtomAttr(aid, 'stereoParity', attrs['stereoParity']).perform(
          ReStruct
        )
      )
    if ('stereoLabel' in attrs) {
      action.addOp(
        new AtomAttr(aid, 'stereoLabel', attrs['stereoLabel']).perform(ReStruct)
      )
      if (attrs['stereoLabel'] === null) {
        action.addOp(new FragmentDeleteStereoAtom(frid, aid).perform(ReStruct))
      } else {
        action.addOp(new FragmentAddStereoAtom(frid, aid).perform(ReStruct))
      }
    }
    if (withReverse) action.operations.reverse()
  }

  return action
}

export function fromAtomsFragmentAttr(ReStruct, aids, newfrid) {
  const action = new Action()

  aids.forEach(aid => {
    const atom = ReStruct.molecule.atoms.get(aid)
    const oldfrid = atom.fragment
    action.addOp(new AtomAttr(aid, 'fragment', newfrid))

    if (atom.stereoLabel !== null) {
      action.addOp(new FragmentAddStereoAtom(newfrid, aid))
      action.addOp(new FragmentDeleteStereoAtom(oldfrid, aid))
    }
  })

  return action.perform(ReStruct)
}

/**
 * @param ReStruct { ReStruct }
 * @param srcId { number }
 * @param dstId { number }
 * @return { Action }
 */
export function fromAtomMerge(ReStruct, srcId, dstId) {
  if (srcId === dstId) return new Action()

  const fragAction = new Action()
  mergeFragmentsIfNeeded(fragAction, ReStruct, srcId, dstId)

  const action = new Action()

  const atomNeighbors = ReStruct.molecule.atomGetNeighbors(srcId)
  atomNeighbors.forEach(nei => {
    const bond = ReStruct.molecule.bonds.get(nei.bid)

    if (dstId === bond.begin || dstId === bond.end) {
      // src & dst have one nei
      action.addOp(new BondDelete(nei.bid))
      return
    }

    const begin = bond.begin === nei.aid ? nei.aid : dstId
    const end = bond.begin === nei.aid ? dstId : nei.aid

    const mergeBondId = ReStruct.molecule.findBondId(begin, end)

    if (mergeBondId === null) {
      action.addOp(new BondAdd(begin, end, bond))
    } else {
      // replace old bond with new bond
      const attrs = Bond.getAttrHash(bond)
      Object.keys(attrs).forEach(key => {
        action.addOp(new BondAttr(mergeBondId, key, attrs[key]))
      })
    }

    action.addOp(new BondDelete(nei.bid))
  })

  const attrs = Atom.getAttrHash(ReStruct.molecule.atoms.get(srcId))

  if (atomGetDegree(ReStruct, srcId) === 1 && attrs['label'] === '*')
    attrs['label'] = 'C'

  Object.keys(attrs).forEach(key => {
    if (key !== 'stereoLabel' && key !== 'stereoParity') {
      action.addOp(new AtomAttr(dstId, key, attrs[key]))
    }
  })

  const sgChanged = removeAtomFromSgroupIfNeeded(action, ReStruct, srcId)

  if (sgChanged) removeSgroupIfNeeded(action, ReStruct, [srcId])

  action.addOp(new AtomDelete(srcId))
  action.addOp(new CalcImplicitH([dstId]))
  const dstAtomNeighbors = ReStruct.molecule.atomGetNeighbors(dstId)
  const bond = ReStruct.molecule.bonds.get(
    dstAtomNeighbors[0]?.bid || atomNeighbors[0]?.bid
  )

  return action
    .perform(ReStruct)
    .mergeWith(fragAction)
    .mergeWith(fromBondStereoUpdate(ReStruct, bond))
}

export function mergeFragmentsIfNeeded(action, ReStruct, srcId, dstId) {
  const frid = atomGetAttr(ReStruct, srcId, 'fragment')
  const frid2 = atomGetAttr(ReStruct, dstId, 'fragment')
  if (frid2 === frid || typeof frid2 !== 'number') return

  const struct = ReStruct.molecule

  const rgid = RGroup.findRGroupByFragment(struct.rgroups, frid2)
  if (!(typeof rgid === 'undefined')) {
    action
      .mergeWith(fromRGroupFragment(ReStruct, null, frid2))
      .mergeWith(fromUpdateIfThen(ReStruct, 0, rgid))
  }

  const fridAtoms = struct.getFragmentIds(frid)

  const atomsToNewFrag = []
  struct.atoms.forEach((atom, aid) => {
    if (atom.fragment === frid2) atomsToNewFrag.push(aid)
  })
  const moveAtomsAction = fromAtomsFragmentAttr(ReStruct, atomsToNewFrag, frid)

  mergeSgroups(action, ReStruct, fridAtoms, dstId)
  action.addOp(new FragmentDelete(frid2).perform(ReStruct))
  action.mergeWith(moveAtomsAction)
}

export function mergeSgroups(action, ReStruct, srcAtoms, dstAtom) {
  const sgroups = atomGetSGroups(ReStruct, dstAtom)

  sgroups.forEach(sid => {
    const sgroup = ReStruct.molecule.sgroups.get(sid)
    const notExpandedContexts = ['Atom', 'Bond', 'Group']
    if (
      sgroup.type === 'DAT' &&
      notExpandedContexts.includes(sgroup.data.context)
    )
      return
    const atomsToSgroup = without(sgroup.atoms, srcAtoms)
    atomsToSgroup.forEach(aid =>
      action.addOp(new SGroupAtomAdd(sid, aid).perform(ReStruct))
    )
  })
}
