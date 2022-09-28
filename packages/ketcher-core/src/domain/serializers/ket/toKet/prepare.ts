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
import { Pile, SGroup, Struct, Vec2 } from 'domain/entities'

export function prepareStructForKet(struct: Struct) {
  const ketNodes: any = []

  const rgFrags = new Set() // skip this when writing molecules
  for (const [rgnumber, rgroup] of struct.rgroups.entries()) {
    // RGroups writing
    rgroup.frags.forEach((frid) => rgFrags.add(frid))

    const fragsAtoms = Array.from(rgroup.frags.values()).reduce(
      (res, frid) => res.union(struct.getFragmentIds(frid)),
      new Pile()
    )

    ketNodes.push({
      type: 'rgroup',
      fragment: struct.clone(fragsAtoms),
      center: getFragmentCenter(struct, fragsAtoms),
      data: { rgnumber, rgroup }
    })
  }

  Array.from(struct.frags.keys())
    .filter((fid) => !rgFrags.has(fid))
    .forEach((fid) => {
      const fragAtoms = struct.getFragmentIds(fid)
      ketNodes.push({
        type: 'molecule',
        fragment: struct.clone(fragAtoms),
        center: getFragmentCenter(struct, fragAtoms)
      })
    })

  struct.rxnArrows.forEach((item) => {
    ketNodes.push({
      type: 'arrow',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos,
        height: item.height
      }
    })
  })

  struct.rxnPluses.forEach((item) => {
    ketNodes.push({
      type: 'plus',
      center: item.pp,
      data: {}
    })
  })

  struct.simpleObjects.forEach((item) => {
    ketNodes.push({
      type: 'simpleObject',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos
      }
    })
  })

  struct.texts.forEach((item) => {
    ketNodes.push({
      type: 'text',
      center: item.position,
      data: {
        content: item.content,
        position: item.position,
        pos: item.pos
      }
    })
  })

  ketNodes.forEach((ketNode) => {
    if (ketNode.fragment) {
      const sgroups: SGroup[] = Array.from(ketNode.fragment.sgroups.values())
      const filteredSGroups = sgroups.filter((sg: SGroup) =>
        sg.atoms.every((atom) => atom !== undefined)
      )
      const filteredSGroupsMap = new Map()
      filteredSGroups.forEach((sg, index) => {
        filteredSGroupsMap.set(index, sg)
      })
      ketNode.fragment.sgroups = filteredSGroupsMap
    }
  })

  // TODO: check if this sorting operation is needed
  // return ketNodes.sort((a, b) => a.center.x - b.center.x)
  return ketNodes
}

function getFragmentCenter(struct, atomSet) {
  const bb = struct.getCoordBoundingBox(atomSet)
  return Vec2.centre(bb.min, bb.max)
}
