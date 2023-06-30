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
import { Bond, Fragment, Struct, Vec2 } from 'domain/entities'
import { ReStruct } from 'application/render'
import { getRelSGroupsBySelection, structSelection } from './utils'
import { Action } from './action'
import { EditorSelection } from '../editor.types'

export type FlipDirection = 'horizontal' | 'vertical'

export function fromFlip(
  reStruct: ReStruct,
  selection: EditorSelection | null,
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

    const difference = flipPointByCenter(
      rxnArrow.center(),
      center,
      flipDirection
    )
    action.addOp(new RxnArrowMove(arrowId, difference))
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

    const difference = flipPointByCenter(rxnPlus.pp, center, flipDirection)
    action.addOp(new RxnPlusMove(plusId, difference))
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

    // Note: text has two position properties
    //      `position`: the middle left point
    //      `pos`: a box (not bounding box)
    // `TextMove` is to move `position`, so we have to calculate the flipped `position`
    const textMiddleLeft = text.pos[0]
    const textMiddleRight = text.pos[2]
    const textCenter = Vec2.centre(textMiddleLeft, textMiddleRight)

    const difference = flipPointByCenter(textCenter, center, flipDirection)
    action.addOp(new TextMove(textId, difference))
  })

  return action.perform(reStruct)
}

function fromStructureFlip(
  reStruct: ReStruct,
  selection: EditorSelection | null,
  flipDirection: FlipDirection,
  center: Vec2
) {
  const struct = reStruct.molecule
  const action = new Action()

  selection?.atoms?.forEach((atomId) => {
    const atom = struct.atoms.get(atomId)
    if (!atom) {
      return
    }

    const difference = flipPointByCenter(atom.pp, center, flipDirection)
    action.addOp(new AtomMove(atomId, difference))
  })

  const sGroups = getRelSGroupsBySelection(struct, selection?.atoms || [])
  sGroups.forEach((sGroup) => {
    if (!sGroup.pp) {
      return
    }
    const difference = flipPointByCenter(sGroup.pp, center, flipDirection)
    action.addOp(new SGroupDataMove(sGroup.id, difference))
  })

  if (selection?.bonds) {
    flipBonds(selection.bonds, struct, action)
  }

  return action.perform(reStruct)
}

function flipBonds(bondIds: number[], struct: Struct, action: Action) {
  bondIds.forEach((bondId) => {
    const bond = struct.bonds.get(bondId)

    if (!bond) {
      return
    }

    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) {
      return
    }

    if (bond.stereo === Bond.PATTERN.STEREO.UP) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.DOWN))
      return
    }

    if (bond.stereo === Bond.PATTERN.STEREO.DOWN) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.UP))
    }
  })
}

function flipPointByCenter(
  pointToFlip: Vec2,
  center: Vec2,
  flipDirection: FlipDirection
) {
  const d = new Vec2()
  if (flipDirection === 'horizontal') {
    d.x =
      center.x > pointToFlip.x
        ? 2 * (center.x - pointToFlip.x)
        : -2 * (pointToFlip.x - center.x)
  } else {
    // 'vertical'
    d.y =
      center.y > pointToFlip.y
        ? 2 * (center.y - pointToFlip.y)
        : -2 * (pointToFlip.y - center.y)
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
      const sgroups = getRelSGroupsBySelection(struct, selection.atoms)

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

  if (selection.enhancedFlags) {
    selection.enhancedFlags.forEach((flagId) => {
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
