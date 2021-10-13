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
  AtomAttr,
  SGroupAddToHierarchy,
  SGroupAtomAdd,
  SGroupAtomRemove,
  SGroupAttr,
  SGroupCreate,
  SGroupDelete,
  SGroupRemoveFromHierarchy
} from '../operations'
import { Pile, SGroup } from 'ketcher-core'
import { atomGetAttr, atomGetDegree, atomGetSGroups } from './utils'

import Action from '../shared/action'
import { SgContexts } from '../shared/constants'
import { uniq } from 'lodash/fp'

export function fromSeveralSgroupAddition(ReStruct, type, atoms, attrs) {
  const descriptors = attrs.fieldValue

  if (typeof descriptors === 'string' || type !== 'DAT')
    return fromSgroupAddition(
      ReStruct,
      type,
      atoms,
      attrs,
      ReStruct.molecule.sgroups.newId()
    )

  return descriptors.reduce((acc, fValue) => {
    const localAttrs = Object.assign({}, attrs)
    localAttrs.fieldValue = fValue

    return acc.mergeWith(
      fromSgroupAddition(
        ReStruct,
        type,
        atoms,
        localAttrs,
        ReStruct.molecule.sgroups.newId()
      )
    )
  }, new Action())
}

export function fromSgroupAttrs(ReStruct, id, attrs) {
  const action = new Action()

  Object.keys(attrs).forEach(key => {
    action.addOp(new SGroupAttr(id, key, attrs[key]))
  })

  return action.perform(ReStruct)
}

export function sGroupAttributeAction(id, attrs) {
  const action = new Action()

  Object.keys(attrs).forEach(key => {
    action.addOp(new SGroupAttr(id, key, attrs[key]))
  })

  return action
}

export function fromSgroupDeletion(ReStruct, id) {
  let action = new Action()
  const struct = ReStruct.molecule

  const sG = ReStruct.sgroups.get(id).item

  if (sG.type === 'SRU') {
    struct.sGroupsRecalcCrossBonds()

    sG.neiAtoms.forEach(aid => {
      if (atomGetAttr(ReStruct, aid, 'label') === '*')
        action.addOp(new AtomAttr(aid, 'label', 'C'))
    })
  }

  const sg = struct.sgroups.get(id)
  const atoms = SGroup.getAtoms(struct, sg)
  const attrs = sg.getAttrs()

  action.addOp(new SGroupRemoveFromHierarchy(id))

  atoms.forEach(atom => {
    action.addOp(new SGroupAtomRemove(id, atom))
  })

  action.addOp(new SGroupDelete(id))

  action = action.perform(ReStruct)

  action.mergeWith(sGroupAttributeAction(id, attrs))

  return action
}

export function fromSgroupAddition(
  ReStruct,
  type,
  atoms,
  attrs,
  sgid,
  pp,
  expanded,
  name
) {
  // eslint-disable-line
  let action = new Action()

  // TODO: shoud the id be generated when OpSGroupCreate is executed?
  //      if yes, how to pass it to the following operations?
  sgid = sgid - 0 === sgid ? sgid : ReStruct.molecule.sgroups.newId()

  if (type === 'SUP') {
    action.addOp(new SGroupCreate(sgid, type, pp, expanded, name))
  } else {
    action.addOp(new SGroupCreate(sgid, type, pp))
  }

  atoms.forEach(atom => {
    action.addOp(new SGroupAtomAdd(sgid, atom))
  })

  action.addOp(
    type !== 'DAT'
      ? new SGroupAddToHierarchy(sgid)
      : new SGroupAddToHierarchy(sgid, -1, [])
  )

  action = action.perform(ReStruct)

  if (type === 'SRU') {
    ReStruct.molecule.sGroupsRecalcCrossBonds()
    let asteriskAction = new Action()

    ReStruct.sgroups.get(sgid).item.neiAtoms.forEach(aid => {
      const plainCarbon = ReStruct.atoms.get(aid).a.isPlainCarbon()

      if (atomGetDegree(ReStruct, aid) === 1 && plainCarbon)
        asteriskAction.addOp(new AtomAttr(aid, 'label', '*'))
    })

    asteriskAction = asteriskAction.perform(ReStruct)
    asteriskAction.mergeWith(action)
    action = asteriskAction
  }

  return fromSgroupAttrs(ReStruct, sgid, attrs).mergeWith(action)
}

export function fromSgroupAction(
  context,
  ReStruct,
  newSg,
  sourceAtoms,
  selection
) {
  if (context === SgContexts.Bond)
    return fromBondAction(ReStruct, newSg, sourceAtoms, selection)

  const atomsFromBonds = getAtomsFromBonds(ReStruct.molecule, selection.bonds)
  const newSourceAtoms = uniq(sourceAtoms.concat(atomsFromBonds))

  if (context === SgContexts.Fragment)
    return fromGroupAction(
      ReStruct,
      newSg,
      newSourceAtoms,
      Array.from(ReStruct.atoms.keys())
    )

  if (context === SgContexts.Multifragment)
    return fromMultiFragmentAction(ReStruct, newSg, newSourceAtoms)

  if (context === SgContexts.Group)
    return fromGroupAction(ReStruct, newSg, newSourceAtoms, newSourceAtoms)

  if (context === SgContexts.Atom)
    return fromAtomAction(ReStruct, newSg, newSourceAtoms)

  return {
    action: fromSeveralSgroupAddition(
      ReStruct,
      newSg.type,
      sourceAtoms,
      newSg.attrs
    )
  }
}

function fromAtomAction(ReStruct, newSg, sourceAtoms) {
  return sourceAtoms.reduce(
    (acc, atom) => {
      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(ReStruct, newSg.type, [atom], newSg.attrs)
      )
      return acc
    },
    {
      action: new Action(),
      selection: {
        atoms: sourceAtoms,
        bonds: []
      }
    }
  )
}

function fromGroupAction(ReStruct, newSg, sourceAtoms, targetAtoms) {
  const allFragments = new Pile(
    sourceAtoms.map(aid => ReStruct.atoms.get(aid).a.fragment)
  )

  return Array.from(allFragments).reduce(
    (acc, fragId) => {
      const atoms = targetAtoms.reduce((res, aid) => {
        const atom = ReStruct.atoms.get(aid).a
        if (fragId === atom.fragment) res.push(aid)

        return res
      }, [])

      const bonds = getAtomsBondIds(ReStruct.molecule, atoms)

      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(ReStruct, newSg.type, atoms, newSg.attrs)
      )

      acc.selection.atoms = acc.selection.atoms.concat(atoms)
      acc.selection.bonds = acc.selection.bonds.concat(bonds)

      return acc
    },
    {
      action: new Action(),
      selection: {
        atoms: [],
        bonds: []
      }
    }
  )
}

function fromBondAction(ReStruct, newSg, sourceAtoms, currSelection) {
  const struct = ReStruct.molecule
  let bonds = getAtomsBondIds(struct, sourceAtoms)

  if (currSelection.bonds) bonds = uniq(bonds.concat(currSelection.bonds))

  return bonds.reduce(
    (acc, bondid) => {
      const bond = struct.bonds.get(bondid)

      acc.action = acc.action.mergeWith(
        fromSeveralSgroupAddition(
          ReStruct,
          newSg.type,
          [bond.begin, bond.end],
          newSg.attrs
        )
      )

      acc.selection.bonds.push(bondid)

      return acc
    },
    {
      action: new Action(),
      selection: {
        atoms: sourceAtoms,
        bonds: []
      }
    }
  )
}

function fromMultiFragmentAction(ReStruct, newSg, atoms) {
  const bonds = getAtomsBondIds(ReStruct.molecule, atoms)
  return {
    action: fromSeveralSgroupAddition(ReStruct, newSg.type, atoms, newSg.attrs),
    selection: {
      atoms,
      bonds
    }
  }
}

// Add action operation to remove atom from s-group if needed
export function removeAtomFromSgroupIfNeeded(action, ReStruct, id) {
  const sgroups = atomGetSGroups(ReStruct, id)

  if (sgroups.length > 0) {
    sgroups.forEach(sid => {
      action.addOp(new SGroupAtomRemove(sid, id))
    })

    return true
  }

  return false
}

// Add action operations to remove whole s-group if needed
export function removeSgroupIfNeeded(action, ReStruct, atoms) {
  const struct = ReStruct.molecule
  const sgCounts = new Map()

  atoms.forEach(id => {
    const sgroups = atomGetSGroups(ReStruct, id)

    sgroups.forEach(sid => {
      sgCounts.set(sid, sgCounts.has(sid) ? sgCounts.get(sid) + 1 : 1)
    })
  })

  sgCounts.forEach((count, sid) => {
    const sG = ReStruct.sgroups.get(sid).item
    const sgAtoms = SGroup.getAtoms(ReStruct.molecule, sG)

    if (sgAtoms.length === count) {
      // delete whole s-group
      const sgroup = struct.sgroups.get(sid)
      action.mergeWith(sGroupAttributeAction(sid, sgroup.getAttrs()))
      action.addOp(new SGroupRemoveFromHierarchy(sid))
      action.addOp(new SGroupDelete(sid))
    }
  })
}

function getAtomsBondIds(struct, atoms) {
  const atomSet = new Pile(atoms)

  return Array.from(struct.bonds.keys()).filter(bid => {
    const bond = struct.bonds.get(bid)
    return atomSet.has(bond.begin) && atomSet.has(bond.end)
  })
}

function getAtomsFromBonds(struct, bonds) {
  bonds = bonds || []
  return bonds.reduce((acc, bondid) => {
    const bond = struct.bonds.get(bondid)
    acc = acc.concat([bond.begin, bond.end])
    return acc
  }, [])
}
