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
  RxnPlusMove,
  SGroupDataMove
} from '../operations'
import { Bond, Fragment, Pile, Vec2 } from 'domain/entities'
import { getRelSgroupsBySelection, structSelection } from './utils'

import { Action } from './action'
import utils from '../shared/utils'

export function fromFlip(restruct, selection, dir, center) {
  // eslint-disable-line max-statements
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
  const isAttachmentBond = ({ begin, end }) =>
    (selection.atoms.includes(begin) && !selection.atoms.includes(end)) ||
    (selection.atoms.includes(end) && !selection.atoms.includes(begin))
  const isSelectedAtom = (atomId) => selection.atoms.includes(atomId)
  const getAttachmentBond = () => {
    for (const [bondId, bond] of bonds.entries()) {
      if (isAttachmentBond(bond)) {
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
      const d = flipItemByCenter(atom, rotationPoint, dir)
      action.addOp(new AtomMove(aid, d))
    })

    const sgroups = getRelSgroupsBySelection(restruct, Array.from(fragment))
    sgroups.forEach((sg) => {
      const d = flipItemByCenter(sg, rotationPoint, dir)
      action.addOp(new SGroupDataMove(sg.id, d))
    })
  })

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
      const d = flipItemByCenter(atom, calcCenter, dir)
      action.addOp(new AtomMove(aid, d))
    })

    const sgroups = getRelSgroupsBySelection(restruct, Array.from(fragment))
    sgroups.forEach((sg) => {
      const d = flipItemByCenter(sg, calcCenter, dir)
      action.addOp(new SGroupDataMove(sg.id, d))
    })
  })

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

  return action.perform(restruct)
}

function flipItemByCenter(item, center, dir) {
  const d = new Vec2()
  /* eslint-disable no-mixed-operators */
  if (dir === 'horizontal') {
    d.x =
      center.x > item.pp.x
        ? 2 * (center.x - item.pp.x)
        : -2 * (item.pp.x - center.x)
  } else {
    // 'vertical'
    d.y =
      center.y > item.pp.y
        ? 2 * (center.y - item.pp.y)
        : -2 * (item.pp.y - center.y)
  }
  /* eslint-enable no-mixed-operators */
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
    selection.rxnArrows.forEach((aid) => {
      const arrow = struct.rxnArrows.get(aid)
      action.addOp(
        new RxnArrowMove(aid, rotateDelta(arrow.center(), center, angle))
      )
    })
  }

  if (selection.rxnPluses) {
    selection.rxnPluses.forEach((pid) => {
      const plus = struct.rxnPluses.get(pid)
      action.addOp(new RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)))
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

export function fromBondAlign(restruct, bid, dir) {
  const struct = restruct.molecule
  const bond = struct.bonds.get(bid)
  const begin = struct.atoms.get(bond.begin)
  const end = struct.atoms.get(bond.end)

  const center = begin.pp.add(end.pp).scaled(0.5)
  let angle = utils.calcAngle(begin.pp, end.pp)
  const atoms = Array.from(struct.getFragmentIds(begin.fragment))

  // TODO: choose minimal angle
  angle = dir === 'horizontal' ? -angle : Math.PI / 2 - angle

  if (angle === 0 || Math.abs(angle) === Math.PI) {
    return fromFlip(restruct, { atoms }, dir, center)
  }

  return fromRotate(restruct, { atoms }, center, angle)
}

function rotateDelta(v, center, angle) {
  let v1 = v.sub(center)
  v1 = v1.rotate(angle)
  v1.add_(center) // eslint-disable-line no-underscore-dangle
  return v1.sub(v)
}
