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
import { Pile, Struct, Vec2, SGroup } from 'domain/entities'

export function prepareStructForGraph(struct: Struct) {
  const graphNodes: any = []

  const rgFrags = new Set() // skip this when writing molecules
  for (const [rgnumber, rgroup] of struct.rgroups.entries()) {
    // RGroups writing
    rgroup.frags.forEach(frid => rgFrags.add(frid))

    const fragsAtoms = Array.from(rgroup.frags.values()).reduce(
      (res, frid) => res.union(struct.getFragmentIds(frid)),
      new Pile()
    )

    graphNodes.push({
      type: 'rgroup',
      fragment: struct.clone(fragsAtoms),
      center: getFragmentCenter(struct, fragsAtoms),
      data: { rgnumber, rgroup }
    })
  }

  Array.from(struct.frags.keys())
    .filter(fid => !rgFrags.has(fid))
    .forEach(fid => {
      const fragAtoms = struct.getFragmentIds(fid)
      graphNodes.push({
        type: 'molecule',
        fragment: struct.clone(fragAtoms),
        center: getFragmentCenter(struct, fragAtoms)
      })
    })

  struct.rxnArrows.forEach(item => {
    graphNodes.push({
      type: 'arrow',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos
      }
    })
  })

  struct.rxnPluses.forEach(item => {
    graphNodes.push({
      type: 'plus',
      center: item.pp,
      data: {}
    })
  })

  struct.simpleObjects.forEach(item => {
    graphNodes.push({
      type: 'simpleObject',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos
      }
    })
  })

  struct.texts.forEach(item => {
    graphNodes.push({
      type: 'text',
      center: item.position,
      data: {
        content: item.content,
        position: item.position
      }
    })
  })

  graphNodes.forEach(graphNode => {
    if (graphNode.fragment) {
      const sgroups: SGroup[] = Array.from(graphNode.fragment.sgroups.values())
      const filteredSGroups = sgroups.filter((sg: SGroup) =>
        sg.atoms.every(atom => atom !== undefined)
      )
      const filteredSGroupsMap = new Map()
      filteredSGroups.forEach((sg, index) => {
        filteredSGroupsMap.set(index, sg)
      })
      graphNode.fragment.sgroups = filteredSGroupsMap
    }
  })

  return graphNodes.sort((a, b) => a.center.x - b.center.x)
}

function getFragmentCenter(struct, atomSet) {
  const bb = struct.getCoordBoundingBox(atomSet)
  return Vec2.centre(bb.min, bb.max)
}
