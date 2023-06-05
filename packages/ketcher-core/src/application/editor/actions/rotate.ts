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
  AtomMove,
  BondAttr,
  EnhancedFlagMove,
  RxnArrowMove,
  RxnArrowRotate,
  RxnPlusMove,
  SGroupDataMove,
  TextMove
} from '../operations'
import { Bond, Fragment, Pile, Vec2 } from 'domain/entities'
import { ReStruct } from 'application/render'
import {
  getRelSgroupsBySelection,
  structSelection,
  isAttachmentBond
} from './utils'
import { Action } from './action'
import { Selection } from '../editor.types'

export type FlipDirection = 'horizontal' | 'vertical'

export function fromFlip(
  reStruct: ReStruct,
  selection: Selection | null,
  flipDirection: FlipDirection,
  center: Vec2
) {
  const action = new Action()
  const structToFlip = selection || structSelection(reStruct.molecule)

  action.mergeWith(
    fromStructureFlip(reStruct, structToFlip, flipDirection, center)
  )

  if (structToFlip.rxnArrows) {
    action.mergeWith(
      fromRxnArrowFlip(reStruct, structToFlip.rxnArrows, flipDirection, center)
    )
  }

  if (structToFlip.rxnPluses) {
    action.mergeWith(
      fromRxnPlusFlip(reStruct, structToFlip.rxnPluses, flipDirection, center)
    )
  }

  if (structToFlip.texts) {
    action.mergeWith(
      fromTextFlip(reStruct, structToFlip.texts, flipDirection, center)
    )
  }

  return action
}

// @yuleicul to fix text move when flipping

function fromRxnArrowFlip(
  reStruct: ReStruct,
  rxnArrowIds: number[],
  flipDirection: FlipDirection,
  center: Vec2
) {
  const action = new Action()

  rxnArrowIds.forEach((arrowId) => {
    const rxnArrow = reStruct.molecule.rxnArrows.get(arrowId)
    if (!rxnArrow) {
      return
    }

    const [start, end] = rxnArrow.pos
    const oxAngle = end.sub(start).oxAngle()
    const oyAngle = oxAngle - Math.PI / 2
    const rotateAngle =
      flipDirection === 'vertical' ? -2 * oxAngle : -2 * oyAngle
    action.addOp(new RxnArrowRotate(arrowId, rotateAngle, rxnArrow.center()))

    const offset = flipItemByCenter(rxnArrow.center(), center, flipDirection)
    action.addOp(new RxnArrowMove(arrowId, offset))
  })

  return action.perform(reStruct)
}

function fromRxnPlusFlip(
  reStruct: ReStruct,
  rxnPlusIds: number[],
  flipDirection: FlipDirection,
  center: Vec2
) {
  const action = new Action()

  rxnPlusIds.forEach((plusId) => {
    const rxnPlus = reStruct.molecule.rxnPluses.get(plusId)
    if (!rxnPlus) {
      return
    }

    const offset = flipItemByCenter(rxnPlus.pp, center, flipDirection)
    action.addOp(new RxnPlusMove(plusId, offset))
  })

  return action.perform(reStruct)
}

function fromTextFlip(
  reStruct: ReStruct,
  textIds: number[],
  flipDirection: FlipDirection,
  center: Vec2
) {
  const action = new Action()

  textIds.forEach((textId) => {
    const text = reStruct.molecule.texts.get(textId)
    if (!text) {
      return
    }

    const offset = flipItemByCenter(text.position, center, flipDirection)
    action.addOp(new TextMove(textId, offset))
  })

  return action.perform(reStruct)
}

function fromStructureFlip(
  restruct: ReStruct,
  selection: Selection | null,
  dir: FlipDirection,
  center: Vec2
) {
  const struct = restruct.molecule

  const action = new Action()

  if (!selection) {
    selection = structSelection(struct)
  }

  if (!selection.atoms) {
    return action.perform(restruct)
  }

  const fids = selection.atoms.reduce((acc, aid) => {
    const atom = struct.atoms.get(aid)

    if (!atom) {
      return acc
    }

    if (!acc[atom.fragment]) {
      acc[atom.fragment] = []
    }

    acc[atom.fragment].push(aid)
    return acc
  }, {})

  const fidsNumberKeys = Object.keys(fids).map((frag) => parseInt(frag, 10))

  const isFragFound = fidsNumberKeys.find((frag) => {
    const allFragmentsOfStructure = struct.getFragmentIds(frag)
    const selectedFragmentsOfStructure = new Pile(fids[frag])
    const res = allFragmentsOfStructure.equals(selectedFragmentsOfStructure)
    return !res
  })

  if (typeof isFragFound === 'number') {
    return flipPartOfStructure({
      fids,
      struct,
      restruct,
      dir,
      action,
      selection
    })
  }

  return flipStandaloneStructure({
    fids,
    struct,
    restruct,
    center,
    dir,
    action,
    selection
  })
}

function getRotationPoint(struct, selection) {
  const { bonds } = struct
  const isSelectedAtom = (atomId) => selection.atoms.includes(atomId)
  const getAttachmentBond = () => {
    for (const [bondId, bond] of bonds.entries()) {
      if (isAttachmentBond(bond, selection)) {
        return [bondId, bond]
      }
    }
    return [null, null]
  }
  const getRotationPointAtomId = (attachmentBondId, attachmentBond) => {
    if (selection.bonds.includes(attachmentBondId)) {
      return [attachmentBond.begin, attachmentBond.end].find(
        (atomId) => !isSelectedAtom(atomId)
      )
    }
    return [attachmentBond.begin, attachmentBond.end].find(isSelectedAtom)
  }

  const [attachmentBondId, attachmentBond] = getAttachmentBond()
  const rotationPointAtomId = getRotationPointAtomId(
    attachmentBondId,
    attachmentBond
  )
  return struct.atoms.get(rotationPointAtomId).pp
}

function flipBonds(selection, struct, action) {
  if (selection.bonds) {
    selection.bonds.forEach((bid) => {
      const bond = struct.bonds.get(bid)

      if (bond.type !== Bond.PATTERN.TYPE.SINGLE) {
        return
      }

      if (bond.stereo === Bond.PATTERN.STEREO.UP) {
        action.addOp(new BondAttr(bid, 'stereo', Bond.PATTERN.STEREO.DOWN))
        return
      }

      if (bond.stereo === Bond.PATTERN.STEREO.DOWN) {
        action.addOp(new BondAttr(bid, 'stereo', Bond.PATTERN.STEREO.UP))
      }
    })
  }
}

function flipPartOfStructure({
  fids,
  struct,
  restruct,
  dir,
  action,
  selection
}) {
  const rotationPoint = getRotationPoint(struct, selection)

  Object.keys(fids).forEach((frag) => {
    const fragment = new Pile(fids[frag])

    fragment.forEach((aid) => {
      const atom = struct.atoms.get(aid)
      const d = flipItemByCenter(atom.pp, rotationPoint, dir)
      action.addOp(new AtomMove(aid, d))
    })

    const sgroups = getRelSgroupsBySelection(restruct, Array.from(fragment))
    sgroups.forEach((sg) => {
      const d = flipItemByCenter(sg.pp, rotationPoint, dir)
      action.addOp(new SGroupDataMove(sg.id, d))
    })
  })

  flipBonds(selection, struct, action)

  return action.perform(restruct)
}

function flipStandaloneStructure({
  fids,
  struct,
  restruct,
  center,
  dir,
  action,
  selection
}) {
  Object.keys(fids).forEach((frag) => {
    const fragment = new Pile(fids[frag])

    const bbox = struct.getCoordBoundingBox(fragment)
    const calcCenter =
      center ||
      new Vec2((bbox.max.x + bbox.min.x) / 2, (bbox.max.y + bbox.min.y) / 2)

    fragment.forEach((aid) => {
      const atom = struct.atoms.get(aid)
      const d = flipItemByCenter(atom.pp, calcCenter, dir)
      action.addOp(new AtomMove(aid, d))
    })

    const sgroups = getRelSgroupsBySelection(restruct, Array.from(fragment))
    sgroups.forEach((sg) => {
      const d = flipItemByCenter(sg.pp, calcCenter, dir)
      action.addOp(new SGroupDataMove(sg.id, d))
    })
  })

  flipBonds(selection, struct, action)

  return action.perform(restruct)
}

function flipItemByCenter(
  itemPos: Vec2,
  center: Vec2,
  flipDirection: FlipDirection
) {
  const d = new Vec2()
  if (flipDirection === 'horizontal') {
    d.x =
      center.x > itemPos.x
        ? 2 * (center.x - itemPos.x)
        : -2 * (itemPos.x - center.x)
  } else {
    // 'vertical'
    d.y =
      center.y > itemPos.y
        ? 2 * (center.y - itemPos.y)
        : -2 * (itemPos.y - center.y)
  }
  return d
}

export function fromRotate(restruct, selection, center, angle) {
  // eslint-disable-line
  const struct = restruct.molecule

  const action = new Action()

  if (!selection) {
    selection = structSelection(struct)
  }

  if (selection.atoms) {
    selection.atoms.forEach((aid) => {
      const atom = struct.atoms.get(aid)
      action.addOp(new AtomMove(aid, rotateDelta(atom.pp, center, angle)))
    })

    if (!selection.sgroupData) {
      const sgroups = getRelSgroupsBySelection(restruct, selection.atoms)

      sgroups.forEach((sg) => {
        action.addOp(
          new SGroupDataMove(sg.id, rotateDelta(sg.pp, center, angle))
        )
      })
    }
  }

  if (selection.rxnArrows) {
    selection.rxnArrows.forEach((arrowId) => {
      action.addOp(new RxnArrowRotate(arrowId, angle, center))
    })
  }

  if (selection.rxnPluses) {
    selection.rxnPluses.forEach((pid) => {
      const plus = struct.rxnPluses.get(pid)
      action.addOp(new RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)))
    })
  }

  if (selection.texts) {
    selection.texts.forEach((textId) => {
      const text = struct.texts.get(textId)
      action.addOp(
        new TextMove(textId, rotateDelta(text.position, center, angle))
      )
    })
  }

  if (selection.sgroupData) {
    selection.sgroupData.forEach((did) => {
      const data = struct.sgroups.get(did)
      action.addOp(new SGroupDataMove(did, rotateDelta(data.pp, center, angle)))
    })
  }

  const stereoFlags =
    selection.enhancedFlags || Array.from(restruct.enhancedFlags.keys())
  if (stereoFlags) {
    stereoFlags.forEach((flagId) => {
      const frId = flagId
      const frag = restruct.molecule.frags.get(frId)
      action.addOp(
        new EnhancedFlagMove(
          flagId,
          rotateDelta(
            frag.stereoFlagPosition ||
              Fragment.getDefaultStereoFlagPosition(restruct.molecule, frId),
            center,
            angle
          )
        )
      )
    })
  }

  return action.perform(restruct)
}

function rotateDelta(v, center, angle) {
  let v1 = v.sub(center)
  v1 = v1.rotate(angle)
  v1.add_(center) // eslint-disable-line no-underscore-dangle
  return v1.sub(v)
}
