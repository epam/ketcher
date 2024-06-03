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

import { Fragment, FunctionalGroup, Vec2, Scale, SGroup } from 'ketcher-core'

const SELECTION_DISTANCE_COEFFICIENT = 0.4
const SELECTION_WITHIN_TEXT = 0

const findMaps = {
  atoms: findClosestAtom,
  bonds: findClosestBond,
  enhancedFlags: findClosestEnhancedFlag,
  sgroupData: findClosestDataSGroupData,
  sgroups: findClosestSGroup,
  functionalGroups: findClosestFG,
  rxnArrows: findClosestRxnArrow,
  rxnPluses: findClosestRxnPlus,
  frags: findClosestFrag,
  rgroups: findClosestRGroup,
  simpleObjects: findClosestSimpleObject,
  texts: findClosestText
}

function rectangleContainsPoint(startX, startY, width, height, x, y) {
  return (
    startX <= x && x <= startX + width && startY <= y && y <= startY + height
  )
}

function findClosestText(restruct, cursorPosition) {
  let minDist = null
  let ret = null

  restruct.texts.forEach((text, id) => {
    const referencePoints = text.getReferencePoints(restruct)
    const topX = referencePoints[0].x
    const topY = referencePoints[0].y
    const bottomX = referencePoints[2].x
    const bottomY = referencePoints[2].y

    const distances = []

    if (cursorPosition.x >= topX && cursorPosition.x <= bottomX) {
      if (cursorPosition.y < topY) {
        distances.push(topY - cursorPosition.y)
      } else if (cursorPosition.y > bottomY) {
        distances.push(cursorPosition.y - bottomY)
      } else {
        distances.push(cursorPosition.y - topY, bottomY - cursorPosition.y)
      }
    }

    if (cursorPosition.x < topX && cursorPosition.y < topY) {
      distances.push(Vec2.dist(new Vec2(topX, topY), cursorPosition))
    }

    if (cursorPosition.x > bottomX && cursorPosition.y > bottomY) {
      distances.push(Vec2.dist(new Vec2(bottomX, bottomY), cursorPosition))
    }

    if (cursorPosition.x < topX && cursorPosition.y > bottomY) {
      distances.push(Vec2.dist(new Vec2(topX, bottomY), cursorPosition))
    }

    if (cursorPosition.x > bottomX && cursorPosition.y < topY) {
      distances.push(Vec2.dist(new Vec2(bottomX, topY), cursorPosition))
    }

    if (cursorPosition.y >= topY && cursorPosition.y <= bottomY) {
      if (cursorPosition.x < topX) {
        distances.push(topX - cursorPosition.x)
      } else if (cursorPosition.x > bottomX) {
        distances.push(cursorPosition.x - bottomX)
      } else {
        distances.push(SELECTION_WITHIN_TEXT)
      }
    }

    const dist = Math.min(...distances)

    if (dist < SELECTION_DISTANCE_COEFFICIENT && (!ret || dist < minDist)) {
      minDist = dist
      ret = { id, dist: minDist }
    }
  })
  return ret
}

function findClosestSimpleObject(restruct, pos) {
  let minDist = null
  let refPoint = null
  let ret = null

  restruct.simpleObjects.forEach((simpleObject, id) => {
    const dist = simpleObject.calcDistance(pos, restruct.render.options.scale)

    if (dist.minDist < 0.3 && (!ret || dist.minDist < minDist)) {
      minDist = dist.minDist
      refPoint = dist.refPoint

      ret = { id, dist: minDist, ref: refPoint }
    }
  })
  return ret
}

function findClosestAtom(restruct, pos, skip, minDist) {
  let closestAtom = null
  const maxMinDist = SELECTION_DISTANCE_COEFFICIENT
  const skipId = skip && skip.map === 'atoms' ? skip.id : null
  const sGroups = restruct.sgroups
  const functionalGroups = restruct.molecule.functionalGroups

  minDist = minDist || maxMinDist
  minDist = Math.min(minDist, maxMinDist)

  restruct.atoms.forEach((atom, aid) => {
    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom.a,
        sGroups,
        functionalGroups,
        true
      )
    ) {
      return null
    }
    if (aid === skipId) return

    const dist = Vec2.dist(pos, atom.a.pp)

    if (dist < minDist) {
      closestAtom = aid
      minDist = dist
    }
  })

  if (closestAtom !== null) {
    return {
      id: closestAtom,
      dist: minDist
    }
  }

  return null
}

function findClosestBond(restruct, pos, skip, minDist, options) {
  // eslint-disable-line max-params
  let closestBond = null
  let closestBondCenter = null
  const maxMinDist = 0.8 * SELECTION_DISTANCE_COEFFICIENT
  const skipId = skip && skip.map === 'bonds' ? skip.id : null
  const sGroups = restruct.sgroups
  const functionalGroups = restruct.molecule.functionalGroups

  minDist = minDist || maxMinDist
  minDist = Math.min(minDist, maxMinDist)

  let minCDist = minDist

  restruct.bonds.forEach((bond, bid) => {
    if (bid === skipId) return

    const p1 = restruct.atoms.get(bond.b.begin).a.pp
    const p2 = restruct.atoms.get(bond.b.end).a.pp

    if (
      FunctionalGroup.isBondInContractedFunctionalGroup(
        bond.b,
        sGroups,
        functionalGroups
      ) ||
      SGroup.isBondInContractedSGroup(bond.b, sGroups)
    ) {
      return null
    }

    const mid = Vec2.lc2(p1, 0.5, p2, 0.5)
    const cdist = Vec2.dist(pos, mid)

    const { render } = restruct
    const hitboxPoints = bond.getSelectionPoints(render)
    const position = Scale.obj2scaled(pos, options)
    const isPosInsidePolygon = position.isInsidePolygon(hitboxPoints)

    if (isPosInsidePolygon) {
      minCDist = cdist
      closestBondCenter = bid
    }

    const hb = restruct.molecule.halfBonds.get(bond.b.hb1)
    const dir = hb.dir
    const norm = hb.norm

    const inStripe = Vec2.dot(pos.sub(p1), dir) * Vec2.dot(pos.sub(p2), dir) < 0

    if (inStripe) {
      const dist = Math.abs(Vec2.dot(pos.sub(p1), norm))

      if (dist < minDist) {
        closestBond = bid
        minDist = dist
      }
    }
  })

  if (closestBondCenter !== null) {
    return {
      id: closestBondCenter,
      dist: minCDist
    }
  }

  if (
    closestBond !== null &&
    minDist > SELECTION_DISTANCE_COEFFICIENT * options.scale
  ) {
    return {
      id: closestBond,
      dist: minDist
    }
  }

  return null
}

function findClosestEnhancedFlag(restruct, pos, skip, _minDist, options) {
  let minDist
  let ret = null
  restruct.enhancedFlags.forEach((item, id) => {
    const fragment = restruct.molecule.frags.get(id)

    if (!fragment || !fragment.enhancedStereoFlag || !options.showStereoFlags)
      return

    const p = fragment.stereoFlagPosition
      ? new Vec2(fragment.stereoFlagPosition.x, fragment.stereoFlagPosition.y)
      : Fragment.getDefaultStereoFlagPosition(restruct.molecule, id)
    if (!p || Math.abs(pos.x - p.x) >= 1.0) return

    const dist = Math.abs(pos.y - p.y)

    if (dist < 0.3 && (!ret || dist < minDist)) {
      minDist = dist
      ret = { id, dist: minDist }
    }
  })
  return ret
}

function findClosestDataSGroupData(restruct, pos) {
  let minDist = null
  let ret = null

  restruct.sgroupData.forEach((item, id) => {
    if (item.sgroup.type !== 'DAT') throw new Error('Data group expected')

    if (item.sgroup.data.fieldName !== 'MRV_IMPLICIT_H') {
      const box = item.sgroup.dataArea
      const inBox =
        box.p0.y < pos.y &&
        box.p1.y > pos.y &&
        box.p0.x < pos.x &&
        box.p1.x > pos.x
      const xDist = Math.min(
        Math.abs(box.p0.x - pos.x),
        Math.abs(box.p1.x - pos.x)
      )

      if (inBox && (ret === null || xDist < minDist)) {
        ret = { id, dist: xDist }
        minDist = xDist
      }
    }
  })

  return ret
}

function findClosestFrag(restruct, pos, skip, minDist, options) {
  minDist = Math.min(
    minDist || SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT
  )

  const struct = restruct.molecule

  const closestAtom = findClosestAtom(restruct, pos, skip, minDist)

  if (closestAtom) {
    return {
      id: struct.atoms.get(closestAtom.id).fragment,
      dist: closestAtom.dist
    }
  }

  const closestBond = findClosestBond(restruct, pos, skip, minDist, options)

  if (closestBond) {
    const atomId = struct.bonds.get(closestBond.id).begin
    return {
      id: struct.atoms.get(atomId).fragment,
      dist: closestBond.dist
    }
  }

  return null
}

function findClosestRGroup(restruct, pos, skip, minDist) {
  minDist = Math.min(
    minDist || SELECTION_DISTANCE_COEFFICIENT,
    SELECTION_DISTANCE_COEFFICIENT
  )

  let ret = null

  restruct.rgroups.forEach((rgroup, rgid) => {
    if (
      rgid !== skip &&
      rgroup.labelBox &&
      rgroup.labelBox.contains(pos, 0.5)
    ) {
      const dist = Vec2.dist(rgroup.labelBox.centre(), pos)

      if (!ret || dist < minDist) {
        minDist = dist
        ret = { id: rgid, dist: minDist }
      }
    }
  })

  return ret
}

function findClosestRxnArrow(restruct, pos) {
  let minDist = null
  let refPoint = null
  let ret = null

  restruct.rxnArrows.forEach((rxnArrow, id) => {
    const dist = rxnArrow.calcDistance(pos, restruct.render.options.scale)

    if (dist.minDist < 0.3 && (!ret || dist.minDist < minDist)) {
      minDist = dist.minDist
      refPoint = dist.refPoint

      ret = { id, dist: minDist, ref: refPoint }
    }
  })
  return ret
}

function findClosestRxnPlus(restruct, pos) {
  let minDist = null
  let ret = null

  restruct.rxnPluses.forEach((plus, id) => {
    const p = plus.item.pp
    const dist = Math.max(Math.abs(pos.x - p.x), Math.abs(pos.y - p.y))

    if (dist < 0.3 && (!ret || dist < minDist)) {
      minDist = dist
      ret = { id, dist: minDist }
    }
  })

  return ret
}

function findClosestSGroup(restruct, pos) {
  let ret = null
  let minDist = SELECTION_DISTANCE_COEFFICIENT

  restruct.molecule.sgroups.forEach((sg, sgid) => {
    if (sg.functionalGroup && !sg.expanded && sg.firstSgroupAtom) return null

    const d = sg.bracketDir
    const n = d.rotateSC(1, 0)
    const pg = new Vec2(Vec2.dot(pos, d), Vec2.dot(pos, n))

    sg.areas.forEach((box) => {
      const inBox =
        box.p0.y < pg.y && box.p1.y > pg.y && box.p0.x < pg.x && box.p1.x > pg.x
      const xDist = Math.min(
        Math.abs(box.p0.x - pg.x),
        Math.abs(box.p1.x - pg.x)
      )

      if (inBox && (ret === null || xDist < minDist)) {
        ret = sgid
        minDist = xDist
      }
    })
  })

  if (ret !== null) {
    return {
      id: ret,
      dist: minDist
    }
  }

  return null
}

function findClosestFG(restruct, pos, skip) {
  const sGroups = restruct.sgroups
  const skipId = skip && skip.map === 'functionalGroups' ? skip.id : null
  for (const [reSGroupId, reSGroup] of sGroups.entries()) {
    if (reSGroupId === skipId) continue

    const { startX, startY, width, height } =
      reSGroup.getTextHighlightDimensions(0, restruct.render)
    const { x, y } = Scale.obj2scaled(pos, restruct.render.options)
    if (rectangleContainsPoint(startX, startY, width, height, x, y)) {
      const centerX = startX + width / 2
      const centerY = startY + height / 2
      const rectangleCenter = new Vec2(centerX, centerY)
      const cursorPosition = new Vec2(x, y)

      const dist = Vec2.dist(rectangleCenter, cursorPosition)
      const { id } = reSGroup.item
      return { id, dist }
    }
  }
  return null
}

function findClosestItem(restruct, pos, maps, skip, options) {
  // eslint-disable-line max-params
  maps = maps || Object.keys(findMaps)

  let priorityItem = null

  const closestItem = maps.reduce((res, mp) => {
    const minDist = res ? res.dist : null
    const item = findMaps[mp](restruct, pos, skip, minDist, options)

    if (item !== null) {
      const enrichedItem = {
        map: mp,
        ...item
      }

      if (mp === 'sgroupData') {
        priorityItem = enrichedItem
      } else if (res === null || item.dist < res.dist) {
        return enrichedItem
      }
    }

    return res
  }, null)

  return priorityItem || closestItem
}

/**
 * @param restruct { ReStruct }
 * @param selected { object }
 * @param maps { Array<string> }
 * @param options { RenderOption }
 * @return {{
 * 		atoms: Map<number, number>?
 * 		bonds: Map<number, number>?
 *    atomToFunctionalGroup: Map<number, number>?
 * }}
 */
function findCloseMerge(
  restruct,
  selected,
  maps = ['atoms', 'bonds'],
  options
) {
  const pos = {
    atoms: new Map(), // aid -> position
    bonds: new Map() // bid -> position
  }

  const struct = restruct.molecule

  selected.atoms.forEach((aid) => {
    pos.atoms.set(aid, struct.atoms.get(aid).pp)
  })

  selected.bonds.forEach((bid) => {
    const bond = struct.bonds.get(bid)
    pos.bonds.set(
      bid,
      Vec2.lc2(
        struct.atoms.get(bond.begin).pp,
        0.5,
        struct.atoms.get(bond.end).pp,
        0.5
      )
    )
  })

  const result = {
    atoms: new Map(),
    atomToFunctionalGroup: new Map()
  }

  maps.forEach((map) => {
    if (map === 'atoms') {
      Array.from(pos.atoms.keys()).forEach((atomId) => {
        const atomPosition = pos.atoms.get(atomId)
        mergeAtomToAtom(atomId, restruct, atomPosition, selected, result) ||
          mergeAtomToFunctionalGroup(atomId, restruct, atomPosition, result)
      })
    } else {
      result[map] = Array.from(pos[map].keys()).reduce((res, srcId) => {
        const skip = { map, id: srcId }
        const item = findMaps[map](
          restruct,
          pos[map].get(srcId),
          skip,
          null,
          options
        )

        if (item && !selected[map].includes(item.id)) {
          res.set(srcId, item.id)
        }

        return res
      }, new Map())
    }
  })

  return result
}

function mergeAtomToAtom(atomId, restruct, atomPosition, selected, result) {
  const skip = { map: 'atoms', id: atomId }
  const closestAtom = findClosestAtom(restruct, atomPosition, skip, null)

  if (closestAtom && !selected.atoms.includes(closestAtom.id)) {
    result.atoms.set(atomId, closestAtom.id)
    return true
  }

  return false
}

function mergeAtomToFunctionalGroup(atomId, restruct, atomPosition, result) {
  if (FunctionalGroup.isAttachmentPointAtom(atomId, restruct.molecule)) {
    return false
  }

  const closestFunctionalGroup = findClosestFG(restruct, atomPosition, null)
  if (closestFunctionalGroup) {
    result.atomToFunctionalGroup.set(atomId, closestFunctionalGroup.id)
    return true
  }

  return false
}

export default {
  atom: findClosestAtom, // used in Actions
  item: findClosestItem,
  merge: findCloseMerge
}
