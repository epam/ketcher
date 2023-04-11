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

import { Atom, Bond, Vec2 } from 'domain/entities'
import { AtomAdd, BondAdd, BondAttr, CalcImplicitH } from '../operations'
import { atomForNewBond, atomGetAttr } from './utils'
import { fromAtomsAttrs, mergeSgroups } from './atom'
import { fromBondStereoUpdate, fromBondsAttrs, fromBondAddition } from './bond'

import { Action } from './action'
import closest from '../shared/closest'
import { fromAromaticTemplateOnBond } from './aromaticFusing'
import { fromPaste } from './paste'
import utils from '../shared/utils'
import { fromSgroupAddition } from './sgroup'

const benzeneMoleculeName = 'Benzene'
const benzeneDoubleBondIndexes = [1, 4]

export function fromTemplateOnCanvas(restruct, template, pos, angle) {
  const [action, pasteItems] = fromPaste(
    restruct,
    template.molecule,
    pos,
    angle
  )

  action.addOp(new CalcImplicitH(pasteItems.atoms).perform(restruct))

  return [action, pasteItems]
}

function extraBondAction(restruct, aid, angle) {
  let action = new Action()
  const frid = atomGetAttr(restruct, aid, 'fragment')
  let additionalAtom: any = null

  if (angle === null) {
    const middleAtom = atomForNewBond(restruct, aid)
    const actionRes = fromBondAddition(
      restruct,
      { type: 1 },
      aid,
      middleAtom.atom,
      middleAtom.pos.get_xy0()
    )
    action = actionRes[0]
    action.operations.reverse()
    additionalAtom = actionRes[2]
  } else {
    const operation = new AtomAdd(
      { label: 'C', fragment: frid },
      new Vec2(1, 0)
        .rotate(angle)
        .add(restruct.molecule.atoms.get(aid).pp)
        .get_xy0()
    ).perform(restruct) as AtomAdd

    action.addOp(operation)
    action.addOp(
      new BondAdd(aid, operation.data.aid, { type: 1 }).perform(restruct)
    )

    additionalAtom = operation.data.aid
  }

  return { action, aid1: additionalAtom }
}

export function fromTemplateOnAtom(restruct, template, aid, angle, extraBond) {
  let action = new Action()

  const tmpl = template.molecule
  const struct = restruct.molecule

  const isTmplSingleGroup = template.molecule.isSingleGroup()

  let atom = struct.atoms.get(aid) // aid - the atom that was clicked on
  let aid1 = aid // aid1 - the atom on the other end of the extra bond || aid

  let delta: any = null

  if (extraBond) {
    // create extra bond after click on atom
    const extraRes = extraBondAction(restruct, aid, angle)
    action = extraRes.action
    aid1 = extraRes.aid1

    atom = struct.atoms.get(aid1)
    delta = utils.calcAngle(struct.atoms.get(aid).pp, atom.pp) - template.angle0
  } else {
    if (angle === null) {
      angle = utils.calcAngle(atom.pp, atomForNewBond(restruct, aid).pos)
    }
    delta = angle - template.angle0
  }

  const map = new Map()
  const xy0 = tmpl.atoms.get(template.aid).pp
  const frid = atomGetAttr(restruct, aid, 'fragment')

  /* For merge */
  const pasteItems: any = {
    // only atoms and bonds now
    atoms: [],
    bonds: []
  }
  /* ----- */

  tmpl.atoms.forEach((a, id) => {
    const attrs: any = Atom.getAttrHash(a)
    attrs.fragment = frid

    if (id === template.aid) {
      action.mergeWith(fromAtomsAttrs(restruct, aid1, attrs, true))
      map.set(id, aid1)
      pasteItems.atoms.push(aid1)
    } else {
      const v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp)

      const operation = new AtomAdd(attrs, v.get_xy0()).perform(
        restruct
      ) as AtomAdd
      action.addOp(operation)
      map.set(id, operation.data.aid)
      pasteItems.atoms.push(operation.data.aid)
    }
  })

  if (!isTmplSingleGroup) mergeSgroups(action, restruct, pasteItems.atoms, aid)

  tmpl.bonds.forEach((bond) => {
    const operation = new BondAdd(
      map.get(bond.begin),
      map.get(bond.end),
      bond
    ).perform(restruct) as BondAdd
    action.addOp(operation)

    pasteItems.bonds.push(operation.data.bid)
  })

  tmpl.sgroups.forEach((sg) => {
    const newsgid = restruct.molecule.sgroups.newId()
    const sgAtoms = sg.atoms.map((aid) => map.get(aid))
    const sgAction = fromSgroupAddition(
      restruct,
      sg.type,
      sgAtoms,
      sg.data,
      newsgid,
      atom.pp,
      sg.type === 'SUP' ? sg.expanded : null,
      sg.data.name
    )
    sgAction.operations.reverse().forEach((oper) => {
      action.addOp(oper)
    })
  })

  action.operations.reverse()

  action.addOp(new CalcImplicitH([...pasteItems.atoms, aid]).perform(restruct))
  action.mergeWith(
    fromBondStereoUpdate(
      restruct,
      restruct.molecule.bonds.get(pasteItems.bonds[0])
    )
  )

  return [action, pasteItems]
}

export function fromTemplateOnBondAction(
  restruct,
  template,
  bid,
  events,
  flip,
  force
) {
  if (!force) return fromTemplateOnBond(restruct, template, bid, flip)

  const simpleFusing = (restruct, template, bid) =>
    fromTemplateOnBond(restruct, template, bid, flip) // eslint-disable-line
  /* aromatic merge (Promise) */
  return fromAromaticTemplateOnBond(
    restruct,
    template,
    bid,
    events,
    simpleFusing
  )
}

function fromTemplateOnBond(restruct, template, bid, flip) {
  // TODO: refactor function !!
  const action = new Action()

  const tmpl = template.molecule
  const struct = restruct.molecule

  const bond = struct.bonds.get(bid)
  const tmplBond = tmpl.bonds.get(template.bid)

  const tmplBegin = tmpl.atoms.get(flip ? tmplBond.end : tmplBond.begin)

  const atomsMap = new Map([
    [tmplBond.begin, flip ? bond.end : bond.begin],
    [tmplBond.end, flip ? bond.begin : bond.end]
  ])

  // calc angle
  const bondAtoms = {
    begin: flip ? tmplBond.end : tmplBond.begin,
    end: flip ? tmplBond.begin : tmplBond.end
  }
  const { angle, scale } = utils.mergeBondsParams(struct, bond, tmpl, bondAtoms)

  const frid = struct.getBondFragment(bid)

  /* For merge */
  const pasteItems: any = {
    // only atoms and bonds now
    atoms: [],
    bonds: []
  }
  /* ----- */

  tmpl.atoms.forEach((atom, id) => {
    const attrs: any = Atom.getAttrHash(atom)
    attrs.fragment = frid
    if (id === tmplBond.begin || id === tmplBond.end) {
      action.mergeWith(fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true))
      return
    }

    const v = Vec2.diff(atom.pp, tmplBegin.pp)
      .rotate(angle)
      .scaled(scale)
      .add(struct.atoms.get(bond.begin).pp)
    const mergeA = closest.atom(restruct, v, null, 0.1)

    if (mergeA === null) {
      const operation = new AtomAdd(attrs, v).perform(restruct) as AtomAdd
      action.addOp(operation)
      atomsMap.set(id, operation.data.aid)
      pasteItems.atoms.push(operation.data.aid)
    } else {
      atomsMap.set(id, mergeA.id)

      action.mergeWith(fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true))
      // TODO [RB] need to merge fragments?
    }
  })
  mergeSgroups(action, restruct, pasteItems.atoms, bond.begin)

  // When a template of "Benzene" molecule is attached it
  // uses specific fusing rules when attaching to a bond
  // that is connected exactly to one bond on each side.
  // For more info please refer to: https://github.com/epam/ketcher/issues/1855
  let isFusingBenzeneBySpecialRules = false
  let benzeneConnectingBondType: any = null

  const isBenzeneTemplate = tmpl.name === benzeneMoleculeName
  if (tmpl.bonds.size && isBenzeneTemplate) {
    const { beginBondIds, endBondIds } = Bond.getBondNeighbourIds(struct, bid)
    const isOnlyTwoConnectingBonds =
      beginBondIds.length === 1 && endBondIds.length === 1
    if (isOnlyTwoConnectingBonds) {
      const beginBond = struct.bonds.get(beginBondIds[0])
      const endBond = struct.bonds.get(endBondIds[0])
      benzeneConnectingBondType = Bond.getBenzeneConnectingBondType(
        bond,
        beginBond,
        endBond
      )
      isFusingBenzeneBySpecialRules = benzeneConnectingBondType !== null
    }
  }

  tmpl.bonds.forEach((tBond, tBondIndex) => {
    const existId = struct.findBondId(
      atomsMap.get(tBond.begin),
      atomsMap.get(tBond.end)
    )
    if (existId === null) {
      const operation = new BondAdd(
        atomsMap.get(tBond.begin),
        atomsMap.get(tBond.end),
        tBond
      ).perform(restruct) as BondAdd
      action.addOp(operation)
      const newBondId = operation.data.bid

      if (isFusingBenzeneBySpecialRules) {
        const newBondType = benzeneDoubleBondIndexes.includes(tBondIndex)
          ? Bond.PATTERN.TYPE.DOUBLE
          : Bond.PATTERN.TYPE.SINGLE
        action.addOp(
          new BondAttr(newBondId, 'type', newBondType).perform(restruct)
        )
      }

      pasteItems.bonds.push(newBondId)
    } else {
      const commonBond = bond.type > tmplBond.type ? bond : tmplBond
      action.mergeWith(fromBondsAttrs(restruct, existId, commonBond, true))

      if (isFusingBenzeneBySpecialRules && benzeneConnectingBondType) {
        action.addOp(
          new BondAttr(bid, 'type', benzeneConnectingBondType).perform(restruct)
        )
      }
    }
  })

  if (pasteItems.atoms.length) {
    action.addOp(
      new CalcImplicitH([bond.begin, bond.end, ...pasteItems.atoms]).perform(
        restruct
      )
    )
  }

  if (pasteItems.bonds.length) {
    action.mergeWith(
      fromBondStereoUpdate(
        restruct,
        restruct.molecule.bonds.get(pasteItems.bonds[0])
      )
    )
  }

  action.operations.reverse()

  return [action, pasteItems]
}
