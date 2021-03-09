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
import { Pile, Vec2 } from 'ketcher-core'

export function prepareStructForGraph(struct) {
  const graphNodes = []

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

  const molFrags = Array.from(struct.frags.keys()).filter(
    fid => !rgFrags.has(fid)
  )
  const moleculeFragsAtoms = molFrags.reduce((acc, fid) => {
    const fragAtoms = struct.getFragmentIds(fid)
    acc = acc.union(fragAtoms)
    return acc
  }, new Pile())

  graphNodes.push({
    type: 'molecule',
    fragment: struct.clone(moleculeFragsAtoms),
    center: getFragmentCenter(struct, moleculeFragsAtoms)
  })

  struct.rxnArrows.forEach(item => {
    graphNodes.push({
      type: 'arrow',
      center: item.pp,
      data: {},
      mode: item.mode
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

  return graphNodes.sort((a, b) => a.center.x - b.center.x)
}

function getFragmentCenter(struct, atomSet) {
  const bb = struct.getCoordBoundingBox(atomSet)
  return Vec2.centre(bb.min, bb.max)
}
