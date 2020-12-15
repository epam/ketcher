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

import Pile from '../../util/pile'
import SGroup from './sgroup'

function SGroupForest() {
  this.parent = new Map() // child id -> parent id
  this.children = new Map() // parent id -> list of child ids
  this.children.set(-1, []) // extra root node
  this.atomSets = new Map()
}

// returns an array or s-group ids in the order of breadth-first search
SGroupForest.prototype.getSGroupsBFS = function () {
  const order = []
  let id = -1
  let queue = Array.from(this.children.get(-1))
  while (queue.length > 0) {
    id = queue.shift()
    queue = queue.concat(this.children.get(id))
    order.push(id)
  }
  return order
}

export function checkOverlapping(struct, atoms) {
  const sgroups = atoms.reduce((res, aid) => {
    const atom = struct.atoms.get(aid)
    return res.union(atom.sgs)
  }, new Pile())

  return Array.from(sgroups).some(sid => {
    const sg = struct.sgroups.get(sid)
    if (sg.type === 'DAT') return false
    const sgAtoms = SGroup.getAtoms(struct, sg)

    return sgAtoms.length < atoms.length
      ? sgAtoms.findIndex(aid => atoms.indexOf(aid) === -1) >= 0
      : atoms.findIndex(aid => sgAtoms.indexOf(aid) === -1) >= 0
  })
}

SGroupForest.prototype.getAtomSetRelations = function (newId, atoms) {
  // find the lowest superset in the hierarchy
  const isStrictSuperset = new Map()
  const isSubset = new Map()

  this.atomSets.delete(newId)

  this.atomSets.forEach((atomSet, id) => {
    isSubset.set(id, atomSet.isSuperset(atoms))
    isStrictSuperset.set(
      id,
      atoms.isSuperset(atomSet) && !atomSet.equals(atoms)
    )
  })

  const parents = Array.from(this.atomSets.keys()).filter(sgid => {
    if (!isSubset.get(sgid)) return false
    return (
      this.children.get(sgid).findIndex(childId => isSubset.get(childId)) < 0
    )
  })

  const children = Array.from(this.atomSets.keys()).filter(
    id => isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id))
  )

  return {
    children,
    parent: parents.length === 0 ? -1 : parents[0]
  }
}

SGroupForest.prototype.getPathToRoot = function (sgid) {
  const path = []
  for (let id = sgid; id >= 0; id = this.parent.get(id)) {
    console.assert(path.indexOf(id) < 0, 'SGroupForest: loop detected')
    path.push(id)
  }
  return path
}

SGroupForest.prototype.insert = function (
  { id, atoms },
  parent /* int, optional */,
  children /* [int], optional */
) {
  console.assert(!this.parent.has(id), 'sgid already present in the forest')
  console.assert(!this.children.has(id), 'sgid already present in the forest')

  if (!parent || !children) {
    // if these are not provided, deduce automatically
    const guess = this.getAtomSetRelations(id, new Pile(atoms))
    parent = guess.parent
    children = guess.children
  }

  // TODO: make children Map<int, Pile> instead of Map<int, []>?
  children.forEach(childId => {
    // reset parent links
    var childs = this.children.get(this.parent.get(childId))
    var i = childs.indexOf(childId)
    console.assert(
      i >= 0 && childs.indexOf(childId, i + 1) < 0,
      'Assertion failed'
    ) // one element
    childs.splice(i, 1)
    this.parent.set(childId, id)
  })
  this.children.set(id, children)
  this.parent.set(id, parent)
  this.children.get(parent).push(id)
  this.atomSets.set(id, new Pile(atoms))

  return { parent, children }
}

SGroupForest.prototype.remove = function (id) {
  console.assert(this.parent.has(id), 'sgid is not in the forest')
  console.assert(this.children.has(id), 'sgid is not in the forest')

  const parentId = this.parent.get(id)
  this.children.get(id).forEach(childId => {
    // reset parent links
    this.parent.set(childId, parentId)
    this.children.get(parentId).push(childId)
  })

  const childs = this.children.get(parentId)
  const i = childs.indexOf(id)
  console.assert(i >= 0 && childs.indexOf(id, i + 1) < 0, 'Assertion failed') // one element
  childs.splice(i, 1)

  this.children.delete(id)
  this.parent.delete(id)
  this.atomSets.delete(id)
}

export default SGroupForest
