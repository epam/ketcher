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

import { Pile } from './pile'
import { SGroup } from './sgroup'
import assert from 'assert'

export class SGroupForest {
  /** node id -> parent id */
  parent: Map<number, number>
  /** node id -> list of child ids */
  children: Map<number, number[]>
  atomSets: Map<number, any>

  constructor() {
    this.parent = new Map()
    this.children = new Map()

    this.children.set(-1, []) // extra root node
    this.atomSets = new Map()
  }

  /** returns an array or s-group ids in the order of breadth-first search */
  getSGroupsBFS(): number[] {
    const order: number[] = []
    const queue = Array.from(this.children.get(-1) as Array<number>)
    while (queue.length > 0) {
      const id = queue.shift()
      if (typeof id !== 'number') {
        break
      }
      const children = this.children.get(id)
      if (typeof children === 'undefined') {
        break
      }

      children.forEach((id) => {
        queue.push(id)
      })

      order.push(id)
    }

    return order
  }

  getAtomSetRelations(newId: any, atoms: any) {
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

    const parents = Array.from(this.atomSets.keys()).filter((sgid) => {
      if (!isSubset.get(sgid)) {
        return false
      }
      const childs = this.children.get(sgid)
      return childs && childs.findIndex((childId) => isSubset.get(childId)) < 0
    })

    const children = Array.from(this.atomSets.keys()).filter(
      (id) =>
        isStrictSuperset.get(id) && !isStrictSuperset.get(this.parent.get(id))
    )

    return {
      children,
      parent: parents.length === 0 ? -1 : parents[0]
    }
  }

  getPathToRoot(sgid): number[] {
    const path: number[] = []
    for (let id = sgid; id >= 0; id = this.parent.get(id)) {
      path.push(id)
    }
    return path
  }

  insert({ id, atoms }, parent?: number, children?: number[]) {
    assert(!this.parent.has(id), 'sgid already present in the forest')
    assert(!this.children.has(id), 'sgid already present in the forest')

    if (!parent || !children) {
      // if these are not provided, deduce automatically
      const guess = this.getAtomSetRelations(id, new Pile(atoms))
      parent = guess.parent
      children = guess.children
    }

    // TODO: make children Map<int, Pile> instead of Map<int, []>?
    children.forEach((childId) => {
      this.resetParentLink(childId, id)
    })
    this.children.set(
      id,
      children.filter((id) => this.parent.get(id))
    )
    this.parent.set(id, parent)
    this.children.get(parent)?.push(id)
    this.atomSets.set(id, new Pile(atoms))

    return { parent, children }
  }

  private resetParentLink(childId, id) {
    const parentId = this.parent.get(childId)
    if (typeof parentId === 'undefined') {
      return
    }

    const childs = this.children.get(parentId)
    if (!childs) {
      return
    }

    const childIndex = childs.indexOf(childId)
    childs.splice(childIndex, 1)
    this.parent.set(childId, id)
  }

  remove(id) {
    try {
      assert(this.parent.has(id), 'sgid is not in the forest')
      assert(this.children.has(id), 'sgid is not in the forest')
    } catch (e) {
      console.info('error: sgid is not in the forest')
    }

    const parentId = this.parent.get(id) as any
    const childs = this.children.get(parentId) as any

    if (!parentId || !childs) return

    this.children.get(id)?.forEach((childId) => {
      this.parent.set(childId, parentId)
      this.children.get(parentId)?.push(childId)
    })

    const i = childs.indexOf(id)
    childs.splice(i, 1)

    this.children.delete(id)
    this.parent.delete(id)
    this.atomSets.delete(id)
  }
}

export function checkOverlapping(struct, atoms) {
  const sgroups = atoms.reduce((res, aid) => {
    const atom = struct.atoms.get(aid)
    return res.union(atom.sgs)
  }, new Pile())

  return Array.from(sgroups).some((sid) => {
    const sg = struct.sgroups.get(sid)
    if (sg.type === 'DAT') return false
    const sgAtoms = SGroup.getAtoms(struct, sg)

    return sgAtoms.length < atoms.length
      ? sgAtoms.findIndex((aid) => atoms.indexOf(aid) === -1) >= 0
      : atoms.findIndex((aid) => sgAtoms.indexOf(aid) === -1) >= 0
  })
}
