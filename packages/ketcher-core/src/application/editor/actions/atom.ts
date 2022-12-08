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

import { Atom, Bond, RGroup } from 'domain/entities'
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

import { Action } from './action'
import { fromBondStereoUpdate } from './bond'
import { without } from 'lodash/fp'

export function fromAtomAddition(restruct, pos, atom) {
  atom = Object.assign({}, atom)
  const action = new Action()
  atom.fragment = (
    action.addOp(new FragmentAdd().perform(restruct)) as FragmentAdd
  ).frid

  const aid = (
    action.addOp(new AtomAdd(atom, pos).perform(restruct)) as AtomAdd
  ).data.aid
  action.addOp(new CalcImplicitH([aid]).perform(restruct))

  return action
}

/**
 * @param restruct { ReStruct }
 * @param ids { Array<number>|number }
 * @param attrs { object }
 * @param reset { boolean? }
 */
export function fromAtomsAttrs(restruct, ids, attrs, reset) {
  const action = new Action()
  const aids = Array.isArray(ids) ? ids : [ids]

  aids.forEach((aid) => {
    Object.keys(Atom.attrlist).forEach((key) => {
      if (key === 'attpnt' && !(key in attrs)) return
      if (!(key in attrs) && !reset) return

      const value = key in attrs ? attrs[key] : Atom.attrGetDefault(key)

      switch (key) {
        case 'stereoLabel':
          if (key in attrs && value) {
            action.addOp(new AtomAttr(aid, key, value).perform(restruct))
          }
          break
        case 'stereoParity':
          if (key in attrs && value) {
            action.addOp(new AtomAttr(aid, key, value).perform(restruct))
          }
          break
        default:
          action.addOp(new AtomAttr(aid, key, value).perform(restruct))
          break
      }
    })

    if (
      !reset &&
      'label' in attrs &&
      attrs.label !== null &&
      attrs.label !== 'L#' &&
      !('atomList' in attrs)
    ) {
      action.addOp(new AtomAttr(aid, 'atomList', null).perform(restruct))
    }

    action.addOp(new CalcImplicitH([aid]).perform(restruct))

    const atomNeighbors = restruct.molecule.atomGetNeighbors(aid)
    const bond = restruct.molecule.bonds.get(atomNeighbors[0]?.bid)
    if (bond) {
      action.mergeWith(fromBondStereoUpdate(restruct, bond))
    }
  })

  return action
}

export function fromStereoAtomAttrs(restruct, aid, attrs, withReverse) {
  const action = new Action()
  const atom = restruct.molecule.atoms.get(aid)
  if (atom) {
    const frid = atom.fragment

    if ('stereoParity' in attrs) {
      action.addOp(
        new AtomAttr(aid, 'stereoParity', attrs.stereoParity).perform(restruct)
      )
    }
    if ('stereoLabel' in attrs) {
      action.addOp(
        new AtomAttr(aid, 'stereoLabel', attrs.stereoLabel).perform(restruct)
      )
      if (attrs.stereoLabel === null) {
        action.addOp(new FragmentDeleteStereoAtom(frid, aid).perform(restruct))
      } else {
        action.addOp(new FragmentAddStereoAtom(frid, aid).perform(restruct))
      }
    }
    if (withReverse) action.operations.reverse()
  }

  return action
}

export function fromAtomsFragmentAttr(restruct, aids, newfrid) {
  const action = new Action()

  aids.forEach((aid) => {
    const atom = restruct.molecule.atoms.get(aid)
    const oldfrid = atom.fragment
    action.addOp(new AtomAttr(aid, 'fragment', newfrid))

    if (atom.stereoLabel !== null) {
      action.addOp(new FragmentAddStereoAtom(newfrid, aid))
      action.addOp(new FragmentDeleteStereoAtom(oldfrid, aid))
    }
  })

  return action.perform(restruct)
}

/**
 * @param restruct { ReStruct }
 * @param srcId { number }
 * @param dstId { number }
 * @return { Action }
 */
export function fromAtomMerge(restruct, srcId, dstId) {
  if (srcId === dstId) return new Action()

  const fragAction = new Action()
  mergeFragmentsIfNeeded(fragAction, restruct, srcId, dstId)

  const action = new Action()

  const atomNeighbors = restruct.molecule.atomGetNeighbors(srcId)
  atomNeighbors.forEach((nei) => {
    const bond = restruct.molecule.bonds.get(nei.bid)

    if (dstId === bond.begin || dstId === bond.end) {
      // src & dst have one nei
      action.addOp(new BondDelete(nei.bid))
      return
    }

    const begin = bond.begin === nei.aid ? nei.aid : dstId
    const end = bond.begin === nei.aid ? dstId : nei.aid

    const mergeBondId = restruct.molecule.findBondId(begin, end)

    if (mergeBondId === null) {
      action.addOp(new BondAdd(begin, end, bond))
    } else {
      // replace old bond with new bond
      const attrs = Bond.getAttrHash(bond)
      Object.keys(attrs).forEach((key) => {
        action.addOp(new BondAttr(mergeBondId, key, attrs[key]))
      })
    }

    action.addOp(new BondDelete(nei.bid))
  })

  const attrs = Atom.getAttrHash(restruct.molecule.atoms.get(srcId))

  if (atomGetDegree(restruct, srcId) === 1 && attrs.label === '*') {
    attrs.label = 'C'
  }

  Object.keys(attrs).forEach((key) => {
    if (key !== 'stereoLabel' && key !== 'stereoParity') {
      action.addOp(new AtomAttr(dstId, key, attrs[key]))
    }
  })

  const sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, srcId)

  if (sgChanged) removeSgroupIfNeeded(action, restruct, [srcId])

  action.addOp(new AtomDelete(srcId))
  action.addOp(new CalcImplicitH([dstId]))
  const dstAtomNeighbors = restruct.molecule.atomGetNeighbors(dstId)
  const bond = restruct.molecule.bonds.get(
    dstAtomNeighbors[0]?.bid || atomNeighbors[0]?.bid
  )

  return action
    .perform(restruct)
    .mergeWith(fragAction)
    .mergeWith(fromBondStereoUpdate(restruct, bond))
}

export function mergeFragmentsIfNeeded(action, restruct, srcId, dstId) {
  const frid = atomGetAttr(restruct, srcId, 'fragment')
  const frid2 = atomGetAttr(restruct, dstId, 'fragment')
  if (frid2 === frid || typeof frid2 !== 'number') {
    return
  }

  const struct = restruct.molecule

  const rgid = RGroup.findRGroupByFragment(struct.rgroups, frid2)
  if (!(typeof rgid === 'undefined')) {
    action
      .mergeWith(fromRGroupFragment(restruct, null, frid2))
      .mergeWith(fromUpdateIfThen(restruct, 0, rgid))
  }

  const fridAtoms = struct.getFragmentIds(frid)

  const atomsToNewFrag: Array<any> = []
  struct.atoms.forEach((atom, aid) => {
    if (atom.fragment === frid2) atomsToNewFrag.push(aid)
  })
  const moveAtomsAction = fromAtomsFragmentAttr(restruct, atomsToNewFrag, frid)

  mergeSgroups(action, restruct, fridAtoms, dstId)
  action.addOp(new FragmentDelete(frid2).perform(restruct))
  action.mergeWith(moveAtomsAction)
}

export function mergeSgroups(action, restruct, srcAtoms, dstAtom) {
  const sgroups = atomGetSGroups(restruct, dstAtom)

  sgroups.forEach((sid) => {
    const sgroup = restruct.molecule.sgroups.get(sid)
    const notExpandedContexts = ['Atom', 'Bond', 'Group']
    if (
      sgroup.type === 'DAT' &&
      notExpandedContexts.includes(sgroup.data.context)
    ) {
      return
    }
    const atomsToSgroup: any = without(sgroup.atoms, srcAtoms)
    atomsToSgroup.forEach((aid) =>
      action.addOp(new SGroupAtomAdd(sid, aid).perform(restruct))
    )
  })
}
